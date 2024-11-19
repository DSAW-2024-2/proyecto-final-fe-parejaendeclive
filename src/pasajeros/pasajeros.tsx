// src/pasajeros/Pasajeros.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L, { Icon, LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './pasajeros.css';
import menuIcon from '../assets/menu.png';
import personaIcon from '../assets/persona.png';

import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Definir la interfaz Viaje
interface Viaje {
  id: string;
  startTrip: string;
  endTrip: string;
  availablePlaces: number;
  timeTrip: string;
  date: string; // Nuevo campo para la fecha
  priceTrip: number;
  carID: string;
  number: string; // Nuevo campo para el teléfono
  route: string; // Nuevo campo para la ruta
  stops?: string[] | null;
  reservedBy?: string[] | null;
  status?: string;
  startCoords?: [number, number] | null;
  endCoords?: [number, number] | null;
  pickupCoords?: [number, number] | null;
}

// Definir la interfaz de la respuesta de la API
interface TripsResponse {
  message: string;
  trips: Viaje[];
}

const Pasajeros: React.FC = () => {
  const navigate = useNavigate();

  // Estados para los filtros y datos
  const [puntoStart, setPuntoStart] = useState('');
  const [puntoEnd, setPuntoEnd] = useState('');
  const [availablePlaces_pasajeros, setAvailablePlaces_pasajeros] = useState(2);
  const [timeTrip_pasajeros, setTimeTrip_pasajeros] = useState('');
  const [date_pasajeros, setDate_pasajeros] = useState(''); // Nuevo estado para la fecha
  const [todosViajes, setTodosViajes] = useState<Viaje[]>([]); // Nuevo estado para todos los viajes
  const [viajes_pasajeros, setViajes_pasajeros] = useState<Viaje[]>([]);
  const [viajeSeleccionado_pasajeros, setViajeSeleccionado_pasajeros] = useState<Viaje | null>(null);

  // Estados para las coordenadas
  const [startCoords, setStartCoords] = useState<[number, number] | null>(null);
  const [endCoords, setEndCoords] = useState<[number, number] | null>(null);

  // Nuevo estado para los puntos de recogida y sus coordenadas
  const [pickupInputs, setPickupInputs] = useState<string[]>([]);
  const [pickupCoordsArray, setPickupCoordsArray] = useState<Array<[number, number] | null>>([]);

  // Estado para determinar qué input está activo
  const [activeInput, setActiveInput] = useState<{ type: 'start' | 'end' | 'pickup'; index?: number } | null>(
    null
  );

  // Nuevo estado para la cantidad de availablePlaces a reservar
  const [placesToReserve, setPlacesToReserve] = useState(1);

  // Estados para carga y error
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const opcionesPlaces_pasajeros = Array.from({ length: 11 }, (_, index) => index);

  // Obtener la URL de la API desde el .env
  const apiUrl = import.meta.env.VITE_API_URL;

  // Obtener el token de localStorage
  const token = localStorage.getItem('token');

  // Configurar Axios con el token de autenticación
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      withCredentials: true,
    });
    return instance;
  }, [apiUrl, token]);

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

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
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

  // Definir íconos personalizados para start, end y pickup utilizando SVG data URLs
  const startIcon: Icon = useMemo(() => {
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

  const endIcon: Icon = useMemo(() => {
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

  const pickupIcon: Icon = useMemo(() => {
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

  // Componente para manejar eventos en el mapa y seleccionar puntos de start, end o pickup
  const LocationSelector: React.FC = () => {
    useMapEvents({
      click: async (e: LeafletMouseEvent) => {
        if (!activeInput) return;

        const { lat, lng } = e.latlng;
        const coords: [number, number] = [lat, lng];
        try {
          const address = await reverseGeocodeCoords(coords);
          if (address) {
            if (activeInput.type === 'start') {
              setStartCoords(coords);
              setPuntoStart(address);
            } else if (activeInput.type === 'end') {
              setEndCoords(coords);
              setPuntoEnd(address);
            } else if (activeInput.type === 'pickup' && activeInput.index !== undefined) {
              const updatedCoordsArray = [...pickupCoordsArray];
              updatedCoordsArray[activeInput.index] = coords;
              setPickupCoordsArray(updatedCoordsArray);

              const updatedInputs = [...pickupInputs];
              updatedInputs[activeInput.index] = address;
              setPickupInputs(updatedInputs);
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
  const handlePuntoStartChange_pasajeros = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setPuntoStart(address);

    if (address) {
      const coords = await geocodeAddress(address);
      setStartCoords(coords);
    } else {
      setStartCoords(null);
    }
  };

  const handlePuntoEndChange_pasajeros = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setPuntoEnd(address);

    if (address) {
      const coords = await geocodeAddress(address);
      setEndCoords(coords);
    } else {
      setEndCoords(null);
    }
  };

  // Función para manejar cambios en los inputs de puntos de recogida
  const handlePickupChange = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const address = e.target.value;
    const updatedInputs = [...pickupInputs];
    updatedInputs[index] = address;
    setPickupInputs(updatedInputs);

    if (address) {
      const coords = await geocodeAddress(address);
      const updatedCoordsArray = [...pickupCoordsArray];
      updatedCoordsArray[index] = coords;
      setPickupCoordsArray(updatedCoordsArray);
    } else {
      const updatedCoordsArray = [...pickupCoordsArray];
      updatedCoordsArray[index] = null;
      setPickupCoordsArray(updatedCoordsArray);
    }
  };

  // Función para mover los marcadores
  const DraggableMarker: React.FC<{
    coords: [number, number] | null;
    setCoords: (coords: [number, number] | null) => void;
    setAddress: (address: string) => void;
    type: 'start' | 'end' | 'pickup';
    index?: number;
  }> = ({ coords, setCoords, setAddress, type, index }) => {
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
      if (type === 'start') {
        return activeInput?.type === 'start' ? activeIcon : startIcon;
      } else if (type === 'end') {
        return activeInput?.type === 'end' ? activeIcon : endIcon;
      } else {
        return activeInput?.type === 'pickup' && activeInput.index === index
          ? activeIcon
          : pickupIcon;
      }
    }, [activeInput, type, index, activeIcon, startIcon, endIcon, pickupIcon]);

    return coords ? (
      <Marker
        draggable
        eventHandlers={eventHandlers}
        position={coords}
        icon={icon}
        ref={markerRef}
      >
        <Popup>Mueve el marcador para ajustar la ubicación</Popup>
      </Marker>
    ) : null;
  };

  // Función para mostrar marcadores no movibles
  const StaticMarker: React.FC<{
    coords: [number, number];
    label: string;
    icon: Icon;
  }> = ({ coords, label, icon }) => (
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
    if (!Array.isArray(todosViajes)) {
      console.error('todosViajes no es un array:', todosViajes);
      setError('Error interno de la aplicación.');
      setViajes_pasajeros([]);
      return;
    }

    // Obtener la fecha actual en formato 'YYYY-MM-DD'
    const todayStr = new Date().toISOString().split('T')[0];

    const viajesFiltrados = todosViajes.filter((viaje) => {
      const coincideStart = puntoStart
        ? viaje.startTrip.toLowerCase().includes(puntoStart.toLowerCase()) ||
          puntoStart.toLowerCase().includes(viaje.startTrip.toLowerCase())
        : true;
      const coincideEnd = puntoEnd
        ? viaje.endTrip.toLowerCase().includes(puntoEnd.toLowerCase()) ||
          puntoEnd.toLowerCase().includes(viaje.endTrip.toLowerCase())
        : true;
      const coincidePlaces = availablePlaces_pasajeros
        ? viaje.availablePlaces >= availablePlaces_pasajeros
        : true;
      const coincideTime = timeTrip_pasajeros ? viaje.timeTrip === timeTrip_pasajeros : true;
      const coincideDate = date_pasajeros ? viaje.date === date_pasajeros : true;

      // Nueva condición para excluir viajes pasados
      const notInPast = viaje.date >= todayStr;

      return coincideStart && coincideEnd && coincidePlaces && coincideTime && coincideDate && notInPast;
    });

    setViajes_pasajeros(viajesFiltrados);
  };

  // useEffect para filtrar automáticamente cuando cambien los filtros
  useEffect(() => {
    filterViajes();
  }, [puntoStart, puntoEnd, availablePlaces_pasajeros, timeTrip_pasajeros, date_pasajeros, todosViajes]);

  // useEffect para obtener los viajes desde la API al montar el componente
  useEffect(() => {
    const fetchViajes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get<TripsResponse>('/trips'); // Endpoint correcto

        console.log('Respuesta de la API:', response.data); // Verificar la respuesta

        if (Array.isArray(response.data.trips)) {
          setTodosViajes(response.data.trips);
          setViajes_pasajeros(response.data.trips);
        } else {
          console.error('Respuesta inesperada de la API:', response.data);
          setError('Formato de datos inesperado recibido desde el servidor.');
          setTodosViajes([]);
          setViajes_pasajeros([]);
        }
      } catch (err) {
        console.error('Error fetching viajes:', err);
        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError;
          if (axiosError.response) {
            if (axiosError.response.status === 401) {
              setError('No autorizado. Por favor, inicia sesión nuevamente.');
              navigate('/login');
            } else {
              setError('no hay viajes disponibles por el momento');
            }
          } else if (axiosError.request) {
            setError('No se recibió respuesta del servidor. Por favor, intenta de nuevo más tarde.');
          } else {
            setError('Error al configurar la solicitud. Por favor, intenta de nuevo.');
          }
        } else {
          setError('Ocurrió un error desconocido. Por favor, intenta de nuevo.');
        }
      } finally {
        setLoading(false);
      }
    };

    // Verificar si el token está presente antes de intentar la solicitud
    if (token) {
      fetchViajes();
    } else {
      setError('No estás autenticado. Por favor, inicia sesión.');
      navigate('/login');
    }
  }, [axiosInstance, navigate, token]);

  // Seleccionar un viaje de la lista
  const handleSeleccionarViaje_pasajeros = async (viaje: Viaje) => {
    setViajeSeleccionado_pasajeros(viaje);
    // Limpiar las coordenadas de los filtros para que no se muestren en el mapa
    setStartCoords(null);
    setEndCoords(null);

    // Limpiar puntos de recogida
    setPickupInputs(Array(placesToReserve).fill(''));
    setPickupCoordsArray(Array(placesToReserve).fill(null));

    // Geocodificar las direcciones de start y end del viaje seleccionado
    const start = await geocodeAddress(viaje.startTrip);
    const end = await geocodeAddress(viaje.endTrip);
    setStartCoords(start);
    setEndCoords(end);
  };

  // Cerrar el modal de detalles del viaje
  const handleCloseModal = () => {
    setViajeSeleccionado_pasajeros(null);
    setPickupInputs([]);
    setPickupCoordsArray([]);
    setPlacesToReserve(1);
  };

  // Función para manejar la reserva
  const handleReservar = () => {
    // Validar que todos los puntos de recogida estén completos
    const inputsCompletos = pickupInputs.every((input) => input.trim() !== '');
    if (!inputsCompletos) {
      alert('Por favor, ingresa todos los puntos de recogida para reservar.');
      return;
    }
    alert(`Reserva realizada exitosamente.
Número de Teléfono del Viaje: ${viajeSeleccionado_pasajeros?.number}`);
    setPickupInputs([]);
    setPickupCoordsArray([]);
    setViajeSeleccionado_pasajeros(null);
  };

  // useEffect para actualizar los arrays de puntos de recogida cuando cambia placesToReserve
  useEffect(() => {
    if (viajeSeleccionado_pasajeros) {
      setPickupInputs((prevInputs) => {
        const newInputs = [...prevInputs];
        if (placesToReserve > newInputs.length) {
          // Agregar nuevos inputs
          return [...newInputs, ...Array(placesToReserve - newInputs.length).fill('')];
        } else if (placesToReserve < newInputs.length) {
          // Eliminar los inputs excedentes
          return newInputs.slice(0, placesToReserve);
        }
        return newInputs;
      });

      setPickupCoordsArray((prevCoords) => {
        const newCoords = [...prevCoords];
        if (placesToReserve > newCoords.length) {
          // Agregar nuevos coords
          return [...newCoords, ...Array(placesToReserve - newCoords.length).fill(null)];
        } else if (placesToReserve < newCoords.length) {
          // Eliminar los coords excedentes
          return newCoords.slice(0, placesToReserve);
        }
        return newCoords;
      });
    }
  }, [placesToReserve, viajeSeleccionado_pasajeros]);

  // **Nuevo useEffect para resetear startCoords y endCoords al cerrar el modal**
  useEffect(() => {
    const resetCoords = async () => {
      if (!viajeSeleccionado_pasajeros) {
        // Geocodificar puntoStart y puntoEnd para los filtros
        const start = puntoStart ? await geocodeAddress(puntoStart) : null;
        const end = puntoEnd ? await geocodeAddress(puntoEnd) : null;
        setStartCoords(start);
        setEndCoords(end);
      }
    };

    resetCoords();
  }, [viajeSeleccionado_pasajeros, puntoStart, puntoEnd]);

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
                    className={`input-icon_pasajeros ${activeInput?.type === 'start' ? 'active start' : 'start'}`}
                    onClick={() =>
                      setActiveInput(
                        activeInput?.type === 'start' ? null : { type: 'start' }
                      )
                    }
                  ></span>
                  <input
                    type="text"
                    value={puntoStart}
                    onChange={handlePuntoStartChange_pasajeros}
                    placeholder="Punto salida"
                    className="input-field_pasajeros"
                    onFocus={() => setActiveInput({ type: 'start' })}
                  />
                </div>
              </div>
              <div className="form-group_pasajeros">
                <label>Punto final</label>
                <div className="input-container_pasajeros">
                  <span
                    className={`input-icon_pasajeros ${activeInput?.type === 'end' ? 'active end' : 'end'}`}
                    onClick={() =>
                      setActiveInput(
                        activeInput?.type === 'end' ? null : { type: 'end' }
                      )
                    }
                  ></span>
                  <input
                    type="text"
                    value={puntoEnd}
                    onChange={handlePuntoEndChange_pasajeros}
                    placeholder="Punto llegada"
                    className="input-field_pasajeros"
                    onFocus={() => setActiveInput({ type: 'end' })}
                  />
                </div>
              </div>
              <div className="form-row_pasajeros">
                <div className="form-group_pasajeros">
                  <label>Cupos disponibles</label>
                  <select
                    value={availablePlaces_pasajeros}
                    onChange={(e) => setAvailablePlaces_pasajeros(parseInt(e.target.value))}
                    className="input-field_pasajeros"
                  >
                    {opcionesPlaces_pasajeros.map((opcion) => (
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
                    value={timeTrip_pasajeros}
                    onChange={(e) => setTimeTrip_pasajeros(e.target.value)}
                    className="input-field_pasajeros"
                  />
                </div>
                <div className="form-group_pasajeros">
                  <label>Fecha salida</label>
                  <input
                    type="date"
                    value={date_pasajeros}
                    onChange={(e) => setDate_pasajeros(e.target.value)}
                    className="input-field_pasajeros"
                  />
                </div>
              </div>
              {/* Botón "Filtrar" eliminado */}
            </div>
          )}

          {/* Manejo de estados de carga y error */}
          {loading && !error && (
            <div className="loading-overlay">
              <p>Cargando viajes disponibles...</p>
            </div>
          )}
          {error && (
            <div className="error-overlay">
              <p className="error-message_pasajeros">{error}</p>
            </div>
          )}

          {/* Viajes Disponibles */}
          {!viajeSeleccionado_pasajeros && !loading && !error && (
            <>
              {viajes_pasajeros.length > 0 ? (
                <div className="viajes-section_pasajeros">
                  <ul className="viajes-list_pasajeros">
                    {viajes_pasajeros.map((viaje) => (
                      <li key={viaje.id} className="viaje-item_pasajeros">
                        <div>
                          <p>
                            <strong>Inicio:</strong> {viaje.startTrip}
                          </p>
                          <p>
                            <strong>Final:</strong> {viaje.endTrip}
                          </p>
                          <p>
                            <strong>Hora:</strong> {viaje.timeTrip}
                          </p>
                          <p>
                            <strong>Fecha:</strong> {viaje.date}
                          </p>
                          <p>
                            <strong>Tarifa:</strong> ${viaje.priceTrip}
                          </p>
                          <p>
                            <strong>Cupos disponibles:</strong> {viaje.availablePlaces}
                          </p>
                          <p>
                            <strong>Teléfono:</strong> {viaje.number}
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
                
                {/* Inicio viaje */}
                <div className="form-row_pasajeros">
                  <div className="form-group_pasajeros">
                    <label>Inicio viaje:</label>
                    <div className="input-container_pasajeros no-icon">
                      <input
                        type="text"
                        value={viajeSeleccionado_pasajeros.startTrip}
                        readOnly
                        className="input-highlight_pasajeros"
                      />
                    </div>
                  </div>

                  {/* Final viaje */}
                  <div className="form-group_pasajeros">
                    <label>Final viaje:</label>
                    <div className="input-container_pasajeros no-icon">
                      <input
                        type="text"
                        value={viajeSeleccionado_pasajeros.endTrip}
                        readOnly
                        className="input-highlight_pasajeros"
                      />
                    </div>
                  </div>
                </div>

                {/* Resto del contenido del modal */}
                <div className="form-row_pasajeros">
                  <div className="form-group_pasajeros">
                    <label>Hora inicio:</label>
                    <input
                      type="text"
                      value={viajeSeleccionado_pasajeros.timeTrip}
                      readOnly
                      className="input-highlight_pasajeros"
                    />
                  </div>
                  <div className="form-group_pasajeros">
                    <label>Fecha salida:</label>
                    <input
                      type="text"
                      value={viajeSeleccionado_pasajeros.date}
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
                      value={`$${viajeSeleccionado_pasajeros.priceTrip}`}
                      readOnly
                      className="input-highlight_pasajeros"
                    />
                  </div>
                  <div className="form-group_pasajeros">
                    <label>Cupos disponibles:</label>
                    <input
                      type="text"
                      value={`${viajeSeleccionado_pasajeros.availablePlaces} Cupos`}
                      readOnly
                      className="input-highlight_pasajeros"
                    />
                  </div>
                </div>
                <div className="form-row_pasajeros">
                  <div className="form-group_pasajeros">
                    <label>Placa:</label>
                    <div className="input-container_pasajeros no-icon">
                      <input
                        type="text"
                        value={viajeSeleccionado_pasajeros.carID}
                        readOnly
                        className="input-highlight_pasajeros"
                      />
                    </div>
                  </div>
                  <div className="form-group_pasajeros">
                    <label>Número de Teléfono:</label>
                    <div className="input-container_pasajeros no-icon">
                      <input
                        type="tel"
                        value={viajeSeleccionado_pasajeros.number}
                        readOnly
                        className="input-highlight_pasajeros"
                      />
                    </div>
                  </div>
                </div>

                {/* Cupos a Reservar y Ruta */}
                <div className="form-row_pasajeros">
                  <div className="form-group_pasajeros">
                    <label>Cupos a reservar:</label>
                    <input
                      type="number"
                      min="1"
                      max={viajeSeleccionado_pasajeros.availablePlaces}
                      value={placesToReserve}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (isNaN(value)) {
                          setPlacesToReserve(1);
                          return;
                        }
                        if (value > viajeSeleccionado_pasajeros.availablePlaces) {
                          alert('Añade o disminuye cupos a través de los botones');
                          return;
                        }
                        if (value < 1) {
                          alert('Debes reservar al menos un cupo.');
                          return;
                        }
                        setPlacesToReserve(value);
                      }}
                      className="input-field_pasajeros"
                    />
                  </div>
                  <div className="form-group_pasajeros">
                    <label>Ruta:</label>
                    <textarea
                      value={viajeSeleccionado_pasajeros.route}
                      readOnly
                      className="input-field_pasajeros"
                      style={{
                        resize: 'vertical',
                        minHeight: '3rem',
                        maxHeight: '10rem',
                        overflowY: 'auto',
                      }}
                    />
                  </div>
                </div>

                {/* Inputs para los puntos de recogida */}
                {Array.from({ length: placesToReserve }, (_, index) => (
                  <div className="form-group_pasajeros" key={index}>
                    <label>Punto de recogida {index + 1}:</label>
                    <div className="input-container_pasajeros">
                      <span
                        className={`input-icon_pasajeros ${
                          activeInput?.type === 'pickup' && activeInput.index === index ? 'active pickup' : 'pickup'
                        }`}
                        onClick={() =>
                          setActiveInput(
                            activeInput?.type === 'pickup' && activeInput.index === index
                              ? null
                              : { type: 'pickup', index }
                          )
                        }
                      ></span>
                      <input
                        type="text"
                        value={pickupInputs[index] || ''}
                        onChange={(e) => handlePickupChange(index, e)}
                        placeholder={`Ingresa el punto de recogida ${index + 1}`}
                        className="input-field_pasajeros"
                        onFocus={() => setActiveInput({ type: 'pickup', index })}
                      />
                    </div>
                  </div>
                ))}

                {/* Botones de Reservar y Cerrar */}
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
                {startCoords && (
                  <StaticMarker
                    coords={startCoords}
                    label="Inicio del viaje"
                    icon={activeInput?.type === 'start' ? activeIcon : startIcon}
                  />
                )}
                {endCoords && (
                  <StaticMarker
                    coords={endCoords}
                    label="Final del viaje"
                    icon={activeInput?.type === 'end' ? activeIcon : endIcon}
                  />
                )}
                {pickupCoordsArray.map((coords, index) =>
                  coords ? (
                    <StaticMarker
                      key={index}
                      coords={coords}
                      label={`Parada de recogida ${index + 1}`}
                      icon={
                        activeInput?.type === 'pickup' && activeInput.index === index
                          ? activeIcon
                          : pickupIcon
                      }
                    />
                  ) : null
                )}
              </>
            ) : (
              <>
                <DraggableMarker
                  coords={startCoords}
                  setCoords={setStartCoords}
                  setAddress={setPuntoStart}
                  type="start"
                />
                <DraggableMarker
                  coords={endCoords}
                  setCoords={setEndCoords}
                  setAddress={setPuntoEnd}
                  type="end"
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