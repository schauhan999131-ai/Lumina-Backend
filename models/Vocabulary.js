import mongoose from 'mongoose'

const vocabSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  word: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    default: 'Coding Term',
  },
  partOfSpeech: {
    type: String,
    default: 'Noun',
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  definition: {
    type: String,
    required: true,
  },
  example: {
    type: String,
    default: '',
  },
  codeContext: {
    type: String,
    default: '',
  },
  mnemonic: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['learning', 'mastered'],
    default: 'learning',
  },
}, {
  timestamps: true,
})

export default mongoose.model('Vocabulary', vocabSchema)
