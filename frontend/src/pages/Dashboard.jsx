import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import DashboardGrid from '../components/DashboardGrid';

// --- DEFINIZIONE URL BACKEND ---
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Dashboard = ({ onLogin }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState({ name: "Viaggiatore", email: "", id: null });
  const [myTrips, setMyTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlToken = searchParams.get('accessToken');
    if (urlToken) {
      localStorage.setItem('accessToken', urlToken);
      if (onLogin) onLogin();
      navigate('/dashboard', { replace: true });
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    } 
    
    if (onLogin) onLogin();

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const payload = JSON.parse(jsonPayload);
        setUser({ 
            name: payload.username || "Viaggiatore", 
            email: payload.email, 
            id: payload.userId 
        });
    } catch (e) {
        console.error("Errore lettura token", e);
    }

    const fetchMyTrips = async () => {
        try {
            // --- CORREZIONE QUI ---
            const response = await fetch(`${API_URL}/api/itinerari/miei`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 403 || response.status === 401) {
                 localStorage.removeItem('accessToken');
                 navigate('/login');
                 return; 
            }

            const data = await response.json();
            if (data.success) {
                setMyTrips(data.data);
            }
        } catch (error) {
            console.error("Errore fetch viaggi:", error);
        } finally {
            setLoading(false);
        }
    };
    
    fetchMyTrips();

  }, [searchParams, navigate, onLogin]);
  
  const handleCreateClick = () => {
      navigate('/create-trip');
  };

  const handleViewTrip = (id) => {
      navigate(`/trip/${id}`);
  };

  const handleEditTrip = (id) => {
      navigate(`/edit-trip/${id}`);
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Sei sicuro di voler cancellare questo viaggio?")) return;

      try {
        const token = localStorage.getItem('accessToken');
        // --- CORREZIONE QUI ---
        const res = await fetch(`${API_URL}/api/itinerari/cancella/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            setMyTrips(prev => prev.filter(trip => trip._id !== id));
        } else {
            alert("Errore durante la cancellazione");
        }
      } catch (err) { console.error(err); }
  };

  const handleLeaveTrip = async (tripId) => {
    if (!window.confirm("Sei sicuro di voler abbandonare questo viaggio?")) return;

    try {
        const token = localStorage.getItem('accessToken');
        // --- CORREZIONE QUI ---
        const response = await fetch(`${API_URL}/api/itinerari/abbandona/${tripId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.success) {
            alert("Hai abbandonato il viaggio.");
            setMyTrips(prev => prev.filter(t => t._id !== tripId));
        } else {
            alert(data.message || "Errore durante l'operazione");
        }
    } catch (error) {
        console.error("Errore:", error);
        alert("Errore di connessione");
    }
  };

  return (
    <div className="dashboard-container">
        <DashboardHeader 
            userName={user.name} 
            onCreateClick={handleCreateClick} 
        />
        <div className="section-title-row">
            <h2>I Miei Itinerari</h2>
        </div>
        <DashboardGrid 
            trips={myTrips}
            loading={loading}
            currentUserId={user.id}
            onView={handleViewTrip}
            onEdit={handleEditTrip}
            onDelete={handleDelete}
            onLeave={handleLeaveTrip}
        />
    </div>
  );
};

export default Dashboard;