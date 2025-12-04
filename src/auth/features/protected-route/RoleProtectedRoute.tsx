import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[]; // Roles permitidos para acceder a esta ruta
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, userRole } = useAuth();
  const location = useLocation();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Función para verificar si el usuario tiene acceso
  const hasAccess = (): boolean => {
    if (!userRole) return false;

    // Si el rol del usuario está directamente en los roles permitidos
    if (allowedRoles.includes(userRole)) {
      return true;
    }

    // ADMIN tiene acceso a todo lo de OPERATOR
    if (userRole === "ROLE_ADMIN" && allowedRoles.includes("ROLE_OPERATOR")) {
      return true;
    }

    return false;
  };

  // Si no tiene acceso, redirigir al panel correspondiente
  if (!hasAccess()) {
    // Redirigir al panel correspondiente según el rol
    let redirectPath = "/";
    
    if (userRole === "ROLE_ADMIN") {
      redirectPath = "/dashboard/admin/workers";
    } else if (userRole === "ROLE_OPERATOR") {
      redirectPath = "/dashboard/operator/resume";
    } else if (userRole === "ROLE_USER") {
      redirectPath = "/dashboard/user/resume";
    }

    return <Navigate to={redirectPath} replace />;
  }

  // Si tiene acceso, renderizar el contenido
  return <>{children}</>;
};

export default RoleProtectedRoute;

