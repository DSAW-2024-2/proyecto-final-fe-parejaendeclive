// Menu.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './menu.css';
import menuIcon from '../assets/menu.png';
import personaIcon from '../assets/persona.png';
import perfilAvatarIcon from '../assets/perfil.png';
import pasajeroIcon from '../assets/persona.png';
import viajesIcon from '../assets/ubicacion.png';
import carroIcon from '../assets/carro.png'; // Único icono para Conductor, Vehículo y Carro

// Variables de entorno
const api_URL = import.meta.env.VITE_API_URL;

// Interfaz para Usuario
interface Usuario {
  idUser: string;
  name: string;
  LastName: string;
  email: string;
  number: string;
  carIDs: string[]; // Asegúrate de que esta propiedad exista en tu respuesta del backend
  // Otros campos si es necesario
}

// Interfaz para la respuesta del rol
interface RoleResponse {
  role: 'pasajero' | 'conductor';
}

const Menu = () => {
  const navigate = useNavigate();

  // Estados para switches
  const [isPassenger, setIsPassenger] = useState(true);
  const [isDriver, setIsDriver] = useState(false);

  // Estado para verificar si el usuario tiene carros
  const [hasCars, setHasCars] = useState<boolean>(false); // Inicializa como false

  // Estado para el rol y el ID del usuario
  const [role, setRole] = useState<'pasajero' | 'conductor' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Función para decodificar el token JWT manualmente
  const decodeToken = (token: string) => {
    try {
      const payload = token.split('.')[1];
      // Reemplazar caracteres para base64 estándar
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = atob(base64);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Función para obtener la información del usuario y su rol
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No se encontró el token. Por favor, inicia sesión nuevamente.');
        navigate('/login');
        return;
      }

      // Decodificar el token para obtener el userId
      const decoded = decodeToken(token);
      if (!decoded || !decoded.userId) {
        alert('Token inválido. Por favor, inicia sesión nuevamente.');
        navigate('/login');
        return;
      }

      const fetchedUserId = decoded.userId;
      setUserId(fetchedUserId);

      // Realizar la solicitud GET a /user/:id
      const userResponse = await axios.get(`${api_URL}/user/${fetchedUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData: Usuario = userResponse.data.data;
      console.log("Información completa del usuario:", JSON.stringify(userData, null, 2));

      // Verificar si el usuario tiene carros
      if (userData.carIDs && userData.carIDs.length > 0) {
        setHasCars(true);
      } else {
        setHasCars(false);
      }

      // Realizar la solicitud GET a /roles/:idUser para obtener el rol
      const roleResponse = await axios.get<RoleResponse>(`${api_URL}/roles/${fetchedUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userRole = roleResponse.data.role;
      setRole(userRole);

      // Configurar los switches según el rol
      if (userRole === 'pasajero') {
        setIsPassenger(true);
        setIsDriver(false);
      } else if (userRole === 'conductor') {
        setIsPassenger(false);
        setIsDriver(true);
      }
    } catch (error: any) {
      console.error('Error al obtener datos del usuario o rol:', error);
      if (error.response) {
        alert(`Error: ${error.response.data.message || 'Error del servidor.'}`);
      } else if (error.request) {
        alert('Error de red. Por favor, verifica tu conexión a Internet.');
      } else {
        alert('Ocurrió un error. Por favor, intenta nuevamente.');
      }
      setHasCars(false); // Asumir que no tiene carros en caso de error
    }
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función para manejar el switch de Pasajero
  const handlePassengerSwitch = async () => {
    if (role === 'pasajero') return; // Ya es pasajero

    if (!userId) {
      alert('No se encontró el ID del usuario. Por favor, inicia sesión nuevamente.');
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No se encontró el token. Por favor, inicia sesión nuevamente.');
        navigate('/login');
        return;
      }

      // Realizar la solicitud PUT para actualizar el rol a 'pasajero'
      await axios.put(
        `${api_URL}/roles/${userId}`,
        { role: 'pasajero' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Actualizar los estados según el nuevo rol
      setRole('pasajero');
      setIsPassenger(true);
      setIsDriver(false);
    } catch (error: any) {
      console.error('Error al actualizar el rol a pasajero:', error);
      if (error.response) {
        alert(`Error: ${error.response.data.message || 'Error del servidor.'}`);
      } else if (error.request) {
        alert('Error de red al actualizar el rol. Por favor, verifica tu conexión a Internet.');
      } else {
        alert('Ocurrió un error al actualizar el rol. Por favor, intenta nuevamente.');
      }
    }
  };

  // Función para manejar el switch de Conductor
  const handleDriverSwitch = async () => {
    if (role === 'conductor') return; // Ya es conductor

    if (!hasCars) {
      alert('No tienes vehículos registrados. Por favor, añade un vehículo primero.');
      return;
    }

    if (!userId) {
      alert('No se encontró el ID del usuario. Por favor, inicia sesión nuevamente.');
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No se encontró el token. Por favor, inicia sesión nuevamente.');
        navigate('/login');
        return;
      }

      // Realizar la solicitud PUT para actualizar el rol a 'conductor'
      await axios.put(
        `${api_URL}/roles/${userId}`,
        { role: 'conductor' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Actualizar los estados según el nuevo rol
      setRole('conductor');
      setIsDriver(true);
      setIsPassenger(false);
    } catch (error: any) {
      console.error('Error al actualizar el rol a conductor:', error);
      if (error.response) {
        alert(`Error: ${error.response.data.message || 'Error del servidor.'}`);
      } else if (error.request) {
        alert('Error de red al actualizar el rol. Por favor, verifica tu conexión a Internet.');
      } else {
        alert('Ocurrió un error al actualizar el rol. Por favor, intenta nuevamente.');
      }
    }
  };

  // Función para manejar el clic en el menú (opcionalmente, se puede modificar o eliminar)
  const handleMenuClick = () => {
    if (role === 'pasajero') {
      navigate('/pasajeros');
    } else if (role === 'conductor') {
      navigate('/conductores');
    } else {
      alert('Rol desconocido. Por favor, intenta nuevamente.');
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
                  disabled={!hasCars} // Deshabilitar el switch si no tiene carros
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

          {/* Añadir vehículo */}
          <div className="option">
            <div
              className={`option-label clickable ${hasCars ? 'disabled' : ''}`}
              onClick={!hasCars ? () => navigate('/registro-carro') : undefined}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !hasCars) navigate('/registro-carro');
              }}
              aria-label="Añadir vehículo"
              aria-disabled={hasCars}
            >
              <img src={carroIcon} alt="Añadir vehículo" className="icon" />
              <span>Añadir vehículo</span>
            </div>
          </div>

          {/* Añadir viaje */}
          <div className="option">
            <div
              className={`option-label clickable ${!hasCars ? 'disabled' : ''}`}
              onClick={hasCars ? () => navigate('/añadir_viaje') : undefined}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && hasCars) navigate('/añadir_viaje');
              }}
              aria-label="Añadir viaje"
              aria-disabled={!hasCars}
            >
              <img src={viajesIcon} alt="Añadir viaje" className="icon" />
              <span>Añadir viaje</span>
            </div>
          </div>

          {/* Editar vehículo */}
          <div className="option">
            <div
              className={`option-label clickable ${!hasCars ? 'disabled' : ''}`}
              onClick={hasCars ? () => navigate('/editar_carro') : undefined}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && hasCars) navigate('/editar_carro');
              }}
              aria-label="Editar vehículo"
              aria-disabled={!hasCars}
            >
              <img src={carroIcon} alt="Editar vehículo" className="icon" />
              <span>Editar vehículo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
