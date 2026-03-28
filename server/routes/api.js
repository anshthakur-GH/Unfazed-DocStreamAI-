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

// Build filters helper (shared) - Enhanced for partial word matching
function buildFilters({ document_type, search }) {
  const filter = {};
  if (document_type) filter.document_type = document_type;

  if (search) {
    // Use regex-based search for partial word matching
    const searchTerms = search.trim().split(/\s+/);
    const searchRegexes = searchTerms.map(term => new RegExp(term, 'i'));

    // Create OR conditions for each field and each search term
    const orConditions = [];

    searchRegexes.forEach(regex => {
      orConditions.push(
        { document_title: { $regex: regex } },
        { summary: { $regex: regex } },
        { content: { $regex: regex } },
        { AuthorIssuer: { $regex: regex } },
        { Department: { $regex: regex } },
        { SummaryMeta: { $regex: regex } },
        { EmbeddedContent: { $regex: regex } }
      );

      // For array fields, use $in with regex for partial matching
      orConditions.push(
        { keywords: { $regex: regex } },
        { departments_tagged: { $regex: regex } }
      );
    });

    filter.$or = orConditions;
    filter._searchType = 'regex';
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
      search,
      urgency_sort // Add urgency_sort to query parameters
    } = req.query;

    const parsedLimit = parseInt(limit);
    const parsedSkip = parseInt(skip);
    const sortOrder = sort === 'asc' ? 1 : -1;

    const matchStage = buildFilters({ document_type, search });

    const pipeline = [];
    // $text must be in the first $match in pipeline if present
    pipeline.push({ $match: matchStage }); // first stage if $text exists [8][12]

    // Clean up search type flag before pipeline execution
    const searchType = matchStage._searchType;
    delete matchStage._searchType;

    // If text search, include textScore for meaningful sort
    if (search && searchType === 'text') {
      pipeline.push({ $addFields: { score: { $meta: 'textScore' } } });
      pipeline.push({ $sort: { score: -1, createdAt: -1 } }); // relevance then recency [8]
    } else if (search && searchType === 'regex') {
      // For regex-based search, sort by recency
      pipeline.push({ $sort: { createdAt: -1 } });
    } else if (urgency_sort) {
      // Custom sorting for UrgencyLevel
      pipeline.push({
        $addFields: {
          urgencyValue: {
            $switch: {
              branches: [
                { case: { $eq: ["$UrgencyLevel", "Critical"] }, then: 4 },
                { case: { $eq: ["$UrgencyLevel", "High"] }, then: 3 },
                { case: { $eq: ["$UrgencyLevel", "Medium"] }, then: 2 },
                { case: { $eq: ["$UrgencyLevel", "Low"] }, then: 1 },
              ],
              default: 0, // For "N/A" or undefined urgency levels
            },
          },
        },
      });

      if (urgency_sort === 'critical_to_low') {
        pipeline.push({ $sort: { urgencyValue: -1, createdAt: -1 } }); // Critical -> High -> Medium -> Low
      } else if (urgency_sort === 'low_to_critical') {
        pipeline.push({ $sort: { urgencyValue: 1, createdAt: -1 } }); // Low -> Medium -> High -> Critical
      }
    } else {
      // Default sorting by date
      pipeline.push({ $addFields: { sortDate: { $ifNull: ['$createdAt', { $toDate: '$_id' }] } } });
      pipeline.push({ $sort: { sortDate: sortOrder } });
    }

    pipeline.push({ $skip: parsedSkip });
    pipeline.push({ $limit: parsedLimit });

    const [data, totalAgg] = await Promise.all([
      Document.aggregate(pipeline),
      Document.countDocuments(matchStage)
    ]); // same filter for accurate count [10][12]

    res.json({
      data,
      pagination: {
        total: totalAgg,
        limit: parsedLimit,
        skip: parsedSkip,
        hasMore: totalAgg > (parsedSkip + parsedLimit)
      },
      filters: {
        document_type: document_type || null,
        search: search || null
      }
    });
  } catch (error) {
    console.error('❌ Error fetching data:', error);
    res.status(500).json({
      error: 'Failed to fetch data',
      details: error.message
    });
  }
});

// Get single document by ID
router.get('/data/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    const data = await Document.findById(id);

    if (!data) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching document:', error);
    res.status(500).json({
      error: 'Failed to fetch document',
      details: error.message
    });
  }
});

