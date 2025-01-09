import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/services/AuthContext";
import logo from "../../../assets/img/logoNavbar.svg";

const Navbar: React.FC = () => {
  // Hooks importados
  const { isAuthenticated, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Función para redirigir al login después de cerrar sesión y borrar el token
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Función para determinar si un enlace está activo
  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <img src={logo} alt="Logo" width="78" height="45" />
          </a>
          <ul className="navbar-nav ms-auto d-flex flex-row align-items-center">
            <li className="nav-item mx-2">
              <Link to="/" className={`nav-link d-none d-lg-inline ${isActive("/") ? "active" : ""}`}>
                Inicio
              </Link>
              <Link to="/" className={`nav-link d-lg-none ${isActive("/") ? "active" : ""}`}>
                <i className="bi-house fs-5"></i>
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link to="/faq" className={`nav-link d-none d-lg-inline ${isActive("/faq") ? "active" : ""}`}>
                Preguntas frecuentes
              </Link>
              <Link to="/faq" className={`nav-link d-lg-none ${isActive("/faq") ? "active" : ""}`}>
                <i className="bi-question-circle fs-5"></i>
              </Link>
            </li>
            {isAuthenticated ? (
              <>
                {/* Links para usuarios autenticados con rol admin */}
                {userRole === "ROLE_ADMIN" && (
                  <li className="nav-item mx-2">
                    <Link to="/dashboard/admin" className={`nav-link d-none d-lg-inline ${isActive("/dashboard/admin") ? "active" : ""}`}>
                      Panel de Administración
                    </Link>
                    <Link to="/dashboard/admin" className={`nav-link d-lg-none ${isActive("/dashboard/admin") ? "active" : ""}`}>
                      <i className="bi bi-layout-sidebar fs-5"></i>
                    </Link>
                  </li>
                )}
                {/* Links para usuarios autenticados con otros roles */}
                {(userRole === "ROLE_USER" || userRole === "ROLE_OPERATOR") && (
                  <li className="nav-item mx-2">
                    <Link to="/admin" className={`nav-link d-none d-lg-inline ${isActive("/admin") ? "active" : ""}`}>
                      Panel de {userRole === "ROLE_USER" ? "Usuario" : "Operadores"}
                    </Link>
                    <Link to="/admin" className={`nav-link d-lg-none ${isActive("/admin") ? "active" : ""}`}>
                      <i className="bi bi-layout-sidebar fs-5"></i>
                    </Link>
                  </li>
                )}
                <li className="nav-item mx-2">
                  <button className="btn btn-link nav-link d-none d-lg-inline" onClick={handleLogout}>
                    Cerrar sesión
                  </button>
                  <button className="btn btn-link nav-link d-lg-none" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-left fs-5"></i>
                  </button>
                </li>
              </>
            ) : (
              <>
                {/* Links para usuarios no autenticados */}
                <li className="nav-item mx-2">
                  <Link to="/login" className={`nav-link d-none d-lg-inline ${isActive("/login") ? "active" : ""}`}>
                    Iniciar sesión
                  </Link>
                  <Link to="/login" className={`nav-link d-lg-none ${isActive("/login") ? "active" : ""}`}>
                    <i className="bi bi-box-arrow-right fs-5"></i>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
