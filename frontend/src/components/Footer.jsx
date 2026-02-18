import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 1. Controlliamo se l'utente è loggato
  const isLoggedIn = localStorage.getItem('accessToken');

  // Se siamo su Register o Login, non restituire nulla (nascondi il footer)
  if (location.pathname === '/register' || location.pathname === '/login') {
    return null;
  }

  // Funzione per gestire il click su "Itinerari Pubblici" se non sei loggato (comportamento Hero)
  const handlePublicTripsClick = (e) => {
    e.preventDefault(); // Previene la navigazione standard del link
    if (isLoggedIn) {
      navigate('/explore');
    } else {
      navigate('/login');
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Colonna 1: Brand e Descrizione */}
        <div className="footer-column">
          <div className="logo" style={{ marginBottom: '1rem' }}>
            <span className="material-symbols-outlined logo-icon">travel_explore</span>
            <span>TripPlanner</span>
          </div>
          <p className="footer-desc">
            La piattaforma ideale per organizzare viaggi con i tuoi amici e non. 
            Pianifica, condividi e parti.
          </p>
        </div>

        {/* Colonna 2: Link di Navigazione (Dinamici) */}
        <div className="footer-column">
          <h4>Esplora</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            
            {/* LOGICA CONDIZIONALE */}
            {isLoggedIn ? (
              // --- SE SEI LOGGATO ---
              <>
                <li><Link to="/create-trip">Crea Itinerario</Link></li>
                <li><Link to="/explore">Visualizza Itinerari</Link></li>
              </>
            ) : (
              // --- SE NON SEI LOGGATO ---
              <>
                {/* Questo link porta al login se cliccato da sloggato (come nella Hero) */}
                <li>
                    <a href="/explore" onClick={handlePublicTripsClick}>Itinerari Pubblici</a>
                </li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Registrati</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* Colonna 3: Info Accademiche */}
        <div className="footer-column">
          <h4>Informazioni</h4>
          <ul className="footer-links">
            <li>
              <span className="material-symbols-outlined" style={{fontSize: '16px', verticalAlign: 'middle'}}>school</span>
              <span style={{marginLeft: '8px'}}>Progetto Universitario</span>
            </li>
            <li>Corso: Fondamenti Web</li>
            <li>Anno: 2025-2026</li>
            <li>Studenti: Pierluigi Zarra & Leonardo Oliva</li>
          </ul>
        </div>

      </div>

      {/* Riga Copyright separata */}
      <div className="footer-bottom">
        <p>© 2026 TripPlanner</p>
      </div>
    </footer>
  );
};

export default Footer;