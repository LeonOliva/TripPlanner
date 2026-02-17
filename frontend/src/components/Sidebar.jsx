import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; 

const Sidebar = ({ isOpen, onClose, isLoggedIn, onLogout, hasUnread }) => {
  // Stato iniziale vuoto
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: ""
  });

  // --- RECUPERA DATI REALI DAL TOKEN ---
  useEffect(() => {
    if (isLoggedIn) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const payload = JSON.parse(jsonPayload);

          setUserInfo({
            name: payload.username || "Utente", 
            email: payload.email || "Email non disponibile"
          });
        } catch (e) {
          console.error("Errore decodifica token sidebar:", e);
        }
      }
    }
  }, [isLoggedIn]);

  return (
    <>
      {/* Overlay Scuro (clicca per chiudere) */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      ></div>

      {/* Sidebar Laterale */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        
        <div className="sidebar-header">
          {isLoggedIn ? (
            <div className="user-profile">
              <div className="avatar-placeholder">
                {userInfo.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{userInfo.name}</span>
                <span className="user-email">{userInfo.email}</span>
              </div>
              {/* Matita rimossa da qui */}
            </div>
          ) : (
            <div className="logo" style={{color: 'var(--primary-color)'}}>
               <span className="material-symbols-outlined">travel_explore</span>
               <span>TripPlanner</span>
            </div>
          )}

          <button className="close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/" className="sidebar-link" onClick={onClose}>
                <span className="material-symbols-outlined">home</span>
                Home
              </Link>
            </li>

            {isLoggedIn ? (
              // MENU LOGGATO
              <>
                <li>
                  <Link to="/dashboard" className="sidebar-link" onClick={onClose}>
                    <span className="material-symbols-outlined">dashboard</span>
                    Dashboard
                  </Link>
                </li>
                
                <li>
                  <Link to="/create-trip" className="sidebar-link" onClick={onClose}>
                    <span className="material-symbols-outlined">add_circle</span>
                    Crea Itinerari
                  </Link>
                </li>
                
                <li>
                  <Link to="/explore" className="sidebar-link" onClick={onClose}>
                    <span className="material-symbols-outlined">map</span>
                    Visualizza Itinerari
                  </Link>
                </li>

                <li>
                  <Link to="/notifications" className="sidebar-link" onClick={onClose}>
                    <div className="icon-wrapper-relative">
                        <span className="material-symbols-outlined">notifications</span>
                        {hasUnread && <div className="notification-dot-badge"></div>}
                    </div>
                    Notifiche
                  </Link>
                </li>
                
                <div className="separator"></div>

                <li>
                  <button onClick={() => { onLogout(); onClose(); }} className="sidebar-link logout-btn">
                    <span className="material-symbols-outlined">logout</span>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              // MENU OSPITE
              <>
                 <li>
                  <Link to="/explore" className="sidebar-link" onClick={onClose}>
                    <span className="material-symbols-outlined">map</span>
                    Itinerari Pubblici
                  </Link>
                </li>
                <div className="separator"></div>
                <li>
                  <Link to="/login" className="sidebar-link" onClick={onClose}>
                    <span className="material-symbols-outlined">login</span>
                    Accedi
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="sidebar-link" onClick={onClose}>
                    <span className="material-symbols-outlined">person_add</span>
                    Registrati
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;