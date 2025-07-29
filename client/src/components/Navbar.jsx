import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Bike Service
        </Link>
        
        <div className="nav-menu">
          <Link 
            to="/" 
            className={`nav-link ${isActiveLink('/') ? 'active' : ''}`}
          >
            Home
          </Link>
          
          <Link 
            to="/services" 
            className={`nav-link ${isActiveLink('/services') ? 'active' : ''}`}
          >
            Services
          </Link>
          
          {isAuthenticated ? (
            <>
              {user?.role === 'service_owner' && (
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${isActiveLink('/dashboard') ? 'active' : ''}`}
                >
                  Dashboard
                </Link>
              )}
              
              <Link 
                to="/my-bookings" 
                className={`nav-link ${isActiveLink('/my-bookings') ? 'active' : ''}`}
              >
                My Bookings
              </Link>
              
              <Link 
                to="/profile" 
                className={`nav-link ${isActiveLink('/profile') ? 'active' : ''}`}
              >
                Profile
              </Link>
              
              <button onClick={handleLogout} className="nav-button logout-btn">
                Logout
              </button>
              
              <div className="nav-user">
                <span className="user-greeting">👋 {user?.name}</span>
                <span className="user-role">
                  {user?.role === 'service_owner' ? 'Service Provider' : 'Customer'}
                </span>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`nav-link ${isActiveLink('/login') ? 'active' : ''}`}
              >
                Login
              </Link>
              
              <Link 
                to="/register" 
                className={`nav-button register-btn ${isActiveLink('/register') ? 'active' : ''}`}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
