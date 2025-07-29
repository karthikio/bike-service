import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const serviceAPI = {
  getAllServices: () => api.get('/services'),
  getServiceById: (id) => api.get(`/services/${id}`),
  getAvailableSlots: (serviceId, date) => 
    api.get(`/services/${serviceId}/available-slots?date=${date}`),
  createService: (serviceData) => api.post('/services', serviceData),
};

export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getMyBookings: () => api.get('/my-bookings'),
};

// ✅ ADD THIS: Admin API exports for Dashboard
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getBookings: (params) => api.get('/admin/bookings', { params }),
  updateBookingStatus: (bookingId, status) => 
    api.patch(`/admin/bookings/${bookingId}/status`, { status }),
  getServices: () => api.get('/admin/services'),
  updateService: (serviceId, serviceData) => 
    api.put(`/admin/services/${serviceId}`, serviceData),
  getCustomers: () => api.get('/admin/customers'),
  getRevenueAnalytics: (period) => 
    api.get(`/admin/analytics/revenue?period=${period}`),
};

export const generalAPI = {
  healthCheck: () => api.get('/health'),
  getCategories: () => api.get('/categories'),
};

export default api;
