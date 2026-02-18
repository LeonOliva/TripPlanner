import React, { useState, useEffect, useCallback } from 'react';
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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
    if(socket) socket.disconnect(); 
    setSocket(null);
    window.location.href = '/login'; 
  };

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
        console.error("Errore decodifica token:", e);
        return null; 
    }
  };

  const checkNotifications = useCallback(async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
          setHasUnread(false);
          return;
      }

      try {
        // Usa la costante globale API_URL
        const res = await fetch(`${API_URL}/api/itinerari/notifiche`, {
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
  }, []); // Dipendenze vuote perché API_URL è esterno

  // GESTIONE SOCKET
  useEffect(() => {
    const userId = getUserIdFromToken();

    if (isLoggedIn && userId && !socket) {
        
        const newSocket = io(API_URL); 

        newSocket.on("connect", () => {
            console.log("🔌 Socket connesso:", newSocket.id);
            newSocket.emit("identity", userId);
        });

        newSocket.on("nuova_notifica", (notifica) => {
            console.log("🔔 Notifica ricevuta realtime:", notifica);
            setHasUnread(true); 
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }
  }, [isLoggedIn, socket]); // Rimosso API_URL dalle dipendenze perché ora è esterno

  // CONTROLLO NOTIFICHE AL CAMBIO PAGINA
  useEffect(() => {
    checkNotifications();
  }, [location.pathname, checkNotifications]); // Ora checkNotifications è sicuro grazie a useCallback

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