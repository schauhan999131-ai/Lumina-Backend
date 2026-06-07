import mongoose from 'mongoose'

const connectDB = async () => { 
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/smb-saas'
    // Sanitize credentials to hide password in logs
    const sanitizedURI = mongoURI.replace(/:([^:@]+)@/, ':***@')
    console.log(`🔌 Connecting to database: ${sanitizedURI}`)
    
    await mongoose.connect(mongoURI)
    
    console.log(`✅ MongoDB connected successfully to: ${sanitizedURI}`)
    return true
  } catch (err) {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/smb-saas'
    const sanitizedURI = mongoURI.replace(/:([^:@]+)@/, ':***@')
    console.error(`⚠️  MongoDB connection error on ${sanitizedURI}:`, err.message)
    return false
  }
}

export default connectDB
