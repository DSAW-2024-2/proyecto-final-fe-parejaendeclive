// Menu.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './menu.css';
import menuIcon from '../assets/menu.png';
import personaIcon from '../assets/persona.png';
import perfilAvatarIcon from '../assets/perfil.png';
import pasajeroIcon from '../assets/persona.png';
import viajesIcon from '../assets/ubicacion.png';
import carroIcon from '../assets/carro.png'; // Único icono para Conductor, Vehículo y Carro

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
    <div className="perfil-container">
      {/* Encabezado con perfil e icono de persona */}
      <header className="perfil-header">
        <button className="perfil-button" onClick={() => navigate('/pasajeros')} aria-label="Perfil">
          <img src={menuIcon} alt="Perfil" />
        </button>
        <span className="perfil-title">Menu</span>
        <div className="persona-button" onClick={() => navigate('/perfil')} role="button">
          <img src={personaIcon} alt="Perfil" />
        </div>
      </header>

      {/* Contenido del perfil */}
      <div className="perfil-content">
        {/* Div morado de fondo */}
        <div className="header-background"></div>

        {/* Foto de perfil */}
        <div className="user-avatar">
          <img src={perfilAvatarIcon} alt="Foto de perfil" />
        </div>

        {/* Opciones del perfil */}
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
              <label className="switch" aria-label="Toggle Passenger Mode">
                <input
                  type="checkbox"
                  checked={isPassenger}
                  onChange={handlePassengerSwitch}
                  aria-checked={isPassenger}
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
              <img src={carroIcon} alt="Conductor" className="icon" />
              <span>Conductor</span>
            </div>
            <div className="switch-container">
              <label className="switch" aria-label="Toggle Driver Mode">
                <input
                  type="checkbox"
                  checked={isDriver}
                  onChange={handleDriverSwitch}
                  aria-checked={isDriver}
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
              onClick={() => navigate('/registro-carro')}
            >
              <img src={carroIcon} alt="Añadir vehículo" className="icon" />
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
  );
};

export default Menu;
