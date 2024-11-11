// Pasajeros.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { Icon } from 'leaflet';
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

  // Manejo de cambios en los filtros
  const handleCuposChange_pasajeros = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCuposDisponibles_pasajeros(parseInt(e.target.value));
  };

  const handleHoraChange_pasajeros = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHoraSalida_pasajeros(e.target.value);
  };

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

  // Manejo del punto de recogida (solo actualiza el input)
  const handlePuntoRecogidaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setPuntoRecogida(address);
    // No geocodificamos aquí para evitar geocodificaciones innecesarias mientras el usuario escribe
  };

  // Función para agregar el punto de recogida
  const handleAgregarPuntoRecogida = () => {
    if (puntoRecogida.trim() === '') {
      alert('Por favor, ingresa un Punto de Recogida.');
      return;
    }
    // Aquí podrías añadir lógica adicional si es necesario
    alert('Punto de Recogida añadido.');
  };

  // Función para calcular la distancia en metros entre dos coordenadas
  const getDistance = (coords1: [number, number], coords2: [number, number]) => {
    const [lat1, lon1] = coords1;
    const [lat2, lon2] = coords2;

    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;

    return distance; // En metros
  };

  // Función para filtrar viajes según los filtros seleccionados
  const handleFiltrarViajes_pasajeros = async () => {
    // Geocodificar direcciones de viajes si no están geocodificadas
    await Promise.all(
      todosViajes.map(async (viaje) => {
        if (!viaje.inicioCoords) {
          viaje.inicioCoords = await geocodeAddress(viaje.inicio);
        }
        if (!viaje.finalCoords) {
          viaje.finalCoords = await geocodeAddress(viaje.final);
        }
      })
    );

    const viajesFiltrados = todosViajes.filter((viaje) => {
      let coincideInicio = true;
      let coincideFinal = true;

      if (inicioCoords) {
        if (viaje.inicioCoords) {
          // Calcular distancia entre puntos de inicio
          const distanciaInicio = getDistance(inicioCoords, viaje.inicioCoords);
          coincideInicio = distanciaInicio < 2000; // 2 km de tolerancia
        } else {
          coincideInicio = false;
        }
      }

      if (finalCoords) {
        if (viaje.finalCoords) {
          // Calcular distancia entre puntos finales
          const distanciaFinal = getDistance(finalCoords, viaje.finalCoords);
          coincideFinal = distanciaFinal < 2000; // 2 km de tolerancia
        } else {
          coincideFinal = false;
        }
      }

      const coincideCupos = cuposDisponibles_pasajeros ? viaje.cupos >= cuposDisponibles_pasajeros : true;
      const coincideHora = horaSalida_pasajeros ? viaje.hora === horaSalida_pasajeros : true;

      return coincideInicio && coincideFinal && coincideCupos && coincideHora;
    });

    setViajes_pasajeros(viajesFiltrados);
    setViajeSeleccionado_pasajeros(null); // Resetear selección al filtrar
    // Resetear el punto de recogida
    setPuntoRecogida('');
  };

  // Función para manejar la reserva
  const handleReservar = () => {
    if (puntoRecogida.trim() === '') {
      alert('Por favor, ingresa un Punto de Recogida para reservar.');
      return;
    }

    // Aquí puedes añadir la lógica para reservar el viaje, por ejemplo, enviar datos al backend
    // Por ahora, mostraremos un mensaje de éxito
    alert('Reserva realizada exitosamente.');
    // Resetear el punto de recogida después de la reserva
    setPuntoRecogida('');
    setViajeSeleccionado_pasajeros(null);
  };

  // Seleccionar un viaje de la lista
  const handleSeleccionarViaje_pasajeros = async (viaje: Viaje) => {
    // Geocodificar direcciones del viaje seleccionado si no están geocodificadas
    if (!viaje.inicioCoords) {
      viaje.inicioCoords = await geocodeAddress(viaje.inicio);
    }
    if (!viaje.finalCoords) {
      viaje.finalCoords = await geocodeAddress(viaje.final);
    }
    setViajeSeleccionado_pasajeros(viaje);
    // Resetear el punto de recogida al seleccionar un viaje
    setPuntoRecogida('');
  };

  // Cerrar el modal de detalles del viaje
  const handleCloseModal = () => {
    setViajeSeleccionado_pasajeros(null);
    // Resetear el punto de recogida al cerrar el modal
    setPuntoRecogida('');
  };

  // Funciones de navegación
  const navigateToMenu = () => {
    navigate('/menu');
  };

  const navigateToPerfil = () => {
    navigate('/perfil');
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
                />
              </div>
              <div className="form-row_pasajeros">
                <div className="form-group_pasajeros">
                  <label>Cupos disponibles</label>
                  <select
                    value={cuposDisponibles_pasajeros}
                    onChange={handleCuposChange_pasajeros}
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
                    onChange={handleHoraChange_pasajeros}
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
            center={[4.7110, -74.0721]}
            zoom={12}
            className="map_pasajeros"
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {/* Marcadores según el estado */}
            {viajeSeleccionado_pasajeros ? (
              <>
                {viajeSeleccionado_pasajeros.inicioCoords && (
                  <Marker position={viajeSeleccionado_pasajeros.inicioCoords} icon={defaultIcon}>
                    <Popup>
                      <strong>Inicio:</strong> {viajeSeleccionado_pasajeros.inicio}
                    </Popup>
                  </Marker>
                )}
                {viajeSeleccionado_pasajeros.finalCoords && (
                  <Marker position={viajeSeleccionado_pasajeros.finalCoords} icon={defaultIcon}>
                    <Popup>
                      <strong>Final:</strong> {viajeSeleccionado_pasajeros.final}
                    </Popup>
                  </Marker>
                )}
              </>
            ) : (
              <>
                {inicioCoords && (
                  <Marker position={inicioCoords} icon={defaultIcon}>
                    <Popup>Punto de inicio ingresado</Popup>
                  </Marker>
                )}
                {finalCoords && (
                  <Marker position={finalCoords} icon={defaultIcon}>
                    <Popup>Punto final ingresado</Popup>
                  </Marker>
                )}
              </>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default Pasajeros;