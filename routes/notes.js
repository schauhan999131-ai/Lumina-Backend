import express from 'express'
import Note from '../models/Note.js'
import { isAuthenticated } from '../middleware/auth.js'

const router = express.Router()

// Get all notes for the logged in user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId }).sort({ updatedAt: -1 })
    res.json({ data: notes })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create a new note or batch migrate notes
router.post('/', isAuthenticated, async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      const notesToCreate = req.body.map((note) => ({
        userId: req.userId,
        title: note.title || 'Untitled Note',
        subject: note.subject || 'Software Engineering',
        content: note.content || '',
        todos: note.todos || [],
        images: note.images || [],
      }))
      const createdNotes = await Note.insertMany(notesToCreate)
      res.status(201).json({ data: createdNotes })
    } else {
      const { title, subject, content, todos = [], images = [] } = req.body
      const note = new Note({
        userId: req.userId,
        title,
        subject,
        content,
        todos,
        images,
      })
      await note.save()
      res.status(201).json({ data: note })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update an existing note
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params
    const { title, subject, content, todos, images } = req.body

    const note = await Note.findOne({ _id: id, userId: req.userId })
    if (!note) {
      return res.status(404).json({ error: 'Note not found' })
    }

    if (title !== undefined) note.title = title
    if (subject !== undefined) note.subject = subject
    if (content !== undefined) note.content = content
    if (todos !== undefined) note.todos = todos
    if (images !== undefined) note.images = images

    await note.save()
    res.json({ data: note })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete a note
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params
    const note = await Note.findOneAndDelete({ _id: id, userId: req.userId })
    if (!note) {
      return res.status(404).json({ error: 'Note not found' })
    }
    res.json({ message: 'Note deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
