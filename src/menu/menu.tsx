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
    if (isPassenger) {
      // Si se desactiva Pasajero, activar Conductor
      setIsPassenger(false);
      setIsDriver(true);
    } else {
      // Si se activa Pasajero, desactivar Conductor
      setIsPassenger(true);
      setIsDriver(false);
    }
  };

  const handleDriverSwitch = () => {
    if (isDriver) {
      // Si se desactiva Conductor, activar Pasajero
      setIsDriver(false);
      setIsPassenger(true);
    } else {
      // Si se activa Conductor, desactivar Pasajero
      setIsDriver(true);
      setIsPassenger(false);
    }
  };

  const handleMenuClick = () => {
    if (isPassenger) {
      navigate('/pasajeros');
    } else if (isDriver) {
      navigate('/conductores');
    }
  };

  return (
    <div className="perfil-container">
      {/* Encabezado con perfil e icono de persona */}
      <header className="perfil-header">
        <button
          className="perfil-button"
          onClick={handleMenuClick}
          aria-label="Ir al modo activo"
        >
          <img src={menuIcon} alt="Perfil" />
        </button>
        <span className="perfil-title">Menú</span>
        <div
          className="persona-button"
          onClick={() => navigate('/perfil')}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter') navigate('/perfil');
          }}
          aria-label="Ir al perfil"
        >
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
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') navigate('/pasajeros');
              }}
              aria-label="Ir al modo Pasajero"
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
              onClick={() => navigate('/conductores')}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') navigate('/conductores');
              }}
              aria-label="Ir al modo Conductor"
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
              onClick={() => navigate('/reservas')}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') navigate('/reservas');
              }}
              aria-label="Ir a Viajes Reservados"
            >
              <img src={viajesIcon} alt="Viajes reservados" className="icon" />
              <span>Viajes reservados</span>
            </div>
          </div>
          <div className="option">
            <div
              className="option-label clickable"
              onClick={() => navigate('/registro-carro')}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') navigate('/registro-carro');
              }}
              aria-label="Añadir vehículo"
            >
              <img src={carroIcon} alt="Añadir vehículo" className="icon" />
              <span>Añadir vehículo</span>
            </div>
          </div>
          <div className="option">
            <div
              className="option-label clickable"
              onClick={() => navigate('/añadir_viaje')}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') navigate('/añadir_viaje');
              }}
              aria-label="Añadir viaje"
            >
              <img src={viajesIcon} alt="Añadir viaje" className="icon" />
              <span>Añadir viaje</span>
            </div>
          </div>
          {/* Nueva opción de Editar vehículo */}
          <div className="option">
            <div
              className="option-label clickable"
              onClick={() => navigate('/editar_carro')}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') navigate('/editar_carro');
              }}
              aria-label="Editar vehículo"
            >
              <img src={carroIcon} alt="Editar vehículo" className="icon" />
              <span>Editar vehiculo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
