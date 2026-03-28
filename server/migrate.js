const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });
const { Document } = require('./models');

async function migrate() {
    try {
        let MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        // Clean URI (remove trailing slash)
        if (MONGODB_URI.endsWith('/')) {
            MONGODB_URI = MONGODB_URI.slice(0, -1);
        }

        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            dbName: 'ProcessedDOC'
        });
        console.log('✅ Connected.');

        // Update documents missing user_profile or using legacy fields
        const result = await Document.updateMany(
            { 
                $or: [
                    { user_profile: { $exists: false } },
                    { user_profile: null },
                    { urgency_level: { $exists: false } },
                    { urgency_level: null }
                ]
            },
            { 
                $set: { 
                    user_profile: 'Head', 
                    urgency_level: 'Medium',
                    uploaded_by: 'System Migration',
                    user_id: 'system',
                    upload_timestamp: new Date(),
                    date_received: new Date()
                } 
            }
        );

        console.log(`✅ Migration complete. Updated ${result.modifiedCount} documents.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

migrate();
