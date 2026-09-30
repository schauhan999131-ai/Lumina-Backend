import test from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import { isAuthenticated } from '../middleware/auth.js'

const TEST_SECRET = 'test-secret'
process.env.JWT_SECRET = TEST_SECRET

test('isAuthenticated accepts a bearer token from the Authorization header', () => {
  const token = jwt.sign({ userId: 'user-123', userEmail: 'admin@example.com', role: 'Admin' }, TEST_SECRET, { expiresIn: '1h' })

  const req = {
    cookies: {},
    headers: {
      authorization: `Bearer ${token}`,
    },
  }

  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
  }

  let nextCalled = false
  const next = () => {
    nextCalled = true
  }

  isAuthenticated(req, res, next)

  assert.equal(nextCalled, true)
  assert.equal(req.userId, 'user-123')
  assert.equal(req.userEmail, 'admin@example.com')
  assert.equal(req.role, 'Admin')
})
