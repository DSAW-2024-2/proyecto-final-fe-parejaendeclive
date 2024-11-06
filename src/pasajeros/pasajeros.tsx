import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './pasajeros.css';
import menuIcon from '../assets/menu.png';
import personaIcon from '../assets/persona.png';

const Pasajeros = () => {
  const navigate = useNavigate();

  // Estados para los filtros y datos
  const [puntoInicio_pasajeros, setPuntoInicio_pasajeros] = useState('');
  const [puntoFinal_pasajeros, setPuntoFinal_pasajeros] = useState('');
  const [cuposDisponibles_pasajeros, setCuposDisponibles_pasajeros] = useState(2);
  const [horaSalida_pasajeros, setHoraSalida_pasajeros] = useState('');
  const [viajes_pasajeros, setViajes_pasajeros] = useState<any[]>([]);
  const [viajeSeleccionado_pasajeros, setViajeSeleccionado_pasajeros] = useState<any | null>(null);

  const opcionesCupos_pasajeros = Array.from({ length: 11 }, (_, index) => index);

  // Viajes disponibles (simulación)
  const todosViajes = [
    { id: 1, inicio: 'Estación Alcala', final: 'Universidad de La Sabana', cupos: 2, hora: '09:00', tarifa: 6000, placa: 'ABC123' },
    { id: 2, inicio: 'Estación Calle 100', final: 'Universidad de La Sabana', cupos: 3, hora: '10:00', tarifa: 5500, placa: 'XYZ789' },
    { id: 3, inicio: 'Estación Calle 85', final: 'Universidad de Los Andes', cupos: 2, hora: '09:30', tarifa: 6500, placa: 'JKL456' },
  ];

  // Manejo de cambios en los filtros
  const handleCuposChange_pasajeros = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCuposDisponibles_pasajeros(parseInt(e.target.value));
  };

  const handleHoraChange_pasajeros = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHoraSalida_pasajeros(e.target.value);
  };

  const handlePuntoInicioChange_pasajeros = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPuntoInicio_pasajeros(e.target.value);
  };

  const handlePuntoFinalChange_pasajeros = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPuntoFinal_pasajeros(e.target.value);
  };

  // Función para filtrar viajes según los filtros seleccionados
  const handleFiltrarViajes_pasajeros = () => {
    const viajesFiltrados = todosViajes.filter((viaje) => {
      const coincideInicio = puntoInicio_pasajeros
        ? viaje.inicio.toLowerCase().includes(puntoInicio_pasajeros.toLowerCase())
        : true;
      const coincideFinal = puntoFinal_pasajeros
        ? viaje.final.toLowerCase().includes(puntoFinal_pasajeros.toLowerCase())
        : true;
      const coincideCupos = cuposDisponibles_pasajeros ? viaje.cupos >= cuposDisponibles_pasajeros : true;
      const coincideHora = horaSalida_pasajeros
        ? viaje.hora === horaSalida_pasajeros
        : true;

      return coincideInicio && coincideFinal && coincideCupos && coincideHora;
    });

    setViajes_pasajeros(viajesFiltrados);
  };

  // Seleccionar un viaje de la lista
  const handleSeleccionarViaje_pasajeros = (viaje: any) => {
    setViajeSeleccionado_pasajeros(viaje);
  };

  // Cerrar el modal de detalles del viaje
  const handleCloseModal = () => {
    setViajeSeleccionado_pasajeros(null);
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

      {/* Contenedor de dos columnas para filtros y mapa */}
      <div className="main-content_pasajeros">
        {/* Columna Izquierda */}
        <div className="left-section_pasajeros">
          {/* Filtros */}
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

          {/* Viajes Disponibles */}
          {viajes_pasajeros.length > 0 ? (
            <div className="viajes-section_pasajeros">
              <ul className="viajes-list_pasajeros">
                {viajes_pasajeros.map((viaje) => (
                  <li key={viaje.id} className="viaje-item_pasajeros">
                    <div>
                      <p>Inicio: {viaje.inicio}</p>
                      <p>Final: {viaje.final}</p>
                      <p>Hora: {viaje.hora}</p>
                      <p>Tarifa: ${viaje.tarifa}</p>
                      <p>Cupos disponibles: {viaje.cupos}</p>
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
        </div>

        {/* Columna Derecha (Mapa) */}
        <div className="right-section_pasajeros">
          <iframe
            title="Mapa"
            src=""
            allowFullScreen
          />
        </div>
      </div>

      {/* Modal de detalles */}
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
            <div className="button-container_pasajeros">
              <button className="button-primary_pasajeros">Reservar</button>
              <button className="button-secondary_pasajeros" onClick={handleCloseModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pasajeros;