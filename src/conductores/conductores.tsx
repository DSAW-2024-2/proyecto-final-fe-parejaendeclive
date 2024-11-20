// src/components/Conductores.tsx
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup as LeafletPopup } from 'react-leaflet';
import L, { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './conductores.css';
import menuIcon from '../assets/menu.png';
import personaIcon from '../assets/persona.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Variables de entorno
const api_URL = import.meta.env.VITE_API_URL;

// Interfaz para Reserva
interface Reserva {
  userID: string;
  reservedPlaces: number;
  stops: string[];
}

// Interfaz para Viaje
interface Viaje {
  id: string;
  carId: string;
  carID: string;
  startTrip: string;
  endTrip: string;
  route: string;
  timeTrip: string;
  date: string;
  number: string;
  priceTrip: number;
  status: string;
  reservedBy: Reserva[];
  stops: string[];
  availablePlaces: number;
}

// Interfaz para Usuario
interface Usuario {
  idUser: string;
  name: string;
  LastName: string;
  email: string;
  number: string;
  // Otros campos si es necesario
}

const Conductores = () => {
  const navigate = useNavigate();

  // Estados para filtros y datos
  const [timeTripSalida_conductores, settimeTripSalida_conductores] = useState('');
  const [dateSalida_conductores, setdateSalida_conductores] = useState('');
  const [todosLosViajes, setTodosLosViajes] = useState<Viaje[]>([]);
  const [viajesFiltrados, setViajesFiltrados] = useState<Viaje[]>([]);
  const [viajeSeleccionado_conductores, setViajeSeleccionado_conductores] = useState<Viaje | null>(null);

  // Estados para coordenadas del viaje seleccionado
  const [startTripCoords, setstartTripCoords] = useState<[number, number] | null>(null);
  const [endTripCoords, setendTripCoords] = useState<[number, number] | null>(null);
  const [stopsCoords, setParadasCoords] = useState<{ direccion: string; coords: [number, number]; celular: string }[]>([]);

  // Cachés
  const geocodeCache = useMemo(() => new Map<string, [number, number]>(), []);
  const userCache = useMemo(() => new Map<string, string>(), []);

  // Función para geocodificar una dirección usando Nominatim
  const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    if (geocodeCache.has(address)) {
      console.log(`Obteniendo coordenadas de la caché para: ${address}`);
      return geocodeCache.get(address)!;
    }
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          limit: 1,
        },
        headers: {
          'Accept-Language': 'es', // Opcional: Para obtener resultados en español
          'User-Agent': 'tu-app (tu-email@example.com)', // Recomendado por Nominatim
        },
      });

      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        const coords: [number, number] = [parseFloat(lat), parseFloat(lon)];
        geocodeCache.set(address, coords);
        console.log(`Geocodificación exitosa para: ${address} -> ${coords}`);
        return coords;
      } else {
        console.warn(`No se encontraron coordenadas para la dirección: ${address}`);
        return null;
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  };

  // Función para obtener el celular de un usuario dado su userID
  const getUserCelular = async (userID: string, token: string): Promise<string> => {
    if (userCache.has(userID)) {
      console.log(`Obteniendo celular de la caché para userID: ${userID}`);
      return userCache.get(userID)!;
    }
    try {
      const response = await axios.get(`${api_URL}/user/${userID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userData: Usuario = response.data.data;
      const celular = userData.number;
      userCache.set(userID, celular);
      console.log(`Celular obtenido para userID ${userID}: ${celular}`);
      return celular;
    } catch (error) {
      console.error(`Error fetching user data for userID ${userID}:`, error);
      return 'No disponible';
    }
  };

  // Definir íconos personalizados
  const startTripIcon: Icon = useMemo(() => {
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

  const endTripIcon: Icon = useMemo(() => {
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

  // Función para decodificar el token JWT manualmente
  const decodeToken = (token: string) => {
    try {
      const payload = token.split('.')[1];
      // Reemplazar caracteres para base64 estándar
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = atob(base64);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Función para formatear la fecha a DD-MM-YYYY
  const formatDate = (date: string): string => {
    const [year, month, day] = date.split('-'); // Divide la fecha en partes
    return `${day}-${month}-${year}`; // Reorganiza al formato DD-MM-YYYY
  };

  // Función para obtener los viajes del conductor
  const obtenerViajes = async () => {
    try {
      // Obtener el token almacenado en localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No se encontró el token. Por favor, inicia sesión nuevamente.');
        navigate('/login');
        return;
      }

      // Decodificar el token para validar al usuario
      const decoded = decodeToken(token);
      if (!decoded || !decoded.userId) {
        alert('Token inválido. Por favor, inicia sesión nuevamente.');
        navigate('/login');
        return;
      }

      const userId = decoded.userId;

      // Realizar la solicitud GET a /user/:id para obtener el carIDs
      const userResponse = await axios.get(`${api_URL}/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = userResponse.data.data;
      console.log("Información completa del usuario:", JSON.stringify(userData, null, 2));

      const carIDs = userData.carIDs;
      if (!carIDs || carIDs.length === 0) {
        alert('No tienes carros asociados.');
        return;
      }

      // Supongamos que queremos usar el primer carID
      const carID = carIDs[0]; // O manejarlo dinámicamente según tu lógica

      // Realizar la solicitud GET a /trips/:carId
      const tripsResponse = await axios.get(`${api_URL}/trips/${carID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const viajesData: Viaje[] = tripsResponse.data.trips;
      console.log("Respuesta completa de la API:", JSON.stringify(viajesData, null, 2));

      // Formatear las fechas de los viajes
      const viajesFormateados = viajesData.map((viaje) => ({
        ...viaje,
        date: formatDate(viaje.date),
      }));

      setTodosLosViajes(viajesFormateados);
      setViajesFiltrados(viajesFormateados);
      console.log("Viajes obtenidos:", viajesFormateados);
    } catch (error: any) {
      console.error('Error al obtener viajes:', error);
      if (error.response) {
        alert(`Error al obtener viajes: ${error.response.data.message || 'Error del servidor.'}`);
      } else if (error.request) {
        alert('Error de red al obtener viajes. Por favor, verifica tu conexión a Internet.');
      } else {
        alert('Ocurrió un error al obtener los viajes. Por favor, intenta nuevamente.');
      }
    }
  };

  useEffect(() => {
    obtenerViajes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Funciones de navegación
  const navigateToMenu = () => {
    navigate('/menu');
  };

  const navigateToPerfil = () => {
    navigate('/perfil');
  };

  // Función para seleccionar un viaje y procesar sus paradas
  const handleSeleccionarViaje_conductores = async (viaje: Viaje) => {
    setViajeSeleccionado_conductores(viaje);
    console.log("Viaje seleccionado:", viaje);

    // Obtener el token una vez
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No se encontró el token. Por favor, inicia sesión nuevamente.');
      navigate('/login');
      return;
    }

    try {
      // Construir paradas con 'direccion' y 'celular'
      const stopsWithCelular = await Promise.all(
        viaje.stops.map(async (stop) => {
          // Buscar la reserva que incluye esta parada
          const reservation = viaje.reservedBy.find((res) => res.stops.includes(stop));
          if (reservation) {
            const celular = await getUserCelular(reservation.userID, token);
            console.log(`Parada: ${stop}, Celular: ${celular}`);
            return celular ? { direccion: stop, celular } : { direccion: stop, celular: 'No disponible' };
          } else {
            return { direccion: stop, celular: 'No reservado' };
          }
        })
      );

      console.log("Paradas con celular:", stopsWithCelular);

      // Geocodificar las direcciones de las paradas
      const stopsWithCoords = await Promise.all(
        stopsWithCelular.map(async (parada) => {
          const coords = await geocodeAddress(parada.direccion);
          if (coords) {
            console.log(`Parada geocodificada: ${parada.direccion} -> ${coords}`);
            return { ...parada, coords };
          } else {
            console.warn(`No se pudieron geocodificar las coordenadas para: ${parada.direccion}`);
            return null; // Ignorar paradas que no puedan ser geocodificadas
          }
        })
      );

      // Filtrar paradas sin coordenadas y actualizar el estado
      const validStops = stopsWithCoords.filter((parada) => parada !== null) as {
        direccion: string;
        celular: string;
        coords: [number, number];
      }[];

      console.log("Paradas válidas con coordenadas:", validStops);

      setParadasCoords(validStops);

      // Geocodificar inicio y fin del viaje
      const startTrip = await geocodeAddress(viaje.startTrip);
      const endTrip = await geocodeAddress(viaje.endTrip);
      setstartTripCoords(startTrip);
      setendTripCoords(endTrip);

      console.log("Coordenadas Inicio:", startTrip);
      console.log("Coordenadas Fin:", endTrip);
    } catch (error) {
      console.error('Error al procesar paradas:', error);
      alert('Ocurrió un error al procesar las paradas. Por favor, intenta nuevamente.');
    }
  };

  // Cerrar la ventana emergente de detalles del viaje
  const handleCerrarDetalles = () => {
    setViajeSeleccionado_conductores(null);
    setstartTripCoords(null);
    setendTripCoords(null);
    setParadasCoords([]);
  };

  // Función para manejar la cancelación del viaje
  const handleCancelarViaje = async () => {
    if (viajeSeleccionado_conductores) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('No se encontró el token. Por favor, inicia sesión nuevamente.');
          navigate('/login');
          return;
        }

        await axios.delete(`${api_URL}/trips/cancel/${viajeSeleccionado_conductores.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        alert(`Viaje ha sido cancelado exitosamente.`);
        // Refrescar la lista de viajes
        obtenerViajes();
        handleCerrarDetalles();
      } catch (error: any) {
        console.error('Error al cancelar el viaje:', error);
        if (error.response) {
          alert(`Error al cancelar el viaje: ${error.response.data.message || 'Error del servidor.'}`);
        } else if (error.request) {
          alert('Error de red al cancelar el viaje. Por favor, verifica tu conexión a Internet.');
        } else {
          alert('Ocurrió un error al cancelar el viaje. Por favor, intenta nuevamente.');
        }
      }
    }
  };

  // Función para manejar la cancelación de una parada
  const handleCancelarParada = async (index: number) => {
    if (!viajeSeleccionado_conductores) {
      alert('No se encontró el viaje seleccionado.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No se encontró el token. Por favor, inicia sesión nuevamente.');
        navigate('/login');
        return;
      }

      const parada = viajeSeleccionado_conductores.stops[index];
      if (!parada) {
        alert('No se pudo encontrar la parada seleccionada.');
        return;
      }

      console.log('Cancelando parada:', parada, 'para el viaje:', viajeSeleccionado_conductores.id);
      console.log('URL generada:', `${api_URL}/trips/cancel-stop/${viajeSeleccionado_conductores.id}`);

      // Realizar la solicitud DELETE con el cuerpo incluido
      const response = await axios({
        method: 'DELETE',
        url: `${api_URL}/trips/cancel-stop/${viajeSeleccionado_conductores.id}`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: {
          stop: parada, // El backend espera esto
        },
      });

      if (response.status === 200) {
        alert(`Parada "${parada}" ha sido cancelada.`);
        // Refrescar la lista de viajes
        obtenerViajes();
        handleCerrarDetalles();
      } else {
        alert('La parada no pudo ser cancelada. Verifica con el administrador.');
      }
    } catch (error: any) {
      console.error('Error al cancelar la parada:', error);
      if (error.response) {
        alert(`Error al cancelar la parada: ${error.response.data.message || 'Error del servidor.'}`);
      } else if (error.request) {
        alert('Error de red al cancelar la parada. Por favor, verifica tu conexión a Internet.');
      } else {
        alert('Ocurrió un error al cancelar la parada. Por favor, intenta nuevamente.');
      }
    }
  };

  // Función de filtrado
  const filterViajes = () => {
    const viajesFiltrados = todosLosViajes.filter((viaje) => {
      const coincidetimeTrip = timeTripSalida_conductores ? viaje.timeTrip === timeTripSalida_conductores : true;
      const coincidedate = dateSalida_conductores ? viaje.date === formatDate(dateSalida_conductores) : true;

      return coincidetimeTrip && coincidedate;
    });

    setViajesFiltrados(viajesFiltrados);
    console.log("Viajes filtrados:", viajesFiltrados);
  };

  // useEffect para filtrar automáticamente cuando cambien los filtros
  useEffect(() => {
    filterViajes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeTripSalida_conductores, dateSalida_conductores, todosLosViajes]);

  return (
    <div className="conductores-container">
      {/* Encabezado */}
      <header className="header_conductores">
        <button className="menu-button_conductores" onClick={navigateToMenu} aria-label="Menú">
          <img src={menuIcon} alt="Menú" />
        </button>
        <span className="title_conductores">Conductor</span>
        <div className="persona-button_conductores" onClick={navigateToPerfil} role="button">
          <img src={personaIcon} alt="Perfil" />
        </div>
      </header>

      {/* Contenedor principal */}
      <div className="main-content_conductores">
        {/* Sección Izquierda */}
        <div className="left-section_conductores">
          {/* Filtros Simplificados */}
          {!viajeSeleccionado_conductores && (
            <div className="filters-section_conductores">
              <h3>Filtrar viajes del conductor</h3>
              <div className="form-row_conductores">
                <div className="form-group_conductores">
                  <label>Hora de Salida</label>
                  <input
                    type="time"
                    value={timeTripSalida_conductores}
                    onChange={(e) => settimeTripSalida_conductores(e.target.value)}
                    className="input-field_conductores"
                  />
                </div>
                <div className="form-group_conductores">
                  <label>Fecha de Salida</label>
                  <input
                    type="date"
                    value={dateSalida_conductores}
                    onChange={(e) => setdateSalida_conductores(e.target.value)}
                    className="input-field_conductores"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Viajes del Conductor */}
          {!viajeSeleccionado_conductores && (
            <>
              {viajesFiltrados.length > 0 ? (
                <div className="viajes-section_conductores">
                  <h3>Viajes Disponibles</h3>
                  <ul className="viajes-list_conductores">
                    {viajesFiltrados.map((viaje) => (
                      <li key={viaje.id} className="viaje-item_conductores">
                        <div>
                          <p>
                            <strong>Inicio:</strong> {viaje.startTrip}
                          </p>
                          <p>
                            <strong>Destino:</strong> {viaje.endTrip}
                          </p>
                          <p>
                            <strong>Hora:</strong> {viaje.timeTrip}
                          </p>
                          <p>
                            <strong>Fecha:</strong> {viaje.date}
                          </p>
                          <p>
                            <strong>Precio:</strong> ${viaje.priceTrip}
                          </p>
                          <p>
                            <strong>Lugares Disponibles:</strong> {viaje.availablePlaces}
                          </p>
                          <p>
                            <strong>Estado:</strong> {viaje.status}
                          </p>
                          <button
                            className="button-status_conductores"
                            onClick={() => handleSeleccionarViaje_conductores(viaje)}
                          >
                            {viaje.status}
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

          {/* Overlay Oscuro y Ventana Emergente */}
          {viajeSeleccionado_conductores && (
            <>
              <div className="overlay-conductores" onClick={handleCerrarDetalles}></div>
              <div className="popup-detalles_conductores">
                <div className="popup-content_conductores">
                  <h3>Detalles del Viaje Seleccionado</h3>
                  <div className="detalles-section_conductores">
                    <div className="form-row_conductores">
                      <div className="form-group_conductores">
                        <label>Inicio del Viaje:</label>
                        <input
                          type="text"
                          value={viajeSeleccionado_conductores.startTrip}
                          readOnly
                          className="input-highlight_conductores"
                        />
                      </div>
                      <div className="form-group_conductores">
                        <label>Destino del Viaje:</label>
                        <input
                          type="text"
                          value={viajeSeleccionado_conductores.endTrip}
                          readOnly
                          className="input-highlight_conductores"
                        />
                      </div>
                    </div>
                    <div className="form-row_conductores">
                      <div className="form-group_conductores">
                        <label>Hora de Inicio:</label>
                        <input
                          type="text"
                          value={viajeSeleccionado_conductores.timeTrip}
                          readOnly
                          className="input-highlight_conductores"
                        />
                      </div>
                      <div className="form-group_conductores">
                        <label>Fecha de Salida:</label>
                        <input
                          type="text"
                          value={viajeSeleccionado_conductores.date}
                          readOnly
                          className="input-highlight_conductores"
                        />
                      </div>
                    </div>
                    <div className="form-row_conductores">
                      <div className="form-group_conductores">
                        <label>Precio del Viaje:</label>
                        <input
                          type="text"
                          value={`$${viajeSeleccionado_conductores.priceTrip}`}
                          readOnly
                          className="input-highlight_conductores"
                        />
                      </div>
                      <div className="form-group_conductores">
                        <label>Lugares Disponibles:</label>
                        <input
                          type="text"
                          value={`${viajeSeleccionado_conductores.availablePlaces} lugares`}
                          readOnly
                          className="input-highlight_conductores"
                        />
                      </div>
                    </div>

                    {/* Campo para Ruta */}
                    <div className="form-row_conductores">
                      <div className="form-group_conductores">
                        <label>Ruta:</label>
                        <textarea
                          value={viajeSeleccionado_conductores.route}
                          readOnly
                          className="input-field_conductores"
                        />
                      </div>
                    </div>

                    {/* Sección de Paradas con Celular */}
                    <div className="form-group_conductores">
                      <label>Paradas:</label>
                      {stopsCoords.length > 0 ? (
                        <ul className="paradas-list_conductores">
                          {stopsCoords.map((parada, index) => (
                            <li key={index} className="parada-item_conductores">
                              <div className="parada-info_conductores">
                                <p>
                                  <strong>Dirección:</strong> {parada.direccion}
                                </p>
                                <p>
                                  <strong>Teléfono:</strong> {parada.celular}
                                </p>
                              </div>
                              <button
                                className="button-cancelar-parada_conductores"
                                onClick={() => handleCancelarParada(index)}
                              >
                                Cancelar
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No hay paradas disponibles para este viaje.</p>
                      )}
                    </div>
                  </div>

                  <div className="button-container_conductores">
                    <button className="button-secondary_conductores" onClick={handleCancelarViaje}>
                      Cancelar Viaje
                    </button>
                    <button className="button-exit_conductores" onClick={handleCerrarDetalles}>
                      Salir
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sección Derecha (Mapa) */}
        <div className="right-section_conductores">
          <MapContainer
            center={[4.711, -74.0721]}
            zoom={12}
            className="map_conductores"
            style={{ height: '100%', width: '100%' }}
          >
            {/* Proveedor de Tiles Estándar de OpenStreetMap */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {/* Marcadores según el status */}
            {viajeSeleccionado_conductores && (
              <>
                {startTripCoords && (
                  <Marker position={startTripCoords} icon={startTripIcon}>
                    <LeafletPopup>Inicio del viaje: {viajeSeleccionado_conductores.startTrip}</LeafletPopup>
                  </Marker>
                )}
                {endTripCoords && (
                  <Marker position={endTripCoords} icon={endTripIcon}>
                    <LeafletPopup>Destino del viaje: {viajeSeleccionado_conductores.endTrip}</LeafletPopup>
                  </Marker>
                )}
                {stopsCoords.map((parada, index) => (
                  <Marker key={index} position={parada.coords} icon={paradaIcon}>
                    <LeafletPopup>
                      <strong>Parada:</strong> {parada.direccion}
                      <br />
                      <strong>Teléfono:</strong> {parada.celular}
                    </LeafletPopup>
                  </Marker>
                ))}
              </>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default Conductores;
