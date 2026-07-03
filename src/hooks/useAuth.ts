import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { AuthContextProps } from '../core/models/types/AuthContextProps';

// Función/hook para obtener el contexto de autenticación
const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default useAuth;