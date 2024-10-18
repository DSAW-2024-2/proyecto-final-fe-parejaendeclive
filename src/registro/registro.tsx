import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import './registro.css';
import perfilPredefinido from '../assets/perfil_predefinido.png';

const Registro: React.FC = () => {
  const [imagenPerfil, setImagenPerfil] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    idUniversidad: '',
    correo: '',
    numeroContacto: '',
    contraseña: ''
  });
  const [errores, setErrores] = useState({
    nombre: '',
    apellido: '',
    idUniversidad: '',
    correo: '',
    numeroContacto: '',
    contraseña: ''
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
    if (!formData.nombre || /\d/.test(formData.nombre)) {
      erroresTemp.nombre = 'El nombre no debe contener números';
      esValido = false;
    } else {
      erroresTemp.nombre = '';
    }

    if (!formData.apellido || /\d/.test(formData.apellido)) {
      erroresTemp.apellido = 'El apellido no debe contener números';
      esValido = false;
    } else {
      erroresTemp.apellido = '';
    }

    // Validación de ID Universidad (debe tener 10 dígitos y empezar con 4 ceros)
    if (!/^[0]{4}\d{6}$/.test(formData.idUniversidad)) {
      erroresTemp.idUniversidad = 'El ID debe contener 10 números y comenzar con 4 ceros';
      esValido = false;
    } else {
      erroresTemp.idUniversidad = '';
    }

    // Validación de correo (debe ser un correo válido)
    if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      erroresTemp.correo = 'Debe ser un correo electrónico válido';
      esValido = false;
    } else {
      erroresTemp.correo = '';
    }

    // Validación de Número de Contacto (solo números y debe tener 10 dígitos)
    if (!/^\d{10}$/.test(formData.numeroContacto)) {
      erroresTemp.numeroContacto = 'El número de contacto debe tener 10 dígitos';
      esValido = false;
    } else {
      erroresTemp.numeroContacto = '';
    }

    // Validación de contraseña (no vacía)
    if (!formData.contraseña) {
      erroresTemp.contraseña = 'La contraseña no puede estar vacía';
      esValido = false;
    } else {
      erroresTemp.contraseña = '';
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
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className={errores.nombre ? 'input-error' : ''}
        />
        {errores.nombre && <p className="error">{errores.nombre}</p>}

        <input
          type="text"
          placeholder="Apellido"
          name="apellido"
          value={formData.apellido}
          onChange={handleChange}
          className={errores.apellido ? 'input-error' : ''}
        />
        {errores.apellido && <p className="error">{errores.apellido}</p>}

        <input
          type="text"
          placeholder="ID universidad"
          name="idUniversidad"
          value={formData.idUniversidad}
          onChange={handleChange}
          className={errores.idUniversidad ? 'input-error' : ''}
        />
        {errores.idUniversidad && <p className="error">{errores.idUniversidad}</p>}

        <input
          type="email"
          placeholder="Correo institucional"
          name="correo"
          value={formData.correo}
          onChange={handleChange}
          className={errores.correo ? 'input-error' : ''}
        />
        {errores.correo && <p className="error">{errores.correo}</p>}

        <input
          type="tel"
          placeholder="Número de contacto"
          name="numeroContacto"
          value={formData.numeroContacto}
          onChange={handleChange}
          className={errores.numeroContacto ? 'input-error' : ''}
        />
        {errores.numeroContacto && <p className="error">{errores.numeroContacto}</p>}

        <input
          type="password"
          placeholder="Contraseña"
          name="contraseña"
          value={formData.contraseña}
          onChange={handleChange}
          className={errores.contraseña ? 'input-error' : ''}
        />
        {errores.contraseña && <p className="error">{errores.contraseña}</p>}

        <button type="submit">Registrar</button>
      </form>
    </div>
  );
};

export default Registro;