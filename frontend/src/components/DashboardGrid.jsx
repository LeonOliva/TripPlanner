import React from 'react';
import TripCard from './TripCard';

const DashboardGrid = ({ 
    trips, 
    loading, 
    currentUserId, 
    onView, 
    onEdit, 
    onDelete, 
    onLeave 
}) => {

  if (loading) {
      return <p>Caricamento viaggi...</p>;
  }

  if (trips.length === 0) {
      return <p style={{color: '#666'}}>Non hai ancora creato nessun viaggio. Inizia ora!</p>;
  }

  return (
    <div className="trips-grid">
        {trips.map((trip) => {
            // Logica per capire se l'utente è l'autore
            const isAuthor = trip.autore === currentUserId || (trip.autore && trip.autore._id === currentUserId);

            return (
                <TripCard 
                    key={trip._id}
                    trip={trip}
                    onClick={() => onView(trip._id)}
                    showCreator={true}
                    actionButtons={
                        isAuthor ? (
                            <>
                                <button 
                                    className="icon-btn edit" 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        onEdit(trip._id);
                                    }}
                                    title="Modifica"
                                >
                                    <span className="material-symbols-outlined">edit</span>
                                </button>
                                <button 
                                    className="icon-btn delete" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(trip._id);
                                    }}
                                    title="Elimina"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </>
                        ) : (
                            <button 
                                className="icon-btn leave" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onLeave(trip._id);
                                }}
                                title="Abbandona Viaggio"
                                style={{ color: '#d97706', borderColor: '#d97706' }}
                            >
                                <span className="material-symbols-outlined">logout</span> 
                            </button>
                        )
                    }
                />
            );
        })}
    </div>
  );
};

export default DashboardGrid;