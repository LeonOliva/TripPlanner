import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 
import NotificationItem from '../components/NotificationItem';
import NotificationModal from '../components/NotificationModal';

// 1. DEFINIAMO L'URL (Così funziona sia in locale che su Render)
const API_URL = "http://localhost:5000";

const getActionText = (type) => {
    switch(type) {
        case 'richiesta_partecipazione': return 'vuole unirsi al tuo viaggio:';
        case 'richiesta_accettata': return 'ti ha accettato nel viaggio:';
        case 'richiesta_rifiutata': return 'ha rifiutato la tua richiesta per:';
        case 'abbandono': return 'ha abbandonato il viaggio:';
        case 'rimozione_partecipante': return 'ti ha rimosso dal viaggio:';
        case 'invito_viaggio': return 'ti ha invitato al viaggio privato:';
        default: return 'nuova notifica:';
    }
};

const extractTripId = (itinerarioData) => itinerarioData?._id || itinerarioData || null;
const extractTripTitle = (itinerarioData) => itinerarioData?.titolo || 'Dettaglio Viaggio';

const Notifications = ({ onRefreshNotifications, socket }) => { 
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); 
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState(null);

  // FETCH INIZIALE
  useEffect(() => {
    const fetchNotifiche = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if(!token) { navigate('/login'); return; }

        // Usa API_URL
        const res = await fetch(`${API_URL}/api/itinerari/notifiche`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success) {
            const mappedData = data.data.map(n => ({
                id: n._id,
                type: n.tipo, 
                user: n.mittente ? n.mittente.username : 'Sistema',
                senderId: n.mittente ? n.mittente._id : null,
                tripId: extractTripId(n.itinerario),
                target: extractTripTitle(n.itinerario),
                time: new Date(n.createdAt).toLocaleDateString(),
                isRead: n.letta,
                actionText: getActionText(n.tipo)
            }));
            setNotifications(mappedData);
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchNotifiche();
  }, [navigate]);

  // SOCKET UPDATE
  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = (nuovaNotifica) => {
        const notificaFormattata = {
            id: nuovaNotifica._id,
            type: nuovaNotifica.tipo,
            user: nuovaNotifica.mittente ? (nuovaNotifica.mittente.username || 'Utente') : 'Sistema',
            senderId: nuovaNotifica.mittente ? (nuovaNotifica.mittente._id || nuovaNotifica.mittente) : null,
            tripId: extractTripId(nuovaNotifica.itinerario),
            target: extractTripTitle(nuovaNotifica.itinerario),
            time: 'Adesso', 
            isRead: false,
            actionText: getActionText(nuovaNotifica.tipo)
        };
        setNotifications(prev => [notificaFormattata, ...prev]);
    };
    socket.on("nuova_notifica", handleNewNotification);
    return () => { socket.off("nuova_notifica", handleNewNotification); };
  }, [socket]); 

  // --- FUNZIONI DI AZIONE (CORRETTE CON API_URL E UPDATE OTTIMISTICO) ---

  const handleDelete = async (e, id) => {
    e.stopPropagation(); 
    if(!window.confirm("Vuoi eliminare questa notifica?")) return;

    // Aggiorna subito la UI (rimuove la notifica visivamente)
    setNotifications(prev => prev.filter(n => n.id !== id));

    try {
        const token = localStorage.getItem('accessToken');
        await fetch(`${API_URL}/api/itinerari/notifiche/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (onRefreshNotifications) onRefreshNotifications();
    } catch (error) { console.error(error); }
  };

  const handleMarkAllRead = async () => {
      // 1. UPDATE OTTIMISTICO: Segna tutto come letto SUBITO visivamente
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      
      // Aggiorna il pallino rosso nella navbar
      if (onRefreshNotifications) onRefreshNotifications(); 

      try {
        const token = localStorage.getItem('accessToken');
        // 2. Poi chiama il server in background
        await fetch(`${API_URL}/api/itinerari/notifiche/leggi-tutte`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (error) { console.error("Errore lettura notifiche:", error); }
  };

  const handleNotificationClick = async (note) => {
      // Update UI immediato
      setNotifications(prev => prev.map(n => n.id === note.id ? { ...n, isRead: true } : n));
      
      try {
          const token = localStorage.getItem('accessToken');
          await fetch(`${API_URL}/api/itinerari/notifiche/${note.id}/leggi`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (onRefreshNotifications) onRefreshNotifications();
      } catch (error) { console.error(error); }

      if (note.type === 'richiesta_partecipazione') {
          setSelectedNotif(note);
      } else if (note.tripId) {
          navigate(`/trip/${note.tripId}`);
      }
  };

  const handleAcceptUser = async () => {
      if (!selectedNotif) return;
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API_URL}/api/itinerari/accetta`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                viaggioId: selectedNotif.tripId,
                utenteDaAccettareId: selectedNotif.senderId,
                notificaId: selectedNotif.id 
            })
        });

        if (res.status === 401 || res.status === 403) {
            alert("Sessione scaduta! Rifai il login.");
            localStorage.removeItem('accessToken');
            navigate('/login');
            return;
        }

        const data = await res.json();
        if (data.success) {
            alert("Utente accettato!");
            setSelectedNotif(null);
            setNotifications(prev => prev.filter(n => n.id !== selectedNotif.id));
        } else {
            alert(data.message || "Errore");
        }
      } catch (error) { console.error(error); }
  };

  const handleRejectUser = async () => {
      if (!selectedNotif) return;
      if (!window.confirm("Rifiutare richiesta?")) return;
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API_URL}/api/itinerari/rifiuta`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                viaggioId: selectedNotif.tripId,
                utenteDaRifiutareId: selectedNotif.senderId,
                notificaId: selectedNotif.id 
            })
        });
        
        if (res.status === 401 || res.status === 403) {
             alert("Sessione scaduta! Rifai il login.");
             localStorage.removeItem('accessToken');
             navigate('/login');
             return;
        }

        const data = await res.json();
        if (data.success) {
            alert("Rifiutata.");
            setSelectedNotif(null);
            setNotifications(prev => prev.filter(n => n.id !== selectedNotif.id));
        }
      } catch (error) { console.error(error); }
  };

  const displayedNotifications = filter === 'all' ? notifications : notifications.filter(n => !n.isRead);

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifiche</h1>
        <button className="mark-read-btn" onClick={handleMarkAllRead}>
             <span className="material-symbols-outlined check-icon">done_all</span>
             Segna tutte come lette 
        </button>
      </div>

      <div className="notifications-tabs">
        <button className={`tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Tutte</button>
        <button className={`tab-btn ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>Non lette</button>
      </div>

      <div className="notifications-list">
        {loading ? <p>Caricamento...</p> : displayedNotifications.length === 0 ? <p className="no-notif">Nessuna notifica.</p> : (
          displayedNotifications.map((note) => (
            <NotificationItem 
                key={note.id} 
                note={note} 
                onClick={handleNotificationClick} 
                onDelete={handleDelete} 
            />
          ))
        )}
      </div>

      <NotificationModal 
        notification={selectedNotif} 
        onAccept={handleAcceptUser} 
        onReject={handleRejectUser} 
        onClose={() => setSelectedNotif(null)} 
      />
    </div>
  );
};

export default Notifications;