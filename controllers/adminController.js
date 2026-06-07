import User from '../models/User.js'

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
    res.json({ users })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const adminCreateUser = async (req, res) => {
  try {
    const { email, password, role = 'Staff', plan = 'Free' } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    const user = new User({
      email,
      password,
      role,
      plan,
    })

    await user.save()

    res.status(201).json({
      message: 'User created successfully by admin',
      user: user.toJSON(),
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const adminUpdateUserPlan = async (req, res) => {
  try {
    const { id } = req.params
    const { plan, planStatus } = req.body

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (plan !== undefined) user.plan = plan
    if (planStatus !== undefined) user.planStatus = planStatus

    await user.save()

    res.json({
      message: 'User plan updated successfully',
      user: user.toJSON(),
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByIdAndDelete(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
