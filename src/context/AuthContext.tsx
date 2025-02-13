import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AuthService from '../auth/services/AuthService';
import { AuthContextProps } from '../core/models/entity/AuthContextProps';

// Contexto de autenticación
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Proveedor de autenticación
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Estado para almacenar el token de autenticación
  const [token, setToken] = useState<string | null>(AuthService.getToken());
  // Estado para almacenar si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Estado para almacenar el rol del usuario
  const [userRole, setUserRole] = useState<string | null>(null);

  // Efecto para actualizar el estado de autenticación cuando cambia el token
  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      const decodedToken = parseJwt(token);
      setUserRole(decodedToken.role || null);
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
  }, [token]);

  // Función para realizar el login
  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await AuthService.login(credentials);
      setToken(response.token);
    } catch (error) {
      setToken(null);
      throw error;
    }
  };

  // Función para realizar el logout
  const logout = () => {
    AuthService.logout();
    setToken(null);
  };

  // Devolver el contexto de autenticación
  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper para decodificar el token JWT
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (error) {
    console.error('Error al decodificar el token JWT:', error);
    return null;
  }
};

export default AuthContext;