// Get related documents by ID
router.get('/data/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 5 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    // First, get the current document to extract its properties
    const currentDoc = await Document.findById(id);
    if (!currentDoc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const parsedLimit = parseInt(limit);

    // Build query to find related documents based on:
    // 1. Same document type
    // 2. Overlapping departments
    // 3. Overlapping keywords
    // 4. Similar content (using keywords from summary)
    const relatedQuery = {
      _id: { $ne: new mongoose.Types.ObjectId(id) }, // Exclude current document
      $or: []
    };

    // Add conditions based on document type
    if (currentDoc.document_type) {
      relatedQuery.$or.push({ document_type: currentDoc.document_type });
    }

    // Add conditions based on departments
    if (currentDoc.departments_tagged && currentDoc.departments_tagged.length > 0) {
      relatedQuery.$or.push({
        departments_tagged: { $in: currentDoc.departments_tagged }
      });
    }

    // Add conditions based on keywords
    if (currentDoc.keywords && currentDoc.keywords.length > 0) {
      relatedQuery.$or.push({
        keywords: { $in: currentDoc.keywords }
      });
    }

    // Add conditions based on AuthorIssuer if available
    if (currentDoc.AuthorIssuer) {
      relatedQuery.$or.push({ AuthorIssuer: currentDoc.AuthorIssuer });
    }

    // Add conditions based on Department if available
    if (currentDoc.Department) {
      relatedQuery.$or.push({ Department: currentDoc.Department });
    }

    // If no conditions were added, find documents of the same type or from same departments
    if (relatedQuery.$or.length === 0) {
      relatedQuery.$or.push(
        { document_type: currentDoc.document_type || '' },
        { departments_tagged: { $exists: true, $ne: [] } }
      );
    }

    // Use aggregation pipeline for better scoring and sorting
    const pipeline = [
      { $match: relatedQuery },
      {
        $addFields: {
          relevanceScore: {
            $add: [
              // Score for same document type
              { $cond: [{ $eq: ['$document_type', currentDoc.document_type] }, 3, 0] },
              // Score for overlapping departments
              {
                $cond: [
                  {
                    $gt: [
                      {
                        $size: {
                          $ifNull: [
                            {
                              $setIntersection: [
                                { $ifNull: ['$departments_tagged', []] },
                                currentDoc.departments_tagged || []
                              ]
                            },
                            []
                          ]
                        }
                      },
                      0
                    ]
                  },
                  2,
                  0
                ]
              },
              // Score for overlapping keywords
              {
                $cond: [
                  {
                    $gt: [
                      {
                        $size: {
                          $ifNull: [
                            {
                              $setIntersection: [
                                { $ifNull: ['$keywords', []] },
                                currentDoc.keywords || []
                              ]
                            },
                            []
                          ]
                        }
                      },
                      0
                    ]
                  },
                  2,
                  0
                ]
              },
              // Score for same author/issuer
              { $cond: [{ $eq: ['$AuthorIssuer', currentDoc.AuthorIssuer] }, 1, 0] },
              // Score for same department
              { $cond: [{ $eq: ['$Department', currentDoc.Department] }, 1, 0] }
            ]
          }
        }
      },
      { $sort: { relevanceScore: -1, createdAt: -1 } },
      { $limit: parsedLimit },
      {
        $project: {
          _id: 1,
          document_title: 1,
          document_type: 1,
          summary: 1,
          departments_tagged: 1,
          keywords: 1,
          createdAt: 1,
          updatedAt: 1,
          AuthorIssuer: 1,
          Department: 1,
          UrgencyLevel: 1,
          relevanceScore: 1
        }
      }
    ];

    const relatedDocs = await Document.aggregate(pipeline);

    res.json({
      data: relatedDocs,
      count: relatedDocs.length,
      currentDocumentId: id,
      limit: parsedLimit
    });
  } catch (error) {
    console.error('❌ Error fetching related documents:', error);
    res.status(500).json({
      error: 'Failed to fetch related documents',
      details: error.message
    });
  }
});

// Create new document (supports core + DocStreamAI metadata)
router.post('/createData', async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.document_title) {
      return res.status(400).json({
        error: 'Validation failed',
        details: ['document_title is required']
      });
    }

    if (!req.body.document_type) {
      return res.status(400).json({
        error: 'Validation failed',
        details: ['document_type is required']
      });
    }

    // Prepare document data with defaults for core fields and include metadata if present
    const {
      document_title,
      document_type,
      departments_tagged = [],
      summary = '',
      keywords = [],
      content = '', // Changed from 'Content' to 'content'
      images = [],

      // DocStreamAI metadata (all optional, nullable in schema)
      DocumentType,
      Languages,
      DateReceived,
      DateIssued,
      Trigger,
      AuthorIssuer,
      Department,
      Stakeholders,
      UrgencyLevel,
      ActionRequired,
      DueDate,
      ComplianceTags,
      VersionRevision,
      TraceabilityLink,
      SummaryMeta,
      EmbeddedContent,
      TablesExtracted,
      PhotosExtracted,
      SignaturesDetected,
      AttachmentsListed
    } = req.body;

    const documentData = {
      document_title,
      document_type,
      departments_tagged,
      summary,
      keywords,
      content, // Ensure content is passed correctly
      images,

      DocumentType,
      Languages,
      DateReceived,
      DateIssued,
      Trigger,
      AuthorIssuer,
      Department,
      Stakeholders,
      UrgencyLevel,
      ActionRequired,
      DueDate,
      ComplianceTags,
      VersionRevision,
      TraceabilityLink,
      SummaryMeta,
      EmbeddedContent,
      TablesExtracted,
      PhotosExtracted,
      SignaturesDetected,
      AttachmentsListed
    };

    const document = new Document(documentData);
    const savedDocument = await document.save();

    res.status(201).json({
      success: true,
      data: savedDocument
    });
  } catch (error) {
    console.error('❌ Error creating document:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }

    res.status(500).json({
      error: 'Failed to create document',
      details: error.message
    });
  }
});

