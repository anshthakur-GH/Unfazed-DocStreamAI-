const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

async function fix() {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('ProcessedDOC');
        const collection = db.collection('processed_documents');

        console.log('📡 Connected to MongoDB.');

        // Update ALL documents to have Head profile if they don't have a valid one
        const result = await collection.updateMany(
            { 
                $or: [
                    { user_profile: { $nin: ['Head', 'Teacher', 'Student'] } },
                    { user_profile: { $exists: false } },
                    { user_profile: null }
                ]
            },
            { 
                $set: { 
                    user_profile: 'Head',
                    urgency_level: 'Medium',
                    uploaded_by: 'System Recovery',
                    user_id: 'system',
                    upload_timestamp: new Date().toISOString()
                } 
            }
        );

        console.log(`✅ Success! Updated ${result.modifiedCount} documents to "Head" profile.`);
        
        // List updated documents
        const docs = await collection.find({}).project({ document_title: 1, user_profile: 1 }).toArray();
        console.log('Current Documents in DB:');
        docs.forEach(d => console.log(`- ${d.document_title} (${d.user_profile})`));

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.close();
    }
}

fix();
