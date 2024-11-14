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
  fecha: string;
  tarifa: number;
  placa: string;
  estado: string;
  paradas: { direccion: string; coords: [number, number] }[]; // Paradas predefinidas
}

const Conductores = () => {
  const navigate = useNavigate();

  // Estados para los filtros y datos
  const [horaSalida_conductores, setHoraSalida_conductores] = useState('');
  const [fechaSalida_conductores, setFechaSalida_conductores] = useState('');
  const [viajes_conductores, setViajes_conductores] = useState<Viaje[]>([]);
  const [viajeSeleccionado_conductores, setViajeSeleccionado_conductores] = useState<Viaje | null>(null);

  // Estados para las coordenadas del viaje seleccionado
  const [inicioCoords, setInicioCoords] = useState<[number, number] | null>(null);
  const [finalCoords, setFinalCoords] = useState<[number, number] | null>(null);
  const [paradasCoords, setParadasCoords] = useState<{ direccion: string; coords: [number, number] }[]>([]);

  // Viajes disponibles (simulación) con coordenadas, fechas, estados y paradas predefinidas
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
      estado: 'Disponible',
      paradas: [
        {
          direccion: 'Parada 1 - Calle 50',
          coords: [4.711, -74.0721],
        },
        {
          direccion: 'Parada 2 - Calle 60',
          coords: [4.712, -74.073],
        },
      ],
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
      estado: 'Disponible',
      paradas: [
        {
          direccion: 'Parada 1 - Calle 110',
          coords: [4.713, -74.074],
        },
      ],
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
      estado: 'Disponible',
      paradas: [
        {
          direccion: 'Parada 1 - Calle 90',
          coords: [4.714, -74.075],
        },
        {
          direccion: 'Parada 2 - Calle 95',
          coords: [4.715, -74.076],
        },
        {
          direccion: 'Parada 3 - Calle 100',
          coords: [4.716, -74.077],
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

  // Manejo de cambios en los filtros
  const handleHoraSalidaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHoraSalida_conductores(e.target.value);
  };

  const handleFechaSalidaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFechaSalida_conductores(e.target.value);
  };

  // Función de filtrado
  const filterViajes = () => {
    const viajesFiltrados = todosViajes.filter((viaje) => {
      const coincideHora = horaSalida_conductores ? viaje.hora === horaSalida_conductores : true;
      const coincideFecha = fechaSalida_conductores ? viaje.fecha === fechaSalida_conductores : true;

      return coincideHora && coincideFecha;
    });

    setViajes_conductores(viajesFiltrados);
  };

  // useEffect para filtrar automáticamente cuando cambien los filtros
  useEffect(() => {
    filterViajes();
  }, [horaSalida_conductores, fechaSalida_conductores]);

  // Inicializar viajes_conductores con todos los viajes al montar el componente
  useEffect(() => {
    setViajes_conductores(todosViajes);
  }, []);

  // Seleccionar un viaje de la lista
  const handleSeleccionarViaje_conductores = async (viaje: Viaje) => {
    setViajeSeleccionado_conductores(viaje);
    setParadasCoords(viaje.paradas);
    // Geocodificar las direcciones de inicio y final del viaje seleccionado
    const inicio = await geocodeAddress(viaje.inicio);
    const final = await geocodeAddress(viaje.final);
    setInicioCoords(inicio);
    setFinalCoords(final);
  };

  // Cerrar la ventana emergente de detalles del viaje
  const handleCerrarDetalles = () => {
    setViajeSeleccionado_conductores(null);
    setInicioCoords(null);
    setFinalCoords(null);
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
                  <label>Hora salida</label>
                  <input
                    type="time"
                    value={horaSalida_conductores}
                    onChange={handleHoraSalidaChange}
                    className="input-field_conductores"
                  />
                </div>
                <div className="form-group_conductores">
                  <label>Fecha salida</label>
                  <input
                    type="date"
                    value={fechaSalida_conductores}
                    onChange={handleFechaSalidaChange}
                    className="input-field_conductores"
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
              <div className="overlay-conductores"></div>
              <div className="popup-detalles_conductores">
                <div className="popup-content_conductores">
                  <h3>Detalles del Viaje Seleccionado</h3>
                  <div className="detalles-section_conductores">
                    <div className="form-row_conductores">
                      <div className="form-group_conductores">
                        <label>Inicio viaje:</label>
                        <div className="input-container_conductores">
                          <span className={`input-icon_conductores inicio`}></span>
                          <input
                            type="text"
                            value={viajeSeleccionado_conductores.inicio}
                            readOnly
                            className="input-highlight_conductores"
                          />
                        </div>
                      </div>
                      <div className="form-group_conductores">
                        <label>Final viaje:</label>
                        <div className="input-container_conductores">
                          <span className={`input-icon_conductores final`}></span>
                          <input
                            type="text"
                            value={viajeSeleccionado_conductores.final}
                            readOnly
                            className="input-highlight_conductores"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-row_conductores">
                      <div className="form-group_conductores">
                        <label>Hora inicio:</label>
                        <input
                          type="text"
                          value={viajeSeleccionado_conductores.hora}
                          readOnly
                          className="input-highlight_conductores"
                        />
                      </div>
                      <div className="form-group_conductores">
                        <label>Fecha salida:</label>
                        <input
                          type="text"
                          value={viajeSeleccionado_conductores.fecha}
                          readOnly
                          className="input-highlight_conductores"
                        />
                      </div>
                    </div>
                    <div className="form-row_conductores">
                      <div className="form-group_conductores">
                        <label>Tarifa:</label>
                        <input
                          type="text"
                          value={`$${viajeSeleccionado_conductores.tarifa}`}
                          readOnly
                          className="input-highlight_conductores"
                        />
                      </div>
                      <div className="form-group_conductores">
                        <label>Cupos disponibles:</label>
                        <input
                          type="text"
                          value={`${viajeSeleccionado_conductores.cupos} cupos`}
                          readOnly
                          className="input-highlight_conductores"
                        />
                      </div>
                    </div>
                    <div className="form-row_conductores">
                      <div className="form-group_conductores">
                        <label>Placa:</label>
                        <input
                          type="text"
                          value={viajeSeleccionado_conductores.placa}
                          readOnly
                          className="input-highlight_conductores"
                        />
                      </div>
                    </div>

                    {/* Sección de Paradas Predefinidas */}
                    <div className="form-group_conductores">
                      <label>Paradas:</label>
                      <ul className="paradas-list_conductores">
                        {viajeSeleccionado_conductores.paradas.map((parada, index) => (
                          <li key={index} className="parada-item_conductores">
                            <div className="parada-info">
                              <span>{parada.direccion}</span>
                            </div>
                            <button
                              className="button-cancelar-parada_conductores"
                              onClick={() => handleCancelarParada(index)}
                            >
                              Cancelar Parada
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="button-container_conductores">
                    <button className="button-status_conductores" disabled>
                      Estado: {viajeSeleccionado_conductores.estado}
                    </button>
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
                {inicioCoords && (
                  <Marker position={inicioCoords} icon={inicioIcon}>
                    <LeafletPopup>Inicio del viaje: {viajeSeleccionado_conductores.inicio}</LeafletPopup>
                  </Marker>
                )}
                {finalCoords && (
                  <Marker position={finalCoords} icon={finalIcon}>
                    <LeafletPopup>Final del viaje: {viajeSeleccionado_conductores.final}</LeafletPopup>
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