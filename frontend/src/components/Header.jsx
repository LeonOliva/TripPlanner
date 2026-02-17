import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = ({ isLoggedIn, onOpenSidebar, hasUnread }) => {
  const navigate = useNavigate();
  const location = useLocation(); 

  // STATO TEMA: Legge dal localStorage o usa 'light' come default
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // EFFETTO: Applica il tema al caricamento e al cambio
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // FUNZIONE TOGGLE
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const isAuthPage = location.pathname === '/register' || location.pathname === '/login';

  return (
    <nav className="navbar">
      <div className="navbar-content">
        
        <div className="logo-section">
          {!isAuthPage && (
            <button 
              className="hamburger-btn" 
              aria-label="Menu"
              onClick={onOpenSidebar} 
            >
              <div className="icon-wrapper-relative">
                  <span className="material-symbols-outlined">menu</span>
                  {hasUnread && <div className="notification-dot-badge" style={{top: '0', right: '0'}}></div>}
              </div>
            </button>
          )}

          <div className="logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
            <span className="material-symbols-outlined logo-icon">travel_explore</span>
            <span>TripPlanner</span>
          </div>
        </div>

        {/* PARTE DESTRA DELL'HEADER */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
            
            {/* TASTO TEMA (Visibile sempre o solo se loggato, a tua scelta) */}
            <button 
                className="theme-toggle-btn" 
                onClick={toggleTheme}
                title={theme === 'light' ? "Passa al tema scuro" : "Passa al tema chiaro"}
            >
                <span className="material-symbols-outlined">
                    {theme === 'light' ? 'dark_mode' : 'light_mode'}
                </span>
            </button>

            {!isAuthPage && (
            <div className="nav-links">
                {!isLoggedIn ? (
                <>
                    <button 
                    className="btn btn-outline" 
                    style={{ border: 'none' }}
                    onClick={() => navigate('/login')}
                    >
                    Login
                    </button>
                    <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/register')}
                    >
                    Registrati
                    </button>
                </>
                ) : (
                <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/dashboard')}
                >
                    Dashboard
                </button>
                )}
            </div>
            )}
        </div>
      </div>
    </nav>
  );
};

export default Header;