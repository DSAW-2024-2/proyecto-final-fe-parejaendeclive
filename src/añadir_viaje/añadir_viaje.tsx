import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { LatLngExpression, Icon } from 'leaflet';
import axios from 'axios';
import './añadir_viaje.css';
import ubicacionIcon from '../assets/ubicacion.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useNavigate } from 'react-router-dom';

const defaultIcon: Icon = new L.Icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const AñadirViaje: React.FC = () => {
  const navigate = useNavigate();
  const [startPoint, setStartPoint] = useState<LatLngExpression | null>(null);
  const [endPoint, setEndPoint] = useState<LatLngExpression | null>(null);
  const [formData, setFormData] = useState({
    puntoInicio: '',
    puntoFinal: '',
    horaSalida: '',
    cuposDisponibles: '',
    tarifaPorPasajero: '',
    ruta: '',
    placa: '',
  });

  const geocodeCache = new Map<string, [number, number]>();

  // Función para geocodificar una dirección con caché
  const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    if (geocodeCache.has(address)) {
      return geocodeCache.get(address)!;
    }
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          addressdetails: 1,
          limit: 1,
        },
      });
      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        const coords: [number, number] = [parseFloat(lat), parseFloat(lon)];
        geocodeCache.set(address, coords);
        return coords;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  };

  // Manejo de cambios en el campo de punto de inicio
  const handlePuntoInicioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setFormData({ ...formData, puntoInicio: address });

    if (address) {
      const coords = await geocodeAddress(address);
      setStartPoint(coords);
    } else {
      setStartPoint(null);
    }
  };

  // Manejo de cambios en el campo de punto final
  const handlePuntoFinalChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setFormData({ ...formData, puntoFinal: address });

    if (address) {
      const coords = await geocodeAddress(address);
      setEndPoint(coords);
    } else {
      setEndPoint(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formulario enviado:', formData);
    setFormData({
      puntoInicio: '',
      puntoFinal: '',
      horaSalida: '',
      cuposDisponibles: '',
      tarifaPorPasajero: '',
      ruta: '',
      placa: '',
    });
    setStartPoint(null);
    setEndPoint(null);
  };

  return (
    <div className="añadir_viaje">
      <header className="header-añadir">
        <button className="añadir_viaje_back-button" onClick={() => navigate('/menu')}>
          ←
        </button>
        <h1 className="letra-header-añadir">Añadir Viaje</h1>
      </header>
      <div className="añadir_viaje_content">
        <div className="añadir_viaje_left-section">
          <MapContainer center={[4.7110, -74.0721]} zoom={12} className="añadir_viaje_map-container">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {startPoint && (
              <Marker position={startPoint} icon={defaultIcon}>
                <Popup>Punto de inicio</Popup>
              </Marker>
            )}
            {endPoint && (
              <Marker position={endPoint} icon={defaultIcon}>
                <Popup>Punto final</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
        <div className="añadir_viaje_right-section">
          <form onSubmit={handleSubmit} className="añadir_viaje_trip-form">
            <input
              type="text"
              name="puntoInicio"
              value={formData.puntoInicio}
              onChange={handlePuntoInicioChange}
              placeholder="Punto de inicio"
              className="inputs-añadir letrainpitstitulo_añadir"
              required
            />
            <input
              type="text"
              name="puntoFinal"
              value={formData.puntoFinal}
              onChange={handlePuntoFinalChange}
              placeholder="Punto final"
              className="inputs-añadir letrainpitstitulo_añadir"
              required
            />
            <input
              type="time"
              name="horaSalida"
              value={formData.horaSalida}
              onChange={(e) => setFormData({ ...formData, horaSalida: e.target.value })}
              placeholder="Hora de salida"
              className="inputs-añadir letrainpitstitulo_añadir"
              required
            />
            <input
              type="number"
              name="cuposDisponibles"
              value={formData.cuposDisponibles}
              onChange={(e) => setFormData({ ...formData, cuposDisponibles: e.target.value })}
              placeholder="Cupos disponibles"
              className="inputs-añadir letrainpitstitulo_añadir"
              min="1"
              required
            />
            <input
              type="number"
              name="tarifaPorPasajero"
              value={formData.tarifaPorPasajero}
              onChange={(e) => setFormData({ ...formData, tarifaPorPasajero: e.target.value })}
              placeholder="Tarifa por pasajero"
              className="inputs-añadir letrainpitstitulo_añadir"
              min="0"
              step="0.01"
              required
            />
            <textarea
              name="ruta"
              value={formData.ruta}
              onChange={(e) => setFormData({ ...formData, ruta: e.target.value })}
              placeholder="Ruta"
              className="inputs-añadir letrainpitstitulo_añadir"
              required
            />
            <input
              type="text"
              name="placa"
              value={formData.placa}
              onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
              placeholder="Placa"
              className="inputs-añadir letrainpitstitulo_añadir"
              required
            />
            <button type="submit" className="añadir_viaje_submit-button">Añadir viaje</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AñadirViaje;