import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Daily', 'Weekly', 'Yearly'],
    default: 'Daily',
  },
  status: {
    type: String,
    enum: ['Not Started', 'Pending', 'Completed'],
    default: 'Not Started',
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model('Task', taskSchema)
