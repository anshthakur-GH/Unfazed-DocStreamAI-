const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/realtime_app';
        const dbName = 'ProcessedDOC';
        
        console.log('📡 Attempting to connect to MongoDB...');
        
        await mongoose.connect(MONGODB_URI, {
            dbName: dbName,
            // These are deprecated in Mongoose 6+, but keeping if usage of older version is expected
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB connected successfully to database: ${mongoose.connection.name}`);
        return mongoose.connection;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        if (error.code === 'ENOTFOUND') {
            console.error('👉 Tip: Check your internet connection and verify the MongoDB cluster hostname.');
        }
        process.exit(1);
    }
};

module.exports = connectDB;
