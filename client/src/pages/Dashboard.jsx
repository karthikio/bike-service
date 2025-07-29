import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchBookings();
    fetchServices();
    fetchCustomers();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      if (response.data.success) {
        setDashboardData(response.data.dashboard);
      }
    } catch (error) {
      setError('Failed to load dashboard data');
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await adminAPI.getBookings();
      if (response.data.success) {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      console.error('Failed to load bookings');
    }
  };

  const fetchServices = async () => {
    try {
      const response = await adminAPI.getServices();
      if (response.data.success) {
        setServices(response.data.services);
      }
    } catch (error) {
      console.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await adminAPI.getCustomers();
      if (response.data.success) {
        setCustomers(response.data.customers);
      }
    } catch (error) {
      console.error('Failed to load customers');
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const response = await adminAPI.updateBookingStatus(bookingId, status);
      if (response.data.success) {
        setBookings(prev => 
          prev.map(booking => 
            booking._id === bookingId 
              ? { ...booking, status } 
              : booking
          )
        );
        fetchDashboardData(); // Refresh stats
      }
    } catch (error) {
      setError('Failed to update booking status');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      in_progress: 'status-progress',
      completed: 'status-completed',
      cancelled: 'status-cancelled'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Service Owner Dashboard</h1>
        <p>Manage your bike service business</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          Bookings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          Services
        </button>
        <button 
          className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          Customers
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && dashboardData && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🛠️</div>
                <div className="stat-info">
                  <h3>{dashboardData.stats.totalServices}</h3>
                  <p>Total Services</p>
                  <small>{dashboardData.stats.activeServices} Active</small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                  <h3>{dashboardData.stats.totalBookings}</h3>
                  <p>Total Bookings</p>
                  <small>{dashboardData.stats.pendingBookings} Pending</small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>₹{dashboardData.stats.totalRevenue.toLocaleString()}</h3>
                  <p>Total Revenue</p>
                  <small>{dashboardData.stats.completedBookings} Completed</small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{dashboardData.stats.totalCustomers}</h3>
                  <p>Total Customers</p>
                  <small>Unique customers</small>
                </div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3>Service Performance</h3>
                <div className="service-performance">
                  {dashboardData.servicePerformance.map((service, index) => (
                    <div key={index} className="performance-item">
                      <div className="service-name">{service.serviceName}</div>
                      <div className="service-stats">
                        <span>{service.bookings} bookings</span>
                        <span>₹{service.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-card">
                <h3>Recent Bookings</h3>
                <div className="recent-bookings">
                  {dashboardData.recentBookings.slice(0, 5).map((booking) => (
                    <div key={booking._id} className="booking-item">
                      <div className="booking-info">
                        <strong>{booking.customer.name}</strong>
                        <p>{booking.service.serviceName}</p>
                        <small>{formatDate(booking.bookingDate)}</small>
                      </div>
                      <div className="booking-status">
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-tab">
            <div className="bookings-header">
              <h3>All Bookings</h3>
              <div className="booking-stats">
                <span className="stat">Pending: {bookings.filter(b => b.status === 'pending').length}</span>
                <span className="stat">Confirmed: {bookings.filter(b => b.status === 'confirmed').length}</span>
                <span className="stat">In Progress: {bookings.filter(b => b.status === 'in_progress').length}</span>
                <span className="stat">Completed: {bookings.filter(b => b.status === 'completed').length}</span>
              </div>
            </div>

            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking._id} className="booking-card">
                  <div className="booking-header">
                    <div className="booking-customer">
                      <h4>{booking.customer.name}</h4>
                      <p>{booking.customer.email}</p>
                      <p>{booking.customer.phone}</p>
                    </div>
                    <div className="booking-status-actions">
                      {getStatusBadge(booking.status)}
                      <select 
                        value={booking.status}
                        onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="booking-details">
                    <div className="detail-section">
                      <h5>Service Details</h5>
                      <p><strong>{booking.service.serviceName}</strong></p>
                      <p>Category: {booking.service.category}</p>
                      <p>Amount: ₹{booking.totalAmount}</p>
                    </div>

                    <div className="detail-section">
                      <h5>Booking Details</h5>
                      <p>Date: {formatDate(booking.bookingDate)}</p>
                      <p>Time: {booking.timeSlot}</p>
                      <p>Urgency: {booking.urgency}</p>
                    </div>

                    <div className="detail-section">
                      <h5>Bike Details</h5>
                      <p>{booking.bikeDetails.brand} {booking.bikeDetails.model} ({booking.bikeDetails.year})</p>
                      <p>Registration: {booking.bikeDetails.registrationNumber}</p>
                    </div>

                    {booking.specialRequests && (
                      <div className="detail-section">
                        <h5>Special Requests</h5>
                        <p>{booking.specialRequests}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="services-tab">
            <div className="services-header">
              <h3>My Services</h3>
              <button className="add-service-btn">Add New Service</button>
            </div>

            <div className="services-grid">
              {services.map((service) => (
                <div key={service._id} className="service-card">
                  <div className="service-header">
                    <h4>{service.serviceName}</h4>
                    <span className={`service-status ${service.isActive ? 'active' : 'inactive'}`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="service-description">{service.description}</p>
                  
                  <div className="service-stats">
                    <div className="stat">
                      <span className="label">Price:</span>
                      <span className="value">₹{service.price}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Bookings:</span>
                      <span className="value">{service.bookingCount || 0}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Revenue:</span>
                      <span className="value">₹{(service.revenue || 0).toLocaleString()}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Duration:</span>
                      <span className="value">{service.estimatedTime}</span>
                    </div>
                  </div>

                  <div className="service-actions">
                    <button className="edit-btn">Edit</button>
                    <button className={`toggle-btn ${service.isActive ? 'deactivate' : 'activate'}`}>
                      {service.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="customers-tab">
            <h3>Customer Analytics</h3>
            
            <div className="customers-list">
              {customers.map((customer) => (
                <div key={customer._id} className="customer-card">
                  <div className="customer-info">
                    <h4>{customer.name}</h4>
                    <p>{customer.email}</p>
                    <p>{customer.phone}</p>
                  </div>

                  <div className="customer-stats">
                    <div className="stat">
                      <span className="label">Total Bookings:</span>
                      <span className="value">{customer.totalBookings}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Total Spent:</span>
                      <span className="value">₹{customer.totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Completed:</span>
                      <span className="value">{customer.completedBookings}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Last Booking:</span>
                      <span className="value">{formatDate(customer.lastBooking)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
