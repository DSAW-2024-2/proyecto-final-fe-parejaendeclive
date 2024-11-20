import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './editar_perfil.css';
import perfilPredefinido from '../assets/perfil_predefinido.png';
import axios from 'axios';

const api_URL = import.meta.env.VITE_API_URL;

interface MyUglyFormData {
  name: string;
  LastName: string;
  idUser: string;
  email: string;
  number: string;
  password?: string;
  photoUser?: string;
}

const EditarPerfil: React.FC = () => {
  const [imagenPerfil, setImagenPerfil] = useState<string | null>(null);
  const [formData, setFormData] = useState<MyUglyFormData>({
    name: '',
    LastName: '',
    idUser: '',
    email: '',
    number: '',
    password: '',
    photoUser: '',
  });
  const [errores, setErrores] = useState({
    name: '',
    LastName: '',
    idUser: '',
    email: '',
    number: '',
    password: '',
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          const payloadBase64 = token.split('.')[1];
          const decodedPayload = JSON.parse(atob(payloadBase64));
          const userId = decodedPayload.userId;

          const response = await axios.get(`${api_URL}/user/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          });

          if (response.status === 200) {
            const userData = response.data.data;
            setFormData({
              name: userData.name,
              LastName: userData.LastName,
              idUser: userData.idUser,
              email: userData.email,
              number: userData.number,
              password: '',
              photoUser: userData.photoUser || '',
            });
            setImagenPerfil(userData.photoUser || null);
          }
        } catch (error) {
          console.error('Error al obtener la información del usuario:', error);
        }
      } else {
        console.error('Token no encontrado');
      }
    };

    fetchUserData();
  }, []);

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
    const erroresTemp = { ...errores };

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

    setErrores(erroresTemp);
    return esValido;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (validarFormulario()) {
      try {
        const payloadBase64 = token?.split('.')[1] || '';
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const userId = decodedPayload.userId;
  
        if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files[0]) {
          const formDataToSend = new FormData();
          formDataToSend.append('name', formData.name);
          formDataToSend.append('LastName', formData.LastName);
          formDataToSend.append('idUser', formData.idUser);
          formDataToSend.append('email', formData.email);
          formDataToSend.append('number', formData.number);
          formDataToSend.append('photoUser', fileInputRef.current.files[0]);
  
          // Logs para verificar FormData
          for (let [key, value] of formDataToSend.entries()) {
            console.log(`${key}:`, value);
          }
  
          const response = await axios.put(`${api_URL}/user/${userId}`, formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          });
  
          if (response.status === 200) {
            alert('Perfil actualizado exitosamente.');
            navigate('/perfil');
          }
        } else {
          const response = await axios.put(`${api_URL}/user/${userId}`, formData, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
  
          if (response.status === 200) {
            alert('Perfil actualizado exitosamente.');
            navigate('/perfil');
          }
        }
      } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        alert('Ocurrió un error al actualizar el perfil.');
      }
    }
  };
  

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="formulario">
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
      <h2>Editar Perfil</h2>

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
          disabled
        />
        <input
          type="email"
          placeholder="Correo institucional"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="tel"
          placeholder="Número de contacto"
          name="number"
          value={formData.number}
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="Contraseña"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
        <button type="submit">Guardar</button>
      </form>
    </div>
  );
};

export default EditarPerfil;
