import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './editar_carro.css';
import masIcon from '../assets/+.png';
import axios from 'axios';

const api_URL = import.meta.env.VITE_API_URL;

const EditarVehiculo: React.FC = () => {
  const navigate = useNavigate();
  const [carImage, setCarImage] = useState<string | null>(null);
  const [soatImage, setSoatImage] = useState<string | null>(null);
  const [soatFileName, setSoatFileName] = useState<string | null>(null);
  const [soatExpiryDate, setSoatExpiryDate] = useState<string>(''); // Mantiene DD-MM-YYYY
  const [inputDate, setInputDate] = useState<string>(''); // Para YYYY-MM-DD
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [carId, setCarId] = useState<string | null>(null);

  const carImageInputRef = useRef<HTMLInputElement | null>(null);
  const soatImageInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    vehiclePlate: '',
    passengerCapacity: '',
    vehicleBrand: '',
    vehicleModel: '',
  });

  // Obtener información del vehículo
  useEffect(() => {
    const fetchCarData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('No se encontró el token de autenticación.');
          navigate('/');
          return;
        }

        const { userId } = JSON.parse(atob(token.split('.')[1])); // Decodificar el token

        // Solicitar información del usuario
        const response = await axios.get(`${api_URL}/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { carIDs } = response.data.data;

        if (!carIDs || carIDs.length === 0) {
          alert('No se encontró información del vehículo.');
          navigate('/menu');
          return;
        }

        const carID = carIDs[0]; // Usar el primer carro asociado
        setCarId(carID);

        // Solicitar información del vehículo usando el carID
        const carResponse = await axios.get(`${api_URL}/car/${carID}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const carData = carResponse.data.data;

        console.log('Datos del vehículo:', carData);

        // Prellenar los datos del vehículo
        setFormData({
          vehiclePlate: carData.carID || '',
          passengerCapacity: carData.carPassengers.toString() || '',
          vehicleBrand: carData.carBrand || '',
          vehicleModel: carData.carModel || '',
        });

        // Mantener el formato original y convertir al formato de entrada para <input type="date">
        const convertDateToInputFormat = (date: string): string => {
          const [day, month, year] = date.split('-');
          return `${year}-${month}-${day}`;
        };

        setSoatExpiryDate(carData.soatExpiration || ''); // Mantener DD-MM-YYYY
        setInputDate(convertDateToInputFormat(carData.soatExpiration || '')); // Convertir a YYYY-MM-DD
        setCarImage(carData.photoCar || null);
        setSoatImage(carData.photoSOAT || null);
      } catch (error) {
        console.error('Error al obtener información del vehículo:', error);
        alert('Error al cargar los datos del vehículo.');
        navigate('/menu');
      }
    };

    fetchCarData();
  }, [navigate]);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<string | null>>,
    setFileName?: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      if (setFileName) {
        setFileName(file.name);
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
    const selectedDate = new Date(inputDate);

    const newErrors: { [key: string]: string } = {};

    if (!plateRegex.test(formData.vehiclePlate)) {
      newErrors.vehiclePlate = 'La placa debe ser 3 letras y 3 números.';
    }
    if (!brandRegex.test(formData.vehicleBrand)) {
      newErrors.vehicleBrand = 'La marca solo puede contener letras.';
    }
    if (!formData.vehicleModel || isNaN(Number(formData.vehicleModel))) {
      newErrors.vehicleModel = 'El modelo debe ser un año válido.';
    }
    if (!inputDate || selectedDate <= today) {
      newErrors.soatExpiryDate = 'La fecha de vencimiento debe ser mayor a la fecha actual.';
    }
    if (!soatExpiryDate) {
      newErrors.soatExpiryDate = 'La fecha de vencimiento es obligatoria.';
    }
    if (!carImage) {
      newErrors.carImage = 'Debe añadir una foto del carro.';
    }
    if (!soatImage) {
      newErrors.soatImage = 'Debe añadir una foto del SOAT.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleGuardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateInputs() && carId) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('No se encontró el token de autenticación.');
          navigate('/');
          return;
        }
  
        // Diagnóstico: Verifica el token
        console.log('Token usado:', token);
  
        const convertInputDateToOriginalFormat = (date: string): string => {
          const [year, month, day] = date.split('-');
          return `${day}-${month}-${year}`;
        };
  
        await axios.put(
          `${api_URL}/car/${carId}`,
          {
            carID: formData.vehiclePlate,
            photoCar: carImage,
            carPassengers: formData.passengerCapacity,
            photoSOAT: soatImage,
            carBrand: formData.vehicleBrand,
            carModel: formData.vehicleModel,
            soatExpiration: convertInputDateToOriginalFormat(inputDate),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        alert('Cambios guardados exitosamente.');
        navigate('/menu');
      } catch (error: any) {
        console.error('Error al guardar los cambios:', error);
  
        // Diagnóstico: Si el backend devuelve detalles, los mostramos
        if (error.response) {
          console.error('Respuesta del servidor:', error.response.data);
        }
  
        alert('Error al guardar los cambios.');
      }
    }
  };
  return (
    <div className="editar_vehiculo">
      <header className="header-editar">
        <button className="editar_vehiculo_back-button" onClick={() => navigate('/menu')}>
          ←
        </button>
        <h1 className="letra-header-editar">Editar vehículo</h1>
      </header>
      <div className="editar_vehiculo_content">
        <div className="editar_vehiculo_left-section">
          <div className="editar_vehiculo_car-photo-container">
            {carImage && <img src={carImage} alt="Carro" className="editar_vehiculo_car-image" />}
            <div className="editar_vehiculo_photo-text-container">
              <p className="editar_vehiculo_photo-text">Editar foto del carro</p>
              <div
                className="editar_vehiculo_add-photo-circular"
                onClick={() => carImageInputRef.current?.click()}
              >
                <img src={masIcon} alt="Editar Foto" className="editar_vehiculo_add-image-icon" />
              </div>
            </div>
            {errors.carImage && <p className="editar_vehiculo_error">{errors.carImage}</p>}
            <input
              type="file"
              accept="image/*"
              ref={carImageInputRef}
              style={{ display: 'none' }}
              onChange={(e) => handleImageUpload(e, setCarImage)}
            />
          </div>
        </div>
        <div className="editar_vehiculo_right-section">
          <form onSubmit={handleGuardarCambios} className="editar_vehiculo_car-form">
            <input
              type="text"
              id="vehiclePlate"
              value={formData.vehiclePlate}
              onChange={handleInputChange}
              placeholder="Placa vehículo"
              className={`inputs-editar letrainpitstitulo_editar ${
                errors.vehiclePlate ? 'input-error' : ''
              }`}
              required
            />
            {errors.vehiclePlate && <p className="editar_vehiculo_error">{errors.vehiclePlate}</p>}
            <input
              type="number"
              id="passengerCapacity"
              value={formData.passengerCapacity}
              onChange={handleInputChange}
              placeholder="Capacidad pasajeros"
              className="inputs-editar letrainpitstitulo_editar"
              required
            />
            {errors.passengerCapacity && (
              <p className="editar_vehiculo_error">{errors.passengerCapacity}</p>
            )}
            <input
              type="text"
              id="vehicleBrand"
              value={formData.vehicleBrand}
              onChange={handleInputChange}
              placeholder="Marca vehículo"
              className={`inputs-editar letrainpitstitulo_editar ${
                errors.vehicleBrand ? 'input-error' : ''
              }`}
              required
            />
            {errors.vehicleBrand && (
              <p className="editar_vehiculo_error">{errors.vehicleBrand}</p>
            )}
            <input
              type="number"
              id="vehicleModel"
              value={formData.vehicleModel}
              onChange={handleInputChange}
              placeholder="Modelo vehículo (año)"
              className={`inputs-editar letrainpitstitulo_editar ${
                errors.vehicleModel ? 'input-error' : ''
              }`}
              required
            />
            {errors.vehicleModel && (
              <p className="editar_vehiculo_error">{errors.vehicleModel}</p>
            )}

            <label className="editar_vehiculo_soat-expiry-label" htmlFor="soatExpiryDate">
              Fecha de vencimiento del SOAT
            </label>
            <input
              type="date"
              id="soatExpiryDate"
              value={inputDate} // YYYY-MM-DD para el navegador
              onChange={(e) => {
                setInputDate(e.target.value); // Almacenar en formato YYYY-MM-DD
                const [year, month, day] = e.target.value.split('-');
                setSoatExpiryDate(`${day}-${month}-${year}`); // Convertir al formato DD-MM-YYYY
              }}
              className={`inputs-editar letrainpitstitulo_editar ${errors.soatExpiryDate ? 'input-error' : ''}`}
              required
            />
            {errors.soatExpiryDate && (
              <p className="editar_vehiculo_error">{errors.soatExpiryDate}</p>
            )}

            <p className="editar_vehiculo_soat-label">Editar foto del SOAT</p>
            <div
              className="editar_vehiculo_add-photo-square"
              onClick={() => soatImageInputRef.current?.click()}
            >
              {soatImage ? (
                <span>Imagen subida: {soatFileName}</span>
              ) : (
                <span>Escoja un archivo</span>
              )}
            </div>
            {errors.soatImage && <p className="editar_vehiculo_error">{errors.soatImage}</p>}
            <input
              type="file"
              accept="image/*"
              ref={soatImageInputRef}
              style={{ display: 'none' }}
              onChange={(e) => handleImageUpload(e, setSoatImage, setSoatFileName)}
            />

            <div className="editar_vehiculo_button-container">
              <button type="submit" className="editar_vehiculo_submit-button">
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarVehiculo;
