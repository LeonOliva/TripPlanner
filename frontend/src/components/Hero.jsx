import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  // Funzione unica per gestire la navigazione con controllo login
  const handleNavigation = (targetPath) => {
    // 1. Controlliamo se esiste il token (quindi se l'utente è loggato)
    const isLoggedIn = localStorage.getItem('accessToken');

    if (isLoggedIn) {
      // 2. Se è loggato, vai alla destinazione richiesta
      navigate(targetPath);
    } else {
      // 3. Se NON è loggato, vai al Login
      navigate('/login');
    }
  };

  return (
    <header className="hero">
      <div className="hero-content">
        <h1>
          Pianifica il tuo prossimo viaggio <br />
          <span className="highlight">Pronto per partire?</span>
        </h1>
        
        <p>
          Organizza i tuoi viaggi, condividi i tuoi itinerari e preparati per
          nuove destinazioni.
        </p>
        
        <div className="hero-buttons">
          {/* Pulsante Crea Itinerario */}
          <button 
            className="btn btn-primary"
            onClick={() => handleNavigation('/create-trip')}
          >
            Crea itinerario
            <span className="material-symbols-outlined" style={{marginLeft: '8px'}}>arrow_forward</span>
          </button>

          {/* Pulsante Visualizza Itinerari */}
          <button 
            className="btn btn-primary" 
            style={{marginLeft: '10px'}}
            onClick={() => handleNavigation('/explore')}
          >
             Visualizza gli itinerari
             <span className="material-symbols-outlined" style={{marginLeft: '8px'}}>arrow_forward</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Hero;