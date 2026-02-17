import React from 'react';

const LoginHeader = () => {
  return (
    <div className="auth-header">
      <div className="logo text-center" style={{marginBottom: '1.5rem', color: 'var(--primary-color)'}}>
        <span className="material-symbols-outlined logo-icon">travel_explore</span>
        <span>TripPlanner</span>
      </div>
      <h1>Bentornato!</h1>
      <p>Accedi per gestire i tuoi viaggi</p>
    </div>
  );
};

export default LoginHeader;