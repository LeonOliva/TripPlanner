import React from 'react';
import TripCard from './TripCard';

const ExploreGrid = ({ trips, loading, onViewClick }) => {

  if (loading) {
    return <div className="loading-state">Caricamento...</div>;
  }

  if (trips.length === 0) {
    return (
      <div className="no-results">
        <p>Nessun viaggio trovato.</p>
      </div>
    );
  }

  return (
    <div className="trips-grid">
        {trips.map((trip) => {
            const maxPosti = trip.partecipantiMax || trip.partecipanti || 2;
            const attuali = trip.partecipantiAttuali ? trip.partecipantiAttuali.length : 0;
            const postiLiberi = maxPosti - attuali;

            return (
            <TripCard 
                key={trip._id}
                trip={trip}
                onClick={() => onViewClick(trip._id)}
                showCreator={true}
                actionButtons={
                    <>
                        <div style={{
                            marginRight:'10px', 
                            fontSize:'0.85rem', 
                            fontWeight:'600', 
                            color: postiLiberi > 0 ? '#10b981' : '#ef4444'
                        }}>
                            {postiLiberi > 0 ? `${postiLiberi} liberi` : 'Completo'}
                        </div>
                        <button className="btn-primary" style={{padding:'6px 14px', fontSize:'0.85rem'}}>
                            Vedi
                        </button>
                    </>
                }
            />
            );
        })}
    </div>
  );
};

export default ExploreGrid;