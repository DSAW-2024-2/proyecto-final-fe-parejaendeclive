import { useState, useContext, useEffect } from 'react'; // Añadido useEffect para verificar el token
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../Authentication'; // Añadido para importar AuthContext
import './inicio_sesion.css';
import perfilPredefinido from '../assets/persona.png'; // Icono de usuario
import candadoIcon from '../assets/candado.png'; // Icono de candado

const api_URL = import.meta.env.VITE_API_URL;

const InicioSesion = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext); // Acceder a setIsAuthenticated del contexto
  const [formData, setFormData] = useState({
    email: '', // "correo del usuario"
    password: '' // "contraseña"
  });
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Función para verificar el token de localStorage
  const verifyToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) return; // Si no hay token, no se hace nada

    try {
      const response = await axios.get(`${api_URL}/login`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Si el token es válido, se actualiza el estado de autenticación
      if (response.status === 200) {
        setIsAuthenticated(true);
        navigate('/pasajeros');
      }
    } catch (error) {
      // Si el token es inválido, se borra del localStorage y se muestra un error
      localStorage.removeItem('token');
      setErrorMessage('Sesión expirada, por favor inicia sesión nuevamente');
      setIsAuthenticated(false);
    }
  };

  // Verificar token al cargar el componente
  useEffect(() => {
    verifyToken();
  }, []);

  const handleSubmit = async () => {
    const { email, password } = formData;

    // Resetear el mensaje de error al iniciar el envío
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Todos los campos son obligatorios');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Por favor, ingresa un correo válido');
      return;
    }

    try {
      const response = await axios.post(`${api_URL}/login`, { email, password });
  
      // Asumiendo que el backend devuelve { accessToken: string }
      const { accessToken } = response.data;
  
      // Almacenar el token en el local storage
      localStorage.setItem('token', accessToken);

      setIsAuthenticated(true); // Actualizar el estado de autenticación a true

      // Limpiar el mensaje de error en caso de inicio de sesión exitoso
      setErrorMessage('');

      // Redirigir a la página de pasajeros
      navigate('/pasajeros');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Manejar errores conocidos basados en el código de estado
        if (error.response.status === 404) {
          setErrorMessage('Correo no encontrado');
        } else if (error.response.status === 401) {
          setErrorMessage('Contraseña incorrecta');
        } else {
          // Manejar otros errores conocidos
          setErrorMessage(error.response.data.error || 'Error en el inicio de sesión');
        }
      } else {
        // Manejar errores inesperados
        setErrorMessage('Error al conectar con el servidor');
      }
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
    <div className="full-screen"> {/* Este div abarca toda la pantalla */}
      <div className="login-wrapper"> {/* Este div aplica el fondo violeta */}
        <div className="login-container">
          <h2 className="login-title">Iniciar sesión</h2>
          <div className="input-group">
            <div className="input-wrapper">
              <img src={perfilPredefinido} alt="icono usuario" className="input-icon-inside" />
              <input
                type="email"
                name="email" // Mismo nombre "correo del usuario"
                placeholder="Correo"
                className="input-field"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <img src={candadoIcon} alt="icono candado" className="input-icon-inside" />
              <input
                type="password"
                name="password" // Mismo nombre "contraseña"
                placeholder="Contraseña"
                className="input-field"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <button className="login-button" onClick={handleSubmit}>
            Iniciar sesión
          </button>

          <div className="register-prompt">
            <span>¿No tienes cuenta?</span>
            <button className="register-link" onClick={() => navigate('/registro')}>Regístrate</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InicioSesion;
