import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L, { LatLng, Icon } from 'leaflet';
import axios from 'axios';
import './añadir_viaje.css';
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
  const [startPoint, setStartPoint] = useState<LatLng | null>(null);
  const [endPoint, setEndPoint] = useState<LatLng | null>(null);
  const [formData, setFormData] = useState({
    puntoInicio: '',
    puntoFinal: '',
    fechaSalida: '', // Nueva propiedad para la fecha de salida
    horaSalida: '',
    cuposDisponibles: '',
    tarifaPorPasajero: '',
    ruta: '',
    placa: '',
  });

  const geocodeCache = new Map<string, [number, number]>();
  const reverseGeocodeCache = new Map<string, string>();

  // Función para geocodificar una dirección (nombre de lugar a coordenadas)
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

  // Función para obtener el nombre del lugar a partir de coordenadas
  const reverseGeocode = async (coords: LatLng): Promise<string> => {
    const cacheKey = `${coords.lat},${coords.lng}`;
    if (reverseGeocodeCache.has(cacheKey)) {
      return reverseGeocodeCache.get(cacheKey)!;
    }
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat: coords.lat,
          lon: coords.lng,
          format: 'json',
        },
      });

      if (response.data && response.data.display_name) {
        const locationName = response.data.display_name;
        reverseGeocodeCache.set(cacheKey, locationName);
        return locationName;
      } else {
        return 'Ubicación desconocida';
      }
    } catch (error) {
      console.error('Error en geocodificación inversa:', error);
      return 'Ubicación desconocida';
    }
  };

  // Manejo de cambios en el campo de punto de inicio
  const handlePuntoInicioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setFormData({ ...formData, puntoInicio: address });
    const coords = await geocodeAddress(address);
    if (coords) {
      const [lat, lon] = coords;
      setStartPoint(new L.LatLng(lat, lon));
    } else {
      setStartPoint(null);
    }
  };

  // Manejo de cambios en el campo de punto final
  const handlePuntoFinalChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setFormData({ ...formData, puntoFinal: address });
    const coords = await geocodeAddress(address);
    if (coords) {
      const [lat, lon] = coords;
      setEndPoint(new L.LatLng(lat, lon));
    } else {
      setEndPoint(null);
    }
  };

  // Obtener la fecha actual en formato YYYY-MM-DD
  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Los meses en JavaScript van de 0 a 11
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Manejo de cambios en el campo de fecha de salida
  const handleFechaSalidaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fecha = e.target.value;
    setFormData({ ...formData, fechaSalida: fecha });
  };

  // Componente de eventos del mapa
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        if (!startPoint) {
          setStartPoint(e.latlng);
          updateStartLocation(e.latlng);
        } else if (!endPoint) {
          setEndPoint(e.latlng);
          updateEndLocation(e.latlng);
        }
      },
    });
    return null;
  };

  // Actualiza el punto de inicio con el nombre del lugar
  const updateStartLocation = async (coords: LatLng) => {
    const locationName = await reverseGeocode(coords);
    setFormData({ ...formData, puntoInicio: locationName });
  };

  // Actualiza el punto final con el nombre del lugar
  const updateEndLocation = async (coords: LatLng) => {
    const locationName = await reverseGeocode(coords);
    setFormData({ ...formData, puntoFinal: locationName });
  };

  // Función para actualizar el punto de inicio al mover el marcador
  const handleStartPointDrag = async (e: L.DragEndEvent) => {
    const marker = e.target as L.Marker;
    const position = marker.getLatLng();
    setStartPoint(position);
    updateStartLocation(position);
  };

  // Función para actualizar el punto final al mover el marcador
  const handleEndPointDrag = async (e: L.DragEndEvent) => {
    const marker = e.target as L.Marker;
    const position = marker.getLatLng();
    setEndPoint(position);
    updateEndLocation(position);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formulario enviado:', formData);
    // Aquí puedes agregar la lógica para enviar los datos al backend
    setFormData({
      puntoInicio: '',
      puntoFinal: '',
      fechaSalida: '', // Reiniciar la fecha de salida
      horaSalida: '',
      cuposDisponibles: '',
      tarifaPorPasajero: '',
      ruta: '',
      placa: '',
    });
    setStartPoint(null);
    setEndPoint(null);
  };

  // Obtener la fecha actual para establecer el mínimo en el calendario
  const today = getTodayDate();

  return (
    <div className="añadir_viaje">
      <header className="header-añadir">
        <button className="añadir_viaje_back-button" onClick={() => navigate('/menu')} aria-label="Volver">
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
            <MapEvents />
            {startPoint && (
              <Marker
                position={startPoint}
                icon={defaultIcon}
                draggable={true}
                eventHandlers={{
                  dragend: handleStartPointDrag,
                }}
              >
                <Popup>Punto de inicio</Popup>
              </Marker>
            )}
            {endPoint && (
              <Marker
                position={endPoint}
                icon={defaultIcon}
                draggable={true}
                eventHandlers={{
                  dragend: handleEndPointDrag,
                }}
              >
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
            {/* Nuevo Input para Fecha de Salida con atributo min */}
            <input
              type="date"
              name="fechaSalida"
              value={formData.fechaSalida}
              onChange={handleFechaSalidaChange}
              placeholder="Fecha de salida"
              className="inputs-añadir letrainpitstitulo_añadir"
              required
              min={today} // Establecer la fecha mínima como hoy
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
