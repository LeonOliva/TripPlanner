import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { io } from "socket.io-client"; 
import './App.css';

// Componenti Strutturali
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';

// Pagine
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import ExploreTrips from './pages/ExploreTrips';
import Notifications from './pages/Notifications';
import TripDetails from './pages/TripDetails';
import VerifyEmail from './pages/VerifyEmail';

// Creiamo un componente interno per poter usare useLocation
const AppContent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [socket, setSocket] = useState(null); 
  
  const location = useLocation(); 

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    if(socket) socket.disconnect(); // Disconnetti socket al logout
    setSocket(null);
    window.location.href = '/login'; 
  };

  // Helper per decodificare il token e ottenere l'ID utente
  const getUserIdFromToken = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const payload = JSON.parse(jsonPayload);
        return payload.userId || payload.id;
    } catch(e) { 
        // FIX 1: Usiamo la variabile 'e' per evitare il warning "defined but never used"
        console.error("Errore decodifica token:", e);
        return null; 
    }
  };

  // 3. GESTIONE CONNESSIONE SOCKET (REAL-TIME)
useEffect(() => {
    const userId = getUserIdFromToken();

    // Se l'utente è loggato
    if (isLoggedIn && userId) {
        // Se il socket non esiste o è disconnesso, crealo
        if (!socket || !socket.connected) {
            const newSocket = io("http://localhost:5000", {
                reconnection: true, // Importante per la stabilità
                transports: ['websocket']
            });

            newSocket.on("connect", () => {
                console.log("🔌 Socket connesso:", newSocket.id);
                // EMETTIAMO SUBITO L'IDENTITÀ
                console.log("👤 Invio identità per:", userId);
                newSocket.emit("identity", userId);
            });

            newSocket.on("nuova_notifica", (notifica) => {
                console.log("🔔 Notifica ricevuta realtime:", notifica);
                setHasUnread(true);
                // Opzionale: Audio bip qui
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } 
        // CASO CRITICO: Se il socket esiste già ma si era riconnesso, 
        // dobbiamo assicurarci che il server sappia ancora chi siamo
        else if (socket.connected) {
             socket.emit("identity", userId);
        }
    }
  }, [isLoggedIn]);

  // Controllo notifiche standard (API) al cambio pagina
  const checkNotifications = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
          setHasUnread(false);
          return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/itinerari/notifiche', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          const unread = data.data.some(n => !n.letta);
          setHasUnread(unread);
        }
      } catch (err) {
        console.error("Errore check notifiche", err);
      }
  };

  useEffect(() => {
    checkNotifications();
  }, [location.pathname]);

 return (
    <div className="app">
      <Header isLoggedIn={isLoggedIn} onOpenSidebar={openSidebar} hasUnread={hasUnread} />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar} 
        isLoggedIn={isLoggedIn} 
        onLogout={handleLogout} 
        hasUnread={hasUnread}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/dashboard" element={<Dashboard onLogin={handleLogin} />} />
        
        <Route 
            path="/notifications" 
            element={
              <Notifications 
                onRefreshNotifications={checkNotifications} 
                socket={socket} 
                setHasUnread={setHasUnread} 
              />
            } 
        />
        
        <Route path="/create-trip" element={<CreateTrip />} />
        <Route path="/edit-trip/:id" element={<CreateTrip />} />
        <Route path="/trip/:id" element={<TripDetails />} />
        <Route path="/explore" element={<ExploreTrips />} />
      </Routes>

      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;