const express = require('express');
const mongoose = require('mongoose');
const { Document, Knowledge } = require('../models');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'Server running',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Build filters helper (shared)
function buildFilters({ document_type, user_profile, urgency_level, search }) {
  const filter = {};
  if (document_type) filter.document_type = document_type;
  if (user_profile) filter.user_profile = user_profile;
  if (urgency_level) filter.urgency_level = urgency_level;

  if (search) {
    const searchTerms = search.trim().split(/\s+/);
    const searchRegexes = searchTerms.map(term => new RegExp(term, 'i'));
    const orConditions = [];

    searchRegexes.forEach(regex => {
      orConditions.push(
        { document_title: { $regex: regex } },
        { summary: { $regex: regex } },
        { research_domain: { $regex: regex } }
      );
      
      orConditions.push(
        { authors: { $regex: regex } },
        { keywords: { $regex: regex } },
        { subject_tags: { $regex: regex } }
      );
    });

    filter.$or = orConditions;
  }
  return filter;
}

// Get all documents with filtering and pagination
router.get('/data', async (req, res) => {
  try {
    const {
      limit = 50,
      skip = 0,
      sort = 'desc',
      document_type,
      user_profile,
      urgency_level,
      search,
      urgency_sort
    } = req.query;

    const parsedLimit = parseInt(limit);
    const parsedSkip = parseInt(skip);
    const sortOrder = sort === 'asc' ? 1 : -1;

    const matchStage = buildFilters({ document_type, user_profile, urgency_level, search });
    const pipeline = [{ $match: matchStage }];

    if (urgency_sort) {
      pipeline.push({
        $addFields: {
          urgencyValue: {
            $switch: {
              branches: [
                { case: { $eq: ["$urgency_level", "High"] }, then: 3 },
                { case: { $eq: ["$urgency_level", "Medium"] }, then: 2 },
                { case: { $eq: ["$urgency_level", "Low"] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
      });

      if (urgency_sort === 'high_to_low') {
        pipeline.push({ $sort: { urgencyValue: -1, createdAt: -1 } });
      } else if (urgency_sort === 'low_to_high') {
        pipeline.push({ $sort: { urgencyValue: 1, createdAt: -1 } });
      }
    } else {
      pipeline.push({ $sort: { createdAt: sortOrder } });
    }

    pipeline.push({ $skip: parsedSkip });
    pipeline.push({ $limit: parsedLimit });

    const [data, totalAgg] = await Promise.all([
      Document.aggregate(pipeline),
      Document.countDocuments(matchStage)
    ]);

    res.json({
      data,
      pagination: {
        total: totalAgg,
        limit: parsedLimit,
        skip: parsedSkip,
        hasMore: totalAgg > (parsedSkip + parsedLimit)
      },
      filters: { document_type, user_profile, urgency_level, search }
    });
  } catch (error) {
    console.error('❌ Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});

// Get single document by ID
router.get('/data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid document ID' });
    const data = await Document.findById(id);
    if (!data) return res.status(404).json({ error: 'Document not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch document', details: error.message });
  }
});

// Create new document
router.post('/createData', async (req, res) => {
  try {
    const documentData = {
      document_title: req.body.document_title,
      document_type: req.body.document_type,
      uploaded_by: req.body.uploaded_by,
      user_id: req.body.user_id,
      user_profile: req.body.user_profile,
      research_domain: req.body.research_domain,
      subject_tags: req.body.subject_tags || [],
      course_code: req.body.course_code,
      academic_year: req.body.academic_year,
      authors: req.body.authors || [],
      date_published: req.body.date_published,
      date_received: req.body.date_received || new Date(),
      funding_source: req.body.funding_source,
      summary: req.body.summary,
      keywords: req.body.keywords || [],
      urgency_level: req.body.urgency_level,
      google_drive_link: req.body.google_drive_link
    };

    const document = new Document(documentData);
    const savedDocument = await document.save();
    res.status(201).json({ success: true, data: savedDocument });
  } catch (error) {
    console.error('❌ Error creating document:', error);
    res.status(400).json({ error: 'Failed to create document', details: error.message });
  }
});

// Update document
router.put('/data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid document ID' });
    
    // Only allow updating schema fields
    const allowedFields = [
      'document_title', 'document_type', 'research_domain', 'subject_tags', 
      'course_code', 'academic_year', 'authors', 'date_published', 
      'funding_source', 'summary', 'keywords', 'urgency_level', 'google_drive_link'
    ];
    
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    const updatedDocument = await Document.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updatedDocument) return res.status(404).json({ error: 'Document not found' });
    res.json({ success: true, data: updatedDocument });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update document', details: error.message });
  }
});

// Delete document
router.delete('/data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid document ID' });
    const result = await Document.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ error: 'Document not found' });
    res.json({ success: true, message: 'Document deleted', deletedId: id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete document', details: error.message });
  }
});

// Get recent documents
router.get('/data/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const recentData = await Document.findRecent(limit);
    res.json({ data: recentData, count: recentData.length, limit });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recent data', details: error.message });
  }
});

