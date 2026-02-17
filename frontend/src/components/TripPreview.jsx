import React from 'react';
import SharedMap from './SharedMap';

const TripPreview = ({ mapPoints, routePath, duration, formData }) => {
  return (
    <div className="trip-card-preview" style={{
        background: 'var(--surface-color)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '12px', 
        overflow: 'hidden'
    }}>
      <SharedMap points={mapPoints} routePath={routePath} height="300px" />
        
      <div className="preview-content" style={{padding:'1.5rem'}}>
          {duration && (
              <div style={{
                  display:'inline-block', 
                  background:'rgba(59, 130, 246, 0.15)', 
                  color:'var(--primary-color)', 
                  padding:'4px 10px', 
                  borderRadius:'6px', 
                  fontSize:'0.9rem', 
                  fontWeight:'bold',
                  marginBottom: '1rem'
              }}>
                  ⏱ {duration}
              </div>
          )}
          
          <div className="preview-route" style={{display:'flex', flexDirection:'column', gap:'10px', fontSize:'1.1rem'}}>
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                  <span className="material-symbols-outlined" style={{color:'#10b981'}}>trip_origin</span>
                  <strong>{formData.origin || 'Partenza'}</strong>
              </div>
              {formData.stops.map((stop, i) => (
                  <div key={i} style={{paddingLeft:'34px', color:'var(--text-sub)', fontSize:'0.95rem'}}>
                      ↓ {stop}
                  </div>
              ))}
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                  <span className="material-symbols-outlined" style={{color:'#ef4444'}}>location_on</span>
                  <strong>{formData.destination || 'Arrivo'}</strong>
              </div>
          </div>
      </div>
    </div>
  );
};

export default TripPreview;