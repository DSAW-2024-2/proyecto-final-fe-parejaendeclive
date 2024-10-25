// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './principal.css';
import Registro from './registro/registro'; 
import Login from './inicio_sesion/inicio_sesion';
import Pasajero from './pasajeros/pasajeros';

const Principal: React.FC = () => {
  return (
    <div className="container">
      {/* Div de fondo */}
      <div className="background"></div>

      <div className="header_principal" style={{ width: '100%', height: '60vh' }}>
        <div className="logo"></div>
        <h1 className="title_principal">Campus Rush</h1>
      </div>
      
      <div className="button-container_principal">
        <Link to="/login" className="button">Iniciar sesión</Link>
        <Link to="/registro" className="button">Registrarme</Link>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Principal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/pasajeros" element={<Pasajero />} />
        <Route path="/Principal" element={<Principal />} />
      </Routes>
    </Router>
  );
};

export default App;