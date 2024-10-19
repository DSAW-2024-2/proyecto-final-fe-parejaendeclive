import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './inicio_sesion.css';
import perfilPredefinido from '../assets/persona.png'; // Icono de usuario
import candadoIcon from '../assets/candado.png'; // Icono de candado

const InicioSesion = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '', // "correo del usuario"
    password: '' // "contraseña"
  });
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = () => {
    const { email, password } = formData;

    if (!email || !password) {
      setErrorMessage('Todos los campos son obligatorios');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Por favor, ingresa un correo válido');
      return;
    }

    // Si todo es válido, redirigir a la página principal
    setErrorMessage('');
    navigate('/Principal');
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
            <button className="register-link" onClick={() => navigate('/registro')}>Registrate</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InicioSesion;