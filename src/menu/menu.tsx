import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import './menu.css';
import menuIcon from '../assets/menu.png';
import personaIcon from '../assets/persona.png';
import perfilIcon from '../assets/perfil.png';
import pasajeroIcon from '../assets/persona.png';
import viajesIcon from '../assets/ubicacion.png';
import conductorIcon from '../assets/carro.png';
import vehiculoIcon from '../assets/carro.png';

const Menu = () => {
  const [isPassenger, setIsPassenger] = useState(false);
  const [isDriver, setIsDriver] = useState(false);

  const navigate = useNavigate(); // Crea la función de navegación

  const handlePassengerSwitch = () => {
    setIsPassenger(!isPassenger);
    if (!isPassenger) setIsDriver(false); // Apaga "Conductor" si "Pasajero" se enciende
  };

  const handleDriverSwitch = () => {
    setIsDriver(!isDriver);
    if (!isDriver) setIsPassenger(false); // Apaga "Pasajero" si "Conductor" se enciende
  };

  return (
    <div className="page-background">
      <div className="menu-container">
        {/* Encabezado con menú e icono de persona */}
        <header className="menu-header">
          <button className="menu-button" onClick={() => navigate('/pasajeros')}>
            <img src={menuIcon} alt="Menú" />
          </button>
          <span className="menu-title">Pasajero</span>
          <div className="persona-button" onClick={() => navigate('/perfil')}>
            <img src={personaIcon} alt="Perfil" />
          </div>
        </header>

        {/* Contenido del menú */}
        <div className="menu-content">
          <div className="user-section">
            <div className="user-avatar">
              <img src={perfilIcon} alt="Foto de perfil" />
            </div>
            <span className="user-greeting">¡Hola, Andrea!</span>
          </div>
          <div className="options-section">
            {/* Switch para Pasajero */}
            <div className="option">
              <div className="option-label">
                <img src={pasajeroIcon} alt="Pasajero" className="icon" />
                <span>Pasajero</span>
              </div>
              <label className="switch">
                <input type="checkbox" checked={isPassenger} onChange={handlePassengerSwitch} />
                <span className="slider"></span>
              </label>
            </div>

            {/* Switch para Conductor */}
            <div className="option">
              <div className="option-label">
                <img src={conductorIcon} alt="Conductor" className="icon" />
                <span>Conductor</span>
              </div>
              <label className="switch">
                <input type="checkbox" checked={isDriver} onChange={handleDriverSwitch} />
                <span className="slider"></span>
              </label>
            </div>

            <div className="option">
              <div className="option-label">
                <img src={viajesIcon} alt="Viajes reservados" className="icon" />
                <span>Viajes reservados</span>
              </div>
            </div>
            <div className="option disabled">
              <div className="option-label">
                <img src={vehiculoIcon} alt="Añadir vehículo" className="icon" />
                <span>Añadir vehículo</span>
              </div>
            </div>
            <div className="option disabled">
              <div className="option-label">
                <img src={viajesIcon} alt="Añadir viaje" className="icon" />
                <span>Añadir viaje</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;