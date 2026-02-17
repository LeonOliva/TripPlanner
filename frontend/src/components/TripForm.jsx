import React from 'react';
import { useNavigate } from 'react-router-dom';

const TripForm = ({ 
    formData, handleChange, handleSubmit, isEditMode, 
    stopInput, setStopInput, addStop, removeStop,
    inviteInput, setInviteInput, addFriend, removeFriend,
    currentParticipants, handleKickUser, error, todayDate
}) => {
    const navigate = useNavigate();

    return (
        <div className="form-container card">
          <h2>Dettagli Viaggio</h2>
          <form onSubmit={handleSubmit}>
            
            <div className="form-row">
              <div className="form-group">
                <label>Partenza</label>
                <div className="input-icon-wrapper">
                    <span className="material-symbols-outlined icon">flight_takeoff</span>
                    <input type="text" name="origin" value={formData.origin} onChange={handleChange} placeholder="es. Milano" />
                </div>
              </div>
              <div className="form-group">
                <label>Destinazione Finale</label>
                <div className="input-icon-wrapper">
                    <span className="material-symbols-outlined icon">flag</span>
                    <input type="text" name="destination" value={formData.destination} onChange={handleChange} placeholder="es. Roma" />
                </div>
              </div>
            </div>

            <div className="form-group" style={{background: 'var(--badge-bg)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem'}}>
                <label style={{display:'flex', justifyContent:'space-between'}}>
                    Tappe Intermedie (Max 3)
                    <span style={{fontSize:'0.8rem', color:'var(--text-sub)'}}>{formData.stops.length}/3</span>
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <input 
                        type="text" 
                        value={stopInput} 
                        onChange={(e) => setStopInput(e.target.value)} 
                        placeholder="Aggiungi città intermedia..."
                        disabled={formData.stops.length >= 3}
                        style={{flex: 1}} 
                    />
                    <button 
                        type="button" 
                        onClick={addStop} 
                        className="btn btn-outline" 
                        disabled={formData.stops.length >= 3}
                        style={{ width: '44px', height: '44px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', lineHeight: 1 }}
                    >
                        +
                    </button>
                </div>
                {formData.stops.length > 0 && (
                    <div style={{display:'flex', flexWrap:'wrap', gap:'0.5rem'}}>
                        {formData.stops.map((stop, i) => (
                            <span key={i} style={{background:'var(--border-color)', padding:'4px 8px', borderRadius:'12px', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'5px', color:'var(--text-main)'}}>
                                {stop} <span style={{cursor:'pointer', fontWeight:'bold'}} onClick={() => removeStop(i)}>×</span>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Data Inizio</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} min={todayDate} />
              </div>
              <div className="form-group">
                <label>Data Fine</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} min={formData.startDate || todayDate} />
              </div>
            </div>

            <div className="form-group">
                <label>Partecipanti (Minimo 1)</label>
                <div className="input-icon-wrapper">
                    <span className="material-symbols-outlined icon">group</span>
                    <input type="number" name="participants" value={formData.participants} onChange={handleChange} min="1" />
                </div>
            </div>

            {isEditMode && currentParticipants.length > 0 && (
                <div className="form-group" style={{marginTop:'-10px', marginBottom:'1.5rem'}}>
                    <label style={{fontSize:'0.9rem', color:'var(--text-sub)'}}>Persone attualmente nel gruppo:</label>
                    <div style={{display:'flex', flexDirection:'column', gap:'8px', marginTop:'5px'}}>
                        {currentParticipants.map(user => (
                            <div key={user._id} style={{
                                display:'flex', justifyContent:'space-between', alignItems:'center', 
                                background:'var(--badge-bg)', padding:'8px 12px', borderRadius:'8px', border:'1px solid var(--border-color)'
                            }}>
                                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                    <span className="material-symbols-outlined" style={{fontSize:'1.1rem', color:'var(--text-sub)'}}>person</span>
                                    <span style={{fontWeight:'500', color:'var(--text-main)'}}>{user.username || "Utente"}</span>
                                </div>
                                <button type="button" onClick={() => handleKickUser(user._id)} style={{background:'none', border:'none', cursor:'pointer', color:'#ef4444'}}>
                                    <span className="material-symbols-outlined" style={{fontSize:'1.2rem'}}>person_remove</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="form-group">
              <label>Mezzo di Trasporto</label>
              <div className="travel-type-grid" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
                {['flight', 'train', 'car', 'bus'].map((type) => (
                  <label key={type} className={`travel-type-option ${formData.travelType === type ? 'selected' : ''}`}>
                    <input type="radio" name="travelType" value={type} checked={formData.travelType === type} onChange={handleChange} />
                    <span className="material-symbols-outlined">
                      {type === 'flight' ? 'flight' : type === 'train' ? 'train' : type === 'car' ? 'directions_car' : 'directions_bus'}
                    </span>
                    <span>{type === 'flight' ? 'Aereo' : type === 'train' ? 'Treno' : type === 'car' ? 'Auto' : 'Bus'}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group" style={{marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)'}}>
                <label>Visibilità Viaggio</label>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem'}}>
                    <label className={`travel-type-option ${formData.visibility === 'pubblica' ? 'selected' : ''}`}>
                        <input type="radio" name="visibility" value="pubblica" checked={formData.visibility === 'pubblica'} onChange={handleChange} />
                        <span className="material-symbols-outlined">public</span>
                        <span>Pubblico</span>
                    </label>
                    <label className={`travel-type-option ${formData.visibility === 'privata' ? 'selected' : ''}`}>
                        <input type="radio" name="visibility" value="privata" checked={formData.visibility === 'privata'} onChange={handleChange} />
                        <span className="material-symbols-outlined">lock</span>
                        <span>Privato</span>
                    </label>
                </div>

                {formData.visibility === 'privata' && (
                    <div style={{backgroundColor: 'var(--badge-bg)', padding: '1rem', borderRadius: '0.5rem'}}>
                        <label style={{fontSize: '0.9rem'}}>Invita amici</label>
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                            <input type="text" value={inviteInput} onChange={(e) => setInviteInput(e.target.value)} placeholder="Email amico..." style={{flex: 1}} />
                            <button type="button" onClick={addFriend} className="btn btn-primary" style={{ width: '44px', height: '44px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', lineHeight: 1 }}>+</button>
                        </div>
                        <div style={{marginTop:'0.5rem'}}>
                            {formData.sharedWith.map((f, i) => (
                                <span key={i} style={{background:'rgba(59, 130, 246, 0.15)', color:'var(--primary-color)', padding:'2px 8px', borderRadius:'10px', fontSize:'0.8rem', marginRight:'5px'}}>
                                    {f} <span style={{cursor:'pointer'}} onClick={() => removeFriend(f)}>x</span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="form-actions" style={{marginTop: '2rem', display: 'flex', gap: '1rem'}}>
                <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')}>Annulla</button>
                <button type="submit" className="btn btn-primary">{isEditMode ? 'Salva Modifiche' : 'Crea Viaggio'}</button>
            </div>
          </form>
        </div>
    );
};

export default TripForm;