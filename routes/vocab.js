import express from 'express'
import Vocabulary from '../models/Vocabulary.js'
import { isAuthenticated } from '../middleware/auth.js'

const router = express.Router()

// Get all vocab words for the logged in user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const vocab = await Vocabulary.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json({ data: vocab })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create one word or batch import an array
router.post('/', isAuthenticated, async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      const items = req.body.map((v) => ({
        userId: req.userId,
        word: v.word,
        category: v.category || 'Coding Term',
        partOfSpeech: v.partOfSpeech || 'Noun',
        difficulty: v.difficulty || 'Medium',
        definition: v.definition,
        example: v.example || '',
        codeContext: v.codeContext || '',
        mnemonic: v.mnemonic || '',
        image: v.image || null,
        status: v.status || 'learning',
      }))
      const created = await Vocabulary.insertMany(items)
      return res.status(201).json({ data: created })
    }

    const { word, category, partOfSpeech, difficulty, definition, example, codeContext, mnemonic, image, status } = req.body
    const vocab = new Vocabulary({
      userId: req.userId,
      word, category, partOfSpeech, difficulty, definition,
      example: example || '',
      codeContext: codeContext || '',
      mnemonic: mnemonic || '',
      image: image || null,
      status: status || 'learning',
    })
    await vocab.save()
    res.status(201).json({ data: vocab })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update a vocab word
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const vocab = await Vocabulary.findOne({ _id: req.params.id, userId: req.userId })
    if (!vocab) return res.status(404).json({ error: 'Word not found' })

    const fields = ['word', 'category', 'partOfSpeech', 'difficulty', 'definition', 'example', 'codeContext', 'mnemonic', 'image', 'status']
    fields.forEach((f) => { if (req.body[f] !== undefined) vocab[f] = req.body[f] })

    await vocab.save()
    res.json({ data: vocab })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Batch update status for all words (e.g. reset all to learning)
router.put('/batch/status', isAuthenticated, async (req, res) => {
  try {
    const { status } = req.body
    await Vocabulary.updateMany({ userId: req.userId }, { status })
    res.json({ message: 'All words updated' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete a vocab word
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const vocab = await Vocabulary.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!vocab) return res.status(404).json({ error: 'Word not found' })
    res.json({ message: 'Word deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
