import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './viajes_reservados.css';
const api_URL = import.meta.env.VITE_API_URL;
interface Viaje {
  id: number;
  startTrip: string;
  endTrip: string;
  timeTrip: string;
  date: string;
  tarifa: number;
  availablePlaces: number;
  carID: string;
  route: string;
  number: string;
  status: 'En curso' | 'Finalizado';
  paradas: string[];
}

const decodeToken = (token: string): any => {
  const payload = token.split('.')[1];
  const decodedPayload = atob(payload);
  return JSON.parse(decodedPayload);
};

const ViajesReservados = () => {
  const navigate = useNavigate();
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [viajeSeleccionado, setViajeSeleccionado] = useState<Viaje | null>(null);

  useEffect(() => {
    const fetchViajes = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no encontrado');
        
        const userId = decodeToken(token).userId;

        const response = await fetch(`${api_URL}/trips/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Error al obtener viajes');

        const data = await response.json();
        const userTrips = data.trips.map((trip: any) => ({
          id: trip.id,
          startTrip: trip.startTrip,
          endTrip: trip.endTrip,
          timeTrip: trip.timeTrip,
          date: trip.date,
          tarifa: trip.priceTrip,
          availablePlaces: trip.availablePlaces,
          carID: trip.carID,
          route: trip.route,
          number: trip.number,
          status: trip.status === 'available' ? 'En curso' : 'Finalizado',
          paradas: trip.reservedBy.find((r: any) => r.userID === userId)?.stops || [],
        }));
        setViajes(userTrips);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchViajes();
  }, []);

  const handleBack = () => navigate('/menu');
  const handleOpenModal = (viaje: Viaje) => setViajeSeleccionado(viaje);
  const handleCloseModal = () => setViajeSeleccionado(null);

  return (
    <div className="viajes-reservados-container">
      <header className="header-viajes-reservados">
        <button className="back-button" onClick={handleBack} aria-label="Regresar">
          ←
        </button>
        <h1 className="header-title">Viajes Reservados</h1>
      </header>

      <div className="main-content-viajes">
        <div className="viajes-section-viajes">
          <ul className="viajes-list-viajes">
            {viajes.map((viaje) => (
              <li key={viaje.id} className="viaje-item-viajes">
                <div>
                  <p><strong>Inicio:</strong> {viaje.startTrip}</p>
                  <p><strong>Final:</strong> {viaje.endTrip}</p>
                  <p><strong>Hora:</strong> {viaje.timeTrip}</p>
                  <p><strong>Fecha:</strong> {viaje.date}</p>
                  <p><strong>Tarifa:</strong> ${viaje.tarifa}</p>
                  <p><strong>Cupos:</strong> {viaje.availablePlaces}</p>
                  <p><strong>Placa:</strong> {viaje.carID}</p>
                  <p><strong>Ruta:</strong> {viaje.route}</p>
                  <p><strong>Teléfono:</strong> {viaje.number}</p>
                  <button
                    className={`button-status-viajes ${
                      viaje.status === 'En curso' ? 'en-curso' : 'finalizado'
                    }`}
                    onClick={() => handleOpenModal(viaje)}
                  >
                    {viaje.status}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {viajeSeleccionado && (
        <div className="modal-overlay-viajes" onClick={handleCloseModal}>
          <div className="modal-content-viajes" onClick={(e) => e.stopPropagation()}>
            <h3>Detalles del viaje</h3>
            <div className="form-row-viajes">
              <div className="form-group-viajes">
                <label>Inicio viaje:</label>
                <input type="text" value={viajeSeleccionado.startTrip} readOnly className="input-highlight-viajes" />
              </div>
              <div className="form-group-viajes">
                <label>Final viaje:</label>
                <input type="text" value={viajeSeleccionado.endTrip} readOnly className="input-highlight-viajes" />
              </div>
            </div>
            <div className="form-row-viajes">
              <div className="form-group-viajes">
                <label>Hora:</label>
                <input type="text" value={viajeSeleccionado.timeTrip} readOnly className="input-highlight-viajes" />
              </div>
              <div className="form-group-viajes">
                <label>Fecha:</label>
                <input type="text" value={viajeSeleccionado.date} readOnly className="input-highlight-viajes" />
              </div>
            </div>
            <div className="form-row-viajes">
              <div className="form-group-viajes">
                <label>Tarifa:</label>
                <input type="text" value={`$${viajeSeleccionado.tarifa}`} readOnly className="input-highlight-viajes" />
              </div>
              <div className="form-group-viajes">
                <label>Cupos disponibles:</label>
                <input type="text" value={`${viajeSeleccionado.availablePlaces}`} readOnly className="input-highlight-viajes" />
              </div>
            </div>
            <div className="form-row-viajes">
              <div className="form-group-viajes">
                <label>Placa:</label>
                <input type="text" value={viajeSeleccionado.carID} readOnly className="input-highlight-viajes" />
              </div>
              <div className="form-group-viajes">
                <label>Ruta:</label>
                <textarea value={viajeSeleccionado.route} readOnly className="input-highlight-viajes textarea-route" />
              </div>
            </div>
            <div className="form-row-viajes">
              <div className="form-group-viajes">
                <label>Número de Teléfono:</label>
                <input type="tel" value={viajeSeleccionado.number} readOnly className="input-highlight-viajes" />
              </div>
            </div>

            <div className="form-group-viajes">
              <label>Paradas:</label>
              <ul className="paradas-list-viajes">
                {viajeSeleccionado.paradas.map((parada, index) => (
                  <li key={index}>{parada}</li>
                ))}
              </ul>
            </div>

            <div className="button-container-viajes">
              <button className="button-primary-viajes">Cancelar viaje</button>
              <button className="button-secondary-viajes" onClick={handleCloseModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViajesReservados;
