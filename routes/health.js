import express from 'express'
import Health from '../models/Health.js'
import { isAuthenticated } from '../middleware/auth.js'

const router = express.Router()

// Get all food logs for logged in user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const data = await Health.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create manual food entry
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { food, protein, calories } = req.body
    if (!food || protein === undefined || calories === undefined) {
      return res.status(400).json({ error: 'Food, protein (g), and calories (kcal) are required' })
    }

    const entry = new Health({
      userId: req.userId,
      food: food.trim(),
      protein: parseFloat(protein),
      calories: parseFloat(calories),
    })

    await entry.save()
    res.status(201).json({ data: entry })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete food log
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params
    const entry = await Health.findOneAndDelete({ _id: id, userId: req.userId })
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' })
    }
    res.json({ message: 'Entry deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Bulk parse food entries from note saves
router.post('/parse-note', isAuthenticated, async (req, res) => {
  try {
    const { noteId, content } = req.body
    if (!noteId) {
      return res.status(400).json({ error: 'noteId is required' })
    }

    // Clean old parsed food logs for this note first
    await Health.deleteMany({ userId: req.userId, sourceNoteId: noteId.toString() })

    if (!content) {
      return res.json({ message: 'Note content is empty, cleared old entries.', count: 0 })
    }

    // Regex to extract tags: [protein: 30 | cal: 400 | food: Chicken Breast]
    const pattern = /\[protein:\s*([\d\.]+)\s*\|\s*cal:\s*([\d\.]+)\s*\|\s*food:\s*([^\]]+)\]/gi
    let match
    const entriesToInsert = []

    while ((match = pattern.exec(content)) !== null) {
      const [_, proteinStr, caloriesStr, foodName] = match
      
      entriesToInsert.push({
        userId: req.userId,
        food: foodName.trim(),
        protein: parseFloat(proteinStr),
        calories: parseFloat(caloriesStr),
        sourceNoteId: noteId.toString()
      })
    }

    if (entriesToInsert.length > 0) {
      await Health.insertMany(entriesToInsert)
    }

    res.json({ message: `Successfully parsed and recorded ${entriesToInsert.length} food logs.`, count: entriesToInsert.length })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
