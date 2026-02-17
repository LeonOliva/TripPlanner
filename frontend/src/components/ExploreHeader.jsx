import React from 'react';

const ExploreHeader = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="explore-header">
        
        <div className="explore-titles">
          <h1>Esplora Viaggi Pubblici 🌍</h1>
          <p>Lasciati ispirare dalla community.</p>
        </div>

        {/* BARRA DI RICERCA */}
        <div className="search-bar-wrapper">
          <span className="material-symbols-outlined search-icon">search</span>
          <input 
            type="text" 
            placeholder="Cerca destinazione..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

    </div>
  );
};

export default ExploreHeader;