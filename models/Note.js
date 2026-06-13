import mongoose from 'mongoose'

const todoSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => Date.now().toString(),
  },
  text: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
})

const imageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  src: {
    type: String,
    required: true, // base64 representation of image
  },
})

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    default: 'Untitled Note',
    trim: true,
  },
  subject: {
    type: String,
    default: 'Software Engineering',
    trim: true,
  },
  content: {
    type: String,
    default: '',
  },
  todos: [todoSchema],
  images: [imageSchema],
}, {
  timestamps: true,
})

export default mongoose.model('Note', noteSchema)
