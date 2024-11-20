import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './registro_carro.css';
import masIcon from '../assets/+.png';
import axios from 'axios';

const api_URL = import.meta.env.VITE_API_URL;

const RegistroVehiculos: React.FC = () => {
  const navigate = useNavigate();
  const [carImage, setCarImage] = useState<string | null>(null);
  const [soatImage, setSoatImage] = useState<string | null>(null);
  const [soatFile, setSoatFile] = useState<File | null>(null);
  const [carFile, setCarFile] = useState<File | null>(null);
  const [soatExpiryDate, setSoatExpiryDate] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const carImageInputRef = useRef<HTMLInputElement | null>(null);
  const soatImageInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    carID: '',
    carPassengers: '',
    carBrand: '',
    carModel: '',
  });

  // Decodificar el token manualmente
  const getUserIdFromToken = (): string | null => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1]; // Obtener la parte del payload
        const payloadDecoded = JSON.parse(atob(payloadBase64)); // Decodificar Base64
        return payloadDecoded.userId || null; // Retornar userId si existe
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<string | null>>,
    setFile?: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      if (setFile) {
        setFile(file);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: '' }));
  };

  const validateInputs = () => {
    const plateRegex = /^[A-Za-z]{3}\d{3}$/;
    const brandRegex = /^[A-Za-z]+$/;
    const today = new Date();
    const selectedDate = new Date(soatExpiryDate);

    const newErrors: { [key: string]: string } = {};

    if (!plateRegex.test(formData.carID)) {
      newErrors.carID = 'La placa debe ser 3 letras y 3 números.';
    }
    if (!brandRegex.test(formData.carBrand)) {
      newErrors.carBrand = 'La marca solo puede contener letras.';
    }
    if (!formData.carModel || isNaN(Number(formData.carModel))) {
      newErrors.carModel = 'El modelo debe ser un año válido.';
    }
    if (!soatExpiryDate || selectedDate <= today) {
      newErrors.soatExpiryDate = 'La fecha de vencimiento debe ser mayor a la fecha actual.';
    }
    if (!carFile) {
      newErrors.carImage = 'Debe añadir una foto del carro.';
    }
    if (!soatFile) {
      newErrors.soatImage = 'Debe añadir una foto del SOAT.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateInputs()) {
      try {
        const userID = getUserIdFromToken(); // Extrae el userId del token
        if (!userID) {
          throw new Error('Usuario no autenticado');
        }

        // Validar y convertir campos numéricos
        const passengers = Number(formData.carPassengers);
        const modelYear = Number(formData.carModel);

        if (isNaN(passengers) || isNaN(modelYear)) {
          setErrors((prev) => ({
            ...prev,
            carPassengers: isNaN(passengers) ? 'Debe ser un número válido.' : '',
            carModel: isNaN(modelYear) ? 'Debe ser un número válido.' : '',
          }));
          return;
        }

        // Convertir fecha al formato DD-MM-YYYY
        const dateParts = soatExpiryDate.split('-'); // Divide la fecha YYYY-MM-DD
        const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // Reorganiza a DD-MM-YYYY

        const formDataToSend = new FormData();
        formDataToSend.append('carID', formData.carID);
        formDataToSend.append('photoCar', carFile as File);
        formDataToSend.append('carPassengers', passengers.toString());
        formDataToSend.append('photoSOAT', soatFile as File);
        formDataToSend.append('carBrand', formData.carBrand);
        formDataToSend.append('carModel', modelYear.toString());
        formDataToSend.append('soatExpiration', formattedDate); // Enviar la fecha corregida

        const response = await axios.post(`${api_URL}/car/${userID}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Envía el token si es necesario
          },
          withCredentials: true,
        });

        console.log('Car registered successfully:', response.data);
        navigate('/menu');
      } catch (error) {
        console.error('Error registering car:', error);
        if (axios.isAxiosError(error) && error.response) {
          console.error('Response error data:', error.response.data);
        }
      }
    }
  };

  return (
    <div className="registro_vehiculos">
      <header className="header-añadir">
        <button className="registro_vehiculos_back-button" onClick={() => navigate('/menu')}>
          ←
        </button>
        <h1 className="letra-header-añadir">Registro vehículo</h1>
      </header>
      <div className="registro_vehiculos_content">
        <div className="registro_vehiculos_left-section">
          <div className="registro_vehiculos_car-photo-container">
            {carImage && <img src={carImage} alt="Carro" className="registro_vehiculos_car-image" />}
            <div className="registro_vehiculos_photo-text-container">
              <p className="registro_vehiculos_photo-text">Añadir foto del carro</p>
              <div
                className="registro_vehiculos_add-photo-circular"
                onClick={() => carImageInputRef.current?.click()}
              >
                <img src={masIcon} alt="Añadir Foto" className="registro_vehiculos_add-image-icon" />
              </div>
            </div>
            {errors.carImage && <p className="registro_vehiculos_error">{errors.carImage}</p>}
            <input
              type="file"
              accept="image/*"
              ref={carImageInputRef}
              style={{ display: 'none' }}
              onChange={(e) => handleImageUpload(e, setCarImage, setCarFile)}
            />
          </div>
        </div>
        <div className="registro_vehiculos_right-section">
          <form onSubmit={handleSubmit} className="registro_vehiculos_car-form">
            <input
              type="text"
              id="carID"
              value={formData.carID}
              onChange={handleInputChange}
              placeholder="Placa vehículo"
              className={`inputs-añadir letrainpitstitulo_añadir ${errors.carID ? 'input-error' : ''}`}
              required
            />
            {errors.carID && <p className="registro_vehiculos_error">{errors.carID}</p>}
            <input
              type="number"
              id="carPassengers"
              value={formData.carPassengers}
              onChange={handleInputChange}
              placeholder="Capacidad pasajeros"
              className="inputs-añadir letrainpitstitulo_añadir"
              required
            />
            <input
              type="text"
              id="carBrand"
              value={formData.carBrand}
              onChange={handleInputChange}
              placeholder="Marca vehículo"
              className={`inputs-añadir letrainpitstitulo_añadir ${errors.carBrand ? 'input-error' : ''}`}
              required
            />
            {errors.carBrand && <p className="registro_vehiculos_error">{errors.carBrand}</p>}
            <input
              type="number"
              id="carModel"
              value={formData.carModel}
              onChange={handleInputChange}
              placeholder="Modelo vehículo (año)"
              className={`inputs-añadir letrainpitstitulo_añadir ${errors.carModel ? 'input-error' : ''}`}
              required
            />
            {errors.carModel && <p className="registro_vehiculos_error">{errors.carModel}</p>}

            <label className="registro_vehiculos_soat-expiry-label" htmlFor="soatExpiryDate">
              Fecha de vencimiento del SOAT
            </label>
            <input
              type="date"
              id="soatExpiryDate"
              value={soatExpiryDate}
              onChange={(e) => {
                setSoatExpiryDate(e.target.value);
                setErrors((prev) => ({ ...prev, soatExpiryDate: '' }));
              }}
              className={`inputs-añadir letrainpitstitulo_añadir ${errors.soatExpiryDate ? 'input-error' : ''}`}
              required
            />
            {errors.soatExpiryDate && <p className="registro_vehiculos_error">{errors.soatExpiryDate}</p>}

            <p className="registro_vehiculos_soat-label">Foto del SOAT</p>
            <div
              className="registro_vehiculos_add-photo-square"
              onClick={() => soatImageInputRef.current?.click()}
            >
              {soatImage ? (
                <span>Imagen subida</span>
              ) : (
                <span>Escoja un archivo</span>
              )}
            </div>
            {errors.soatImage && <p className="registro_vehiculos_error">{errors.soatImage}</p>}
            <input
              type="file"
              accept="image/*"
              ref={soatImageInputRef}
              style={{ display: 'none' }}
              onChange={(e) => handleImageUpload(e, setSoatImage, setSoatFile)}
            />
            <button type="submit" className="registro_vehiculos_submit-button">Añadir vehículo</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistroVehiculos;
