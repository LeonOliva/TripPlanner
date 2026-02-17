import React from 'react';

const DashboardHeader = ({ userName, onCreateClick }) => {
  return (
    <div className="dashboard-header-row">
        <div>
            <h1>Bentornato, {userName}! 👋</h1>
            <p>Ecco i tuoi prossimi viaggi in programma.</p>
        </div>
        <button className="btn btn-primary" onClick={onCreateClick}>
            <span className="material-symbols-outlined">add</span>
            Crea Nuovo Viaggio
        </button>
    </div>
  );
};

export default DashboardHeader;