import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './principal.css';
import Registro from './registro/registro'; 
import Login from './inicio_sesion/inicio_sesion';
import Pasajero from './pasajeros/pasajeros';
import Menu from './menu/menu';
import Perfil from './perfil/perfil';
import { AuthProvider } from './Authentication';
import ProtectedRoute from './routeProtected';
import LoginRedirect from './login-redirect';

const Principal: React.FC = () => {
  return (
    <div className="container">
      <div className="background"></div>

      <div className="header_principal" style={{ width: '100%', height: '60vh' }}>
        <div className="logo"></div>
        <h1 className="title_principal">Campus Rush</h1>
      </div>
      
      <div className="button-container_principal">
        <Link to="/pasajeros" className="button">Iniciar sesión</Link>
        <Link to="/registro" className="button">Registrarme</Link>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider> {/* Envolver toda la aplicación con el contexto de autenticación */}
      <Router>
        <Routes>
          <Route path="/" element={<Principal />} />
          <Route path="/principal" element={<Principal />} />
          <Route path="/registro" element={<Registro />} />
          
          <Route 
            path="/login" 
            element={
              /* 
              <LoginRedirect>
                <Login />
              </LoginRedirect> 
              */
              <Login />
            } 
          />
          
          <Route 
            path="/pasajeros" 
            element={
              /* 
              <ProtectedRoute>
                <Pasajero />
              </ProtectedRoute> 
              */
              <Pasajero />
            } 
          />
          
          {/* Mantener solo una ruta para /menu */}
          <Route 
            path="/menu" 
            element={
              /* 
              <ProtectedRoute>
                <Menu />
              </ProtectedRoute> 
              */
              <Menu />
            } 
          />
          
          {/* Añadir la ruta para /perfil */}
          <Route 
            path="/perfil" 
            element={
              /* 
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute> 
              */
              <Perfil />
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;