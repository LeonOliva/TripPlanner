import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// IMPORTIAMO I DUE NUOVI COMPONENTI
import TripForm from '../components/TripForm';
import TripPreview from '../components/TripPreview';

const CreateTrip = () => {
  const [currentParticipants, setCurrentParticipants] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const todayDate = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    stops: [],
    startDate: '',
    endDate: '',
    travelType: 'flight',
    participants: 1,
    visibility: 'pubblica',
    sharedWith: []
  });

  const [stopInput, setStopInput] = useState('');
  const [inviteInput, setInviteInput] = useState('');
  const [mapPoints, setMapPoints] = useState([]);
  const [routePath, setRoutePath] = useState([]);
  const [duration, setDuration] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addStop = () => {
    if (stopInput.trim() && formData.stops.length < 3) {
        setFormData(prev => ({ ...prev, stops: [...prev.stops, stopInput.trim()] }));
        setStopInput('');
    } else if (formData.stops.length >= 3) {
        alert("Puoi aggiungere al massimo 3 tappe intermedie.");
    }
  };

  const removeStop = (index) => {
    setFormData(prev => ({ ...prev, stops: prev.stops.filter((_, i) => i !== index) }));
  };

  const addFriend = (e) => {
    e.preventDefault();
    if (inviteInput.trim() && !formData.sharedWith.includes(inviteInput.trim())) {
      setFormData(prev => ({ ...prev, sharedWith: [...prev.sharedWith, inviteInput.trim()] }));
      setInviteInput('');
    }
  };
  const removeFriend = (friend) => {
    setFormData(prev => ({ ...prev, sharedWith: prev.sharedWith.filter(f => f !== friend) }));
  };

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

  const getRoute = useCallback(async (points, type) => {
    if (type === 'flight') {
        setRoutePath(points);
        setDuration("Volo (stimato)");
        return;
    }

    try {
      const coordinatesString = points.map(p => `${p[1]},${p[0]}`).join(';');
      const url = `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        setRoutePath(coordinates);
        const seconds = data.routes[0].duration;
        const hours = Math.floor(seconds / 3600);
        setDuration(`${hours}h ${Math.floor((seconds % 3600) / 60)}min (Stimato)`);
      }
    } catch (err) {
      console.error("Errore routing:", err);
      setRoutePath(points);
    }
  }, []);

  const updateMap = useCallback(async () => {
    const allCities = [formData.origin, ...formData.stops, formData.destination].filter(c => c !== '');
    if (allCities.length < 2) return;

    const coordsPromises = allCities.map(city => getCoordinates(city));
    const coordsResults = await Promise.all(coordsPromises);
    const validCoords = coordsResults.filter(c => c !== null);
    setMapPoints(validCoords);

    if (validCoords.length >= 2) {
        getRoute(validCoords, formData.travelType);
    }
  }, [formData.origin, formData.stops, formData.destination, formData.travelType, getCoordinates, getRoute]);

  useEffect(() => {
     const timer = setTimeout(() => {
         if(formData.origin && formData.destination) updateMap();
     }, 800);
     return () => clearTimeout(timer);
  }, [updateMap, formData.origin, formData.destination]);

  useEffect(() => {
    if (isEditMode) {
      const fetchTripDetails = async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const response = await fetch(`http://localhost:5000/api/itinerari/visualizza/${id}`, {
             headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();

          if (data.success) {
            const trip = data.data;
            setFormData({
              origin: trip.origine,
              destination: trip.destinazione,
              stops: trip.tappe || [],
              startDate: trip.dataInizio.split('T')[0],
              endDate: trip.dataFine.split('T')[0],
              travelType: trip.travelMode ? trip.travelMode.toLowerCase() : 'flight',
              participants: trip.partecipantiMax || trip.partecipanti || 2,
              image: trip.immagine,
              visibility: trip.visibilita,
              sharedWith: trip.condivisoCon || []
            });
            setCurrentParticipants(trip.partecipantiAttuali || []);
          }
        } catch (error) { console.error("Errore recupero viaggio:", error); }
      };
      fetchTripDetails();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
        setError("La data di fine non può essere precedente all'inizio!");
        return;
    }
    if (!formData.origin || !formData.destination || !formData.startDate || !formData.endDate) {
      setError("Compila tutti i campi obbligatori.");
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const url = isEditMode 
        ? `http://localhost:5000/api/itinerari/modifica/${id}` 
        : 'http://localhost:5000/api/itinerari/crea';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });

      if (response.status === 401 || response.status === 403) {
          alert("Sessione scaduta.");
          localStorage.removeItem('accessToken');
          navigate('/login');
          return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Errore salvataggio");
      
      alert(isEditMode ? "Viaggio modificato!" : "Viaggio creato!");
      navigate('/dashboard'); 
    } catch (err) { setError(err.message); }
  };

  const handleKickUser = async (userIdToRemove) => {
    if(!window.confirm("Rimuovere questo utente?")) return;
    try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://localhost:5000/api/itinerari/rimuovi-partecipante', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ viaggioId: id, utenteDaRimuovereId: userIdToRemove })
        });
        const data = await res.json();
        if (data.success) {
            alert("Utente rimosso.");
            setCurrentParticipants(prev => prev.filter(p => p._id !== userIdToRemove));
        }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="create-trip-page">
      <div className="page-header">
        <h1>{isEditMode ? 'Modifica Viaggio ✏️' : 'Crea Nuovo Viaggio 🌍'}</h1>        
        <p>Organizza, aggiungi tappe e invita amici.</p>
      </div>

      <div className="create-trip-layout">
        
        {/* COMPONENTE FORM (SINISTRA) */}
        <TripForm 
            formData={formData} 
            handleChange={handleChange} 
            handleSubmit={handleSubmit} 
            isEditMode={isEditMode}
            stopInput={stopInput} 
            setStopInput={setStopInput} 
            addStop={addStop} 
            removeStop={removeStop}
            inviteInput={inviteInput} 
            setInviteInput={setInviteInput} 
            addFriend={addFriend} 
            removeFriend={removeFriend}
            currentParticipants={currentParticipants} 
            handleKickUser={handleKickUser} 
            error={error} 
            todayDate={todayDate}
        />

        {/* COMPONENTE PREVIEW (DESTRA) */}
        <TripPreview 
            mapPoints={mapPoints} 
            routePath={routePath} 
            duration={duration} 
            formData={formData} 
        />

      </div>
    </div>
  );
};

export default CreateTrip;