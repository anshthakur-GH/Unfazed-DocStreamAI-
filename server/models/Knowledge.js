const mongoose = require('mongoose');

const KnowledgeSchema = new mongoose.Schema(
  {
    author_name: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    department: {
      type: String,
      enum: ['Engineering', 'Maintenance', 'Procurement', 'HR', 'Legal', 'Board', 'Finance', 'Operations', 'Admin'],
      default: null
    },
    tags: {
      type: [String],
      default: []
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
      transform: (_doc, ret) => {
        if (ret.createdAt instanceof Date) ret.createdAt = ret.createdAt.toISOString();
        if (ret.updatedAt instanceof Date) ret.updatedAt = ret.updatedAt.toISOString();
        return ret;
      }
    },
    toObject: { virtuals: true, getters: true }
  }
);

// Indexes for better query performance
KnowledgeSchema.index({ createdAt: -1 }); // For recent knowledge entries
KnowledgeSchema.index({ department: 1 }); // For department filtering
KnowledgeSchema.index({ is_active: 1 }); // For active entries

// Text search index
KnowledgeSchema.index({
  title: 'text',
  content: 'text',
  author_name: 'text'
});

// Virtual for formatted date
KnowledgeSchema.virtual('formattedDate').get(function () {
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

// Static methods
KnowledgeSchema.statics.findRecent = function (limit = 10, department = null) {
  const query = { is_active: true };
  if (department) {
    query.department = department;
  }
  return this.find(query).sort({ createdAt: -1 }).limit(limit);
};

KnowledgeSchema.statics.findByDepartment = function (department, limit = 20) {
  return this.find({ 
    department: department, 
    is_active: true 
  }).sort({ createdAt: -1 }).limit(limit);
};

KnowledgeSchema.statics.textSearch = function (query, limit = 20) {
  return this.find(
    { 
      $text: { $search: query },
      is_active: true 
    },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .limit(limit);
};

const Knowledge = mongoose.model('Knowledge', KnowledgeSchema, 'knowledge_entries');
module.exports = Knowledge;
