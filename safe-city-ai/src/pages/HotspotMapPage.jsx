import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { crimeZones, crimeTypes, firRecords } from '../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Search, 
  Filter, 
  Layers, 
  Navigation, 
  AlertTriangle, 
  MapPin, 
  Info,
  Maximize2,
  XCircle,
  Clock,
  FileText
} from 'lucide-react';

// Fix for default marker icons in Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper to generate hexagon vertices around a center
const getHexagonPoints = (lat, lng, radiusInMeters) => {
  const points = [];
  const radiusInDegrees = radiusInMeters / 111320; // Rough conversion
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const pLat = lat + radiusInDegrees * Math.cos(angle);
    const pLng = lng + (radiusInDegrees / Math.cos(lat * Math.PI / 180)) * Math.sin(angle);
    points.push([pLat, pLng]);
  }
  return points;
};

const HotspotMapPage = () => {
  const [selectedType, setSelectedType] = useState('All');
  const [hoveredZone, setHoveredZone] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterTime, setFilterTime] = useState('');
  
  const mapCenter = [13.0418, 80.2341];

  const filteredZones = useMemo(() => {
    return crimeZones.filter(z => 
      selectedType === 'All' || z.dominantCrime === selectedType || z.severity === 'safe'
    );
  }, [selectedType]);

  const getZoneColor = (zone) => {
    if (zone.severity === 'safe') return '#2ECC71'; // Green -> Safe
    if (zone.severity === 'high' && zone.dominantCrime !== 'Theft' && zone.dominantCrime !== 'Women Safety' && zone.dominantCrime !== 'Accident') return '#FF4D4F'; // Red -> High general
    
    switch (zone.dominantCrime) {
      case 'Theft': return '#E67E22'; // Orange -> Theft
      case 'Women Safety': return '#FFD60A'; // Yellow -> Women Safety
      case 'Accident': return '#3498DB'; // Blue -> Accidents
      default: return zone.severity === 'high' ? '#FF4D4F' : '#95A5A6';
    }
  };

  // Get FIRs for the selected zone
  const zoneFIRs = useMemo(() => {
    if (!selectedZone) return [];
    return firRecords.filter(f => f.location.includes(selectedZone.name.split(' ')[0]));
  }, [selectedZone]);

  return (
    <div style={{ height: 'calc(100vh - 140px)', position: 'relative', borderRadius: '24px', overflow: 'hidden', display: 'flex' }}>
      
      {/* Sidebar for Zone FIRs */}
      <AnimatePresence>
        {selectedZone && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '380px', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="glass-panel"
            style={{ 
              height: '100%', 
              zIndex: 2000, 
              borderRight: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{selectedZone.name}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Status: {selectedZone.severity.toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedZone(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <XCircle size={24} />
              </button>
            </div>

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Risk Score</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: '800', color: selectedZone.riskScore > 70 ? '#FF4D4F' : '#FFD60A' }}>{selectedZone.riskScore}</p>
                </div>
                <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Crimes</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: '800' }}>{selectedZone.crimeCount}</p>
                </div>
              </div>

              <h4 style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-secondary)' }}>LINKED FIR RECORDS</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {zoneFIRs.length > 0 ? zoneFIRs.map(fir => (
                  <div key={fir.id} className="glass-panel" style={{ padding: '16px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '800', color: 'var(--primary-color)' }}>{fir.id}</span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{fir.date}</span>
                    </div>
                    <p style={{ fontWeight: '700', marginBottom: '4px' }}>{fir.crimeType}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{fir.description}</p>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    <FileText size={40} style={{ opacity: 0.1, marginBottom: '12px' }} />
                    <p>No active FIRs in this zone.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
              <button className="btn-primary" style={{ width: '100%', padding: '12px' }}>Deploy Patrol Unit</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ flex: 1, position: 'relative' }}>
        {/* Map Control Overlay */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '80%'
        }}>
          <div className="glass-panel" style={{ padding: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {['All', 'Theft', 'Women Safety', 'Accident', 'General'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: selectedType === type ? 'var(--primary-color)' : 'var(--panel-bg)',
                  color: 'white',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
              >
                {type}
              </button>
            ))}
            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 8px' }} />
            <input 
              type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--panel-bg)', color: 'white', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.8rem' }}
            />
          </div>

          <div className="glass-panel" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#FF4D4F', boxShadow: '0 0 8px #FF4D4F' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: '700' }}>HIGH RISK</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#E67E22' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: '700' }}>THEFT</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#FFD60A' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: '700' }}>WOMEN SAFETY</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#3498DB' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: '700' }}>ACCIDENTS</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#2ECC71' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: '700' }}>SAFE</span>
            </div>
          </div>
        </div>

        {/* Main Map */}
        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; CARTO'
          />
          
          {filteredZones.map(zone => {
            const color = getZoneColor(zone);
            const hexPoints = getHexagonPoints(zone.lat, zone.lng, zone.radius);
            
            return (
              <Polygon
                key={zone.id}
                positions={hexPoints}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.5,
                  color: color,
                  weight: zone.severity === 'high' ? 3 : 1,
                  className: zone.severity === 'high' ? 'zone-pulse' : ''
                }}
                eventHandlers={{
                  mouseover: () => setHoveredZone(zone),
                  mouseout: () => setHoveredZone(null),
                  click: () => setSelectedZone(zone)
                }}
              >
                <Popup>
                  <div style={{ color: 'white', background: '#0B132B', padding: '10px', borderRadius: '8px' }}>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>{zone.name}</strong>
                    <div style={{ fontSize: '0.8rem' }}>
                      Primary: {zone.dominantCrime}<br />
                      Risk Index: {zone.riskScore}<br />
                      Total Crimes: {zone.crimeCount}
                    </div>
                    <button 
                       onClick={() => setSelectedZone(zone)}
                       style={{ marginTop: '8px', width: '100%', padding: '4px', background: 'var(--primary-color)', border: 'none', borderRadius: '4px', color: 'white', fontSize: '0.75rem', cursor: 'pointer' }}
                    >View FIRs</button>
                  </div>
                </Popup>
              </Polygon>
            )
          })}

          <Marker position={[13.0425, 80.2348]}>
             <Popup>Active SOS: Officer En Route</Popup>
          </Marker>
        </MapContainer>
      </div>

      <style>{`
        .zone-pulse { animation: pulse 2s infinite; }
        @keyframes pulse {
          0% { fill-opacity: 0.5; stroke-width: 3; }
          50% { fill-opacity: 0.2; stroke-width: 6; }
          100% { fill-opacity: 0.5; stroke-width: 3; }
        }
        .leaflet-container { background: #0B132B !important; }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: #0B132B !important;
          color: white !important;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
        }
      `}</style>
    </div>
  );
};

export default HotspotMapPage;
