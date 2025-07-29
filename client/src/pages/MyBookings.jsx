import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { bookingAPI } from '../services/api';

const MyBookings = () => {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchBookings();
    
    // Show success message if coming from booking creation
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [location]);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getMyBookings();
      if (response.data.success) {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      setError('Failed to load bookings');
      console.error('Bookings error:', error);
    } finally {
      setLoading(false);
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

  const getUrgencyBadge = (urgency) => {
    const urgencyClasses = {
      normal: 'urgency-normal',
      urgent: 'urgency-urgent',
      emergency: 'urgency-emergency'
    };
    
    return (
      <span className={`urgency-badge ${urgencyClasses[urgency]}`}>
        {urgency.toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h1>My Bookings</h1>
        <p>Track your bike service appointments</p>
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <div className="no-bookings-icon">📅</div>
          <h3>No bookings found</h3>
          <p>You haven't made any service bookings yet.</p>
          <a href="/services" className="cta-button">
            Browse Services
          </a>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking._id} className="booking-card">
              <div className="booking-header">
                <div className="booking-service">
                  <h3>{booking.service.serviceName}</h3>
                  <p className="service-category">{booking.service.category}</p>
                </div>
                <div className="booking-status">
                  {getStatusBadge(booking.status)}
                  {getUrgencyBadge(booking.urgency)}
                </div>
              </div>

              <div className="booking-details">
                <div className="detail-section">
                  <h4>📅 Appointment Details</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Date:</span>
                      <span className="value">{formatDate(booking.bookingDate)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Time:</span>
                      <span className="value">{booking.timeSlot}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Duration:</span>
                      <span className="value">{booking.service.estimatedTime}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Amount:</span>
                      <span className="value price">₹{booking.totalAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>🏍️ Bike Details</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Bike:</span>
                      <span className="value">{booking.bikeDetails.brand} {booking.bikeDetails.model}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Year:</span>
                      <span className="value">{booking.bikeDetails.year}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Registration:</span>
                      <span className="value">{booking.bikeDetails.registrationNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>📍 Service Location</h4>
                  <p className="address">{booking.customerAddress}</p>
                </div>

                {booking.specialRequests && (
                  <div className="detail-section">
                    <h4>📝 Special Requests</h4>
                    <p className="special-requests">{booking.specialRequests}</p>
                  </div>
                )}

                <div className="detail-section">
                  <h4>🔧 Service Provider</h4>
                  <div className="provider-info">
                    <span className="provider-name">{booking.serviceOwner.name}</span>
                    <span className="provider-contact">{booking.serviceOwner.phone}</span>
                  </div>
                </div>
              </div>

              <div className="booking-footer">
                <small className="booking-id">Booking ID: {booking._id}</small>
                <small className="booking-date">
                  Booked on: {formatDate(booking.createdAt)}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
