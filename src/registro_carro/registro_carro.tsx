import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './registro_carro.css'; // Aseguramos que la ruta del CSS es correcta
import masIcon from '../assets/+.png';

const AgregarVehiculo: React.FC = () => {
  const navigate = useNavigate();
  const [carImage, setCarImage] = useState<string | null>(null);
  const [soatImage, setSoatImage] = useState<string | null>(null);
  const [soatFileName, setSoatFileName] = useState<string | null>(null);
  const [soatExpiryDate, setSoatExpiryDate] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const carImageInputRef = useRef<HTMLInputElement | null>(null);
  const soatImageInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    vehiclePlate: '',
    passengerCapacity: '',
    vehicleBrand: '',
    vehicleModel: '',
  });

  // Información existente del vehículo (si aplica)
  useEffect(() => {
    // Aquí puedes cargar la información existente si estás editando
    // Por ahora, lo dejamos vacío para agregar un nuevo vehículo
  }, []);

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
    const selectedDate = new Date(soatExpiryDate);

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
    if (!soatExpiryDate || selectedDate <= today) {
      newErrors.soatExpiryDate = 'La fecha de vencimiento debe ser mayor a la fecha actual.';
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

  const handleGuardarCambios = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateInputs()) {
      // Aquí puedes implementar la lógica para agregar el vehículo
      alert('Vehículo agregado exitosamente.');
      navigate('/menu');
    }
  };

  return (
    <div className="registro_carro">
      <header className="header-registro">
        <button className="registro_carro_back-button" onClick={() => navigate('/menu')}>
          ←
        </button>
        <h1 className="letra-header-registro">Agregar vehículo</h1>
      </header>
      <div className="registro_carro_content">
        <div className="registro_carro_left-section">
          <div className="registro_carro_car-photo-container">
            {carImage && <img src={carImage} alt="Carro" className="registro_carro_car-image" />}
            <div className="registro_carro_photo-text-container">
              <p className="registro_carro_photo-text">Agregar foto del carro</p>
              <div
                className="registro_carro_add-photo-circular"
                onClick={() => carImageInputRef.current?.click()}
              >
                <img src={masIcon} alt="Agregar Foto" className="registro_carro_add-image-icon" />
              </div>
            </div>
            {errors.carImage && <p className="registro_carro_error">{errors.carImage}</p>}
            <input
              type="file"
              accept="image/*"
              ref={carImageInputRef}
              style={{ display: 'none' }}
              onChange={(e) => handleImageUpload(e, setCarImage)}
            />
          </div>
        </div>
        <div className="registro_carro_right-section">
          <form onSubmit={handleGuardarCambios} className="registro_carro_car-form">
            <input
              type="text"
              id="vehiclePlate"
              value={formData.vehiclePlate}
              onChange={handleInputChange}
              placeholder="Placa vehículo"
              className={`inputs-registro letrainpitstitulo_registro ${errors.vehiclePlate ? 'input-error' : ''}`}
              required
            />
            {errors.vehiclePlate && <p className="registro_carro_error">{errors.vehiclePlate}</p>}
            <input
              type="number"
              id="passengerCapacity"
              value={formData.passengerCapacity}
              onChange={handleInputChange}
              placeholder="Capacidad pasajeros"
              className="inputs-registro letrainpitstitulo_registro"
              required
            />
            <input
              type="text"
              id="vehicleBrand"
              value={formData.vehicleBrand}
              onChange={handleInputChange}
              placeholder="Marca vehículo"
              className={`inputs-registro letrainpitstitulo_registro ${errors.vehicleBrand ? 'input-error' : ''}`}
              required
            />
            {errors.vehicleBrand && <p className="registro_carro_error">{errors.vehicleBrand}</p>}
            <input
              type="number"
              id="vehicleModel"
              value={formData.vehicleModel}
              onChange={handleInputChange}
              placeholder="Modelo vehículo (año)"
              className={`inputs-registro letrainpitstitulo_registro ${errors.vehicleModel ? 'input-error' : ''}`}
              required
            />
            {errors.vehicleModel && <p className="registro_carro_error">{errors.vehicleModel}</p>}

            <label className="registro_carro_soat-expiry-label" htmlFor="soatExpiryDate">
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
              className={`inputs-registro letrainpitstitulo_registro ${errors.soatExpiryDate ? 'input-error' : ''}`}
              required
            />
            {errors.soatExpiryDate && <p className="registro_carro_error">{errors.soatExpiryDate}</p>}

            <p className="registro_carro_soat-label">Agregar foto del SOAT</p>
            <div
              className="registro_carro_add-photo-square"
              onClick={() => soatImageInputRef.current?.click()}
            >
              {soatImage ? (
                <span>Imagen subida: {soatFileName}</span>
              ) : (
                <span>Escoja un archivo</span>
              )}
            </div>
            {errors.soatImage && <p className="registro_carro_error">{errors.soatImage}</p>}
            <input
              type="file"
              accept="image/*"
              ref={soatImageInputRef}
              style={{ display: 'none' }}
              onChange={(e) => handleImageUpload(e, setSoatImage, setSoatFileName)}
            />

            <div className="registro_carro_button-container">
              <button type="submit" className="registro_carro_submit-button">
                Añadir Vehículo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgregarVehiculo;
