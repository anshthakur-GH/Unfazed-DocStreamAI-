const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema(
  {
    document_title: { type: String, required: true },
    document_type: { 
      type: String, 
      enum: ["Research Paper", "Lecture Notes", "Policy Document", "Other"],
      required: true 
    },
    uploaded_by: { type: String, required: true },
    upload_timestamp: { type: Date, default: Date.now },
    user_id: { type: String, required: true },
    user_profile: { 
      type: String, 
      enum: ["Head", "Teacher", "Student"],
      required: true 
    },
    research_domain: { type: String, default: null },
    subject_tags: { type: [String], default: [] },
    course_code: { type: String, default: null },
    academic_year: { type: String, default: null },
    authors: { type: [String], default: [] },
    date_published: { type: Date, default: null },
    date_received: { type: Date, default: Date.now },
    funding_source: { type: String, default: null },
    summary: { type: String, required: true },
    keywords: { type: [String], default: [] },
    urgency_level: { 
      type: String, 
      enum: ["High", "Medium", "Low"],
      required: true 
    },
    google_drive_link: { type: String, default: null }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes for performance and search
DocumentSchema.index({ document_type: 1 });
DocumentSchema.index({ user_profile: 1 });
DocumentSchema.index({ urgency_level: 1 });
DocumentSchema.index({ academic_year: 1 });
DocumentSchema.index({ createdAt: -1 });

// Text index for search
DocumentSchema.index({
  document_title: 'text',
  summary: 'text',
  research_domain: 'text',
  authors: 'text',
  keywords: 'text',
  subject_tags: 'text'
}, {
  weights: {
    document_title: 10,
    summary: 5,
    authors: 3,
    keywords: 2
  },
  name: 'document_search_index'
});

// Static methods
DocumentSchema.statics.findRecent = function (limit = 10) {
  return this.find().sort({ createdAt: -1 }).limit(limit);
};

const Document = mongoose.model('Document', DocumentSchema, 'processed_documents');
module.exports = Document;

