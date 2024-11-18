import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../Authentication';
import './inicio_sesion.css';
import perfilPredefinido from '../assets/persona.png';
import candadoIcon from '../assets/candado.png';

const api_URL = import.meta.env.VITE_API_URL;

const InicioSesion = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Estado de carga

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const verifyToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setIsLoading(true); // Iniciar carga

    try {
      const response = await axios.get(`${api_URL}/login`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        setIsAuthenticated(true);
        navigate('/pasajeros');
      }
    } catch (error) {
      localStorage.removeItem('token');
      setErrorMessage('Sesión expirada, por favor inicia sesión nuevamente');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false); // Finalizar carga
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  const handleSubmit = async () => {
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

      setIsAuthenticated(true);

      setErrorMessage('');

      navigate('/pasajeros');
    } catch (error) {
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

          <button className="login-button" onClick={handleSubmit} disabled={isLoading}>
            Iniciar sesión
          </button>

          <div className="register-prompt">
            <span>¿No tienes cuenta?</span>
            <button className="register-link" onClick={() => navigate('/registro')} disabled={isLoading}>
              Regístrate
            </button>
          </div>
        </div>
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
