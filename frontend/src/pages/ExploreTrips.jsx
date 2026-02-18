import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 
import ExploreHeader from '../components/ExploreHeader';
import ExploreGrid from '../components/ExploreGrid';

// CORRETTO
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ExploreTrips = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        // CORRETTO: Usiamo i backticks (`) e la variabile API_URL
        const url = searchTerm 
          ? `${API_URL}/api/itinerari/ricerca?search=${encodeURIComponent(searchTerm)}`
          : `${API_URL}/api/itinerari/visualizza`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          const publicTrips = data.data.filter(trip => trip.visibilita === 'pubblica');
          setTrips(publicTrips);
        }
      } catch (error) {
        console.error("Errore nel caricamento dei viaggi:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => fetchTrips(), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleViewClick = (id) => {
      navigate(`/trip/${id}`);
  };

  return (
    <div className="explore-container">
      <ExploreHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <ExploreGrid trips={trips} loading={loading} onViewClick={handleViewClick} />
    </div>
  );
};

export default ExploreTrips;