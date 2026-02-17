import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icone (lo metti qui una volta sola!)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper interno
function MapUpdater({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

const SharedMap = ({ points, routePath, height = '300px' }) => {
  // Centro default (Roma) se non ci sono punti
  const center = points.length > 0 ? points[0] : [41.9028, 12.4964];

  return (
    <div className="map-wrapper" style={{ height: height, width: '100%', position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
        <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
            <TileLayer 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            />
            {points.map((pos, idx) => (
                <Marker key={idx} position={pos}>
                    <Popup>{idx === 0 ? 'Partenza' : idx === points.length - 1 ? 'Arrivo' : `Tappa ${idx}`}</Popup>
                </Marker>
            ))}
            {routePath.length > 0 && (
                <>
                    <Polyline positions={routePath} color="#3b82f6" weight={4} />
                    <MapUpdater bounds={points} />
                </>
            )}
        </MapContainer>
    </div>
  );
};

export default SharedMap;