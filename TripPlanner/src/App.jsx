import React, { useState } from 'react';
import './App.css';

// IMMAGINI
import logoImg from './assets/logo.png';
import ominoImg from './assets/Omino.png';
import viaggiatoriImg from './assets/viaggiatori.png';
import sun from './assets/sun.png';
import moon from './assets/moon.png';

// ICONE
import { FaBars, FaPlaneDeparture } from 'react-icons/fa';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // STATO FITTIZIO: Mettilo a 'true' per vedere il bottone Logout, 'false' per vedere Accedi
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // --- QUESTA È LA FUNZIONE PRESA DAL TUO COLLEGA ---
  const handleLogout = async () => {
    try {
      // Chiama il backend del tuo collega
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include" // Importante: invia i cookie di sessione
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message || "Logout effettuato!");
        setIsLoggedIn(false); // Aggiorna lo stato grafico
        window.location.href = "/"; // Ricarica o rimanda alla home
      } else {
        alert("Qualcosa è andato storto nel logout");
      }
      
    } catch (err) {
      console.error("Errore logout: ", err);
      alert("Errore di connessione durante il logout");
    }
  };
  // ------------------------------------------------

  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>

      {/* --- HEADER --- */}
      <header className="header">
        <div className="header-inner">
          
          {/* SINISTRA */}
          <button className="btn-icon-text">
            <FaBars /> <span>Menù</span>
          </button>

          {/* CENTRO */}
          <div className="branding">
            <div className="logo-title-wrapper">
              <img src={logoImg} alt="Logo" className="logo-img" />
              <h1>TripPlanner</h1>
              <img src={logoImg} alt="Logo" className="logo-img" />
            </div>
            <p className="tagline">Organizza con i tuoi amici il tuo prossimo viaggio!</p>
          </div>

          {/* DESTRA */}
          <div className="user-actions">
            
            {/* LOGICA BOTTONE ACCEDI / LOGOUT */}
            {isLoggedIn ? (
              // SE SEI LOGGATO: Mostra Logout
              <button className="btn-icon-text login-btn" onClick={handleLogout}>
                <img src={ominoImg} alt="User" className="avatar-small" /> 
                <span>Logout</span>
              </button>
            ) : (
              // SE NON SEI LOGGATO: Mostra Accedi (che porta alla pagina login del collega)
              <a href="login.html" style={{textDecoration: 'none'}}> 
                <button className="btn-icon-text login-btn">
                  <img src={ominoImg} alt="User" className="avatar-small" /> 
                  <span>Accedi</span>
                </button>
              </a>
            )}

            {/* Bottone TEMA */}
            <button className="btn-icon-text" onClick={toggleTheme}>
              {isDarkMode ? (
                <img src={sun} alt="Light Mode" className="avatar-small filter-white" />
              ) : (
                <img src={moon} alt="Dark Mode" className="avatar-small filter-white" />
              )}
              <span>{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>

          </div>
        </div>
      </header>

      {/* --- MAIN BODY --- */}
      <main className="main-content">
        <div className="hero-wrapper">
          <div className="text-section">
            <div className="hero-card">
              <div className="title-group">
                <FaPlaneDeparture className="plane-icon" />
                <h2 className="main-title">Pronto per partire?</h2>
              </div>
              <ul className="info-list">
                <li>Crea il tuo account o accedi</li>
                <li>Segui gli account dei tuoi amici</li>
                <li>Organizza il tuo viaggio!</li>
                <li>Oppure visualizza itinerari condivisi!</li>
              </ul>
              <div className="btn-group">
                <button className="btn-primary">Crea itinerari</button>
                <button className="btn-primary">Visualizza itinerari</button>
              </div>
            </div>
          </div>
          <div className="image-section">
            <img src={viaggiatoriImg} alt="Viaggiatori" className="hero-img" />
          </div>
        </div>
      </main>
      {/* --- AGGIUNGI QUESTO FOOTER --- */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} TripPlanner. Tutti i diritti riservati.</p>
      </footer>
    </div>
  );
}

export default App;