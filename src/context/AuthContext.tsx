import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AuthService from '../auth/services/AuthService';
import { AuthContextProps } from '../core/models/types/AuthContextProps';

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

// Contexto de autenticación
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Proveedor de autenticación
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialToken = AuthService.getToken();
  const initialDecoded = initialToken ? parseJwt(initialToken) : null;

  // Estado para almacenar el token de autenticación
  const [token, setToken] = useState<string | null>(initialToken);
  // Estado para almacenar si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialToken && !!initialDecoded);
  // Estado para almacenar el rol del usuario
  const [userRole, setUserRole] = useState<string | null>(initialDecoded?.role || null);
  // Estado para almacenar el id del usuario
  const [userId, setUserID] = useState<number | null>(initialDecoded?.userId || null);

  // Efecto para actualizar el estado de autenticación cuando cambia el token
  useEffect(() => {
    if (token) {
      const decodedToken = parseJwt(token);
      if (decodedToken) {
        setIsAuthenticated(true);
        setUserRole(decodedToken.role || null);
        setUserID(decodedToken.userId || null);
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
        setUserID(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
      setUserID(null);
    }
  }, [token]);

  // Función para realizar el login
  const login = useCallback(async (credentials: { username: string; password: string }) => {
    try {
      const response = await AuthService.login(credentials);
      setToken(response.token);
    } catch (error) {
      setToken(null);
      throw error;
    }
  }, []);

  // Función para realizar el logout
  const logout = useCallback(() => {
    AuthService.logout();
    setToken(null);
  }, []);

  // Efecto para monitorear el vencimiento del token y realizar logout automático
  useEffect(() => {
    if (!token) return;

    const decodedToken = parseJwt(token);
    if (!decodedToken || !decodedToken.exp) return;

    const expTime = decodedToken.exp * 1000;

    const checkTokenExpiration = () => {
      const timeLeft = expTime - Date.now();
      if (timeLeft <= 0) {
        logout();
        window.location.href = '/login';
      }
    };

    // Verificar inmediatamente
    checkTokenExpiration();

    const timeLeft = expTime - Date.now();
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        checkTokenExpiration();
      }, timeLeft);

      return () => clearTimeout(timer);
    }
  }, [token, logout]);

  // Devolver el contexto de autenticación
  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;