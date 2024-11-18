import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup as LeafletPopup } from 'react-leaflet';
import L, { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './conductores.css';
import menuIcon from '../assets/menu.png';
import personaIcon from '../assets/persona.png';

// Importar las imágenes de los iconos de Leaflet
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Definir la interfaz Viaje
interface Viaje {
  id: number;
  startTrip: string;
  endTrip: string;
  availablePlaces: number;
  timeTrip: string;
  date: string;
  priceTrip: number;
  placa: string;
  estado: string;
  paradas: { direccion: string; coords: [number, number]; celular: string }[]; // Añadido 'celular'
  ruta: string; // Nuevo campo para la ruta
}

const Conductores = () => {
  const navigate = useNavigate();

  // Estados para los filtros y datos
  const [timeTripSalida_conductores, settimeTripSalida_conductores] = useState('');
  const [dateSalida_conductores, setdateSalida_conductores] = useState('');
  const [viajes_conductores, setViajes_conductores] = useState<Viaje[]>([]);
  const [viajeSeleccionado_conductores, setViajeSeleccionado_conductores] = useState<Viaje | null>(null);

  // Estados para las coordenadas del viaje seleccionado
  const [startTripCoords, setstartTripCoords] = useState<[number, number] | null>(null);
  const [endTripCoords, setendTripCoords] = useState<[number, number] | null>(null);
  const [paradasCoords, setParadasCoords] = useState<{ direccion: string; coords: [number, number]; celular: string }[]>([]);

  // Viajes disponibles (simulación) con coordenadas, dates, estados y paradas predefinidas
  const todosViajes: Viaje[] = [
    {
      id: 1,
      startTrip: 'Titan Plaza',
      endTrip: 'Universidad de La Sabana',
      availablePlaces: 2,
      timeTrip: '09:00',
      date: '2024-11-15',
      priceTrip: 6000,
      placa: 'ABC123',
      estado: 'Disponible',
      ruta: 'Ruta principal desde Titan Plaza hacia la Universidad de La Sabana pasando por la Calle 50 y la Avenida Central.',
      paradas: [
        {
          direccion: 'Parada 1 - Calle 50',
          coords: [4.711, -74.0721],
          celular: '3101112222',
        },
        {
          direccion: 'Parada 2 - Calle 60',
          coords: [4.712, -74.073],
          celular: '3103334444',
        },
      ],
    },
    {
      id: 2,
      startTrip: 'Estación Calle 100',
      endTrip: 'Universidad de La Sabana',
      availablePlaces: 3,
      timeTrip: '10:00',
      date: '2024-11-16',
      priceTrip: 5500,
      placa: 'XYZ789',
      estado: 'Disponible',
      ruta: 'Ruta alterna desde Estación Calle 100 hacia la Universidad de La Sabana pasando por la Calle 110.',
      paradas: [
        {
          direccion: 'Parada 1 - Calle 110',
          coords: [4.713, -74.074],
          celular: '3105556666',
        },
      ],
    },
    {
      id: 3,
      startTrip: 'Estación Calle 85',
      endTrip: 'Universidad de Los Andes',
      availablePlaces: 2,
      timeTrip: '09:30',
      date: '2024-11-15',
      priceTrip: 6500,
      placa: 'JKL456',
      estado: 'Disponible',
      ruta: 'Ruta directa desde Estación Calle 85 hacia la Universidad de Los Andes, pasando por la Calle 90 y la Calle 95.',
      paradas: [
        {
          direccion: 'Parada 1 - Calle 90',
          coords: [4.714, -74.075],
          celular: '3107778888',
        },
        {
          direccion: 'Parada 2 - Calle 95',
          coords: [4.715, -74.076],
          celular: '3109990000',
        },
        {
          direccion: 'Parada 3 - Calle 100',
          coords: [4.716, -74.077],
          celular: '3101213141',
        },
      ],
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

  // Definir íconos personalizados para startTrip, endTrip y parada utilizando SVG data URLs
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

  // Manejo de cambios en los filtros
  const handletimeTripSalidaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    settimeTripSalida_conductores(e.target.value);
  };

  const handledateSalidaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setdateSalida_conductores(e.target.value);
  };

  // Función de filtrado
  const filterViajes = () => {
    const viajesFiltrados = todosViajes.filter((viaje) => {
      const coincidetimeTrip = timeTripSalida_conductores ? viaje.timeTrip === timeTripSalida_conductores : true;
      const coincidedate = dateSalida_conductores ? viaje.date === dateSalida_conductores : true;

      return coincidetimeTrip && coincidedate;
    });

    setViajes_conductores(viajesFiltrados);
  };

  // useEffect para filtrar automáticamente cuando cambien los filtros
  useEffect(() => {
    filterViajes();
  }, [timeTripSalida_conductores, dateSalida_conductores]);

  // Inicializar viajes_conductores con todos los viajes al montar el componente
  useEffect(() => {
    setViajes_conductores(todosViajes);
  }, []);

  // Seleccionar un viaje de la lista
  const handleSeleccionarViaje_conductores = async (viaje: Viaje) => {
    setViajeSeleccionado_conductores(viaje);
    setParadasCoords(viaje.paradas);
    // Geocodificar las direcciones de startTrip y endTrip del viaje seleccionado
    const startTrip = await geocodeAddress(viaje.startTrip);
    const endTrip = await geocodeAddress(viaje.endTrip);
    setstartTripCoords(startTrip);
    setendTripCoords(endTrip);
  };

  // Cerrar la ventana emergente de detalles del viaje
  const handleCerrarDetalles = () => {
    setViajeSeleccionado_conductores(null);
    setstartTripCoords(null);
    setendTripCoords(null);
    setParadasCoords([]);
  };

  // Función para manejar la cancelación del viaje
  const handleCancelarViaje = () => {
    if (viajeSeleccionado_conductores) {
      // Aquí puedes agregar la lógica para cancelar el viaje, como una llamada a la API
      alert(`Viaje con ID ${viajeSeleccionado_conductores.id} ha sido cancelado.`);
      setViajeSeleccionado_conductores(null);
    }
  };

  // Función para manejar la cancelación de una parada específica
  const handleCancelarParada = (index: number) => {
    if (viajeSeleccionado_conductores) {
      const updatedParadas = [...viajeSeleccionado_conductores.paradas];
      updatedParadas.splice(index, 1); // Elimina la parada en el índice especificado
      setViajeSeleccionado_conductores({ ...viajeSeleccionado_conductores, paradas: updatedParadas });
      setParadasCoords(updatedParadas);
    }
  };

  // Función para manejar el cambio del estado del viaje
  const handleChangeEstadoViaje = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (viajeSeleccionado_conductores) {
      setViajeSeleccionado_conductores({ ...viajeSeleccionado_conductores, estado: e.target.value });
    }
  };

  // Definir funciones de navegación dentro del componente
  const navigateToMenu = () => {
    navigate('/menu');
  };

  const navigateToPerfil = () => {
    navigate('/perfil');
  };

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
                  <label>timeTrip salida</label>
                  <input
                    type="time"
                    value={timeTripSalida_conductores}
                    onChange={handletimeTripSalidaChange}
                    className="input-field_conductores" // Usar la misma clase que los demás inputs
                  />
                </div>
                <div className="form-group_conductores">
                  <label>date salida</label>
                  <input
                    type="date"
                    value={dateSalida_conductores}
                    onChange={handledateSalidaChange}
                    className="input-field_conductores" // Usar la misma clase que los demás inputs
                  />
                </div>
              </div>
            </div>
          )}

          {/* Viajes del Conductor */}
          {!viajeSeleccionado_conductores && (
            <>
              {viajes_conductores.length > 0 ? (
                <div className="viajes-section_conductores">
                  <h3>Viajes Disponibles</h3>
                  <ul className="viajes-list_conductores">
                    {viajes_conductores.map((viaje) => (
                      <li key={viaje.id} className="viaje-item_conductores">
                        <div>
                          <p>
                            <strong>startTrip:</strong> {viaje.startTrip}
                          </p>
                          <p>
                            <strong>endTrip:</strong> {viaje.endTrip}
                          </p>
                          <p>
                            <strong>timeTrip:</strong> {viaje.timeTrip}
                          </p>
                          <p>
                            <strong>date:</strong> {viaje.date}
                          </p>
                          <p>
                            <strong>priceTrip:</strong> ${viaje.priceTrip}
                          </p>
                          <p>
                            <strong>availablePlaces disponibles:</strong> {viaje.availablePlaces}
                          </p>
                          <p>
                            <strong>Estado:</strong> {viaje.estado}
                          </p>
                          <button
                            className="button-status_conductores"
                            onClick={() => handleSeleccionarViaje_conductores(viaje)}
                          >
                            {viaje.estado}
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
                        <label>startTrip viaje:</label>
                        <input
                          type="text"
                          value={viajeSeleccionado_conductores.startTrip}
                          readOnly
                          className="input-highlight_conductores" // Usar la misma clase que los demás inputs
                        />
                      </div>
                      <div className="form-group_conductores">
                        <label>endTrip viaje:</label>
                        <input
                          type="text"
                          value={viajeSeleccionado_conductores.endTrip}
                          readOnly
                          className="input-highlight_conductores" // Usar la misma clase que los demás inputs
                        />
                      </div>
                    </div>
                    <div className="form-row_conductores">
                      <div className="form-group_conductores">
                        <label>timeTrip startTrip:</label>
                        <input
                          type="text"
                          value={viajeSeleccionado_conductores.timeTrip}
                          readOnly
                          className="input-highlight_conductores"
                        />
                      </div>
                      <div className="form-group_conductores">
                        <label>date salida:</label>
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
                        <label>priceTrip:</label>
                        <input
                          type="text"
                          value={`$${viajeSeleccionado_conductores.priceTrip}`}
                          readOnly
                          className="input-highlight_conductores"
                        />
                      </div>
                      <div className="form-group_conductores">
                        <label>availablePlaces disponibles:</label>
                        <input
                          type="text"
                          value={`${viajeSeleccionado_conductores.availablePlaces} availablePlaces`}
                          readOnly
                          className="input-highlight_conductores"
                        />
                      </div>
                    </div>
                    

                    {/* Nuevo Campo para Ruta */}
                    <div className="form-row_conductores">
                      <div className="form-group_conductores">
                        <label>Ruta:</label>
                        <textarea
                          value={viajeSeleccionado_conductores.ruta}
                          readOnly
                          className="input-field_conductores"
                        />
                      </div>
                    </div>

                    {/* Sección de Paradas Predefinidas con Celular */}
                    <div className="form-group_conductores">
                      <label>Paradas:</label>
                      <ul className="paradas-list_conductores">
                        {viajeSeleccionado_conductores.paradas.map((parada, index) => (
                          <li key={index} className="parada-item_conductores">
                            <div className="parada-info_conductores">
                              <p>
                                <strong>Celular:</strong> {parada.celular}
                              </p>
                              <p>
                                <strong>Dirección:</strong> {parada.direccion}
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
                    </div>
                  </div>

                  <div className="button-container_conductores">
                    {/* Modificar Estado del Viaje */}
                    <select
                      value={viajeSeleccionado_conductores.estado}
                      onChange={handleChangeEstadoViaje}
                      className="button-status-select_conductores"
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="No disponible">No disponible</option>
                    </select>
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
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {/* Marcadores según el estado */}
            {viajeSeleccionado_conductores && (
              <>
                {startTripCoords && (
                  <Marker position={startTripCoords} icon={startTripIcon}>
                    <LeafletPopup>startTrip del viaje: {viajeSeleccionado_conductores.startTrip}</LeafletPopup>
                  </Marker>
                )}
                {endTripCoords && (
                  <Marker position={endTripCoords} icon={endTripIcon}>
                    <LeafletPopup>endTrip del viaje: {viajeSeleccionado_conductores.endTrip}</LeafletPopup>
                  </Marker>
                )}
                {paradasCoords.map((parada, index) => (
                  <Marker key={index} position={parada.coords} icon={paradaIcon}>
                    <LeafletPopup>Parada: {parada.direccion}</LeafletPopup>
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
