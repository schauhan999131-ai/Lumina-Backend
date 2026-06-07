import mongoose from 'mongoose'

const healthSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  food: {
    type: String,
    required: true,
    trim: true,
  },
  protein: {
    type: Number,
    required: true,
  },
  calories: {
    type: Number,
    required: true,
  },
  sourceNoteId: {
    type: String, // Tracks if this was parsed from a specific Knowledge Vault note
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model('Health', healthSchema)
