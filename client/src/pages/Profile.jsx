import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2>{user.name}</h2>
          <span className={`role-badge ${user.role}`}>
            {user.role === 'service_owner' ? 'Service Owner' : 'Customer'}
          </span>
        </div>

        <div className="profile-info">
          <h3>Profile Information</h3>
          
          <div className="info-grid">
            <div className="info-item">
              <label>Name</label>
              <p>{user.name}</p>
            </div>

            <div className="info-item">
              <label>Email</label>
              <p>{user.email}</p>
            </div>

            <div className="info-item">
              <label>Phone</label>
              <p>{user.phone}</p>
            </div>

            <div className="info-item">
              <label>Account Type</label>
              <p>{user.role === 'service_owner' ? 'Service Owner' : 'Customer'}</p>
            </div>

            <div className="info-item">
              <label>User ID</label>
              <p className="user-id">{user.id}</p>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="profile-button edit-btn">
            Edit Profile
          </button>
          <button 
            onClick={handleLogout} 
            className="profile-button logout-btn"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
