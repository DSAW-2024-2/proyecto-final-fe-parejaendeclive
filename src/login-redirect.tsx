import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './Authentication';

const LoginRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);

    if (isAuthenticated) {
        return <Navigate to="/pasajeros" />;
    }

    return <>{children}</>;
};

export default LoginRedirect;
