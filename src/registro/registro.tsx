import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import './registro.css';
import perfilPredefinido from '../assets/perfil_predefinido.png';

const Registro: React.FC = () => {
  const [imagenPerfil, setImagenPerfil] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',           // Nombre del estudiante
    lastName: '',       // Apellido del estudiante
    id: '',             // ID de la universidad
    email: '',          // Correo del usuario
    number: '',         // Número de contacto
    password: ''        // Contraseña
  });
  const [errores, setErrores] = useState({
    name: '',           // Nombre del estudiante
    lastName: '',       // Apellido del estudiante
    id: '',             // ID de la universidad
    email: '',          // Correo del usuario
    number: '',         // Número de contacto
    password: ''        // Contraseña
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate(); // Inicializar useNavigate

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

    // Validación de Nombre y Apellido (no deben contener números)
    if (!formData.name || /\d/.test(formData.name)) {
      erroresTemp.name = 'El nombre no debe contener números';
      esValido = false;
    } else {
      erroresTemp.name = '';
    }

    if (!formData.lastName || /\d/.test(formData.lastName)) {
      erroresTemp.lastName = 'El apellido no debe contener números';
      esValido = false;
    } else {
      erroresTemp.lastName = '';
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (validarFormulario()) {
      console.log('Formulario enviado:', formData);
      navigate('/Principal');
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
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className={errores.lastName ? 'input-error' : ''}
        />
        {errores.lastName && <p className="error">{errores.lastName}</p>}

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

        <button type="submit">Registrar</button>
      </form>
    </div>
  );
};

export default Registro;