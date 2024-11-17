import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './editar_carro.css';
import masIcon from '../assets/+.png';

const EditarVehiculo: React.FC = () => {
  const navigate = useNavigate();
  const [carImage, setCarImage] = useState<string | null>(null);
  const [soatImage, setSoatImage] = useState<string | null>(null);
  const [soatFileName, setSoatFileName] = useState<string | null>(null);
  const [soatExpiryDate, setSoatExpiryDate] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const carImageInputRef = useRef<HTMLInputElement | null>(null);
  const soatImageInputRef = useRef<HTMLInputElement | null>(null);

  // Información existente del vehículo (simulada)
  const existingVehicleData = {
    vehiclePlate: 'ABC123',
    passengerCapacity: '4',
    vehicleBrand: 'Toyota',
    vehicleModel: '2020',
    soatExpiryDate: '2025-12-31',
    carImage: null, // Puedes poner una URL de imagen si tienes una
    soatImage: null, // Puedes poner una URL de imagen si tienes una
  };

  const [formData, setFormData] = useState({
    vehiclePlate: existingVehicleData.vehiclePlate,
    passengerCapacity: existingVehicleData.passengerCapacity,
    vehicleBrand: existingVehicleData.vehicleBrand,
    vehicleModel: existingVehicleData.vehicleModel,
  });

  // Prellenar la fecha de vencimiento del SOAT
  React.useEffect(() => {
    setSoatExpiryDate(existingVehicleData.soatExpiryDate);
    setCarImage(existingVehicleData.carImage);
    setSoatImage(existingVehicleData.soatImage);
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
      // Aquí puedes implementar la lógica para guardar los cambios
      alert('Cambios guardados exitosamente.');
      navigate('/menu');
    }
  };

  const handleEliminarVehiculo = () => {
    // Aquí puedes implementar la lógica para eliminar el vehículo
    alert('Vehículo eliminado.');
    navigate('/menu');
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
            {errors.vehicleBrand && <p className="editar_vehiculo_error">{errors.vehicleBrand}</p>}
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
            {errors.vehicleModel && <p className="editar_vehiculo_error">{errors.vehicleModel}</p>}

            <label className="editar_vehiculo_soat-expiry-label" htmlFor="soatExpiryDate">
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
              className={`inputs-editar letrainpitstitulo_editar ${
                errors.soatExpiryDate ? 'input-error' : ''
              }`}
              required
            />
            {errors.soatExpiryDate && <p className="editar_vehiculo_error">{errors.soatExpiryDate}</p>}

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
              <button
                type="button"
                className="editar_vehiculo_delete-button"
                onClick={handleEliminarVehiculo}
              >
                Eliminar vehículo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarVehiculo;
