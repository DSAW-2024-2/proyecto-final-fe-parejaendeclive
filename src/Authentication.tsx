import React, { createContext, useState, useEffect } from 'react';

interface AuthContextProps {
    isAuthenticated: boolean;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AuthContext = createContext<AuthContextProps>({
    isAuthenticated: false,
    setIsAuthenticated: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
    // Check if token exists in local storage
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    }, []);

    return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
        {children}
    </AuthContext.Provider>
    );
};