// Update document by ID (partial update; validators on)
router.put('/data/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    const updateData = { ...req.body };
    if (updateData.Content !== undefined) { // Check for uppercase 'Content' and convert to 'content'
      updateData.content = updateData.Content;
      delete updateData.Content;
    }

    const updatedDocument = await Document.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedDocument) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({
      success: true,
      data: updatedDocument
    });
  } catch (error) {
    console.error('❌ Error updating document:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }

    res.status(500).json({
      error: 'Failed to update document',
      details: error.message
    });
  }
});

// Delete document
router.delete('/data/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    const result = await Document.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({
      success: true,
      message: 'Document permanently deleted',
      deletedId: id
    });
  } catch (error) {
    console.error('❌ Error deleting document:', error);
    res.status(500).json({
      error: 'Failed to delete document',
      details: error.message
    });
  }
});

// Get recent documents using query parameter
router.get('/data/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const recentData = await Document.findRecent(limit);

    res.json({
      data: recentData,
      count: recentData.length,
      limit: limit
    });
  } catch (error) {
    console.error('❌ Error fetching recent data:', error);
    res.status(500).json({
      error: 'Failed to fetch recent data',
      details: error.message
    });
  }
});

// Get documents by department with filtering and pagination
router.get('/data/department/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { limit = 50, skip = 0, sort = 'desc', document_type, search, urgency_sort } = req.query;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Department name is required' });
    }

    const parsedLimit = parseInt(limit);
    const parsedSkip = parseInt(skip);
    const sortOrder = sort === 'asc' ? 1 : -1;

    // Include both tagged department and optional filters
    const matchStage = buildFilters({ document_type, search });

    // Get search type before modifying matchStage
    const searchType = matchStage._searchType;
    delete matchStage._searchType;

    // Add department filter - combine with existing search if present
    const deptFilter = { departments_tagged: { $regex: new RegExp(name, 'i') } };

    if (matchStage.$or) {
      // If search is present with $or, combine department filter with search using $and
      matchStage.$and = [
        { $or: matchStage.$or },
        deptFilter
      ];
      delete matchStage.$or;
    } else {
      // If no search or text search, just add department filter
      Object.assign(matchStage, deptFilter);
    }

    const pipeline = [];
    pipeline.push({ $match: matchStage }); // keep $text in first $match if present [8][12]

    if (search && searchType === 'text') {
      pipeline.push({ $addFields: { score: { $meta: 'textScore' } } });
      pipeline.push({ $sort: { score: -1, createdAt: -1 } });
    } else if (search && searchType === 'regex') {
      // For regex-based search, sort by recency
      pipeline.push({ $sort: { createdAt: -1 } });
    } else if (urgency_sort) {
      // Custom sorting for UrgencyLevel
      pipeline.push({
        $addFields: {
          urgencyValue: {
            $switch: {
              branches: [
                { case: { $eq: ["$UrgencyLevel", "Critical"] }, then: 4 },
                { case: { $eq: ["$UrgencyLevel", "High"] }, then: 3 },
                { case: { $eq: ["$UrgencyLevel", "Medium"] }, then: 2 },
                { case: { $eq: ["$UrgencyLevel", "Low"] }, then: 1 },
              ],
              default: 0, // For "N/A" or undefined urgency levels
            },
          },
        },
      });

      if (urgency_sort === 'critical_to_low') {
        pipeline.push({ $sort: { urgencyValue: -1, createdAt: -1 } }); // Critical -> High -> Medium -> Low
      } else if (urgency_sort === 'low_to_critical') {
        pipeline.push({ $sort: { urgencyValue: 1, createdAt: -1 } }); // Low -> Medium -> High -> Critical
      }
    } else {
      // Default sorting by date
      pipeline.push({ $addFields: { sortDate: { $ifNull: ['$createdAt', { $toDate: '$_id' }] } } });
      pipeline.push({ $sort: { sortDate: sortOrder } });
    }

    pipeline.push({ $skip: parsedSkip });
    pipeline.push({ $limit: parsedLimit });

    const [data, total] = await Promise.all([
      Document.aggregate(pipeline),
      Document.countDocuments(matchStage)
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
        department: name,
        document_type: document_type || null,
        search: search || null
      }
    });
  } catch (error) {
    console.error('❌ Error fetching department data:', error);
    res.status(500).json({
      error: 'Failed to fetch department data',
      details: error.message
    });
  }
});

