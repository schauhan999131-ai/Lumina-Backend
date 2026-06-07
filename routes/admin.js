import express from 'express'
import {
  getAllUsers,
  adminCreateUser,
  adminUpdateUserPlan,
  adminDeleteUser,
} from '../controllers/adminController.js'
import { isAuthenticated, authorize } from '../middleware/auth.js'

const router = express.Router()

router.get('/users', isAuthenticated, authorize('Admin'), getAllUsers)
router.post('/users', isAuthenticated, authorize('Admin'), adminCreateUser)
router.put('/users/:id/plan', isAuthenticated, authorize('Admin'), adminUpdateUserPlan)
router.delete('/users/:id', isAuthenticated, authorize('Admin'), adminDeleteUser)

export default router
