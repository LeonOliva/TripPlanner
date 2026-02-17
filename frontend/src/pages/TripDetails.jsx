import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TripHeader from '../components/TripHeader';
import TripInfo from '../components/TripInfo';
import JoinModal from '../components/JoinModal';
import SharedMap from '../components/SharedMap'; // Riutilizziamo la mappa creata prima!

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Stati Dati
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Stati Utente
  const [currentUserId, setCurrentUserId] = useState(null); 
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  // Stati Mappa & Modale
  const [mapPoints, setMapPoints] = useState([]);
  const [routePath, setRoutePath] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  // 1. RECUPERA ID ED EMAIL DAL TOKEN
  useEffect(() => {
      const token = localStorage.getItem('accessToken');
      if (token) {
          try {
              const base64Url = token.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
              const payload = JSON.parse(jsonPayload);
              
              setCurrentUserId(payload.userId || payload.id); 
              setCurrentUserEmail(payload.email);
          } catch (e) {
              console.error("Errore decodifica token", e);
          }
      }
  }, []);

  // --- LOGICA MAPPA ---
  const getCoordinates = useCallback(async (city) => {
    if (!city) return null;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
      const data = await response.json();
      if (data && data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    } catch (err) { console.error(err); }
    return null;
  }, []);

  const calculateMapRoute = useCallback(async (tripData) => {
      if (!tripData) return;
      const stops = tripData.tappe || [];
      const allCities = [tripData.origine, ...stops, tripData.destinazione].filter(Boolean);
      
      const coordsPromises = allCities.map(city => getCoordinates(city));
      const coordsResults = await Promise.all(coordsPromises);
      const validCoords = coordsResults.filter(c => c !== null);
      
      setMapPoints(validCoords);

      if (validCoords.length >= 2) {
          if (tripData.travelMode === 'FLIGHT' || tripData.travelMode === 'TRAIN') {
              setRoutePath(validCoords);
          } else {
            try {
                const coordinatesString = validCoords.map(p => `${p[1]},${p[0]}`).join(';');
                const url = `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`;
                const response = await fetch(url);
                const data = await response.json();
                if (data.routes && data.routes.length > 0) {
                    setRoutePath(data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]));
                }
            } catch (error) {
                console.error(error); 
                setRoutePath(validCoords);
            }
          }
      }
  }, [getCoordinates]);

  // 2. FETCH VIAGGIO
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/itinerari/visualizza/${id}`);
        const data = await res.json();
        
        if (data.success) {
            setTrip(data.data);
            calculateMapRoute(data.data);
        } else {
            setError("Viaggio non trovato o rimosso.");
        }
      } catch (err) {
        console.error(err);
        setError("Errore di connessione al server.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id, calculateMapRoute]);

  // --- AZIONI UTENTE ---
  const handleJoinRequest = async () => {
    try {
        const token = localStorage.getItem('accessToken');
        if(!token) { navigate('/login'); return; }

        const res = await fetch(`http://localhost:5000/api/itinerari/partecipa/${id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
            alert("Richiesta inviata! Attendi l'approvazione dell'autore.");
            setShowConfirm(false);
            window.location.reload(); 
        } else {
            alert(data.message || data.error || "Errore generico"); 
            setShowConfirm(false);
        }
    } catch (error) {
        console.error(error);
        alert("Errore di connessione al server");
    }
  };

  const handleKickUser = async (userIdToRemove) => {
    if(!window.confirm("Sei sicuro di voler rimuovere questo utente dal viaggio?")) return;

    try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://localhost:5000/api/itinerari/rimuovi-partecipante', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                viaggioId: id,
                utenteDaRimuovereId: userIdToRemove
            })
        });

        const data = await res.json();
        if (data.success) {
            alert("Utente rimosso.");
            window.location.reload();
        } else {
            alert(data.message || "Errore");
        }
    } catch (err) { console.error(err); }
  };

  const handleAcceptInvite = async () => {
    try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://localhost:5000/api/itinerari/accetta-invito', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ viaggioId: id })
        });
        const data = await res.json();
        if (data.success) {
            alert("Invito accettato! Sei a bordo.");
            window.location.reload(); 
        } else {
            alert(data.message || "Errore");
        }
    } catch (err) { console.error(err); }
  };

  // --- RENDER ---
  if (loading) return <div style={{padding:'2rem', textAlign:'center'}}>Caricamento in corso...</div>;
  
  if (error || !trip) return (
    <div style={{padding:'2rem', textAlign:'center', marginTop:'3rem'}}>
        <h2>⚠️ Ops! Qualcosa non va.</h2>
        <p style={{color:'var(--text-sub)'}}>{error || "Impossibile caricare i dati del viaggio."}</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{marginTop:'1rem'}}>
            Torna alla Dashboard
        </button>
    </div>
  );

  const postiTotali = trip.partecipantiMax || trip.partecipanti || 2;
  const postiOccupati = (trip.partecipantiAttuali?.length || 0);
  const postiLiberi = postiTotali - postiOccupati;
  
  const authorId = trip.autore?._id || trip.autore; 
  const isCreator = currentUserId === authorId;
  const isParticipant = trip.partecipantiAttuali?.some(p => (p._id || p) === currentUserId);
  const isPending = trip.richiestePendenti?.some(p => (p._id || p) === currentUserId);
  const isInvited = trip.condivisoCon && currentUserEmail && trip.condivisoCon.includes(currentUserEmail);

  return (
    <div className="trip-details-page" style={{padding: '2rem', maxWidth:'1800px', margin:'0 auto', width: '95%'}}>
      
      {/* HEADER */}
      <TripHeader trip={trip} postiLiberi={postiLiberi} />

      <div className="details-layout" style={{display:'flex', gap:'2rem', flexDirection: 'row', flexWrap:'wrap'}}>
        
        {/* COLONNA INFO (SINISTRA) */}
        <div className="info-col" style={{flex:'1.2', minWidth:'var(--col-min-width)'}}>
            <TripInfo 
                trip={trip}
                currentUserId={currentUserId}
                isCreator={isCreator}
                isParticipant={isParticipant}
                isPending={isPending}
                isInvited={isInvited}
                postiLiberi={postiLiberi}
                handleKickUser={handleKickUser}
                handleAcceptInvite={handleAcceptInvite}
                onJoinClick={() => setShowConfirm(true)}
            />
        </div>

        {/* COLONNA MAPPA (DESTRA - Usa SharedMap) */}
        <div className="map-col" style={{flex:'1.8', minWidth:'var(--col-min-width)', height:'var(--map-height)', borderRadius:'16px', overflow:'hidden', border:'1px solid var(--border-color)', boxShadow:'var(--shadow)'}}>
             {mapPoints.length > 0 ? (
                 <SharedMap points={mapPoints} routePath={routePath} height="100%" />
             ) : (
                 <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-color)', color:'var(--text-sub)'}}>
                     <p style={{fontSize:'1.2rem', display:'flex', alignItems:'center', gap:'10px'}}>
                        <span className="material-symbols-outlined animate-spin">sync</span>
                        Caricamento mappa...
                     </p>
                 </div>
             )}
        </div>
      </div>

      {/* MODALE DI CONFERMA */}
      {showConfirm && (
        <JoinModal 
            onClose={() => setShowConfirm(false)} 
            onConfirm={handleJoinRequest} 
        />
      )}
    </div>
  );
};

export default TripDetails;