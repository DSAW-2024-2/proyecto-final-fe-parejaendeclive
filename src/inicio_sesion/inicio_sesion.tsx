// InicioSesion.tsx

import { useState, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../Authentication';
import './inicio_sesion.css';
import perfilPredefinido from '../assets/persona.png';
import candadoIcon from '../assets/candado.png';

// Variables de entorno
const api_URL = import.meta.env.VITE_API_URL;

// Interfaz para la respuesta del rol
interface RoleResponse {
  role: 'pasajero' | 'conductor';
}

const InicioSesion = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Estado de carga

  // Estado adicional para almacenar el rol del usuario
  const [role, setRole] = useState<'pasajero' | 'conductor' | null>(null);

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

  // Eliminamos la función verifyToken de este componente
  // Esta lógica debería manejarse en un contexto de autenticación global o en un componente de alto nivel

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const { email, password } = formData;

    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Todos los campos son obligatorios');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Por favor, ingresa un correo válido');
      return;
    }

    setIsLoading(true); // Iniciar carga

    try {
      const response = await axios.post(`${api_URL}/login`, { email, password });

      const { accessToken } = response.data;

      localStorage.setItem('token', accessToken);

      // Decodificar el token para obtener el userId
      const decoded = decodeToken(accessToken);
      if (!decoded || !decoded.userId) {
        throw new Error('Token inválido');
      }
      const userId = decoded.userId;

      // Obtener el rol del usuario
      const roleResponse = await axios.get<RoleResponse>(`${api_URL}/roles/${userId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const userRole = roleResponse.data.role;
      setRole(userRole);

      // Establecer la autenticación
      setIsAuthenticated(true);
      setErrorMessage('');

      // Navegar según el rol
      if (userRole === 'pasajero') {
        navigate('/pasajeros');
      } else if (userRole === 'conductor') {
        navigate('/conductores');
      } else {
        setErrorMessage('Rol desconocido');
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          setErrorMessage('Correo no encontrado');
        } else if (error.response.status === 401) {
          setErrorMessage('Contraseña incorrecta');
        } else {
          setErrorMessage(error.response.data.error || 'Error en el inicio de sesión');
        }
      } else {
        setErrorMessage('Error al conectar con el servidor');
      }
    } finally {
      setIsLoading(false); // Finalizar carga
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  return (
    <div className="full-screen">
      <div className="login-wrapper">
        <div className="login-container">
          <h2 className="login-title">Iniciar sesión</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <div className="input-wrapper">
                <img src={perfilPredefinido} alt="icono usuario" className="input-icon-inside" />
                <input
                  type="email"
                  name="email"
                  placeholder="Correo"
                  className="input-field"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading} // Deshabilitar mientras carga
                />
              </div>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <img src={candadoIcon} alt="icono candado" className="input-icon-inside" />
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  className="input-field"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading} // Deshabilitar mientras carga
                />
              </div>
            </div>

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <button type="submit" className="login-button" disabled={isLoading}>
              Iniciar sesión
            </button>
          </form>

          <div className="register-prompt">
            <span>¿No tienes cuenta?</span>
            <button className="register-link" onClick={() => navigate('/registro')} disabled={isLoading}>
              Regístrate
            </button>
          </div>
        </div>
      </div>
      <div className="welcome-message">
        {role && <p>Bienvenido, {role === 'pasajero' ? 'Pasajero' : 'Conductor'}!</p>}
      </div>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner"></div>
            <p className="loading-text">Iniciando sesión...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InicioSesion;
