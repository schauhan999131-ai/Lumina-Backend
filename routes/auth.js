import express from 'express'
import { signup, login, logout, getCurrentUser, updateMyPlan, updateProfile, updateYoutubeSubscription, getTimerState, updateTimerState } from '../controllers/authController.js'
import { isAuthenticated } from '../middleware/auth.js'

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', isAuthenticated, logout)
router.get('/me', isAuthenticated, getCurrentUser)
router.put('/plan', isAuthenticated, updateMyPlan)
router.put('/profile', isAuthenticated, updateProfile)
router.put('/youtube-subscribe', isAuthenticated, updateYoutubeSubscription)
router.get('/timer', isAuthenticated, getTimerState)
router.put('/timer', isAuthenticated, updateTimerState)

export default router
