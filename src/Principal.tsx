import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './principal.css';
import Registro from './registro/registro'; 
import Login from './inicio_sesion/inicio_sesion';
import Pasajero from './pasajeros/pasajeros';
import Menu from './menu/menu';
import Perfil from './perfil/perfil';
import EditPerfil from './editar_perfil/editar_perfil';
import Añadir_viaje from './añadir_viaje/añadir_viaje';
import RegistroCarro from './registro_carro/registro_carro';
import Conductor from './conductores/conductores';
import Viajes_Reservados from './viajes_reservados/viajes_reservados';
import Editar_carro from './editar_carro/editar_carro';
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
        <Link to="/login" className="button">Iniciar sesión</Link>
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
          {/* Rutas Públicas */}
          <Route path="/" element={<Principal />} />
          <Route path="/principal" element={<Principal />} />
          <Route path="/registro" element={<Registro />} />

          {/* Ruta de Inicio de Sesión con Redirección para Usuarios Autenticados */}
          <Route 
            path="/login" 
            element={
              <LoginRedirect>
                <Login />
              </LoginRedirect>
            } 
          />

          {/* Rutas Protegidas */}
          <Route 
            path="/pasajeros" 
            element={
              <ProtectedRoute>
                <Pasajero />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/menu" 
            element={
              <ProtectedRoute>
                <Menu />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/perfil" 
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/editar-perfil" 
            element={
              <ProtectedRoute>
                <EditPerfil />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/registro-carro" 
            element={
              <ProtectedRoute>
                <RegistroCarro />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/añadir_viaje" 
            element={
              <ProtectedRoute>
                <Añadir_viaje />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/conductores" 
            element={
              <ProtectedRoute>
                <Conductor />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/reservas" 
            element={
              <ProtectedRoute>
                <Viajes_Reservados />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/editar_carro" 
            element={
              <ProtectedRoute>
                <Editar_carro />
              </ProtectedRoute>
            } 
          />
          
          {/* Rutas No Encontradas (Opcional) */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
