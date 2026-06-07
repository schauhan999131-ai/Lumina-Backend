import jwt from 'jsonwebtoken'

export const isAuthenticated = (req, res, next) => {
  const token = req.cookies?.token
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated. Please login.' })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production')
    req.userId = decoded.userId
    req.userEmail = decoded.userEmail
    req.role = decoded.role || 'Staff'

    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please login again.' })
  }
}

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}
