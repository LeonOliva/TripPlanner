import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 
import ExploreHeader from '../components/ExploreHeader';
import ExploreGrid from '../components/ExploreGrid';

const ExploreTrips = () => {
  const navigate = useNavigate();
  
  // Stati
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch dei dati (Logica "Smart")
  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const url = searchTerm 
          ? `http://localhost:5000/api/itinerari/ricerca?search=${encodeURIComponent(searchTerm)}`
          : `http://localhost:5000/api/itinerari/visualizza`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          // Filtriamo solo i viaggi pubblici
          const publicTrips = data.data.filter(trip => trip.visibilita === 'pubblica');
          setTrips(publicTrips);
        }
      } catch (error) {
        console.error("Errore nel caricamento dei viaggi:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce: aspetta 500ms dopo che l'utente smette di scrivere
    const timer = setTimeout(() => fetchTrips(), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleViewClick = (id) => {
      navigate(`/trip/${id}`);
  };

  return (
    <div className="explore-container">
      
      {/* Intestazione e Ricerca */}
      <ExploreHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
      />

      {/* Griglia Risultati */}
      <ExploreGrid 
        trips={trips} 
        loading={loading} 
        onViewClick={handleViewClick} 
      />

    </div>
  );
};

export default ExploreTrips;