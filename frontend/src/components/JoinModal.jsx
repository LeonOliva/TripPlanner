import React from 'react';

const JoinModal = ({ onClose, onConfirm }) => {
  return (
    <div className="modal-overlay" style={{
        position:'fixed', top:0, left:0, right:0, bottom:0, 
        background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000,
        backdropFilter: 'blur(5px)'
    }}>
        <div className="modal-content" style={{background:'var(--surface-color)', padding:'2.5rem', borderRadius:'16px', maxWidth:'450px', width:'90%', border:'1px solid var(--border-color)', boxShadow:'var(--shadow-lg)'}}>
            <h3 style={{marginTop:0, fontSize:'1.5rem'}}>Vuoi unirti al gruppo? 🌍</h3>
            <p style={{color:'var(--text-sub)', fontSize:'1.1rem'}}>Verrà inviata una notifica all'autore del viaggio per l'approvazione.</p>
            
            <div className="modal-actions" style={{display:'flex', gap:'1rem', marginTop:'2rem', justifyContent:'flex-end'}}>
                <button onClick={onClose} className="btn btn-outline" style={{padding:'10px 20px', fontSize:'1rem'}}>Annulla</button>
                <button onClick={onConfirm} className="btn btn-primary" style={{padding:'10px 20px', fontSize:'1rem'}}>Sì, partecipa!</button>
            </div>
        </div>
    </div>
  );
};

export default JoinModal;