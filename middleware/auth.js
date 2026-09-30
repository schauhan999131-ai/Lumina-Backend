import jwt from 'jsonwebtoken'

const extractToken = (req) => {
  if (req.cookies?.token) {
    return req.cookies.token
  }

  const authHeader = req.headers?.authorization
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim()
  }

  return null
}

export const isAuthenticated = (req, res, next) => {
  const token = extractToken(req)

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated. Please login.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production')

    if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid or expired token. Please login again.' })
    }

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
