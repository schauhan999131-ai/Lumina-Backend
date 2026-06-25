import mongoose from 'mongoose'
import bcryptjs from 'bcryptjs'

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['Admin', 'Manager', 'Staff'],
    default: 'Staff',
  },
  plan: {
    type: String,
    enum: ['Free', 'Pro', 'Enterprise'],
    default: 'Free',
  },
  planStatus: {
    type: String,
    enum: ['Active', 'Canceled'],
    default: 'Active',
  },
  profilePicture: {
    type: String,
    default: '',
  },
  occupation: {
    type: String,
    default: 'Developer',
  },
  isSubscribedYoutube: {
    type: Boolean,
    default: false,
  },
  studyTimerEndTime: {
    type: Number,
    default: 0,
  },
  studyTimerActive: {
    type: Boolean,
    default: false,
  },
  studyTimerMode: {
    type: String,
    default: 'work',
  },
  studyTimerTimeLeft: {
    type: Number,
    default: 1500,
  },
  studyWorkDuration: {
    type: Number,
    default: 25,
  },
  studyShortDuration: {
    type: Number,
    default: 5,
  },
  studyLongDuration: {
    type: Number,
    default: 15,
  },
  studySessionsCompleted: {
    type: Number,
    default: 0,
  },
  studyFocusMinutes: {
    type: Number,
    default: 0,
  },
  studyFocusHistory: {
    type: String,
    default: '[]',
  },
  studyAcceptedDays: {
    type: String,
    default: '[]',
  },
  studyTimerStartDuration: {
    type: Number,
    default: 0,
  },
  studyTimerLastReset: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  
  const hashedPassword = await bcryptjs.hash(this.password, 10)
  this.password = hashedPassword
})

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password)
}

// Method to return user without password
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}
  
export default mongoose.model('User', userSchema)
