import express from 'express'
import Task from '../models/Task.js'
import { isAuthenticated } from '../middleware/auth.js'

const router = express.Router()

// Get all tasks for logged in user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json({ data: tasks })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create task
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { title, category = 'Daily', priority = 'Medium', status = 'Not Started' } = req.body
    if (!title) {
      return res.status(400).json({ error: 'Task title is required' })
    }

    const task = new Task({
      userId: req.userId,
      title,
      category,
      status,
      priority,
      completed: status === 'Completed',
      completedAt: status === 'Completed' ? new Date() : null,
    })

    await task.save()
    res.status(201).json({ data: task })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update task (status, priority, details, etc.)
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params
    const { title, category, status, priority } = req.body

    const task = await Task.findOne({ _id: id, userId: req.userId })
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    if (title !== undefined) task.title = title
    if (category !== undefined) task.category = category
    if (priority !== undefined) task.priority = priority
    
    if (status !== undefined) {
      task.status = status
      task.completed = status === 'Completed'
      task.completedAt = status === 'Completed' ? new Date() : null
    }

    await task.save()
    res.json({ data: task })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete task
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params
    const task = await Task.findOneAndDelete({ _id: id, userId: req.userId })
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }
    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get completion analytics stats (Daily, Monthly, Yearly) + status count details
router.get('/stats', isAuthenticated, async (req, res) => {
  try {
    const allTasks = await Task.find({ userId: req.userId })
    const completedTasks = allTasks.filter(t => t.status === 'Completed')

    // Generate last 7 days
    const dailyStats = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
      const dateString = d.toDateString()
      
      const count = completedTasks.filter(t => t.completedAt && new Date(t.completedAt).toDateString() === dateString).length
      dailyStats.push({ label: dayName, count })
    }

    // Generate last 6 months
    const monthlyStats = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const monthName = d.toLocaleDateString('en-US', { month: 'short' })
      const year = d.getFullYear()
      
      const count = completedTasks.filter(t => {
        if (!t.completedAt) return false
        const compDate = new Date(t.completedAt)
        return compDate.getMonth() === d.getMonth() && compDate.getFullYear() === year
      }).length
      monthlyStats.push({ label: monthName, count })
    }

    // Generate last 5 years
    const yearlyStats = []
    const currentYear = new Date().getFullYear()
    for (let i = 4; i >= 0; i--) {
      const year = currentYear - i
      const count = completedTasks.filter(t => t.completedAt && new Date(t.completedAt).getFullYear() === year).length
      yearlyStats.push({ label: year.toString(), count })
    }

    // Calculate today's stats
    const todayDateString = new Date().toDateString()
    const todayCompletedCount = completedTasks.filter(t => t.completedAt && new Date(t.completedAt).toDateString() === todayDateString).length

    // Status distributions
    const notStartedCount = allTasks.filter(t => t.status === 'Not Started').length
    const pendingCount = allTasks.filter(t => t.status === 'Pending').length
    const completedCount = completedTasks.length

    // Priority distributions for active tasks
    const highPriorityCount = allTasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length
    const mediumPriorityCount = allTasks.filter(t => t.priority === 'Medium' && t.status !== 'Completed').length
    const lowPriorityCount = allTasks.filter(t => t.priority === 'Low' && t.status !== 'Completed').length

    res.json({
      daily: dailyStats,
      monthly: monthlyStats,
      yearly: yearlyStats,
      todayCompletedCount,
      totalCompletedCount: completedCount,
      statusDistribution: {
        notStarted: notStartedCount,
        pending: pendingCount,
        completed: completedCount,
      },
      priorityDistribution: {
        high: highPriorityCount,
        medium: mediumPriorityCount,
        low: lowPriorityCount,
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
