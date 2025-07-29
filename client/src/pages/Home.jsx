import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to Bike Service Platform</h1>
        <p>Your one-stop solution for all bike service needs</p>
        
        {isAuthenticated ? (
          <div className="welcome-back">
            <h2>Welcome back, {user?.name}! 👋</h2>
            <p>Role: <span className="role-badge">{user?.role}</span></p>
            <Link to="/profile" className="cta-button">
              View Profile
            </Link>
          </div>
        ) : (
          <div className="auth-actions">
            <Link to="/register" className="cta-button primary">
              Get Started
            </Link>
            <Link to="/login" className="cta-button secondary">
              Sign In
            </Link>
          </div>
        )}
      </div>

      <div className="features-section">
        <h2>Our Services</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>🔧 Maintenance</h3>
            <p>Regular bike maintenance and servicing</p>
          </div>
          <div className="feature-card">
            <h3>🛠️ Repair</h3>
            <p>Professional repair services</p>
          </div>
          <div className="feature-card">
            <h3>⚙️ Customization</h3>
            <p>Custom modifications and upgrades</p>
          </div>
          <div className="feature-card">
            <h3>🔍 Inspection</h3>
            <p>Thorough bike inspections</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
