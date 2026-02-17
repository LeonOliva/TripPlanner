import React from 'react';

const TripCard = ({ trip, onClick, actionButtons, showCreator = true }) => {
  
  // Helper per le date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  };

  // Helper per l'icona
  const getIcon = (mode) => {
    const m = mode ? mode.toUpperCase() : 'FLIGHT';
    switch(m) {
        case 'FLIGHT': return 'flight';
        case 'TRAIN': return 'train';
        case 'CAR': case 'DRIVING': return 'directions_car';
        case 'BUS': return 'directions_bus';
        default: return 'flight';
    }
  };

  // Gestione Nome Autore (fix per mostrare il nome vero)
  // Se trip.autore è un oggetto con username, usa quello. Altrimenti fallback.
  const creatorName = trip.autore?.username || "Utente Community";
  
  // Iniziale per l'avatar
  const creatorInitial = creatorName.charAt(0).toUpperCase();

  return (
    <div 
      className="trip-card" 
      onClick={onClick}
      style={{
        borderLeft: '5px solid var(--primary-color)', 
        cursor: 'pointer',
        background: 'var(--surface-color)',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: '1px solid var(--border-color)',
        borderLeftWidth: '5px', // Rinforza il bordo sinistro
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'transform 0.2s'
      }}
    >
      <div className="card-content" style={{padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column'}}>
        
        {/* HEADER: Date e Badge Veicolo */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem'}}>
            <span style={{fontSize:'0.75rem', fontWeight:'700', color:'var(--text-sub)', textTransform:'uppercase', letterSpacing:'0.5px'}}>
                {formatDate(trip.dataInizio)} - {formatDate(trip.dataFine)}
            </span>

            <span className="badge-dynamic" style={{fontSize:'0.7rem', padding:'4px 8px'}}>
                <span className="material-symbols-outlined" style={{fontSize:'1rem'}}>
                    {getIcon(trip.travelMode)}
                </span>
                {trip.travelMode}
            </span>
        </div>

        {/* BODY: Rotta */}
        <div className="trip-route" style={{display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'1.1rem', fontWeight:'800', color:'var(--text-main)', marginBottom:'0.5rem'}}>
            <span>{trip.origine}</span>
            <span className="material-symbols-outlined arrow" style={{color:'var(--text-sub)', fontSize:'1rem'}}>arrow_forward</span>
            <span>{trip.destinazione}</span>
        </div>

        {/* Titolo opzionale (se vuoi mostrarlo) */}
        {trip.titolo && <p style={{margin:'0 0 1.5rem 0', fontSize:'0.9rem', color:'var(--text-sub)'}}>{trip.titolo}</p>}

        {/* FOOTER: Creatore (Sinistra) e Azioni (Destra) */}
        <div className="card-footer" style={{marginTop:'auto', paddingTop:'1rem', borderTop:'1px dashed var(--border-color)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            
            {/* Sezione Autore (Solo se richiesto) */}
            {showCreator && (
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                    <div style={{
                        width:'28px', height:'28px', borderRadius:'50%', 
                        background:'#e0f2fe', color:'var(--primary-color)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:'0.75rem', fontWeight:'bold'
                    }}>
                        {creatorInitial}
                    </div>
                    <span style={{fontSize:'0.85rem', color:'var(--text-sub)', fontWeight:'500'}}>
                        {creatorName}
                    </span>
                </div>
            )}

            {/* Bottoni Personalizzati (Passati dal genitore) */}
            <div style={{display:'flex', gap:'0.5rem', marginLeft: 'auto'}}>
                {actionButtons}
            </div>
        </div>

      </div>
    </div>
  );
};

export default TripCard;