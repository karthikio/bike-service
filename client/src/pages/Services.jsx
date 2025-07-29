import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { serviceAPI } from '../services/api';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await serviceAPI.getAllServices();
      if (response.data.success) {
        setServices(response.data.services);
      }
    } catch (error) {
      setError('Failed to load services');
      console.error('Services error:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All Services' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'repair', label: 'Repair' },
    { value: 'customization', label: 'Customization' },
    { value: 'inspection', label: 'Inspection' }
  ];

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  const getCategoryIcon = (category) => {
    const icons = {
      maintenance: '🔧',
      repair: '🛠️',
      customization: '⚙️',
      inspection: '🔍'
    };
    return icons[category] || '🏍️';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="services-container">
      <div className="services-header">
        <h1>Our Bike Services</h1>
        <p>Professional bike servicing at your fingertips</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="services-filters">
        <h3>Filter by Category</h3>
        <div className="filter-buttons">
          {categories.map(category => (
            <button
              key={category.value}
              className={`filter-btn ${selectedCategory === category.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="services-grid">
        {filteredServices.length === 0 ? (
          <div className="no-services">
            <h3>No services found</h3>
            <p>Try selecting a different category</p>
          </div>
        ) : (
          filteredServices.map(service => (
            <div key={service._id} className="service-card">
              <div className="service-icon">
                {getCategoryIcon(service.category)}
              </div>
              <div className="service-content">
                <h3>{service.serviceName}</h3>
                <p className="service-description">{service.description}</p>
                <div className="service-details">
                  <div className="detail-item">
                    <span className="label">Price:</span>
                    <span className="value price">₹{service.price}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Duration:</span>
                    <span className="value">{service.estimatedTime}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Category:</span>
                    <span className="value category">{service.category}</span>
                  </div>
                </div>
                <div className="service-owner">
                  <p>Service by: <strong>{service.serviceOwner?.name}</strong></p>
                </div>
              </div>
              <div className="service-actions">
                <Link 
                  to={`/booking/${service._id}`} 
                  className="book-btn"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Services;
