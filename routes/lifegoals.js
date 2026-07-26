import express from 'express'
import LifeGoal from '../models/LifeGoal.js'
import { isAuthenticated } from '../middleware/auth.js'

const router = express.Router()

// Get all saved life maps for the logged in user, most recently updated first.
// Excludes nodes/edges — the list view only needs titles, the canvas is loaded
// per-map on demand via GET /:id.
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const lifeGoals = await LifeGoal.find({ userId: req.userId })
      .select('-nodes -edges')
      .sort({ updatedAt: -1 })
      .lean()
    res.json({ data: lifeGoals })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get a single life map (full node/edge graph) for the logged in user.
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const lifeGoal = await LifeGoal.findOne({ _id: req.params.id, userId: req.userId }).lean()
    if (!lifeGoal) {
      return res.status(404).json({ error: 'Life map not found' })
    }
    res.json({ data: lifeGoal })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create a new life map.
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { title, nodes = [], edges = [] } = req.body
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'title required' })
    }

    const lifeGoal = new LifeGoal({
      userId: req.userId,
      title,
      nodes,
      edges,
    })
    await lifeGoal.save()
    res.status(201).json({ data: lifeGoal })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update an existing life map. The whole canvas (nodes + edges) is edited
// client-side as one unit and saved wholesale, same pattern as Notes' todos array.
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params
    const { title, nodes, edges } = req.body

    const lifeGoal = await LifeGoal.findOne({ _id: id, userId: req.userId })
    if (!lifeGoal) {
      return res.status(404).json({ error: 'Life map not found' })
    }

    if (title !== undefined) lifeGoal.title = title
    if (nodes !== undefined) lifeGoal.nodes = nodes
    if (edges !== undefined) lifeGoal.edges = edges

    await lifeGoal.save()
    res.json({ data: lifeGoal })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete a life map.
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params
    const lifeGoal = await LifeGoal.findOneAndDelete({ _id: id, userId: req.userId })
    if (!lifeGoal) {
      return res.status(404).json({ error: 'Life map not found' })
    }
    res.json({ message: 'Life map deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
