import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './pasajeros.css';
import menuIcon from '../assets/menu.png';  // Icono de menú
import personaIcon from '../assets/persona.png';  // Icono de persona

const Pasajeros = () => {
  const navigate = useNavigate();
  
  // Estados para los filtros y datos
  const [puntoInicio_pasajeros, setPuntoInicio_pasajeros] = useState('');  // Se buscará en la API
  const [puntoFinal_pasajeros, setPuntoFinal_pasajeros] = useState('');    // Se buscará en la API
  const [cuposDisponibles_pasajeros, setCuposDisponibles_pasajeros] = useState(2); // Inicialmente en 2
  const [horaSalida_pasajeros, setHoraSalida_pasajeros] = useState('');    // Se selecciona la hora
  const [viajes_pasajeros, setViajes_pasajeros] = useState<any[]>([]);     // Lista de viajes disponibles
  const [viajeSeleccionado_pasajeros, setViajeSeleccionado_pasajeros] = useState<any | null>(null);

  const opcionesCupos_pasajeros = Array.from({ length: 11 }, (_, index) => index);

  // Manejo de cambios en los filtros
  const handleCuposChange_pasajeros = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCuposDisponibles_pasajeros(parseInt(e.target.value));
  };

  const handleHoraChange_pasajeros = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHoraSalida_pasajeros(e.target.value);
  };

  const handlePuntoInicioChange_pasajeros = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPuntoInicio_pasajeros(e.target.value);
    // Aquí puedes implementar la lógica para buscar en la API
  };

  const handlePuntoFinalChange_pasajeros = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPuntoFinal_pasajeros(e.target.value);
    // Aquí puedes implementar la lógica para buscar en la API
  };

  // Filtrar viajes disponibles (simulación)
  const handleFiltrarViajes_pasajeros = () => {
    const viajesDisponibles = [
      { id: 1, inicio: 'Estación Alcala', final: 'Universidad de La Sabana', cupos: 2, hora: '9:00 am', tarifa: 6000 },
      { id: 2, inicio: 'Estación Calle 100', final: 'Universidad de La Sabana', cupos: 3, hora: '10:00 am', tarifa: 5500 },
      // Añade más viajes según sea necesario
    ];
    setViajes_pasajeros(viajesDisponibles);
  };

  // Seleccionar un viaje de la lista
  const handleSeleccionarViaje_pasajeros = (viaje: any) => {
    setViajeSeleccionado_pasajeros(viaje);
  };

  // Cerrar el modal de detalles del viaje
  const handleCloseModal = () => {
    setViajeSeleccionado_pasajeros(null); // Cerrar el modal
  };

  // Funciones de navegación
  const navigateToMenu = () => {
    navigate('/menu');  // Navega a la pestaña de menú
  };

  const navigateToPerfil = () => {
    navigate('/perfil'); // Navega a la pestaña de perfil
  };

  return (
    <div className="pasajeros-container">
      {/* Encabezado con menú e icono de persona */}
      <header className="header_pasajeros">
        <button className="menu-button_pasajeros" onClick={navigateToMenu}>
          <img src={menuIcon} alt="Menú" />
        </button>
        <span className="title_pasajeros">Pasajero</span>
        <div className="persona-button_pasajeros" onClick={navigateToPerfil}>
          <img src={personaIcon} alt="Perfil" />
        </div>
      </header>

      {/* Contenedor de dos columnas para filtros y mapa */}
      <div className="main-content_pasajeros">
        {/* Columna Izquierda con filtros, viajes y detalles */}
        <div className="left-section_pasajeros">
          {/* Sección de Filtros */}
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

          {/* Sección de Viajes Disponibles */}
          {viajes_pasajeros.length > 0 && (
            <div className="viajes-section_pasajeros">
              <ul className="viajes-list_pasajeros">
                {viajes_pasajeros.map((viaje) => (
                  <li key={viaje.id} className="viaje-item_pasajeros">
                    <div>
                      <p>Inicio: {viaje.inicio}</p>
                      <p>Final: {viaje.final}</p>
                      <p>Hora: {viaje.hora}</p>
                      <p>Tarifa: ${viaje.tarifa}</p>
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
          )}
        </div>

        {/* Columna Derecha con el mapa */}
        <div className="right-section_pasajeros">
          <iframe
            title="Mapa"
            src=""
            allowFullScreen
          />
        </div>
      </div>

      {/* Modal con detalles del viaje seleccionado */}
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
                <label>Ruta:</label>
                <input
                  type="text"
                  value="Autopista"
                  readOnly
                  className="input-highlight_pasajeros"
                />
              </div>
              <div className="form-group_pasajeros">
                <label>Hora inicio:</label>
                <input
                  type="text"
                  value={viajeSeleccionado_pasajeros.hora}
                  readOnly
                  className="input-highlight_pasajeros"
                />
              </div>
            </div>
            <div className="form-row_pasajeros">
              <div className="form-group_pasajeros">
                <label>Tarifa por pasajero:</label>
                <input
                  type="text"
                  value={`$${viajeSeleccionado_pasajeros.tarifa}`}
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