// Get data statistics
router.get('/stats/data', async (req, res) => {
  try {
    const total = await Document.countDocuments();
    const documentTypes = await Document.aggregate([{ $group: { _id: '$document_type', count: { $sum: 1 } } }]);
    const profileStats = await Document.aggregate([{ $group: { _id: '$user_profile', count: { $sum: 1 } } }]);

    res.json({ total, documentTypes, profiles: profileStats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
  }
});


// Get WebSocket connection stats
router.get('/stats/connections', (req, res) => {
  const connectedClients = req.app.get('websocketService')?.getConnectedClientsCount() || 0;

  res.json({
    connectedClients,
    timestamp: new Date().toISOString()
  });
});

// Get documents requiring action
router.get('/alerts/action-required', async (req, res) => {
  try {
    const { user_profile } = req.query;

    const matchQuery = { 
      urgency_level: { $in: ['High', 'Medium'] }
    };

    if (user_profile) {
      matchQuery.user_profile = user_profile;
    }

    const actionRequiredDocs = await Document.find(matchQuery)
      .select('document_title urgency_level upload_timestamp user_profile authors')
      .sort({ upload_timestamp: -1 });

    const alerts = actionRequiredDocs.map(doc => {
      return {
        id: doc._id,
        title: doc.document_title,
        originalUrgency: doc.urgency_level,
        dynamicUrgency: doc.urgency_level,
        dueDate: null,
        user_profile: doc.user_profile,
        createdAt: doc.upload_timestamp
      };
    });

    res.json({
      alerts,
      count: alerts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts', details: error.message });
  }
});

// ===== KNOWLEDGE ROUTES =====

// Get all knowledge entries with filtering and pagination
router.get('/knowledge', async (req, res) => {
  try {
    const {
      limit = 20,
      skip = 0,
      sort = 'desc',
      user_profile,
      search
    } = req.query;

    const parsedLimit = parseInt(limit);
    const parsedSkip = parseInt(skip);
    const sortOrder = sort === 'asc' ? 1 : -1;

    const matchStage = { is_active: true };

    if (user_profile) {
      matchStage.user_profile = user_profile;
    }

    if (search) {
      matchStage.$text = { $search: search };
    }

    const pipeline = [];
    pipeline.push({ $match: matchStage });

    if (search) {
      pipeline.push({ $addFields: { score: { $meta: 'textScore' } } });
      pipeline.push({ $sort: { score: -1, createdAt: -1 } });
    } else {
      pipeline.push({ $sort: { createdAt: sortOrder } });
    }

    pipeline.push({ $skip: parsedSkip });
    pipeline.push({ $limit: parsedLimit });

    const [data, total] = await Promise.all([
      Knowledge.aggregate(pipeline),
      Knowledge.countDocuments(matchStage)
    ]);

    res.json({
      data,
      pagination: {
        total,
        limit: parsedLimit,
        skip: parsedSkip,
        hasMore: total > (parsedSkip + parsedLimit)
      },
      filters: {
        user_profile: user_profile || null,
        search: search || null
      }
    });
  } catch (error) {
    console.error('❌ Error fetching knowledge entries:', error);
    res.status(500).json({
      error: 'Failed to fetch knowledge entries',
      details: error.message
    });
  }
});

// Get single knowledge entry by ID
router.get('/knowledge/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid knowledge entry ID' });
    }

    const knowledge = await Knowledge.findById(id);

    if (!knowledge) {
      return res.status(404).json({ error: 'Knowledge entry not found' });
    }

    res.json(knowledge);
  } catch (error) {
    console.error('❌ Error fetching knowledge entry:', error);
    res.status(500).json({
      error: 'Failed to fetch knowledge entry',
      details: error.message
    });
  }
});

// Create new knowledge entry
router.post('/knowledge', async (req, res) => {
  try {
    // Validate required fields
    const { author_name, title, content } = req.body;

    if (!author_name || !title || !content) {
      return res.status(400).json({
        error: 'Validation failed',
        details: ['author_name, title, and content are required']
      });
    }

    const knowledgeData = {
      author_name: author_name.trim(),
      title: title.trim(),
      content: content.trim(),
      user_profile: req.body.user_profile || null,
      tags: req.body.tags || []
    };

    const knowledge = new Knowledge(knowledgeData);
    const savedKnowledge = await knowledge.save();

    res.status(201).json({
      success: true,
      data: savedKnowledge
    });
  } catch (error) {
    console.error('❌ Error creating knowledge entry:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }

    res.status(500).json({
      error: 'Failed to create knowledge entry',
      details: error.message
    });
  }
});

// Get recent knowledge entries by profile
router.get('/knowledge/profile/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { limit = 10 } = req.query;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Profile name is required' });
    }

    const parsedLimit = parseInt(limit);
    const knowledge = await Knowledge.findByProfile(name, parsedLimit);

    res.json({
      data: knowledge,
      count: knowledge.length,
      user_profile: name
    });
  } catch (error) {
    console.error('❌ Error fetching profile knowledge:', error);
    res.status(500).json({
      error: 'Failed to fetch profile knowledge',
      details: error.message
    });
  }
});

// Get recent knowledge entries
router.get('/knowledge/recent', async (req, res) => {
  try {
    const { limit = 10, user_profile } = req.query;
    const parsedLimit = parseInt(limit);

    const knowledge = await Knowledge.findRecent(parsedLimit, user_profile);

    res.json({
      data: knowledge,
      count: knowledge.length,
      limit: parsedLimit
    });
  } catch (error) {
    console.error('❌ Error fetching recent knowledge:', error);
    res.status(500).json({
      error: 'Failed to fetch recent knowledge',
      details: error.message
    });
  }
});

// Updated 404 handler using named wildcard parameter (Express v5 compatible)
router.use('/{*splat}', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/data',
      'GET /api/data/:id',
      'POST /api/createData',
      'GET /api/alerts/action-required',
      'PUT /api/data/:id',
      'DELETE /api/data/:id',
      'GET /api/data/recent',
      'GET /api/data/profile/:name',
      'GET /api/knowledge/profile/:name',
      'GET /api/stats/data',
      'GET /api/stats/connections'
    ]
  });
});

module.exports = router;
