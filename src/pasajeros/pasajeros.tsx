import React, { useState, useMemo, useEffect } from 'react';
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
  fecha: string; // Nuevo campo para la fecha
  tarifa: number;
  placa: string;
  inicioCoords?: [number, number] | null;
  finalCoords?: [number, number] | null;
  recogidaCoords?: [number, number] | null;
}

const Pasajeros = () => {
  const navigate = useNavigate();

  // Estados para los filtros y datos
  const [puntoInicio_pasajeros, setPuntoInicio_pasajeros] = useState('');
  const [puntoFinal_pasajeros, setPuntoFinal_pasajeros] = useState('');
  const [cuposDisponibles_pasajeros, setCuposDisponibles_pasajeros] = useState(2);
  const [horaSalida_pasajeros, setHoraSalida_pasajeros] = useState('');
  const [fechaSalida_pasajeros, setFechaSalida_pasajeros] = useState(''); // Nuevo estado para la fecha
  const [viajes_pasajeros, setViajes_pasajeros] = useState<Viaje[]>([]);
  const [viajeSeleccionado_pasajeros, setViajeSeleccionado_pasajeros] = useState<Viaje | null>(null);

  // Estados para las coordenadas
  const [inicioCoords, setInicioCoords] = useState<[number, number] | null>(null);
  const [finalCoords, setFinalCoords] = useState<[number, number] | null>(null);
  const [recogidaCoords, setRecogidaCoords] = useState<[number, number] | null>(null);

  // Nuevo estado para el punto de recogida
  const [puntoRecogida, setPuntoRecogida] = useState('');
  const [puntoRecogidaInput, setPuntoRecogidaInput] = useState('');

  // Estado para determinar qué input está activo
  const [activeInput, setActiveInput] = useState<'inicio' | 'final' | 'recogida' | null>(null);

  const opcionesCupos_pasajeros = Array.from({ length: 11 }, (_, index) => index);

  // Viajes disponibles (simulación) con coordenadas y fechas
  const todosViajes: Viaje[] = [
    {
      id: 1,
      inicio: 'Titan Plaza',
      final: 'Universidad de La Sabana',
      cupos: 2,
      hora: '09:00',
      fecha: '2024-11-15',
      tarifa: 6000,
      placa: 'ABC123',
    },
    {
      id: 2,
      inicio: 'Estación Calle 100',
      final: 'Universidad de La Sabana',
      cupos: 3,
      hora: '10:00',
      fecha: '2024-11-16',
      tarifa: 5500,
      placa: 'XYZ789',
    },
    {
      id: 3,
      inicio: 'Estación Calle 85',
      final: 'Universidad de Los Andes',
      cupos: 2,
      hora: '09:30',
      fecha: '2024-11-15',
      tarifa: 6500,
      placa: 'JKL456',
    },
  ];

  // Caché para geocodificación
  const geocodeCache = useMemo(() => new Map<string, [number, number]>(), []);

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

  // Definir un icono predeterminado usando useMemo para optimizar el rendimiento
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

  // Definir íconos personalizados para inicio, final y parada utilizando SVG data URLs
  const inicioIcon: Icon = useMemo(() => {
    const svg = encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='25' height='41' viewBox='0 0 25 41'>
        <path fill='#2E8B57' d='M12.5 0C5.6 0 0 5.6 0 12.5c0 11.3 12.5 29.5 12.5 29.5S25 23.8 25 12.5C25 5.6 19.4 0 12.5 0zm0 18.8a6.3 6.3 0 1 1 0-12.6 6.3 6.3 0 0 1 0 12.6z'/>
      </svg>
    `);
    return new L.Icon({
      iconUrl: `data:image/svg+xml;charset=UTF-8,${svg}`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: markerShadow,
      shadowSize: [41, 41],
    });
  }, []);

  const finalIcon: Icon = useMemo(() => {
    const svg = encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='25' height='41' viewBox='0 0 25 41'>
        <path fill='#DC143C' d='M12.5 0C5.6 0 0 5.6 0 12.5c0 11.3 12.5 29.5 12.5 29.5S25 23.8 25 12.5C25 5.6 19.4 0 12.5 0zm0 18.8a6.3 6.3 0 1 1 0-12.6 6.3 6.3 0 0 1 0 12.6z'/>
      </svg>
    `);
    return new L.Icon({
      iconUrl: `data:image/svg+xml;charset=UTF-8,${svg}`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: markerShadow,
      shadowSize: [41, 41],
    });
  }, []);

  const paradaIcon: Icon = useMemo(() => {
    const svg = encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='25' height='41' viewBox='0 0 25 41'>
        <path fill='#1E90FF' d='M12.5 0C5.6 0 0 5.6 0 12.5c0 11.3 12.5 29.5 12.5 29.5S25 23.8 25 12.5C25 5.6 19.4 0 12.5 0zm0 18.8a6.3 6.3 0 1 1 0-12.6 6.3 6.3 0 0 1 0 12.6z'/>
      </svg>
    `);
    return new L.Icon({
      iconUrl: `data:image/svg+xml;charset=UTF-8,${svg}`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: markerShadow,
      shadowSize: [41, 41],
    });
  }, []);

  // Definir icono morado para indicar selección activa
  const activeIcon: Icon = useMemo(() => {
    const svg = encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='25' height='41' viewBox='0 0 25 41'>
        <path fill='#800080' d='M12.5 0C5.6 0 0 5.6 0 12.5c0 11.3 12.5 29.5 12.5 29.5S25 23.8 25 12.5C25 5.6 19.4 0 12.5 0zm0 18.8a6.3 6.3 0 1 1 0-12.6 6.3 6.3 0 0 1 0 12.6z'/>
      </svg>
    `);
    return new L.Icon({
      iconUrl: `data:image/svg+xml;charset=UTF-8,${svg}`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: markerShadow,
      shadowSize: [41, 41],
    });
  }, []);

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
              setRecogidaCoords(coords);
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
    const address = e.target.value;
    setPuntoRecogidaInput(address);

    if (address) {
      const coords = await geocodeAddress(address);
      setRecogidaCoords(coords);
    } else {
      setRecogidaCoords(null);
    }
  };

  // Función para agregar el punto de recogida
  const handleAgregarPuntoRecogida = () => {
    if (puntoRecogidaInput.trim() === '') {
      alert('Por favor, ingresa un Punto de Recogida.');
      return;
    }
    setPuntoRecogida(puntoRecogidaInput);
    setPuntoRecogidaInput('');
    alert('Punto de Recogida añadido.');
  };

  // Función para mover los marcadores
  const DraggableMarker = ({
    coords,
    setCoords,
    setAddress,
    type,
  }: {
    coords: [number, number] | null;
    setCoords: React.Dispatch<React.SetStateAction<[number, number] | null>>;
    setAddress: React.Dispatch<React.SetStateAction<string>>;
    type: 'inicio' | 'final' | 'recogida';
  }) => {
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

    // Determinar el icono según el tipo
    const icon = useMemo(() => {
      if (type === 'inicio') {
        return activeInput === 'inicio' ? activeIcon : inicioIcon;
      } else if (type === 'final') {
        return activeInput === 'final' ? activeIcon : finalIcon;
      } else {
        return activeInput === 'recogida' ? activeIcon : paradaIcon;
      }
    }, [activeInput, type, activeIcon, inicioIcon, finalIcon, paradaIcon]);

    return coords ? (
      <Marker draggable eventHandlers={eventHandlers} position={coords} icon={icon} ref={markerRef}>
        <Popup>Mueve el marcador para ajustar la ubicación</Popup>
      </Marker>
    ) : null;
  };

  // Función para mostrar marcadores no movibles
  const StaticMarker = ({
    coords,
    label,
    icon,
  }: {
    coords: [number, number];
    label: string;
    icon: Icon;
  }) => (
    <Marker position={coords} icon={icon}>
      <Popup>{label}</Popup>
    </Marker>
  );

  // Funciones de navegación
  const navigateToMenu = () => {
    navigate('/menu');
  };

  const navigateToPerfil = () => {
    navigate('/perfil');
  };

  // Función de filtrado
  const filterViajes = () => {
    const viajesFiltrados = todosViajes.filter((viaje) => {
      const coincideInicio = puntoInicio_pasajeros
        ? viaje.inicio.toLowerCase().includes(puntoInicio_pasajeros.toLowerCase()) ||
          puntoInicio_pasajeros.toLowerCase().includes(viaje.inicio.toLowerCase())
        : true;
      const coincideFinal = puntoFinal_pasajeros
        ? viaje.final.toLowerCase().includes(puntoFinal_pasajeros.toLowerCase()) ||
          puntoFinal_pasajeros.toLowerCase().includes(viaje.final.toLowerCase())
        : true;
      const coincideCupos = cuposDisponibles_pasajeros ? viaje.cupos >= cuposDisponibles_pasajeros : true;
      const coincideHora = horaSalida_pasajeros ? viaje.hora === horaSalida_pasajeros : true;
      const coincideFecha = fechaSalida_pasajeros ? viaje.fecha === fechaSalida_pasajeros : true;

      return coincideInicio && coincideFinal && coincideCupos && coincideHora && coincideFecha;
    });

    setViajes_pasajeros(viajesFiltrados);
  };

  // useEffect para filtrar automáticamente cuando cambien los filtros
  useEffect(() => {
    filterViajes();
  }, [puntoInicio_pasajeros, puntoFinal_pasajeros, cuposDisponibles_pasajeros, horaSalida_pasajeros, fechaSalida_pasajeros]);

  // Inicializar viajes_pasajeros con todos los viajes al montar el componente
  useEffect(() => {
    setViajes_pasajeros(todosViajes);
  }, []);

  // Seleccionar un viaje de la lista
  const handleSeleccionarViaje_pasajeros = async (viaje: Viaje) => {
    setViajeSeleccionado_pasajeros(viaje);
    // Limpiar las coordenadas de los filtros para que no se muestren en el mapa
    setInicioCoords(null);
    setFinalCoords(null);
    setPuntoRecogida('');
    setRecogidaCoords(null);

    // Geocodificar las direcciones de inicio y final del viaje seleccionado
    const inicio = await geocodeAddress(viaje.inicio);
    const final = await geocodeAddress(viaje.final);
    setInicioCoords(inicio);
    setFinalCoords(final);
  };

  // Cerrar el modal de detalles del viaje
  const handleCloseModal = () => {
    setViajeSeleccionado_pasajeros(null);
    setPuntoRecogida('');
    setRecogidaCoords(null);
  };

  // Función para manejar la reserva
  const handleReservar = () => {
    if (puntoRecogida.trim() === '') {
      alert('Por favor, ingresa un Punto de Recogida para reservar.');
      return;
    }
    alert('Reserva realizada exitosamente.');
    setPuntoRecogida('');
    setRecogidaCoords(null);
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
                <div className="input-container_pasajeros">
                  <span
                    className={`input-icon_pasajeros ${activeInput === 'inicio' ? 'active' : ''}`}
                    onClick={() => setActiveInput(activeInput === 'inicio' ? null : 'inicio')}
                  ></span>
                  <input
                    type="text"
                    value={puntoInicio_pasajeros}
                    onChange={handlePuntoInicioChange_pasajeros}
                    placeholder="Punto salida"
                    className="input-field_pasajeros"
                    onFocus={() => setActiveInput('inicio')}
                  />
                </div>
              </div>
              <div className="form-group_pasajeros">
                <label>Punto final</label>
                <div className="input-container_pasajeros">
                  <span
                    className={`input-icon_pasajeros ${activeInput === 'final' ? 'active' : ''}`}
                    onClick={() => setActiveInput(activeInput === 'final' ? null : 'final')}
                  ></span>
                  <input
                    type="text"
                    value={puntoFinal_pasajeros}
                    onChange={handlePuntoFinalChange_pasajeros}
                    placeholder="Punto llegada"
                    className="input-field_pasajeros"
                    onFocus={() => setActiveInput('final')}
                  />
                </div>
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
                <div className="form-group_pasajeros">
                  <label>Fecha salida</label>
                  <input
                    type="date"
                    value={fechaSalida_pasajeros}
                    onChange={(e) => setFechaSalida_pasajeros(e.target.value)}
                    className="input-field_pasajeros"
                  />
                </div>
              </div>
              {/* Botón "Filtrar" eliminado */}
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
                          <p>
                            <strong>Inicio:</strong> {viaje.inicio}
                          </p>
                          <p>
                            <strong>Final:</strong> {viaje.final}
                          </p>
                          <p>
                            <strong>Hora:</strong> {viaje.hora}
                          </p>
                          <p>
                            <strong>Fecha:</strong> {viaje.fecha}
                          </p>
                          <p>
                            <strong>Tarifa:</strong> ${viaje.tarifa}
                          </p>
                          <p>
                            <strong>Cupos disponibles:</strong> {viaje.cupos}
                          </p>
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
                    <div className="input-container_pasajeros">
                      <span className={`input-icon_pasajeros ${'inicio'}`}></span>
                      <input
                        type="text"
                        value={viajeSeleccionado_pasajeros.inicio}
                        readOnly
                        className="input-highlight_pasajeros"
                      />
                    </div>
                  </div>
                  <div className="form-group_pasajeros">
                    <label>Final viaje:</label>
                    <div className="input-container_pasajeros">
                      <span className={`input-icon_pasajeros ${'final'}`}></span>
                      <input
                        type="text"
                        value={viajeSeleccionado_pasajeros.final}
                        readOnly
                        className="input-highlight_pasajeros"
                      />
                    </div>
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
                    <label>Fecha salida:</label>
                    <input
                      type="text"
                      value={viajeSeleccionado_pasajeros.fecha}
                      readOnly
                      className="input-highlight_pasajeros"
                    />
                  </div>
                </div>
                <div className="form-row_pasajeros">
                  <div className="form-group_pasajeros">
                    <label>Tarifa:</label>
                    <input
                      type="text"
                      value={`$${viajeSeleccionado_pasajeros.tarifa}`}
                      readOnly
                      className="input-highlight_pasajeros"
                    />
                  </div>
                  <div className="form-group_pasajeros">
                    <label>Cupos disponibles:</label>
                    <input
                      type="text"
                      value={`${viajeSeleccionado_pasajeros.cupos} cupos`}
                      readOnly
                      className="input-highlight_pasajeros"
                    />
                  </div>
                </div>
                <div className="form-row_pasajeros">
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

                {/* Nuevo input para el Punto de Recogida con botón "Añadir parada" */}
                <div className="form-group_pasajeros">
                  <label>Punto de recogida:</label>
                  <div className="input-container_pasajeros">
                    <span
                      className={`input-icon_pasajeros ${activeInput === 'recogida' ? 'active' : ''}`}
                      onClick={() => setActiveInput(activeInput === 'recogida' ? null : 'recogida')}
                    ></span>
                    <input
                      type="text"
                      value={puntoRecogidaInput}
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
                  </div>
                  <button type="button" onClick={handleAgregarPuntoRecogida} className="button-add_pasajeros">
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
              attribution="&copy; OpenStreetMap contributors"
            />

            {/* Componente para manejar la selección de ubicación en el mapa */}
            <LocationSelector />

            {/* Marcadores según el estado */}
            {viajeSeleccionado_pasajeros ? (
              <>
                {inicioCoords && (
                  <StaticMarker coords={inicioCoords} label="Inicio del viaje" icon={activeInput === 'inicio' ? activeIcon : inicioIcon} />
                )}
                {finalCoords && (
                  <StaticMarker coords={finalCoords} label="Final del viaje" icon={activeInput === 'final' ? activeIcon : finalIcon} />
                )}
                {recogidaCoords && (
                  <StaticMarker coords={recogidaCoords} label="Parada de recogida" icon={activeInput === 'recogida' ? activeIcon : paradaIcon} />
                )}
              </>
            ) : (
              <>
                <DraggableMarker
                  coords={inicioCoords}
                  setCoords={setInicioCoords}
                  setAddress={setPuntoInicio_pasajeros}
                  type="inicio"
                />
                <DraggableMarker
                  coords={finalCoords}
                  setCoords={setFinalCoords}
                  setAddress={setPuntoFinal_pasajeros}
                  type="final"
                />
                <DraggableMarker
                  coords={recogidaCoords}
                  setCoords={setRecogidaCoords}
                  setAddress={setPuntoRecogida}
                  type="recogida"
                />
              </>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default Pasajeros;