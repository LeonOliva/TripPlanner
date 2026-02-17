import React from 'react';

const getTransportIcon = (mode) => {
    const m = mode ? mode.toUpperCase() : 'FLIGHT';
    switch(m) {
        case 'FLIGHT': return 'flight';
        case 'TRAIN': return 'train';
        case 'CAR': case 'DRIVING': return 'directions_car';
        case 'BUS': return 'directions_bus';
        default: return 'flight';
    }
};

const TripHeader = ({ trip, postiLiberi }) => {
  return (
    <div style={{marginBottom:'2rem'}}>
        <h1 style={{fontSize:'2.5rem', marginBottom:'0.5rem'}}>{trip.titolo || "Viaggio senza titolo"}</h1>
        
        <div style={{display:'flex', gap:'1rem', alignItems:'center', flexWrap:'wrap'}}>
            <span className="badge-dynamic">
                <span className="material-symbols-outlined">{getTransportIcon(trip.travelMode)}</span>
                {trip.travelMode || "Mezzo non specificato"}
            </span>

            <span className="badge-green" style={{
                backgroundColor: postiLiberi > 0 ? '#dcfce7' : '#fee2e2', 
                color: postiLiberi > 0 ? '#166534' : '#991b1b',
                padding:'5px 12px', borderRadius:'15px', fontWeight:'bold',
                border: '1px solid var(--border-color)'
            }}>
                {postiLiberi > 0 ? `${postiLiberi} posti rimasti` : 'Completo'}
            </span>
        </div>
    </div>
  );
};

export default TripHeader;