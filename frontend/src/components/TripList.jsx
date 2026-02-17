import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TripCard from './TripCard'; // Assicurati che il percorso sia giusto

const TripList = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeTrips = async () => {
      try {
        // Scarichiamo i viaggi reali dal backend
        const response = await fetch('http://localhost:5000/api/itinerari/visualizza');
        const data = await response.json();

        if (data.success) {
          // 1. Filtriamo solo quelli pubblici
          // 2. Ne prendiamo solo 3 o 4 per la home
          const publicTrips = data.data
            .filter(trip => trip.visibilita === 'pubblica')
            .slice(0, 4); 
            
          setTrips(publicTrips);
        }
      } catch (error) {
        console.error("Errore caricamento viaggi home:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeTrips();
  }, []);

  return (
    <section className="trips-section">
      <div className="container">
        
        {/* Titolo Sezione */}
        <div className="section-header">
          <div className="title-box">
            <h2>Ecco alcuni viaggi creati da altri utenti</h2>
            <p>Potresti trovare il viaggio dei tuoi sogni!</p>
          </div>
          
          {/* Bottone Filtro / Esplora */}
          <div className="filter-container">
            <button 
                className="btn btn-outline" 
                onClick={() => navigate('/explore')}
                style={{background: 'var(--surface-color)'}}
            >
                Esplora tutti
            </button>
          </div>
        </div>

        {/* Griglia Viaggi */}
        {loading ? (
            <p style={{textAlign:'center', color:'var(--text-sub)'}}>Caricamento ispirazioni...</p>
        ) : (
            <div className="trips-grid">
            {trips.length > 0 ? (
                trips.map((trip) => {
                    // Calcolo posti liberi per il bottone
                    const maxPosti = trip.partecipantiMax || trip.partecipanti || 2;
                    const attuali = trip.partecipantiAttuali ? trip.partecipantiAttuali.length : 0;
                    const postiLiberi = maxPosti - attuali;

                    return (
                        <TripCard 
                            key={trip._id}
                            trip={trip}
                            onClick={() => navigate(`/trip/${trip._id}`)}
                            showCreator={true}
                            actionButtons={
                                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                     <span style={{ 
                                        fontWeight: '600', 
                                        color: postiLiberi > 0 ? '#10b981' : '#ef4444', 
                                        fontSize: '0.8rem'
                                    }}>
                                        {postiLiberi > 0 ? `${postiLiberi} liberi` : 'Completo'}
                                    </span>
                                    <button 
                                        className="btn-primary" 
                                        style={{padding:'4px 12px', fontSize:'0.85rem'}}
                                    >
                                        Vedi
                                    </button>
                                </div>
                            }
                        />
                    );
                })
            ) : (
                <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '2rem'}}>
                    <p>Nessun viaggio pubblico trovato al momento. Sii il primo a crearne uno!</p>
                    <button className="btn btn-primary" onClick={() => navigate('/create-trip')} style={{marginTop:'1rem'}}>
                        Crea Viaggio
                    </button>
                </div>
            )}
            </div>
        )}
      </div>
    </section>
  );
};

export default TripList;