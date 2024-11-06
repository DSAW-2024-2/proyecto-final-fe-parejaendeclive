import React from 'react';
import { useNavigate } from 'react-router-dom';
import './perfil.css';
import menuIcon from '../assets/menu.png';
import personaIcon from '../assets/persona.png';
import perfilIcon from '../assets/perfil.png';
import editarIcon from '../assets/editar.png'; // Icono de editar perfil

const Perfil: React.FC = () => {
  const navigate = useNavigate();

  // Función para cerrar sesión
  const handleLogout = (): void => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Funciones de navegación
  const navigateToMenu = (): void => {
    navigate('/menu');
  };

  const navigateToEditProfile = (): void => {
    navigate('/editar-perfil');
  };

  const navigateToPasajeros = (): void => {
    navigate('/pasajeros');
  };

  return (
    <div className="menu-container_perfil">
      {/* Encabezado con menú y botón de perfil */}
      <header className="menu-header_perfil">
        {/* Div morado de fondo */}
        <div className="header-background_perfil"></div>

        <button className="menu-button_perfil" onClick={navigateToMenu} aria-label="Menú">
          <img src={menuIcon} alt="Menú" />
        </button>
        <span className="menu-title_perfil">Perfil</span>
        <div
          className="persona-button_perfil"
          onClick={navigateToPasajeros}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigateToPasajeros();
            }
          }}
          aria-label="Ir a Pasajeros"
        >
          <img src={personaIcon} alt="Pasajeros" />
        </div>
      </header>

      {/* Contenido del perfil */}
      <div className="menu-content_perfil">
        {/* Foto de perfil */}
        <div className="user-avatar_perfil">
          <img src={perfilIcon} alt="Foto de perfil" />
        </div>

        {/* Opciones del perfil */}
        <div className="options-section_perfil">
          {/* Botón para Editar Perfil */}
          <div
            className="option_perfil clickable"
            onClick={navigateToEditProfile}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigateToEditProfile();
              }
            }}
          >
            <div className="option-label_perfil">
              <img src={editarIcon} alt="Editar Perfil" className="icon_perfil" />
              <span>Editar Perfil</span>
            </div>
          </div>

          {/* Botón para Cerrar Sesión con flecha CSS */}
          <div
            className="option_perfil clickable"
            onClick={handleLogout}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleLogout();
              }
            }}
          >
            <div className="option-label_perfil">
              <div className="arrow-icon_perfil"></div>
              <span>Cerrar Sesión</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;