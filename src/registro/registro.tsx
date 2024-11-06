import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './registro.css';
import perfilPredefinido from '../assets/perfil_predefinido.png';
import axios from 'axios';

const api_URL = import.meta.env.VITE_API_URL;


interface MyUglyFormData {
  name: string;           // Nombre del estudiante
  LastName: string;       // Apellido del estudiante
  idUser: string;             // ID de la universidad
  email: string;          // Correo del usuario
  number: string;         // Número de contacto
  password: string;
  photoUser?: string;
}

const Registro: React.FC = () => {
  const [imagenPerfil, setImagenPerfil] = useState<string | null>(null);
  const [formData, setFormData] = useState<MyUglyFormData>({
    name: '',       // Inicializado como cadena vacía
    LastName: '',   // Inicializado como cadena vacía
    idUser: '',         // Inicializado como cadena vacía
    email: '',      // Inicializado como cadena vacía
    number: '',     // Inicializado como cadena vacía
    password: '',   // Inicializado como cadena vacía
    photoUser: ''   // Inicialización opcional
  });
  const [errores, setErrores] = useState({
    name: '',
    LastName: '',
    idUser: '',
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
        setImagenPerfil(reader.result as string);
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

    if (!/^[0]{4}\d{6}$/.test(formData.idUser)) {
      erroresTemp.idUser = 'El ID debe contener 10 números y comenzar con 4 ceros';
      esValido = false;
    } else {
      erroresTemp.idUser = '';
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      erroresTemp.email = 'Debe ser un correo electrónico válido';
      esValido = false;
    } else {
      erroresTemp.email = '';
    }

    if (!/^\d{10}$/.test(formData.number)) {
      erroresTemp.number = 'El número de contacto debe tener 10 dígitos';
      esValido = false;
    } else {
      erroresTemp.number = '';
    }

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
        let newFormData = { ...formData };

        if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files[0]) {
          newFormData = {
            ...formData,
            photoUser: fileInputRef.current.files[0].name || ''
          }
        }
        console.log("API URL:", api_URL);

        await axios.post(`${api_URL}/register`, newFormData, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        });
        navigate('/login');
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Error de Axios en el registro:', error.toJSON());
          if (error.response) {
            console.error('Respuesta del servidor:', error.response.data);
          } else if (error.request) {
            console.error('No se recibió respuesta del servidor:', error.request);
          } else {
            console.error('Error al configurar la solicitud:', error.message);
          }
        } else {
          console.error('Error desconocido:', error);
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
      <button className="back-arrow" onClick={() => navigate('/Principal')}>
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
      <h2>Registro usuario</h2>
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
          name="LastName"
          value={formData.LastName}
          onChange={handleChange}
          className={errores.LastName ? 'input-error' : ''}
        />
        {errores.LastName && <p className="error">{errores.LastName}</p>}

        <input
          type="text"
          placeholder="ID universidad"
          name="idUser"
          value={formData.idUser}
          onChange={handleChange}
          className={errores.idUser ? 'input-error' : ''}
        />
        {errores.idUser && <p className="error">{errores.idUser}</p>}

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

        <button type="submit">Registrar</button>
      </form>
    </div>
  );
};

export default Registro;
