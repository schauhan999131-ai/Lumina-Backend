import express from 'express'
import { createServer } from 'node:http'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { Server } from 'socket.io'
import cron from 'node-cron'
import nodemailer from 'nodemailer'
import { createClient } from 'redis'
import dotenv from 'dotenv'

// Import routes
import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'
import taskRoutes from './routes/tasks.js'
import wealthRoutes from './routes/wealth.js'
import healthRoutes from './routes/health.js'

// Import database connection
import connectDB from './config.js'

dotenv.config()

// Initialize Database
const dbConnected = await connectDB()
if (!dbConnected) {
  console.error('✖️ Database connection failed. Backend will not start.')
  process.exit(1)
}

const app = express()
const server = createServer(app)

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'
const allowedOrigins = [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3003']

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Redis Setup
const redisClient = createClient({ 
  url: process.env.REDIS_URL || 'redis://localhost:6379' 
})

redisClient.on('error', (err) => console.error('Redis Client Error', err))

// Connect Redis
await (async () => {
  try {
    await redisClient.connect()
    console.log('Redis Connected')
  } catch (err) {
    console.warn('Redis connection failed, continuing without cache.')
  }
})()

// Middleware - Order matters!
app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    callback(new Error('CORS policy: origin not allowed'))
  },
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(cookieParser())

// Session Configuration removed (using JWT cookies now)

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Routes

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/wealth', wealthRoutes)
app.use('/api/health-tracker', healthRoutes)

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('User connected to socket')
  
  // Periodically send live study feed updates to frontend
  const interval = setInterval(() => {
    const subjects = ['Mathematics', 'Computer Science', 'Physics', 'Organic Chemistry', 'English Literature', 'World History']
    const activities = ['completed a study session', 'added a new daily task', 'completed a study task', 'created a study note']
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
    const randomActivity = activities[Math.floor(Math.random() * activities.length)]
    
    socket.emit('study:update', {
      user: `student-${Math.floor(Math.random() * 900) + 100}@university.edu`,
      activity: randomActivity,
      subject: randomSubject,
      timestamp: new Date()
    })
  }, 3000)

  socket.on('disconnect', () => {
    clearInterval(interval)
    console.log('User disconnected')
  })
})

// Cron Job for Reports
cron.schedule('0 8 * * 1', async () => {
  console.log('Running weekly report...')
  // Email logic here...
})

// Dynamic port assignment with EADDRINUSE fallback
const startServer = (portToTry) => {
  server.listen(portToTry, () => {
    console.log(`🚀 Backend running on http://localhost:${portToTry}`)
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${portToTry} is already in use. Trying port ${portToTry + 1}...`)
      startServer(portToTry + 1)
    } else {
      console.error('Server error:', err)
    }
  })
}

const initialPort = parseInt(process.env.PORT, 10) || 4000
startServer(initialPort)