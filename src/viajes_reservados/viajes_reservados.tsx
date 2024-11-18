import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './viajes_reservados.css';

interface Viaje {
  id: number;
  inicio: string;
  final: string;
  hora: string;
  fecha: string;
  tarifa: number;
  cupos: number;
  placa: string;
  ruta: string; // Nuevo campo para la ruta
  telefono: string;
  estado: 'En curso' | 'Finalizado';
  paradas: string[];
}

const ViajesReservados = () => {
  const navigate = useNavigate();
  const [viajes] = useState<Viaje[]>([
    {
      id: 1,
      inicio: 'Terminal Norte',
      final: 'Universidad',
      hora: '08:00',
      fecha: '2024-11-14',
      tarifa: 5000,
      cupos: 2,
      placa: 'ABC123',
      ruta: 'Ruta detallada del viaje 1.',
      telefono: '3101234567',
      estado: 'En curso',
      paradas: ['Parada 1', 'Parada 2'],
    },
    {
      id: 2,
      inicio: 'Parque Central',
      final: 'Centro de Convenciones',
      hora: '09:00',
      fecha: '2024-11-14',
      tarifa: 4500,
      cupos: 1,
      placa: 'XYZ789',
      ruta: 'Ruta detallada del viaje 2.',
      telefono: '3107654321',
      estado: 'Finalizado',
      paradas: ['Parada A', 'Parada B'],
    },
  ]);
  const [viajeSeleccionado, setViajeSeleccionado] = useState<Viaje | null>(null);

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
                  <p><strong>Inicio:</strong> {viaje.inicio}</p>
                  <p><strong>Final:</strong> {viaje.final}</p>
                  <p><strong>Hora:</strong> {viaje.hora}</p>
                  <p><strong>Fecha:</strong> {viaje.fecha}</p>
                  <p><strong>Tarifa:</strong> ${viaje.tarifa}</p>
                  <p><strong>Cupos:</strong> {viaje.cupos}</p>
                  <p><strong>Placa:</strong> {viaje.placa}</p>
                  <p><strong>Ruta:</strong> {viaje.ruta}</p>
                  <p><strong>Teléfono:</strong> {viaje.telefono}</p>
                  <button
                    className={`button-estado-viajes ${
                      viaje.estado === 'En curso' ? 'en-curso' : 'finalizado'
                    }`}
                    onClick={() => handleOpenModal(viaje)}
                  >
                    {viaje.estado}
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
                <input type="text" value={viajeSeleccionado.inicio} readOnly className="input-highlight-viajes" />
              </div>
              <div className="form-group-viajes">
                <label>Final viaje:</label>
                <input type="text" value={viajeSeleccionado.final} readOnly className="input-highlight-viajes" />
              </div>
            </div>
            <div className="form-row-viajes">
              <div className="form-group-viajes">
                <label>Hora inicio:</label>
                <input type="text" value={viajeSeleccionado.hora} readOnly className="input-highlight-viajes" />
              </div>
              <div className="form-group-viajes">
                <label>Fecha salida:</label>
                <input type="text" value={viajeSeleccionado.fecha} readOnly className="input-highlight-viajes" />
              </div>
            </div>
            <div className="form-row-viajes">
              <div className="form-group-viajes">
                <label>Tarifa:</label>
                <input type="text" value={`$${viajeSeleccionado.tarifa}`} readOnly className="input-highlight-viajes" />
              </div>
              <div className="form-group-viajes">
                <label>Cupos disponibles:</label>
                <input type="text" value={`${viajeSeleccionado.cupos} cupos`} readOnly className="input-highlight-viajes" />
              </div>
            </div>
            <div className="form-row-viajes">
              <div className="form-group-viajes">
                <label>Placa:</label>
                <input type="text" value={viajeSeleccionado.placa} readOnly className="input-highlight-viajes" />
              </div>
              <div className="form-group-viajes">
                <label>Ruta:</label>
                <textarea value={viajeSeleccionado.ruta} readOnly className="input-highlight-viajes textarea-ruta" />
              </div>
            </div>
            <div className="form-row-viajes">
              <div className="form-group-viajes">
                <label>Número de Teléfono:</label>
                <input type="tel" value={viajeSeleccionado.telefono} readOnly className="input-highlight-viajes" />
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
