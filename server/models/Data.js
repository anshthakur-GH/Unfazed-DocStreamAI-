const mongoose = require('mongoose');

// Image subdoc (from provided schema)
const ImageSubSchema = new mongoose.Schema(
  {
    filename: { type: String },
    mimetype: { type: String },
    size: { type: Number },
    data: { type: Buffer },
    text_extracted: { type: String }
  },
  { _id: false }
);

// DocStreamAI metadata substructures (nullable-first design)
const TableExtractedSubSchema = new mongoose.Schema(
  {
    tableId: { type: String, default: null },
    description: { type: String, default: null }
  },
  { _id: false }
);

const PhotosExtractedSubSchema = new mongoose.Schema(
  {
    count: { type: Number, default: null },
    captions: { type: [String], default: null }
  },
  { _id: false }
);

const SignaturesDetectedSubSchema = new mongoose.Schema(
  {
    detected: { type: Boolean, default: null },
    signers: { type: [String], default: null }
  },
  { _id: false }
);

const DocumentSchema = new mongoose.Schema(
  {
    // Core fields (required as in provided schema)
    document_title: { type: String, required: true },
    document_type: { type: String, required: true },

    // Operational arrays benefit from [] for predictable iteration
    departments_tagged: { type: [String], default: [] },
    summary: { type: String },
    keywords: { type: [String], default: [] },
    content: { type: String }, // Changed from 'Content' to 'content'

    // Images array also benefits from [] for UI/API handling
    images: { type: [ImageSubSchema], default: [] },

    // Extended metadata — nullable when not found
    DocumentType: { type: String, default: null },
    Languages: { type: [String], default: null }, // English, Malayalam, Bilingual
    DateReceived: { type: Date, default: null },
    DateIssued: { type: Date, default: null },
    Trigger: { type: String, default: null },
    AuthorIssuer: { type: String, default: null },
    Department: {
      type: String,
      enum: ['Engineering', 'Maintenance', 'Procurement', 'HR', 'Legal', 'Board'],
      default: null
    },
    Stakeholders: { type: [String], default: null },
    UrgencyLevel: { type: String, enum: ['High', 'Medium', 'Low'], default: null },
    ActionRequired: { type: Boolean, default: null },
    DueDate: { type: Date, default: null },
    ComplianceTags: { type: [String], default: null },
    VersionRevision: { type: String, default: null },
    TraceabilityLink: { type: String, default: null },
    SummaryMeta: { type: String, default: null },
    EmbeddedContent: { type: String, default: null },

    TablesExtracted: { type: [TableExtractedSubSchema], default: null },
    PhotosExtracted: { type: PhotosExtractedSubSchema, default: null },
    SignaturesDetected: { type: SignaturesDetectedSubSchema, default: null },

    AttachmentsListed: { type: [String], default: null }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
      transform: (_doc, ret) => {
        const { Types } = mongoose;
        const coerceObjectId = (value) => {
          try {
            const raw = typeof value === 'object' && value && value._id ? value._id : value;
            return new Types.ObjectId(String(raw));
          } catch {
            return null;
          }
        };
        if (ret.createdAt instanceof Date) ret.createdAt = ret.createdAt.toISOString();
        if (ret.updatedAt instanceof Date) ret.updatedAt = ret.updatedAt.toISOString();
        if (!ret.createdAt && ret._id) {
          const oid = coerceObjectId(ret._id);
          if (oid) ret.createdAt = oid.getTimestamp().toISOString();
        }
        if (!ret.updatedAt && ret.createdAt) {
          ret.updatedAt = ret.createdAt;
        }
        return ret;
      }
    },
    toObject: { virtuals: true, getters: true }
  }
);

// Indexes
DocumentSchema.index({ createdAt: -1 }); // recency queries [9]
DocumentSchema.index({ document_type: 1 }); // filter by type [9]
DocumentSchema.index({ departments_tagged: 1 }); // tag filters [9]

// Enhanced text index across more fields for comprehensive search coverage
DocumentSchema.index({
  document_title: 'text',
  content: 'text',
  summary: 'text',
  keywords: 'text',
  departments_tagged: 'text',
  AuthorIssuer: 'text',
  Department: 'text',
  SummaryMeta: 'text',
  EmbeddedContent: 'text'
}, {
  weights: {
    document_title: 10,    // Highest weight for title matches
    content: 5,            // High weight for content matches
    summary: 8,            // High weight for summary matches
    keywords: 7,           // High weight for keyword matches
    departments_tagged: 3, // Medium weight for department matches
    AuthorIssuer: 2,       // Lower weight for author matches
    Department: 3,         // Medium weight for department field
    SummaryMeta: 4,        // Medium weight for meta summary
    EmbeddedContent: 2     // Lower weight for embedded content
  },
  name: 'comprehensive_text_search'
}); // Enhanced text search with weighted fields

// Virtuals
DocumentSchema.virtual('formattedDate').get(function () {
  const created = this.createdAt ? new Date(this.createdAt) : null;
  if (!created || isNaN(created.getTime())) return null;
  return created.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Methods
DocumentSchema.methods.getSummary = function () {
  return {
    id: this._id,
    document_title: this.document_title,
    document_type: this.document_type,
    createdAt: this.createdAt
  };
};

// DocStreamAI stakeholder snapshot
DocumentSchema.methods.toStakeholderCard = function () {
  return {
    id: this._id,
    title: this.document_title,
    type: this.document_type || this.DocumentType || null,
    department_primary: this.Department,
    departments_tagged: this.departments_tagged || [],
    urgency: this.UrgencyLevel,
    action_required: this.ActionRequired,
    due: this.DueDate,
    compliance: this.ComplianceTags,
    summary: this.summary || this.SummaryMeta || null,
    trace: this.TraceabilityLink
  };
};

// Minimal routing signal
DocumentSchema.methods.routingSignal = function () {
  return {
    id: this._id,
    department: this.Department,
    stakeholders: this.Stakeholders,
    urgency: this.UrgencyLevel,
    action_required: this.ActionRequired,
    due: this.DueDate
  };
};

// Statics
DocumentSchema.statics.findRecent = function (limit = 10) {
  return this.find().sort({ createdAt: -1 }).limit(limit);
};

DocumentSchema.statics.findByCompliance = function (tags = []) {
  if (!Array.isArray(tags) || tags.length === 0) {
    return this.find({ ComplianceTags: { $exists: true } });
  }
  return this.find({ ComplianceTags: { $in: tags } });
};

DocumentSchema.statics.findPendingWithin = function (days = 7) {
  const now = new Date();
  const until = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return this.find({
    ActionRequired: true,
    DueDate: { $ne: null, $lte: until }
  }).sort({ DueDate: 1 });
};

// Cross-department awareness using $expr patterns safely
DocumentSchema.statics.findCrossDept = function () {
  return this.find({
    Department: { $ne: null },
    departments_tagged: { $exists: true, $ne: [] },
    $expr: { $not: { $in: ['$Department', '$departments_tagged'] } }
  });
}; // [16][7][19]

// Full-text search
DocumentSchema.statics.textSearch = function (q, limit = 20) {
  return this.find(
    { $text: { $search: q } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .limit(limit);
};

const Document = mongoose.model('Document', DocumentSchema, 'processed_documents');
module.exports = Document;
