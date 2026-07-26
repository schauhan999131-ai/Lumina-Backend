import mongoose from 'mongoose'

// Freeform mind-map node: user places/drags it anywhere and labels it themselves.
const mapNodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true, trim: true },
  kind: { type: String, enum: ['goal', 'task', 'avoid', 'note'], default: 'note' },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
}, { _id: false })

// User-drawn connection between two nodes.
const mapEdgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
}, { _id: false })

// A LifeGoal is one saved freeform life-planning mind map: a titled canvas of
// nodes the user placed and connected by hand.
const lifeGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  nodes: [mapNodeSchema],
  edges: [mapEdgeSchema],
}, {
  timestamps: true,
})

lifeGoalSchema.index({ userId: 1, updatedAt: -1 })

export default mongoose.model('LifeGoal', lifeGoalSchema)
