import { useNavigate } from 'react-router-dom';
import './perfil.css';
import menuIcon from '../assets/menu.png';
import personaIcon from '../assets/persona.png';
import perfilIcon from '../assets/perfil.png';
import editIcon from '../assets/editar.png'; // Asegúrate de que este archivo exista en la ruta especificada

const Perfil = () => {
  const navigate = useNavigate();

  const handleLogout = (): void => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="perfil-container">
      {/* Encabezado con menú e icono de persona */}
      <header className="perfil-header">
        <button
          className="perfil-button"
          onClick={() => navigate('/menu')}
          aria-label="Perfil"
        >
          <img src={menuIcon} alt="Menú" />
        </button>
        <span className="perfil-title">Perfil</span>
        <div
          className="persona-button"
          onClick={() => navigate('/perfil')}
          role="button"
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
          <img src={perfilIcon} alt="Foto de perfil" />
        </div>

        {/* Opciones del perfil */}
        <div className="options-section">
          {/* Opción Editar Perfil */}
          <div className="option">
            <div
              className="option-label clickable"
              onClick={() => navigate('/editar-perfil')}
            >
              <img src={editIcon} alt="Editar Perfil" className="icon" />
              <span>Editar Perfil</span>
            </div>
          </div>

          {/* Opción Cerrar Sesión */}
          <div className="option">
            <div
              className="option-label clickable"
              onClick={handleLogout}
            >
              {/* Reemplazo de la imagen con un icono de flecha SVG sencillo y negro */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
              <span>Cerrar Sesión</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;