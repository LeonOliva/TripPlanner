import React from 'react';

// --- HELPER VISIVI (Spostati qui perché servono solo all'Item) ---
const getColor = (type) => {
    switch(type) {
        case 'richiesta_partecipazione': return '#e0f2fe'; 
        case 'richiesta_accettata': return '#dcfce7'; 
        case 'richiesta_rifiutata': return '#fee2e2'; 
        case 'abbandono': return '#fee2e2'; 
        case 'rimozione_partecipante': return '#fee2e2';
        case 'invito_viaggio': return '#f3e8ff';
        default: return '#f1f5f9';
    }
};

const getIconColor = (type) => {
    switch(type) {
        case 'richiesta_partecipazione': return '#0284c7';
        case 'richiesta_accettata': return '#16a34a';
        case 'richiesta_rifiutata': return '#dc2626'; 
        case 'abbandono': return '#dc2626';
        case 'rimozione_partecipante': return '#dc2626'; 
        default: return '#64748b';
    }
};

const renderIcon = (type) => {
    let iconName = '';
    switch(type) {
      case 'richiesta_partecipazione': iconName = 'group_add'; break;
      case 'richiesta_accettata': iconName = 'check_circle'; break;
      case 'richiesta_rifiutata': iconName = 'cancel'; break; 
      case 'abbandono': iconName = 'person_remove'; break;
      case 'rimozione_partecipante': iconName = 'person_remove'; break;
      case 'invito_viaggio': return <span className="material-symbols-outlined" style={{ color: '#8b5cf6' }}>mail</span>;
      default: iconName = 'notifications';
    }
    return <span className="material-symbols-outlined" style={{ color: getIconColor(type) }}>{iconName}</span>;
  };

const NotificationItem = ({ note, onClick, onDelete }) => {
  return (
    <div 
        className={`notification-card ${!note.isRead ? 'unread' : ''}`}
        onClick={() => onClick(note)} 
        style={{cursor: 'pointer'}}
    >
      <div className="note-icon-wrapper" style={{ backgroundColor: getColor(note.type) }}>
        {renderIcon(note.type)}
      </div>
      
      <div className="note-content" style={{flex: 1}}>
        <p><strong>{note.user}</strong> {note.actionText} <span className="note-target">{note.target}</span></p>
        <span className="note-time">{note.time}</span>
      </div>

      <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          {!note.isRead && <div className="blue-dot"></div>}
          
          <button 
            onClick={(e) => onDelete(e, note.id)}
            title="Elimina notifica"
            style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
            onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            <span className="material-symbols-outlined" style={{fontSize: '1.3rem'}}>delete</span>
          </button>
      </div>
    </div>
  );
};

export default NotificationItem;