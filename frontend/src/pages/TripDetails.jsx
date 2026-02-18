import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TripHeader from '../components/TripHeader';
import TripInfo from '../components/TripInfo';
import JoinModal from '../components/JoinModal';
import SharedMap from '../components/SharedMap';

// CORRETTO
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null); 
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [mapPoints, setMapPoints] = useState([]);
  const [routePath, setRoutePath] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

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
          } catch (e) { console.error("Errore decodifica token", e); }
      }
  }, []);

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
            } catch (error) { console.error(error); setRoutePath(validCoords); }
          }
      }
  }, [getCoordinates]);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        // CORRETTO
        const res = await fetch(`${API_URL}/api/itinerari/visualizza/${id}`);
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

  const handleJoinRequest = async () => {
    try {
        const token = localStorage.getItem('accessToken');
        if(!token) { navigate('/login'); return; }

        // CORRETTO
        const res = await fetch(`${API_URL}/api/itinerari/partecipa/${id}`, {
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
    } catch (error) { console.error(error); alert("Errore di connessione al server"); }
  };

  const handleKickUser = async (userIdToRemove) => {
    if(!window.confirm("Sei sicuro di voler rimuovere questo utente dal viaggio?")) return;
    try {
        const token = localStorage.getItem('accessToken');
        // CORRETTO
        const res = await fetch(`${API_URL}/api/itinerari/rimuovi-partecipante`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ viaggioId: id, utenteDaRimuovereId: userIdToRemove })
        });
        const data = await res.json();
        if (data.success) { alert("Utente rimosso."); window.location.reload(); } 
        else { alert(data.message || "Errore"); }
    } catch (err) { console.error(err); }
  };

  const handleAcceptInvite = async () => {
    try {
        const token = localStorage.getItem('accessToken');
        // CORRETTO
        const res = await fetch(`${API_URL}/api/itinerari/accetta-invito`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ viaggioId: id })
        });
        const data = await res.json();
        if (data.success) { alert("Invito accettato! Sei a bordo."); window.location.reload(); } 
        else { alert(data.message || "Errore"); }
    } catch (err) { console.error(err); }
  };

  if (loading) return <div style={{padding:'2rem', textAlign:'center'}}>Caricamento in corso...</div>;
  if (error || !trip) return (<div style={{padding:'2rem', textAlign:'center'}}><h2>⚠️ {error}</h2><button onClick={() => navigate('/dashboard')}>Dashboard</button></div>);

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
      <TripHeader trip={trip} postiLiberi={postiLiberi} />
      <div className="details-layout" style={{display:'flex', gap:'2rem', flexDirection: 'row', flexWrap:'wrap'}}>
        <div className="info-col" style={{flex:'1.2'}}>
            <TripInfo trip={trip} currentUserId={currentUserId} isCreator={isCreator} isParticipant={isParticipant} isPending={isPending} isInvited={isInvited} postiLiberi={postiLiberi} handleKickUser={handleKickUser} handleAcceptInvite={handleAcceptInvite} onJoinClick={() => setShowConfirm(true)} />
        </div>
        <div className="map-col" style={{flex:'1.8', height:'500px'}}>
             {mapPoints.length > 0 ? <SharedMap points={mapPoints} routePath={routePath} height="100%" /> : <p>Caricamento mappa...</p>}
        </div>
      </div>
      {showConfirm && <JoinModal onClose={() => setShowConfirm(false)} onConfirm={handleJoinRequest} />}
    </div>
  );
};
export default TripDetails;