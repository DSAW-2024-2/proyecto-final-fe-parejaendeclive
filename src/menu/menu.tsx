import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './menu.css';
import menuIcon from '../assets/menu.png';
import personaIcon from '../assets/persona.png';
import perfilIcon from '../assets/perfil.png';
import pasajeroIcon from '../assets/persona.png';
import viajesIcon from '../assets/ubicacion.png';
import conductorIcon from '../assets/carro.png';
import vehiculoIcon from '../assets/carro.png';
import carroIcon from '../assets/carro.png'; // Asegúrate de que la ruta es correcta

const Menu = () => {
  // Configura "Pasajero" como activo por defecto
  const [isPassenger, setIsPassenger] = useState(true);
  const [isDriver, setIsDriver] = useState(false);

  const navigate = useNavigate();

  const handlePassengerSwitch = () => {
    if (!isPassenger) {
      setIsPassenger(true);
      setIsDriver(false);
      // Acciones adicionales al activar "Pasajero"
    }
  };

  const handleDriverSwitch = () => {
    if (!isDriver) {
      setIsDriver(true);
      setIsPassenger(false);
      // Acciones adicionales al activar "Conductor"
    }
  };

  return (
    <div className="page-background">
      <div className="menu-container">
        {/* Encabezado con menú e icono de persona */}
        <header className="menu-header">
          <button className="menu-button" onClick={() => navigate('/pasajeros')}>
            <img src={menuIcon} alt="Menú" />
          </button>
          <span className="menu-title">Menú</span>
          <div className="persona-button" onClick={() => navigate('/perfil')}>
            <img src={personaIcon} alt="Perfil" />
          </div>
        </header>

        {/* Contenido del menú */}
        <div className="menu-content">
          {/* Div morado de fondo */}
          <div className="header-background"></div>

          {/* Foto de perfil */}
          <div className="user-avatar">
            <img src={perfilIcon} alt="Foto de perfil" />
          </div>

          {/* Opciones del menú */}
          <div className="options-section">
            {/* Opción Pasajero con botón y Switch */}
            <div className="option">
              <div
                className="option-label clickable"
                onClick={() => navigate('/pasajeros')}
              >
                <img src={pasajeroIcon} alt="Pasajero" className="icon" />
                <span>Pasajero</span>
              </div>
              <div className="switch-container">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={isPassenger}
                    onChange={handlePassengerSwitch}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            {/* Opción Conductor con botón y Switch */}
            <div className="option">
              <div
                className="option-label clickable"
                onClick={() => navigate('/conductor')}
              >
                <img src={conductorIcon} alt="Conductor" className="icon" />
                <span>Conductor</span>
              </div>
              <div className="switch-container">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={isDriver}
                    onChange={handleDriverSwitch}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            {/* Otras Opciones */}
            <div className="option">
              <div
                className="option-label clickable"
                onClick={() => navigate('/viajes-reservados')}
              >
                <img src={viajesIcon} alt="Viajes reservados" className="icon" />
                <span>Viajes reservados</span>
              </div>
            </div>
            <div className="option">
              <div
                className="option-label clickable"
                onClick={() => navigate('/añadir-vehiculo')}
              >
                <img src={vehiculoIcon} alt="Añadir vehículo" className="icon" />
                <span>Añadir vehículo</span>
              </div>
            </div>
            <div className="option">
              <div
                className="option-label clickable"
                onClick={() => navigate('/añadir-viaje')}
              >
                <img src={viajesIcon} alt="Añadir viaje" className="icon" />
                <span>Añadir viaje</span>
              </div>
            </div>
            {/* Nueva opción de Añadir carro */}
            <div className="option">
              <div
                className="option-label clickable"
                onClick={() => navigate('/añadir-carro')}
              >
                <img src={carroIcon} alt="Añadir carro" className="icon" />
                <span>Añadir carro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;