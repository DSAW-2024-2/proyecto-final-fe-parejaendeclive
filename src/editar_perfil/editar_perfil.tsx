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
    photoUser: ''
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
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    // Obtener la información del usuario al cargar la página
    const fetchUserData = async () => {
      
      if (token) {
        try {
          // Decodificar el token manualmente para obtener el userId
          const payloadBase64 = token.split('.')[1];
          const decodedPayload = JSON.parse(atob(payloadBase64));
          const userId = decodedPayload.userId;

          // Realizar la solicitud GET al backend con el userId
          const response = await axios.get(`${api_URL}/user/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            withCredentials: true
          });

          if (response.status === 200) {
            const userData = response.data.data;
            setFormData({
              name: userData.name,
              LastName: userData.LastName,
              idUser: userData.idUser,
              email: userData.email,
              number: userData.number,
              password: '', // Por razones de seguridad, no mostramos la contraseña original
              photoUser: userData.photoUser || ''
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
          };
        }
        if(token){
          const payloadBase64 = token.split('.')[1];
          const decodedPayload = JSON.parse(atob(payloadBase64));
          const userId = decodedPayload.userId;
        
        await axios.put(`${api_URL}/user/${userId}`, newFormData, {
          
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        });
      }
        alert('Perfil actualizado exitosamente.');
        navigate('/perfil');
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Error de Axios al actualizar perfil:', error.toJSON());
          if (error.response) {
            console.error('Respuesta del servidor:', error.response.data);
            alert(`Error en la actualización: ${error.response.data.message}`);
          } else if (error.request) {
            console.error('No se recibió respuesta del servidor:', error.request);
            alert('No se recibió respuesta del servidor. Por favor, intenta de nuevo más tarde.');
          } else {
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
          className={errores.idUser ? 'input-error' : ''}
          disabled // Desactivar para que el usuario no pueda cambiar su ID
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

        <button type="submit">Guardar</button>
      </form>
    </div>
  );
};

export default EditarPerfil;
