import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { serviceAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Booking = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const [formData, setFormData] = useState({
    // Bike Details
    brand: '',
    model: '',
    year: '',
    registrationNumber: '',
    engineNumber: '',
    chassisNumber: '',
    
    // Booking Details
    bookingDate: '',
    timeSlot: '',
    customerAddress: '',
    specialRequests: '',
    urgency: 'normal'
  });

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  useEffect(() => {
    if (formData.bookingDate) {
      fetchAvailableSlots();
    }
  }, [formData.bookingDate]);

  const fetchService = async () => {
    try {
      const response = await serviceAPI.getServiceById(serviceId);
      if (response.data.success) {
        setService(response.data.service);
      }
    } catch (error) {
      setError('Failed to load service details');
      console.error('Service fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await serviceAPI.getAvailableSlots(serviceId, formData.bookingDate);
      if (response.data.success) {
        setAvailableSlots(response.data.availableSlots);
      }
    } catch (error) {
      console.error('Slots fetch error:', error);
      setAvailableSlots([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset time slot when date changes
    if (name === 'bookingDate') {
      setFormData(prev => ({
        ...prev,
        timeSlot: ''
      }));
    }
  };

  const validateForm = () => {
    const required = [
      'brand', 'model', 'year', 'registrationNumber', 
      'bookingDate', 'timeSlot', 'customerAddress'
    ];
    
    for (const field of required) {
      if (!formData[field]) {
        setError(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const bookingData = {
        serviceId,
        bikeDetails: {
          brand: formData.brand,
          model: formData.model,
          year: parseInt(formData.year),
          registrationNumber: formData.registrationNumber,
          engineNumber: formData.engineNumber,
          chassisNumber: formData.chassisNumber
        },
        bookingDate: formData.bookingDate,
        timeSlot: formData.timeSlot,
        customerAddress: formData.customerAddress,
        specialRequests: formData.specialRequests,
        urgency: formData.urgency
      };
      
      const response = await bookingAPI.createBooking(bookingData);
      
      if (response.data.success) {
        navigate('/my-bookings', { 
          state: { message: 'Booking created successfully!' }
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="error-container">
        <h2>Service not found</h2>
        <p>The requested service could not be found.</p>
      </div>
    );
  }

  return (
    <div className="booking-container">
      <div className="booking-header">
        <h1>Book Service</h1>
        <p>Fill in the details to book your bike service</p>
      </div>

      <div className="booking-content">
        <div className="service-summary">
          <h2>Service Details</h2>
          <div className="summary-card">
            <h3>{service.serviceName}</h3>
            <p>{service.description}</p>
            <div className="summary-details">
              <div className="detail">
                <span className="label">Price:</span>
                <span className="value price">₹{service.price}</span>
              </div>
              <div className="detail">
                <span className="label">Duration:</span>
                <span className="value">{service.estimatedTime}</span>
              </div>
              <div className="detail">
                <span className="label">Category:</span>
                <span className="value">{service.category}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="booking-form-container">
          <h2>Booking Information</h2>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-section">
              <h3>Bike Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="brand">Bike Brand *</label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="e.g., Honda, Yamaha"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="model">Bike Model *</label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g., CBR 150R, FZ-S"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="year">Year *</label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="e.g., 2020"
                    min="1990"
                    max={new Date().getFullYear()}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="registrationNumber">Registration Number *</label>
                  <input
                    type="text"
                    id="registrationNumber"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="e.g., KA01AB1234"
                    style={{ textTransform: 'uppercase' }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="engineNumber">Engine Number</label>
                  <input
                    type="text"
                    id="engineNumber"
                    name="engineNumber"
                    value={formData.engineNumber}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="chassisNumber">Chassis Number</label>
                  <input
                    type="text"
                    id="chassisNumber"
                    name="chassisNumber"
                    value={formData.chassisNumber}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Appointment Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="bookingDate">Preferred Date *</label>
                  <input
                    type="date"
                    id="bookingDate"
                    name="bookingDate"
                    value={formData.bookingDate}
                    onChange={handleChange}
                    min={getMinDate()}
                    max={getMaxDate()}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="timeSlot">Available Time Slots *</label>
                  {formData.bookingDate ? (
                    <select
                      id="timeSlot"
                      name="timeSlot"
                      value={formData.timeSlot}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a time slot</option>
                      {availableSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  ) : (
                    <select disabled>
                      <option>Please select a date first</option>
                    </select>
                  )}
                  {formData.bookingDate && availableSlots.length === 0 && (
                    <p className="no-slots">No available slots for this date</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="urgency">Service Urgency</label>
                  <select
                    id="urgency"
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="customerAddress">Service Address *</label>
                <textarea
                  id="customerAddress"
                  name="customerAddress"
                  value={formData.customerAddress}
                  onChange={handleChange}
                  placeholder="Enter your complete address where the service should be performed"
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="specialRequests">Special Requests</label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  placeholder="Any specific requirements or issues you'd like us to focus on?"
                  rows="3"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate('/services')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={submitting || !formData.bookingDate || !formData.timeSlot}
              >
                {submitting ? 'Creating Booking...' : `Book Service - ₹${service.price}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;
