import express from 'express'
import Wealth from '../models/Wealth.js'
import { isAuthenticated } from '../middleware/auth.js'

const router = express.Router()

// Get all transactions for logged in user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const data = await Wealth.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create transaction manual entry
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { type, amount, category, description } = req.body
    if (!type || !amount || !category) {
      return res.status(400).json({ error: 'Type, amount, and category are required' })
    }

    const entry = new Wealth({
      userId: req.userId,
      type,
      amount: parseFloat(amount),
      category: category.trim(),
      description: description ? description.trim() : '',
    })

    await entry.save()
    res.status(201).json({ data: entry })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete transaction
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params
    const entry = await Wealth.findOneAndDelete({ _id: id, userId: req.userId })
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' })
    }
    res.json({ message: 'Entry deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Bulk save extracted transactions from note content
router.post('/parse-note', isAuthenticated, async (req, res) => {
  try {
    const { noteId, content } = req.body
    if (!noteId) {
      return res.status(400).json({ error: 'noteId is required' })
    }

    // Clean old parsed transactions for this note first
    await Wealth.deleteMany({ userId: req.userId, sourceNoteId: noteId.toString() })

    if (!content) {
      return res.json({ message: 'Note content is empty, cleared old entries.', count: 0 })
    }

    // Regex to extract tags: [type: amount | cat: name | desc: text]
    // e.g. [expense: 12.50 | cat: Coffee | desc: coding session]
    // type can be expense, saving, earning
    const pattern = /\[(expense|saving|earning):\s*([\d\.]+)\s*\|\s*cat:\s*([^|]+)\s*\|\s*desc:\s*([^\]]+)\]/gi
    let match
    const entriesToInsert = []

    while ((match = pattern.exec(content)) !== null) {
      const [_, type, amountStr, category, description] = match
      
      // Map 'saving' from notes shortcode to Mongoose enum 'savings'
      const ledgerType = type.toLowerCase() === 'saving' ? 'savings' : type.toLowerCase()
      
      entriesToInsert.push({
        userId: req.userId,
        type: ledgerType,
        amount: parseFloat(amountStr),
        category: category.trim(),
        description: description.trim(),
        sourceNoteId: noteId.toString()
      })
    }

    if (entriesToInsert.length > 0) {
      await Wealth.insertMany(entriesToInsert)
    }

    res.json({ message: `Successfully parsed and recorded ${entriesToInsert.length} transactions.`, count: entriesToInsert.length })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
