import React from 'react';

const TripInfo = ({ 
    trip, 
    currentUserId, 
    isCreator, 
    isParticipant, 
    isPending, 
    isInvited, 
    postiLiberi,
    handleKickUser,
    handleAcceptInvite,
    onJoinClick 
}) => {
  return (
    <div className="card" style={{padding:'2rem', borderRadius:'16px', border:'1px solid var(--border-color)', backgroundColor: 'var(--surface-color)'}}>
        <h3 style={{marginBottom:'1.5rem', fontSize:'1.3rem'}}>Dettagli Viaggio</h3>
        <div style={{display:'flex', flexDirection:'column', gap:'0.8rem'}}>
            <p><strong>Partenza:</strong> {trip.origine}</p>
            <p><strong>Arrivo:</strong> {trip.destinazione}</p>
            <p><strong>Date:</strong> {new Date(trip.dataInizio).toLocaleDateString()} - {new Date(trip.dataFine).toLocaleDateString()}</p>
        </div>
        
        {trip.tappe && trip.tappe.length > 0 && (
            <div style={{marginTop:'1.5rem'}}>
                <strong>Tappe Intermedie:</strong>
                <ul style={{paddingLeft:'1.2rem', marginTop:'0.5rem', color:'var(--text-sub)'}}>
                    {trip.tappe.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
            </div>
        )}

        <div style={{marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem'}}>
            <strong style={{display:'block', marginBottom:'1rem', fontSize:'1.1rem'}}>
                Partecipanti ({(trip.partecipantiAttuali?.length || 0) + 1}): 
            </strong>
            
            <div style={{display:'flex', flexDirection:'column', gap:'0px'}}>
                
                {/* Autore */}
                <div className="participant-card creator">
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        <span className="material-symbols-outlined" style={{fontSize:'1.4rem', color:'#0284c7'}}>manage_accounts</span>
                        <div className="no-wrap-container">
                            <span style={{fontWeight:'bold', fontSize:'1.05rem'}}>
                                {trip.autore?.username || "Organizzatore"}
                            </span>
                            <span style={{
                                fontSize:'0.7rem', color:'#0284c7', marginLeft:'8px', 
                                background:'#e0f2fe', padding:'3px 8px', borderRadius:'6px', fontWeight:'700'
                            }}>
                                CREATOR
                            </span>
                        </div>
                    </div>
                </div>

                {/* Altri Partecipanti */}
                {trip.partecipantiAttuali && trip.partecipantiAttuali.length > 0 ? (
                    trip.partecipantiAttuali.map(participant => (
                        <div key={participant._id} className="participant-card">
                            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                <span className="material-symbols-outlined" style={{fontSize:'1.3rem', color:'#64748b'}}>person</span>
                                <span style={{fontSize:'1.05rem'}}>{participant.username || "Utente"}</span>
                            </div>
                            
                            {isCreator && participant._id !== currentUserId && (
                                <button 
                                    onClick={() => handleKickUser(participant._id)}
                                    className="btn-icon-small delete"
                                    title="Rimuovi dal viaggio"
                                    style={{background:'none', border:'none', cursor:'pointer', color:'#ef4444', padding:'4px'}}
                                >
                                    <span className="material-symbols-outlined" style={{fontSize:'1.4rem'}}>person_remove</span>
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <p style={{fontSize:'0.9rem', color:'var(--text-sub)', fontStyle:'italic', margin: '10px 0'}}>
                        Nessun altro partecipante per ora.
                    </p>
                )}
            </div>
        </div>

        {/* Bottoni Azione */}
        <div style={{marginTop: '2.5rem'}}>
            {isCreator ? (
                    <button className="btn btn-outline" disabled style={{width:'100%', cursor:'not-allowed', opacity:0.7, padding:'12px', fontSize:'1.1rem'}}>
                    Sei l'organizzatore
                    </button>
            ) : isParticipant ? (
                <button className="btn btn-outline" disabled style={{width:'100%', borderColor:'green', color:'green', padding:'12px', fontSize:'1.1rem'}}>
                    Sei già partecipante
                </button>
            ) : isInvited ? (
                    <button 
                    className="btn btn-primary" 
                    style={{width: '100%', padding:'12px', fontSize:'1.1rem', backgroundColor:'#8b5cf6', borderColor:'#8b5cf6'}}
                    onClick={handleAcceptInvite}
                >
                    📩 ACCETTA INVITO
                </button>
            ) : isPending ? (
                <button className="btn btn-outline" disabled style={{width:'100%', borderColor:'orange', color:'orange', padding:'12px', fontSize:'1.1rem'}}>
                    Richiesta in attesa...
                </button>
            ) : (
                <button 
                    className="btn btn-primary" 
                    style={{width: '100%', padding:'12px', fontSize:'1.1rem', fontWeight:'bold'}}
                    onClick={onJoinClick}
                    disabled={postiLiberi <= 0}
                >
                    {postiLiberi > 0 ? "PARTECIPA AL VIAGGIO" : "POSTI ESAURITI"}
                </button>
            )}
        </div>
    </div>
  );
};

export default TripInfo;