
# BikeService Website

A bike service booking system with modern UI and comprehensive dashboard features. 

## ✨ Features

### For Customers:
- 🔐 User registration and authentication
- 🔍 Browse available bike services
- 📅 Book services with date and time selection
- 📱 View booking history and status
- 👤 Profile management

### For Service Owners (Admin):
- 📊 Professional dashboard with analytics
- 📈 Business statistics and revenue tracking
- 📋 Booking management with status updates
- 🛠️ Service management (CRUD operations)
- 👥 Customer analytics and insights
- 📈 Revenue and performance analytics

### General Features:
- 🎨 Professional monochrome UI design
- 📱 Fully responsive design
- 🚀 Real-time availability checking
- 🔒 Secure authentication with JWT
- 💾 MongoDB database integration

## 🛠️ Tech Stack

**Frontend:**
- React 18
- React Router DOM
- Axios for API calls
- CSS3 with CSS Custom Properties

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- CORS enabled

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup
```bash
# Clone the repository
git clone 
cd server

# Install backend dependencies
npm install

# Required packages
npm install express mongoose cors bcryptjs jsonwebtoken

# Start the backend server
node server.js
```

### Frontend Setup
```bash
# Navigate to frontend directory (if separate)
cd client

# Install frontend dependencies
npm install

# Required packages
npm install react react-dom react-router-dom axios

# Start the frontend development server
npm start
```

## 📖 Usage

1. **Start the backend server** (runs on port 5001)
2. **Start the frontend** (runs on port 3000)
3. **Register as a customer** or use admin credentials
4. **Browse services** and make bookings
5. **Manage bookings** through the dashboard

## 🔑 Admin Access

### Admin/Service Owner Credentials:
```
Email: admin@gmail.com
Password: 123456
```

### Admin Dashboard Features:
- **Overview Tab**: Business statistics, revenue tracking, service performance
- **Bookings Tab**: Manage all bookings, update status, view customer details
- **Services Tab**: CRUD operations for services, performance metrics
- **Customers Tab**: Customer analytics, spending insights, booking history

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `GET /api/services/:id/available-slots` - Get available time slots
- `POST /api/services` - Create service (Service Owner only)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/my-bookings` - Get user's bookings

### Admin Dashboard
- `GET /api/admin/dashboard` - Dashboard overview
- `GET /api/admin/bookings` - All bookings with filters
- `PATCH /api/admin/bookings/:id/status` - Update booking status
- `GET /api/admin/services` - Service management
- `GET /api/admin/customers` - Customer analytics

### Utility
- `GET /api/health` - Health check
- `GET /api/categories` - Service categories

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=bike_service_secret_key_2024
PORT=5001
```

**Access admin dashboard**:
   - Login with: `admin@gmail.com` / `123456`
   - Navigate to Dashboard tab


## 📄 License

This project is licensed under the MIT License.
