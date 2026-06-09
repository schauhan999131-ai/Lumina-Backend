import mongoose from 'mongoose';

const connectDB = async () => { 
  try {
    // We strictly use MONGO_URI now to avoid any old platform caching conflicts
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/smb-saas';
    
    // Sanitize credentials to hide password in logs safely
    const sanitizedURI = mongoURI.replace(/:([^:@]+)@/, ':***@');
    console.log(`🔌 Connecting to database: ${sanitizedURI}`);
    
    await mongoose.connect(mongoURI);
    
    console.log(`✅ MongoDB connected successfully to: ${sanitizedURI}`);
    return true;
  } catch (err) {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/smb-saas';
    const sanitizedURI = mongoURI.replace(/:([^:@]+)@/, ':***@');
    console.error(`⚠️  MongoDB connection error on ${sanitizedURI}:`, err.message);
    return false;
  }
};

export default connectDB;