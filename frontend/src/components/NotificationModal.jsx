import React from 'react';

const NotificationModal = ({ notification, onAccept, onReject, onClose }) => {
  if (!notification) return null;

  return (
    <div className="modal-overlay" style={{
        position:'fixed', top:0, left:0, right:0, bottom:0, 
        background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000
    }}>
        <div className="modal-content" style={{background:'white', padding:'2rem', borderRadius:'12px', maxWidth:'400px', width:'90%'}}>
            <h3>Gestisci Richiesta 🤝</h3>
            <p style={{margin: '1rem 0'}}>
                L'utente <strong>{notification.user}</strong> vuole unirsi al viaggio: <br/>
                <em>"{notification.target}"</em>.
            </p>
            <div className="modal-actions" style={{display:'flex', gap:'1rem', justifyContent:'flex-end'}}>
                <button onClick={onReject} className="btn btn-outline" style={{color: '#dc2626', borderColor: '#dc2626'}}>Rifiuta</button>
                <button onClick={onAccept} className="btn btn-primary" style={{backgroundColor: '#16a34a', borderColor: '#16a34a'}}>Accetta</button>
            </div>
            <div style={{marginTop:'1rem', textAlign:'center'}}>
               <span style={{fontSize:'0.8rem', color:'#666', cursor:'pointer', textDecoration:'underline'}} onClick={onClose}>Chiudi senza agire</span>
            </div>
        </div>
    </div>
  );
};

export default NotificationModal;