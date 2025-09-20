const { Document } = require('../models');

class ChangeStreamHandler {
  constructor(db, websocketService, options = {}) {
    this.db = db;
    this.websocketService = websocketService;
    this.changeStream = null;

    this.metaCollectionName = options.metaCollectionName || 'change_stream_meta';
    this.tokenDocId = options.tokenDocId || 'processed_documents_token';
    this.collectionName = options.collectionName || 'processed_documents';
    this.useStartAfter = options.useStartAfter ?? true; // prefer startAfter when token exists (v4.2+) [6][20]
  }

  async initialize() {
    try {
      const collection = Document.collection;

      // Try to load a saved resume token
      const resumeToken = await this.loadResumeToken();

      const watchOptions = { fullDocument: 'updateLookup' };
      if (resumeToken) {
        // Prefer startAfter for resilience after invalidate; fallback to resumeAfter if startAfter not supported [6][20]
        if (this.useStartAfter) {
          watchOptions.startAfter = resumeToken;
        } else {
          watchOptions.resumeAfter = resumeToken;
        }
      }

      // Filter operations
      const pipeline = [
        {
          $match: {
            operationType: { $in: ['insert', 'update', 'delete', 'replace'] }
          }
        }
      ];

      this.changeStream = collection.watch(pipeline, watchOptions);

      this.changeStream.on('change', async (change) => {
        try {
          await this.handleChange(change);
          // Save resume token after successful processing
          if (change && change._id) {
            await this.saveResumeToken(change._id);
          }
        } catch (err) {
          console.error('❌ Error in change handler:', err);
        }
      });

      this.changeStream.on('error', async (error) => {
        console.error('❌ Change stream error:', error);
        await this.recoverAfterError();
      });

      this.changeStream.on('end', async () => {
        console.warn('ℹ️ Change stream ended');
        await this.recoverAfterError();
      });

      console.log(`👀 Watching changes on collection: ${this.collectionName}`);
    } catch (error) {
      console.error('❌ Error initializing change stream:', error);
    }
  }

  async recoverAfterError() {
    try {
      // Try to restart using the last good token; if invalid, clear and start fresh
      const token = await this.loadResumeToken();
      if (this.changeStream) {
        try { await this.changeStream.close(); } catch {}
      }
      // Attempt restart with token
      try {
        await this.initialize();
      } catch (e) {
        console.warn('⚠️ Resume with saved token failed, clearing token and retrying once...', e);
        await this.clearResumeToken();
        await this.initialize();
      }
    } catch (e) {
      console.error('❌ Failed to recover change stream:', e);
      // Last resort: schedule delayed retry
      setTimeout(() => this.initialize(), 5000);
    }
  }

  async handleChange(change) {
    console.log(`📝 Change detected: ${change.operationType}`);

    // Best-effort model fetch to leverage virtuals/methods
    let summary = null;
    let stakeholderCard = null;

    try {
      const doc = change.fullDocument
        ? await Document.findById(change.fullDocument._id)
        : change.documentKey?._id
        ? await Document.findById(change.documentKey._id)
        : null;

      if (doc && typeof doc.getSummary === 'function') {
        summary = doc.getSummary();
      }
      if (doc && typeof doc.toStakeholderCard === 'function') {
        stakeholderCard = doc.toStakeholderCard();
      }
    } catch (e) {
      // Non-fatal; proceed with raw data
    }

    const message = {
      type: 'database_change',
      operation: change.operationType,
      collection: change.ns?.coll || this.collectionName,
      documentId: change.documentKey?._id || change.fullDocument?._id || null,
      data: await this.formatChangeData(change),
      summary,
      stakeholderCard,
      timestamp: new Date().toISOString()
    };

    this.websocketService.broadcast(message);
  }

  async formatChangeData(change) {
    switch (change.operationType) {
      case 'insert':
        return { fullDocument: change.fullDocument };
      case 'update':
        return {
          fullDocument: change.fullDocument,
          updatedFields: change.updateDescription?.updatedFields,
          removedFields: change.updateDescription?.removedFields
        };
      case 'delete':
        return { deletedId: change.documentKey._id };
      case 'replace':
        return { fullDocument: change.fullDocument };
      default:
        return change.fullDocument || change.documentKey;
    }
  }

  // Resume token persistence
  async saveResumeToken(token) {
    if (!token) return;
    const coll = this.db.collection(this.metaCollectionName);
    await coll.updateOne(
      { _id: this.tokenDocId },
      { $set: { token, updatedAt: new Date() } },
      { upsert: true }
    );
  }

  async loadResumeToken() {
    const coll = this.db.collection(this.metaCollectionName);
    const doc = await coll.findOne({ _id: this.tokenDocId });
    return doc?.token || null;
  }

  async clearResumeToken() {
    const coll = this.db.collection(this.metaCollectionName);
    await coll.deleteOne({ _id: this.tokenDocId });
  }

  async close() {
    if (this.changeStream) {
      try {
        await this.changeStream.close();
      } catch {}
      console.log('📝 Change stream closed');
    }
  }
}

module.exports = ChangeStreamHandler;