// Get data statistics
router.get('/stats/data', async (req, res) => {
  try {
    const totalDocuments = await Document.countDocuments();

    const documentTypeStats = await Document.aggregate([
      { $group: { _id: '$document_type', count: { $sum: 1 } } }
    ]);

    const departmentStats = await Document.aggregate([
      { $unwind: '$departments_tagged' },
      { $group: { _id: '$departments_tagged', count: { $sum: 1 } } }
    ]);

    res.json({
      total: totalDocuments,
      documentTypes: documentTypeStats,
      departments: departmentStats
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      details: error.message
    });
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

// Get documents requiring action with dynamic urgency calculation
router.get('/alerts/action-required', async (req, res) => {
  try {
    const now = new Date();
    const { department } = req.query; // Get department from query parameters

    const matchQuery = { // Use any for dynamic properties
      ActionRequired: true
    };

    if (department) {
      matchQuery.departments_tagged = { $regex: new RegExp(department, 'i') };
    }

    // Find documents that require action, potentially filtered by department
    const actionRequiredDocs = await Document.find(matchQuery)
      .select('document_title UrgencyLevel DueDate Department createdAt');

    // Calculate dynamic urgency based on due date proximity
    const alertsWithDynamicUrgency = actionRequiredDocs.map(doc => {
      let dynamicUrgency = doc.UrgencyLevel || 'Low';

      if (doc.DueDate) {
        const dueDate = new Date(doc.DueDate);
        const timeDiff = dueDate.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // Adjust urgency based on due date proximity
        if (daysDiff <= 1) {
          dynamicUrgency = 'High';
        } else if (daysDiff <= 3) {
          dynamicUrgency = 'Medium';
        } else if (daysDiff <= 7 && dynamicUrgency === 'Low') {
          dynamicUrgency = 'Medium';
        }
      }

      return {
        id: doc._id,
        title: doc.document_title,
        originalUrgency: doc.UrgencyLevel,
        dynamicUrgency,
        dueDate: doc.DueDate,
        department: doc.Department,
        createdAt: doc.createdAt
      };
    });

    // Sort by urgency priority: High -> Medium -> Low
    const urgencyOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
    const sortedAlerts = alertsWithDynamicUrgency.sort((a, b) => {
      const urgencyDiff = urgencyOrder[b.dynamicUrgency] - urgencyOrder[a.dynamicUrgency];
      if (urgencyDiff !== 0) return urgencyDiff;

      // If same urgency, sort by due date (closest first)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      // If one has due date and other doesn't, prioritize the one with due date
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;

      // Finally sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.json({
      alerts: sortedAlerts,
      count: sortedAlerts.length,
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching action-required alerts:', error);
    res.status(500).json({
      error: 'Failed to fetch alerts',
      details: error.message
    });
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
      department,
      search
    } = req.query;

    const parsedLimit = parseInt(limit);
    const parsedSkip = parseInt(skip);
    const sortOrder = sort === 'asc' ? 1 : -1;

    const matchStage = { is_active: true };

    if (department) {
      matchStage.department = department;
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
        department: department || null,
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
      department: req.body.department || null,
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

// Get recent knowledge entries by department
router.get('/knowledge/department/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { limit = 10 } = req.query;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Department name is required' });
    }

    const parsedLimit = parseInt(limit);
    const knowledge = await Knowledge.findByDepartment(name, parsedLimit);

    res.json({
      data: knowledge,
      count: knowledge.length,
      department: name
    });
  } catch (error) {
    console.error('❌ Error fetching department knowledge:', error);
    res.status(500).json({
      error: 'Failed to fetch department knowledge',
      details: error.message
    });
  }
});

// Get recent knowledge entries
router.get('/knowledge/recent', async (req, res) => {
  try {
    const { limit = 10, department } = req.query;
    const parsedLimit = parseInt(limit);

    const knowledge = await Knowledge.findRecent(parsedLimit, department);

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
      'GET /api/data/department/:name',
      'GET /api/stats/data',
      'GET /api/stats/connections'
    ]
  });
});

module.exports = router;
