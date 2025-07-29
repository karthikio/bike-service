const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// CORS Configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// MongoDB Connection  
mongoose.connect('mongodb+srv://developerkarthiksanthosh:QUe2TjSXH89euh2m@cluster0.3sivflj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('✅ MongoDB Connected');
    startServer();
  })
  .catch(err => {
    console.error('❌ MongoDB Error:', err);
    process.exit(1);
  });

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['customer', 'service_owner'],
    default: 'customer'
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

// Service Schema
const serviceSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  estimatedTime: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['maintenance', 'repair', 'customization', 'inspection'],
    required: true
  },
  serviceOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  availableTimeSlots: [{
    time: { type: String, required: true },
    isBooked: { type: Boolean, default: false }
  }],
  workingDays: {
    type: [String],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  }
}, {
  timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  serviceOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bikeDetails: {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    registrationNumber: { type: String, required: true },
    engineNumber: { type: String },
    chassisNumber: { type: String }
  },
  bookingDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  customerAddress: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  specialRequests: {
    type: String,
    default: ''
  },
  urgency: {
    type: String,
    enum: ['normal', 'urgent', 'emergency'],
    default: 'normal'
  }
}, {
  timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);

// Auth Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, 'bike_service_secret_key_2024');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Service Owner Only Middleware
const serviceOwnerAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    
    if (req.user.role !== 'service_owner') {
      return res.status(403).json({ message: 'Access denied. Service owners only.' });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      phone,
      password,
      role: role || 'customer'
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      'bike_service_secret_key_2024',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      'bike_service_secret_key_2024',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Current User
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// ===========================
// ADMIN DASHBOARD ROUTES
// ===========================

// Dashboard Overview Stats
app.get('/api/admin/dashboard', serviceOwnerAuth, async (req, res) => {
  try {
    const serviceOwnerId = req.user._id;

    // Basic Stats
    const totalServices = await Service.countDocuments({ serviceOwner: serviceOwnerId });
    const activeServices = await Service.countDocuments({ serviceOwner: serviceOwnerId, isActive: true });
    
    const totalBookings = await Booking.countDocuments({ serviceOwner: serviceOwnerId });
    const pendingBookings = await Booking.countDocuments({ serviceOwner: serviceOwnerId, status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ serviceOwner: serviceOwnerId, status: 'confirmed' });
    const inProgressBookings = await Booking.countDocuments({ serviceOwner: serviceOwnerId, status: 'in_progress' });
    const completedBookings = await Booking.countDocuments({ serviceOwner: serviceOwnerId, status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ serviceOwner: serviceOwnerId, status: 'cancelled' });

    // Revenue Calculation
    const revenueResult = await Booking.aggregate([
      { $match: { serviceOwner: serviceOwnerId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Monthly Revenue (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          serviceOwner: serviceOwnerId,
          status: 'completed',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Service Performance
    const servicePerformance = await Booking.aggregate([
      { $match: { serviceOwner: serviceOwnerId, status: 'completed' } },
      {
        $group: {
          _id: '$service',
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'serviceInfo'
        }
      },
      { $unwind: '$serviceInfo' },
      {
        $project: {
          serviceName: '$serviceInfo.serviceName',
          category: '$serviceInfo.category',
          bookings: 1,
          revenue: 1
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: 5 }
    ]);

    // Recent Bookings
    const recentBookings = await Booking.find({ serviceOwner: serviceOwnerId })
      .populate('customer', 'name email phone')
      .populate('service', 'serviceName category')
      .sort({ createdAt: -1 })
      .limit(10);

    // Customer Stats
    const uniqueCustomers = await Booking.distinct('customer', { serviceOwner: serviceOwnerId });
    const totalCustomers = uniqueCustomers.length;

    res.json({
      success: true,
      dashboard: {
        stats: {
          totalServices,
          activeServices,
          totalBookings,
          pendingBookings,
          confirmedBookings,
          inProgressBookings,
          completedBookings,
          cancelledBookings,
          totalRevenue,
          totalCustomers
        },
        monthlyRevenue,
        servicePerformance,
        recentBookings
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All Bookings with Filters
app.get('/api/admin/bookings', serviceOwnerAuth, async (req, res) => {
  try {
    const { status, service, customer, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    let query = { serviceOwner: req.user._id };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (service) {
      query.service = service;
    }
    
    if (customer) {
      query.customer = customer;
    }
    
    if (startDate || endDate) {
      query.bookingDate = {};
      if (startDate) query.bookingDate.$gte = new Date(startDate);
      if (endDate) query.bookingDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone')
      .populate('service', 'serviceName category price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalBookings = await Booking.countDocuments(query);
    const totalPages = Math.ceil(totalBookings / parseInt(limit));

    res.json({
      success: true,
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalBookings,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Booking Status
app.patch('/api/admin/bookings/:id/status', serviceOwnerAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const booking = await Booking.findOne({
      _id: req.params.id,
      serviceOwner: req.user._id
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();
    
    await booking.populate([
      { path: 'service', select: 'serviceName price estimatedTime category' },
      { path: 'customer', select: 'name email phone' },
      { path: 'serviceOwner', select: 'name email phone' }
    ]);
    
    res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Service Management Data
app.get('/api/admin/services', serviceOwnerAuth, async (req, res) => {
  try {
    const services = await Service.find({ serviceOwner: req.user._id })
      .sort({ createdAt: -1 });
    
    // Add booking count for each service
    const servicesWithStats = await Promise.all(
      services.map(async (service) => {
        const bookingCount = await Booking.countDocuments({ service: service._id });
        const revenueResult = await Booking.aggregate([
          { $match: { service: service._id, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
        
        return {
          ...service.toObject(),
          bookingCount,
          revenue
        };
      })
    );

    res.json({
      success: true,
      services: servicesWithStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Service
app.put('/api/admin/services/:id', serviceOwnerAuth, async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      serviceOwner: req.user._id
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const { serviceName, description, price, estimatedTime, category, availableTimeSlots, isActive } = req.body;

    if (serviceName) service.serviceName = serviceName;
    if (description) service.description = description;
    if (price) service.price = price;
    if (estimatedTime) service.estimatedTime = estimatedTime;
    if (category) service.category = category;
    if (availableTimeSlots) service.availableTimeSlots = availableTimeSlots;
    if (typeof isActive === 'boolean') service.isActive = isActive;

    await service.save();

    res.json({
      success: true,
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Customer Analytics
app.get('/api/admin/customers', serviceOwnerAuth, async (req, res) => {
  try {
    const customerStats = await Booking.aggregate([
      { $match: { serviceOwner: req.user._id } },
      {
        $group: {
          _id: '$customer',
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          lastBooking: { $max: '$createdAt' },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'customerInfo'
        }
      },
      { $unwind: '$customerInfo' },
      {
        $project: {
          name: '$customerInfo.name',
          email: '$customerInfo.email',
          phone: '$customerInfo.phone',
          totalBookings: 1,
          totalSpent: 1,
          lastBooking: 1,
          completedBookings: 1
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);

    res.json({
      success: true,
      customers: customerStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Revenue Analytics
app.get('/api/admin/analytics/revenue', serviceOwnerAuth, async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    
    let groupBy = {};
    let dateRange = {};
    
    if (period === 'daily') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      dateRange = { createdAt: { $gte: lastMonth } };
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
    } else if (period === 'monthly') {
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      dateRange = { createdAt: { $gte: lastYear } };
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
    } else if (period === 'yearly') {
      const lastFiveYears = new Date();
      lastFiveYears.setFullYear(lastFiveYears.getFullYear() - 5);
      dateRange = { createdAt: { $gte: lastFiveYears } };
      groupBy = { year: { $year: '$createdAt' } };
    }

    const analytics = await Booking.aggregate([
      {
        $match: {
          serviceOwner: req.user._id,
          status: 'completed',
          ...dateRange
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===========================
// PUBLIC ROUTES
// ===========================

// Get All Services (Public)
app.get('/api/services', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { serviceName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const services = await Service.find(query)
      .populate('serviceOwner', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      services
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Service by ID
app.get('/api/services/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('serviceOwner', 'name email phone');
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json({
      success: true,
      service
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Available Time Slots
app.get('/api/services/:id/available-slots', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required' });
    }

    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      service: req.params.id,
      bookingDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['pending', 'confirmed', 'in_progress'] }
    });

    const bookedSlots = existingBookings.map(booking => booking.timeSlot);
    const availableSlots = service.availableTimeSlots
      .map(slot => slot.time)
      .filter(time => !bookedSlots.includes(time));

    res.json({
      success: true,
      availableSlots
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create Service
app.post('/api/services', auth, async (req, res) => {
  try {
    if (req.user.role !== 'service_owner') {
      return res.status(403).json({ message: 'Only service owners can create services' });
    }
    
    const { serviceName, description, price, estimatedTime, category, availableTimeSlots } = req.body;
    
    if (!serviceName || !description || !price || !estimatedTime || !category) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    
    const service = new Service({
      serviceName,
      description,
      price,
      estimatedTime,
      category,
      serviceOwner: req.user._id,
      availableTimeSlots: availableTimeSlots || [
        { time: "09:00 AM", isBooked: false },
        { time: "11:00 AM", isBooked: false },
        { time: "02:00 PM", isBooked: false },
        { time: "04:00 PM", isBooked: false }
      ]
    });
    
    await service.save();
    await service.populate('serviceOwner', 'name email phone');
    
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create Booking
app.post('/api/bookings', auth, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can book services' });
    }
    
    const { 
      serviceId, 
      bikeDetails, 
      bookingDate, 
      timeSlot, 
      customerAddress, 
      specialRequests, 
      urgency 
    } = req.body;
    
    if (!serviceId || !bikeDetails || !bookingDate || !timeSlot || !customerAddress) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if (!bikeDetails.brand || !bikeDetails.model || !bikeDetails.year || !bikeDetails.registrationNumber) {
      return res.status(400).json({ message: 'Complete bike details are required' });
    }
    
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (!service.isActive) {
      return res.status(400).json({ message: 'Service is currently not available' });
    }

    const selectedDate = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.status(400).json({ message: 'Booking date cannot be in the past' });
    }

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBooking = await Booking.findOne({
      service: serviceId,
      bookingDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      timeSlot,
      status: { $in: ['pending', 'confirmed', 'in_progress'] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Selected time slot is already booked' });
    }

    const validTimeSlot = service.availableTimeSlots.some(slot => slot.time === timeSlot);
    if (!validTimeSlot) {
      return res.status(400).json({ message: 'Invalid time slot selected' });
    }
    
    const booking = new Booking({
      customer: req.user._id,
      service: serviceId,
      serviceOwner: service.serviceOwner,
      bikeDetails: {
        brand: bikeDetails.brand,
        model: bikeDetails.model,
        year: parseInt(bikeDetails.year),
        registrationNumber: bikeDetails.registrationNumber.toUpperCase(),
        engineNumber: bikeDetails.engineNumber || '',
        chassisNumber: bikeDetails.chassisNumber || ''
      },
      bookingDate: selectedDate,
      timeSlot,
      customerAddress,
      totalAmount: service.price,
      specialRequests: specialRequests || '',
      urgency: urgency || 'normal'
    });
    
    await booking.save();
    await booking.populate([
      { path: 'service', select: 'serviceName price estimatedTime category' },
      { path: 'customer', select: 'name email phone' },
      { path: 'serviceOwner', select: 'name email phone' }
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get My Bookings
app.get('/api/my-bookings', auth, async (req, res) => {
  try {
    const query = req.user.role === 'customer' 
      ? { customer: req.user._id }
      : { serviceOwner: req.user._id };
    
    const bookings = await Booking.find(query)
      .populate('service', 'serviceName price estimatedTime category')
      .populate('customer', 'name email phone')
      .populate('serviceOwner', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    message: 'BikeService Pro API is running!',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// Get Service Categories
app.get('/api/categories', (req, res) => {
  const categories = [
    { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { value: 'repair', label: 'Repair', icon: '🛠️' },
    { value: 'customization', label: 'Customization', icon: '⚙️' },
    { value: 'inspection', label: 'Inspection', icon: '🔍' }
  ];

  res.json({
    success: true,
    categories
  });
});

// Error Handling
app.use('/{*catchAll}', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start Server
const startServer = () => {
  const PORT = process.env.PORT || 5001;

  app.listen(PORT, () => {
    console.log(`🚀 BikeService Pro API running on port ${PORT}`);
  });
};
