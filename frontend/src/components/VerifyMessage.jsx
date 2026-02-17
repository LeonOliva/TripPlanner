import React from 'react';

const VerifyMessage = ({ status, isSuccess, isError }) => {
  return (
    <div className="auth-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', width: '90%' }}>
        
        {/* ICONA DINAMICA */}
        <div style={{ marginBottom: '1.5rem' }}>
            {isSuccess ? (
                <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: '#16a34a' }}>check_circle</span>
            ) : isError ? (
                <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: '#dc2626' }}>error</span>
            ) : (
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: '4rem', color: 'var(--primary-color)' }}>sync</span>
            )}
        </div>

        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Verifica Account</h2>
        
        <p style={{ 
            fontSize: '1.1rem', 
            color: isSuccess ? '#16a34a' : isError ? '#dc2626' : 'var(--text-main)',
            fontWeight: '500' 
        }}>
            {status}
        </p>

      </div>
    </div>
  );
};

export default VerifyMessage;