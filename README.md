# Backend Project Structure

## 📁 Files Created

### Authentication System (`/middleware/auth.js`)
- `isAuthenticated`: Middleware to check if user is logged in via session/cookies
- `authorize(...roles)`: Middleware to check user permissions by role

### User Model (`/models/User.js`)
- Defines the User schema for MongoDB
- Password hashing with bcryptjs
- Email validation
- Methods: `matchPassword()`, `toJSON()`

### Auth Controller (`/controllers/authController.js`)
- `signup()`: Register new users with email, password, tenantId, and role
- `login()`: Authenticate users and create sessions
- `logout()`: Destroy sessions and clear cookies
- `getCurrentUser()`: Get authenticated user info

### Routes
- `/routes/auth.js` - Authentication endpoints (signup, login, logout, me)
- `/routes/inventory.js` - Inventory management endpoints
- `/routes/analytics.js` - Analytics data endpoints
- `/routes/invoices.js` - Invoice management endpoints
- `/routes/content.js` - CMS content endpoints

### Main App File (`/App.js`)
- Express server setup with Socket.io
- Session middleware with httpOnly cookies
- CORS configuration for cross-origin requests
- Redis client for caching
- All routes imported and registered

## 🔐 Authentication Flow

1. **Signup**: User creates account with email/password → Hashed password stored in MongoDB → Session created → Cookie set
2. **Login**: User logs in → Password verified → Session created → Cookie sent to client
3. **Protected Routes**: Session middleware checks `req.session.userId` → User info attached to request
4. **Logout**: Session destroyed → Cookie cleared

## 🚀 Running the Backend

### 1. Install Dependencies
```bash
cd Backend
npm install
# or
yarn install
```

### 2. Setup Environment Variables
Create `.env` file (or copy from `.env.example`):
```
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your-secret-key
MONGODB_URI=mongodb://localhost:27017/smb-saas
REDIS_URL=redis://localhost:6379
```

### 3. Start MongoDB (if installed locally)
```bash
mongod
# Or use MongoDB Atlas cloud service
```

### 4. Start Redis (optional, for caching)
```bash
redis-server
```

### 5. Run the Backend Server
```bash
npm run dev
# or
yarn dev
```

Server runs on: **http://localhost:4000**

## 📋 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user (protected)
- `GET /api/auth/me` - Get current user (protected)

### Inventory
- `GET /api/inventory` - Get all items (protected)
- `POST /api/inventory/:sku/adjust` - Adjust quantity (protected, Admin/Manager only)

### Analytics
- `GET /api/analytics` - Get analytics data (protected)

### Invoices
- `GET /api/invoices` - Get invoices (protected)
- `POST /api/invoices` - Create invoice (protected, Admin/Manager only)

### Content (CMS)
- `GET /api/content/models` - Get content models (protected)
- `POST /api/content/models` - Create content model (protected, Admin only)

## 🔒 Security Features

✅ **httpOnly Cookies**: Sessions stored in secure, httpOnly cookies (can't be accessed by JavaScript)
✅ **Password Hashing**: Bcryptjs for secure password storage
✅ **CORS**: Restricted to frontend domain
✅ **Role-Based Access Control**: Different permissions for Admin, Manager, Staff
✅ **Session Management**: Express-session with automatic expiry (24 hours)

## 🛠️ Technologies Used

- **Express.js**: Web framework
- **MongoDB**: Database (with Mongoose ODM)
- **Bcryptjs**: Password hashing
- **Express-session**: Session management
- **Cookie-parser**: Cookie parsing
- **Socket.io**: Real-time communication
- **Redis**: Caching (optional)
- **Node-cron**: Scheduled tasks
- **Nodemailer**: Email notifications
