import { useNavigate } from 'react-router-dom';
import './perfil.css';
import menuIcon from '../assets/menu.png';
import personaIcon from '../assets/persona.png'; // Importamos persona.png
import perfilIcon from '../assets/perfil.png';
import editarIcon from '../assets/editar.png'; // Icono de editar perfil

const Perfil = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Eliminar el token del localStorage
    localStorage.removeItem('token');
    // Redirigir a la ruta /Principal
    navigate('/');
  };

  // Funciones de navegación
  const navigateToMenu = () => {
    navigate('/menu'); // Navega al menú
  };

  const navigateToEditProfile = () => {
    navigate('/editarPerfil'); // Navega a la edición de perfil (ajusta la ruta según tu aplicación)
  };

  return (
    <div className="page-background_perfil">
      <div className="menu-container_perfil">
        {/* Encabezado con menú y botón de perfil */}
        <header className="menu-header_perfil">
          <button className="menu-button_perfil" onClick={navigateToMenu}>
            <img src={menuIcon} alt="Menú" />
          </button>
          <span className="menu-title_perfil">Perfil</span>
          <div className="persona-button_perfil">
            <img src={personaIcon} alt="Perfil" />
          </div>
        </header>

        {/* Contenido del perfil */}
        <div className="menu-content_perfil">
          <div className="user-section_perfil">
            <div className="user-avatar_perfil">
              <img src={perfilIcon} alt="Foto de perfil" />
            </div>
            <span className="user-greeting_perfil">¡Hola, Andrea!</span>
          </div>
          <div className="options-section_perfil">
            {/* Botón para Editar Perfil */}
            <div className="option_perfil" onClick={navigateToEditProfile}>
              <div className="option-label_perfil">
                <img src={editarIcon} alt="Editar Perfil" className="icon_perfil" />
                <span>Editar Perfil</span>
              </div>
            </div>
            {/* Botón para Cerrar Sesión */}
            <div className="option_perfil" onClick={handleLogout}>
              <div className="option-label_perfil">
                <div className="arrow-icon_perfil"></div>
                <span>Cerrar Sesión</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;