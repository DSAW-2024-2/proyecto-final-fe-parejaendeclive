import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './editar_perfil.css';
import perfilPredefinido from '../assets/perfil_predefinido.png';
import axios from 'axios';
import { api_URL } from '../apiConfig';

interface FormDataType {
  name: string;           // Nombre del estudiante
  LastName: string;       // Apellido del estudiante (con L mayúscula)
  id: string;             // ID de la universidad
  email: string;          // Correo del usuario
  number: string;         // Número de contacto
  password: string;       // Contraseña
  photoUser?: string;     // Imagen en formato Base64 (opcional)
  role?: string;          // Rol (se asignará automáticamente como 'pasajero')
}

const Registro: React.FC = () => {
  const [imagenPerfil, setImagenPerfil] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormDataType>({
    name: '',           
    LastName: '',       
    id: '',             
    email: '',          
    number: '',         
    password: '',
    photoUser: ''
  });
  const [errores, setErrores] = useState({
    name: '',
    LastName: '',
    id: '',
    email: '',
    number: '',
    password: ''
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagenPerfil(result);
        setFormData(prevFormData => ({
          ...prevFormData,
          photoUser: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const validarFormulario = () => {
    let esValido = true;
    let erroresTemp = { ...errores };

    // Validación de Nombre y Apellido (no deben contener números)
    if (!formData.name || /\d/.test(formData.name)) {
      erroresTemp.name = 'El nombre no debe contener números';
      esValido = false;
    } else {
      erroresTemp.name = '';
    }

    if (!formData.LastName || /\d/.test(formData.LastName)) {
      erroresTemp.LastName = 'El apellido no debe contener números';
      esValido = false;
    } else {
      erroresTemp.LastName = '';
    }

    // Validación de ID Universidad (debe tener 10 dígitos y empezar con 4 ceros)
    if (!/^[0]{4}\d{6}$/.test(formData.id)) {
      erroresTemp.id = 'El ID debe contener 10 números y comenzar con 4 ceros';
      esValido = false;
    } else {
      erroresTemp.id = '';
    }

    // Validación de correo (debe ser un correo válido)
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      erroresTemp.email = 'Debe ser un correo electrónico válido';
      esValido = false;
    } else {
      erroresTemp.email = '';
    }

    // Validación de Número de Contacto (solo números y debe tener 10 dígitos)
    if (!/^\d{10}$/.test(formData.number)) {
      erroresTemp.number = 'El número de contacto debe tener 10 dígitos';
      esValido = false;
    } else {
      erroresTemp.number = '';
    }

    // Validación de contraseña (no vacía)
    if (!formData.password) {
      erroresTemp.password = 'La contraseña no puede estar vacía';
      esValido = false;
    } else {
      erroresTemp.password = '';
    }

    setErrores(erroresTemp);
    return esValido;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (validarFormulario()) {
      try {
        // Construir el objeto de datos a enviar, incluyendo 'role' y mapeando los campos
        const dataToSend = {
          id: formData.id,
          name: formData.name,
          LastName: formData.LastName,
          email: formData.email,
          number: formData.number,
          password: formData.password,
          role: 'pasajero', // Añadir el rol automáticamente
          // Incluir 'photoUser' solo si existe
          ...(formData.photoUser && { photoUser: formData.photoUser })
        };

        await axios.post(`${api_URL}/register`, dataToSend, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        alert('Registro exitoso. Redirigiendo a la página de inicio de sesión.');
        navigate('/login');
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            // El servidor respondió con un estado fuera del rango de 2xx
            console.error('Error en el registro:', error.response.data.message);
            alert(`Error en el registro: ${error.response.data.message}`);
          } else if (error.request) {
            // La solicitud fue hecha pero no se recibió respuesta
            console.error('No se recibió respuesta del servidor.');
            alert('No se recibió respuesta del servidor. Por favor, intenta de nuevo más tarde.');
          } else {
            // Algo sucedió al configurar la solicitud que desencadenó un error
            console.error('Error al configurar la solicitud:', error.message);
            alert(`Error al configurar la solicitud: ${error.message}`);
          }
        } else {
          console.error('Error desconocido:', error);
          alert('Ocurrió un error desconocido. Por favor, intenta de nuevo.');
        }
      }
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  return (
    <div className="formulario">
      {/* Botón de regreso */}
      <button className="back-arrow" onClick={() => navigate('/perfil')}>
        ←
      </button>
      <div className="header_registro"></div>
      <div className="imagen-perfil-container" onClick={handleImageClick}>
        {imagenPerfil ? (
          <img src={imagenPerfil} alt="Perfil" className="imagen-perfil" />
        ) : (
          <img src={perfilPredefinido} alt="Perfil Predefinido" className="imagen-perfil" />
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden-input"
          onChange={handleImageUpload}
          accept="image/*"
        />
      </div>
      <h2>Editar  Perfil</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={errores.name ? 'input-error' : ''}
        />
        {errores.name && <p className="error">{errores.name}</p>}

        <input
          type="text"
          placeholder="Apellido"
          name="LastName" // Cambiado a 'LastName' con L mayúscula
          value={formData.LastName}
          onChange={handleChange}
          className={errores.LastName ? 'input-error' : ''}
        />
        {errores.LastName && <p className="error">{errores.LastName}</p>}

        <input
          type="text"
          placeholder="ID universidad"
          name="id"
          value={formData.id}
          onChange={handleChange}
          className={errores.id ? 'input-error' : ''}
        />
        {errores.id && <p className="error">{errores.id}</p>}

        <input
          type="email"
          placeholder="Correo institucional"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={errores.email ? 'input-error' : ''}
        />
        {errores.email && <p className="error">{errores.email}</p>}

        <input
          type="tel"
          placeholder="Número de contacto"
          name="number"
          value={formData.number}
          onChange={handleChange}
          className={errores.number ? 'input-error' : ''}
        />
        {errores.number && <p className="error">{errores.number}</p>}

        <input
          type="password"
          placeholder="Contraseña"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={errores.password ? 'input-error' : ''}
        />
        {errores.password && <p className="error">{errores.password}</p>}

        <button type="submit">Guardar</button>
      </form>
    </div>
  );
};

export default Registro;
