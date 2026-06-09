import User from '../models/User.js'
import jwt from 'jsonwebtoken'

export const signup = async (req, res) => {
  try {
    const { email, password, role = 'Staff', plan = 'Free' } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Check if user exists
    console.log("hellow")
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Create new user
    const user = new User({
      email,
      password,
      role,
      plan,
    })

    await user.save()

    // Sign JWT
    const token = jwt.sign(
      { userId: user._id.toString(), userEmail: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '24h' }
    )

    // Set cookie — SameSite=None+Secure required for cross-origin (Vercel→Render)
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    })

    res.status(201).json({
      message: 'User created successfully',
      user: user.toJSON(),
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
    // Find user and select password (since select: false is set in schema)
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isPasswordValid = await user.matchPassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Sign JWT
    const token = jwt.sign(
      { userId: user._id.toString(), userEmail: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '24h' }
    )

    // Set cookie — SameSite=None+Secure required for cross-origin (Vercel→Render)
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    })

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  })
  res.json({ message: 'Logout successful' })
}

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({ user: user.toJSON() })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const updateMyPlan = async (req, res) => {
  try {
    const { plan } = req.body
    if (!['Free', 'Pro', 'Enterprise'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan selected' })
    }

    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    user.plan = plan
    await user.save()

    res.json({
      message: 'Plan updated successfully',
      user: user.toJSON(),
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { profilePicture, occupation } = req.body

    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (profilePicture !== undefined) user.profilePicture = profilePicture
    if (occupation !== undefined) user.occupation = occupation

    await user.save()

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON(),
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const updateYoutubeSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    user.isSubscribedYoutube = true
    await user.save()

    res.json({
      message: 'YouTube subscription status updated successfully',
      user: user.toJSON(),
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
