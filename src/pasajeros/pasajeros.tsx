// Pasajeros.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L, { Icon, LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './pasajeros.css';
import menuIcon from '../assets/menu.png';
import personaIcon from '../assets/persona.png';

// Importar las imágenes de los iconos de Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Definir la interfaz Viaje
interface Viaje {
  id: number;
  inicio: string;
  final: string;
  cupos: number;
  hora: string;
  tarifa: number;
  placa: string;
  inicioCoords?: [number, number] | null;
  finalCoords?: [number, number] | null;
}

const Pasajeros = () => {
  const navigate = useNavigate();

  // Estados para los filtros y datos
  const [puntoInicio_pasajeros, setPuntoInicio_pasajeros] = useState('');
  const [puntoFinal_pasajeros, setPuntoFinal_pasajeros] = useState('');
  const [cuposDisponibles_pasajeros, setCuposDisponibles_pasajeros] = useState(2);
  const [horaSalida_pasajeros, setHoraSalida_pasajeros] = useState('');
  const [viajes_pasajeros, setViajes_pasajeros] = useState<Viaje[]>([]);
  const [viajeSeleccionado_pasajeros, setViajeSeleccionado_pasajeros] = useState<Viaje | null>(null);

  // Estados para las coordenadas
  const [inicioCoords, setInicioCoords] = useState<[number, number] | null>(null);
  const [finalCoords, setFinalCoords] = useState<[number, number] | null>(null);

  // Nuevo estado para el punto de recogida
  const [puntoRecogida, setPuntoRecogida] = useState('');
  const [puntoRecogidaCoords, setPuntoRecogidaCoords] = useState<[number, number] | null>(null);

  // Estado para determinar qué input está activo
  const [activeInput, setActiveInput] = useState<'inicio' | 'final' | 'recogida' | null>(null);

  const opcionesCupos_pasajeros = Array.from({ length: 11 }, (_, index) => index);

  // Viajes disponibles (simulación) sin coordenadas
  const todosViajes: Viaje[] = [
    {
      id: 1,
      inicio: 'Titan Plaza',
      final: 'Universidad de La Sabana',
      cupos: 2,
      hora: '09:00',
      tarifa: 6000,
      placa: 'ABC123',
    },
    {
      id: 2,
      inicio: 'Estación Calle 100',
      final: 'Universidad de La Sabana',
      cupos: 3,
      hora: '10:00',
      tarifa: 5500,
      placa: 'XYZ789',
    },
    {
      id: 3,
      inicio: 'Estación Calle 85',
      final: 'Universidad de Los Andes',
      cupos: 2,
      hora: '09:30',
      tarifa: 6500,
      placa: 'JKL456',
    },
  ];

  // Caché para geocodificación
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

  // Función para geocodificar coordenadas inversas
  const reverseGeocodeCoords = async (coords: [number, number]): Promise<string | null> => {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat: coords[0],
          lon: coords[1],
          format: 'json',
        },
      });
      return response.data?.display_name || null;
    } catch (error) {
      console.error('Error reversing coordinates:', error);
      return null;
    }
  };

  // Definir un icono personalizado usando useMemo para optimizar el rendimiento
  const defaultIcon: Icon = useMemo(
    () =>
      new L.Icon({
        iconRetinaUrl: markerIcon2x,
        iconUrl: markerIcon,
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    []
  );

  // Componente para manejar eventos en el mapa y seleccionar puntos de inicio, final o recogida
  const LocationSelector = () => {
    useMapEvents({
      click: async (e: LeafletMouseEvent) => {
        if (!activeInput) return;

        const { lat, lng } = e.latlng;
        const coords: [number, number] = [lat, lng];
        try {
          const address = await reverseGeocodeCoords(coords);
          if (address) {
            if (activeInput === 'inicio') {
              setInicioCoords(coords);
              setPuntoInicio_pasajeros(address);
            } else if (activeInput === 'final') {
              setFinalCoords(coords);
              setPuntoFinal_pasajeros(address);
            } else if (activeInput === 'recogida') {
              setPuntoRecogidaCoords(coords);
              setPuntoRecogida(address);
            }
          }
        } catch (error) {
          console.error('Error reversing coordinates:', error);
        }
      },
    });
    return null;
  };

  // Manejo de cambios en los filtros y activación del input
  const handlePuntoInicioChange_pasajeros = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setActiveInput('inicio');
    const address = e.target.value;
    setPuntoInicio_pasajeros(address);

    if (address) {
      const coords = await geocodeAddress(address);
      setInicioCoords(coords);
    } else {
      setInicioCoords(null);
    }
  };

  const handlePuntoFinalChange_pasajeros = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setActiveInput('final');
    const address = e.target.value;
    setPuntoFinal_pasajeros(address);

    if (address) {
      const coords = await geocodeAddress(address);
      setFinalCoords(coords);
    } else {
      setFinalCoords(null);
    }
  };

  const handlePuntoRecogidaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setActiveInput('recogida');
    const address = e.target.value;
    setPuntoRecogida(address);

    if (address) {
      const coords = await geocodeAddress(address);
      setPuntoRecogidaCoords(coords);
    } else {
      setPuntoRecogidaCoords(null);
    }
  };

  // Función para agregar el punto de recogida
  const handleAgregarPuntoRecogida = () => {
    if (puntoRecogida.trim() === '') {
      alert('Por favor, ingresa un Punto de Recogida.');
      return;
    }
    alert('Punto de Recogida añadido.');
  };

  // Función para mover los marcadores
  const DraggableMarker = ({ coords, setCoords, setAddress }: { coords: [number, number] | null, setCoords: React.Dispatch<React.SetStateAction<[number, number] | null>>, setAddress: React.Dispatch<React.SetStateAction<string>> }) => {
    const markerRef = React.useRef<L.Marker>(null);

    const eventHandlers = {
      dragend: async () => {
        if (markerRef.current) {
          const marker = markerRef.current;
          const newCoords: [number, number] = [marker.getLatLng().lat, marker.getLatLng().lng];
          setCoords(newCoords);
          const newAddress = await reverseGeocodeCoords(newCoords);
          if (newAddress) {
            setAddress(newAddress);
          }
        }
      },
    };

    return coords ? (
      <Marker
        draggable
        eventHandlers={eventHandlers}
        position={coords}
        icon={defaultIcon}
        ref={markerRef}
      >
        <Popup>Mueve el marcador para ajustar la ubicación</Popup>
      </Marker>
    ) : null;
  };

  // Funciones de navegación
  const navigateToMenu = () => {
    navigate('/menu');
  };

  const navigateToPerfil = () => {
    navigate('/perfil');
  };

  // Filtrar viajes
  const handleFiltrarViajes_pasajeros = () => {
    // Filtrar los viajes según los puntos de inicio, final, cupos y hora
    const viajesFiltrados = todosViajes.filter((viaje) => {
      const coincideInicio = puntoInicio_pasajeros ? viaje.inicio.toLowerCase().includes(puntoInicio_pasajeros.toLowerCase()) || puntoInicio_pasajeros.toLowerCase().includes(viaje.inicio.toLowerCase()) : true;
      const coincideFinal = puntoFinal_pasajeros ? viaje.final.toLowerCase().includes(puntoFinal_pasajeros.toLowerCase()) || puntoFinal_pasajeros.toLowerCase().includes(viaje.final.toLowerCase()) : true;
      const coincideCupos = cuposDisponibles_pasajeros ? viaje.cupos >= cuposDisponibles_pasajeros : true;
      const coincideHora = horaSalida_pasajeros ? viaje.hora === horaSalida_pasajeros : true;

      return coincideInicio && coincideFinal && coincideCupos && coincideHora;
    });

    setViajes_pasajeros(viajesFiltrados);
  };

  // Seleccionar un viaje de la lista
  const handleSeleccionarViaje_pasajeros = (viaje: Viaje) => {
    setViajeSeleccionado_pasajeros(viaje);
  };

  // Cerrar el modal de detalles del viaje
  const handleCloseModal = () => {
    setViajeSeleccionado_pasajeros(null);
    setPuntoRecogida('');
  };

  // Función para manejar la reserva
  const handleReservar = () => {
    if (puntoRecogida.trim() === '') {
      alert('Por favor, ingresa un Punto de Recogida para reservar.');
      return;
    }
    alert('Reserva realizada exitosamente.');
    setPuntoRecogida('');
    setViajeSeleccionado_pasajeros(null);
  };

  return (
    <div className="pasajeros-container">
      {/* Encabezado */}
      <header className="header_pasajeros">
        <button className="menu-button_pasajeros" onClick={navigateToMenu} aria-label="Menú">
          <img src={menuIcon} alt="Menú" />
        </button>
        <span className="title_pasajeros">Pasajero</span>
        <div className="persona-button_pasajeros" onClick={navigateToPerfil} role="button">
          <img src={personaIcon} alt="Perfil" />
        </div>
      </header>

      {/* Contenedor principal */}
      <div className="main-content_pasajeros">
        {/* Sección Izquierda */}
        <div className="left-section_pasajeros">
          {/* Filtros */}
          {!viajeSeleccionado_pasajeros && (
            <div className="filters-section_pasajeros">
              <h3>Filtrar viajes disponibles</h3>
              <div className="form-group_pasajeros">
                <label>Punto de inicio</label>
                <input
                  type="text"
                  value={puntoInicio_pasajeros}
                  onChange={handlePuntoInicioChange_pasajeros}
                  placeholder="Punto salida"
                  className="input-field_pasajeros"
                  onFocus={() => setActiveInput('inicio')}
                />
              </div>
              <div className="form-group_pasajeros">
                <label>Punto final</label>
                <input
                  type="text"
                  value={puntoFinal_pasajeros}
                  onChange={handlePuntoFinalChange_pasajeros}
                  placeholder="Punto llegada"
                  className="input-field_pasajeros"
                  onFocus={() => setActiveInput('final')}
                />
              </div>
              <div className="form-row_pasajeros">
                <div className="form-group_pasajeros">
                  <label>Cupos disponibles</label>
                  <select
                    value={cuposDisponibles_pasajeros}
                    onChange={(e) => setCuposDisponibles_pasajeros(parseInt(e.target.value))}
                    className="input-field_pasajeros"
                  >
                    {opcionesCupos_pasajeros.map((opcion) => (
                      <option key={opcion} value={opcion}>
                        {opcion}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group_pasajeros">
                  <label>Hora salida</label>
                  <input
                    type="time"
                    value={horaSalida_pasajeros}
                    onChange={(e) => setHoraSalida_pasajeros(e.target.value)}
                    className="input-field_pasajeros"
                  />
                </div>
              </div>
              <button className="button-primary_pasajeros" onClick={handleFiltrarViajes_pasajeros}>
                Filtrar
              </button>
            </div>
          )}

          {/* Viajes Disponibles */}
          {!viajeSeleccionado_pasajeros && (
            <>
              {viajes_pasajeros.length > 0 ? (
                <div className="viajes-section_pasajeros">
                  <ul className="viajes-list_pasajeros">
                    {viajes_pasajeros.map((viaje) => (
                      <li key={viaje.id} className="viaje-item_pasajeros">
                        <div>
                          <p><strong>Inicio:</strong> {viaje.inicio}</p>
                          <p><strong>Final:</strong> {viaje.final}</p>
                          <p><strong>Hora:</strong> {viaje.hora}</p>
                          <p><strong>Tarifa:</strong> ${viaje.tarifa}</p>
                          <p><strong>Cupos disponibles:</strong> {viaje.cupos}</p>
                          <button
                            className="button-primary_pasajeros"
                            onClick={() => handleSeleccionarViaje_pasajeros(viaje)}
                          >
                            Seleccionar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>No hay viajes disponibles con los filtros seleccionados.</p>
              )}
            </>
          )}

          {/* Modal de detalles dentro de la sección izquierda */}
          {viajeSeleccionado_pasajeros && (
            <div className="modal-overlay_pasajeros" onClick={handleCloseModal}>
              <div className="modal-content_pasajeros" onClick={(e) => e.stopPropagation()}>
                <h3>Detalles del viaje seleccionado</h3>
                <div className="form-row_pasajeros">
                  <div className="form-group_pasajeros">
                    <label>Inicio viaje:</label>
                    <input
                      type="text"
                      value={viajeSeleccionado_pasajeros.inicio}
                      readOnly
                      className="input-highlight_pasajeros"
                    />
                  </div>
                  <div className="form-group_pasajeros">
                    <label>Final viaje:</label>
                    <input
                      type="text"
                      value={viajeSeleccionado_pasajeros.final}
                      readOnly
                      className="input-highlight_pasajeros"
                    />
                  </div>
                </div>
                <div className="form-row_pasajeros">
                  <div className="form-group_pasajeros">
                    <label>Hora inicio:</label>
                    <input
                      type="text"
                      value={viajeSeleccionado_pasajeros.hora}
                      readOnly
                      className="input-highlight_pasajeros"
                    />
                  </div>
                  <div className="form-group_pasajeros">
                    <label>Tarifa:</label>
                    <input
                      type="text"
                      value={`$${viajeSeleccionado_pasajeros.tarifa}`}
                      readOnly
                      className="input-highlight_pasajeros"
                    />
                  </div>
                </div>
                <div className="form-row_pasajeros">
                  <div className="form-group_pasajeros">
                    <label>Cupos disponibles:</label>
                    <input
                      type="text"
                      value={`${viajeSeleccionado_pasajeros.cupos} cupos`}
                      readOnly
                      className="input-highlight_pasajeros"
                    />
                  </div>
                  <div className="form-group_pasajeros">
                    <label>Placa:</label>
                    <input
                      type="text"
                      value={viajeSeleccionado_pasajeros.placa}
                      readOnly
                      className="input-highlight_pasajeros"
                    />
                  </div>
                </div>

                {/* Nuevo input para el Punto de Recogida con botón "Añadir para" */}
                <div className="form-group_pasajeros">
                  <label>Punto de recogida:</label>
                  <input
                    type="text"
                    value={puntoRecogida}
                    onChange={handlePuntoRecogidaChange}
                    placeholder="Ingresa el punto de recogida"
                    className="input-field_pasajeros"
                    onFocus={() => setActiveInput('recogida')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAgregarPuntoRecogida();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAgregarPuntoRecogida}
                    className="button-add_pasajeros"
                  >
                    Añadir parada
                  </button>
                </div>

                <div className="button-container_pasajeros">
                  <button className="button-primary_pasajeros" onClick={handleReservar}>
                    Reservar
                  </button>
                  <button className="button-secondary_pasajeros" onClick={handleCloseModal}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sección Derecha (Mapa) */}
        <div className="right-section_pasajeros">
          <MapContainer
            center={[4.711, -74.0721]}
            zoom={12}
            className="map_pasajeros"
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {/* Component to handle selecting location on the map */}
            <LocationSelector />

            {/* Marcadores según el estado */}
            <DraggableMarker coords={inicioCoords} setCoords={setInicioCoords} setAddress={setPuntoInicio_pasajeros} />
            <DraggableMarker coords={finalCoords} setCoords={setFinalCoords} setAddress={setPuntoFinal_pasajeros} />
            <DraggableMarker coords={puntoRecogidaCoords} setCoords={setPuntoRecogidaCoords} setAddress={setPuntoRecogida} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default Pasajeros;
