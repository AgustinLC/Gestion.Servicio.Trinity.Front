import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import useAuth from "../../../hooks/useAuth";
import logo from "../../../assets/img/logoNavbar.svg";

const Navbar: React.FC = () => {
  // Hooks importados
  const { isAuthenticated, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Función para redirigir al login después de cerrar sesión y borrar el token
  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate("/login");
  };

  // Función para determinar si un enlace está activo (soporta prefijos de ruta)
  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
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
                  <>
                    <li className="nav-item mx-2">
                      <Link to="/dashboard/admin/workers" className={`nav-link d-none d-lg-inline navbar-active-link ${isActive("/dashboard/admin") ? "navbar-link-active" : ""}`}>
                        Panel de Administración
                      </Link>
                      <Link to="/dashboard/admin/workers" className={`nav-link d-lg-none ${isActive("/dashboard/admin") ? "navbar-link-active" : ""}`}>
                        <i className="bi bi-layout-sidebar fs-5"></i>
                      </Link>
                    </li>
                    <li className="nav-item mx-2">
                      <Link to="/dashboard/operator/resume" className={`nav-link d-none d-lg-inline navbar-active-link ${isActive("/dashboard/operator") ? "navbar-link-active" : ""}`}>
                        Panel de Operación
                      </Link>
                      <Link to="/dashboard/operator/resume" className={`nav-link d-lg-none ${isActive("/dashboard/operator") ? "navbar-link-active" : ""}`}>
                        <i className="bi bi-layout-sidebar fs-5"></i>
                      </Link>
                    </li>
                  </>
                )}
                {/* Links para usuarios autenticados con rol operator */}
                {userRole === "ROLE_OPERATOR" && (
                  <li className="nav-item mx-2">
                    <Link to="/dashboard/operator/resume" className={`nav-link d-none d-lg-inline navbar-active-link ${isActive("/dashboard/operator") ? "navbar-link-active" : ""}`}>
                      Panel de Operación
                    </Link>
                    <Link to="/dashboard/operator/resume" className={`nav-link d-lg-none ${isActive("/dashboard/operator") ? "navbar-link-active" : ""}`}>
                      <i className="bi bi-layout-sidebar fs-5"></i>
                    </Link>
                  </li>
                )}
                {/* Links para usuarios autenticados con rol user */}
                {userRole === "ROLE_USER" && (
                  <li className="nav-item mx-2">
                    <Link to="/dashboard/user/resume" className={`nav-link d-none d-lg-inline navbar-active-link ${isActive("/dashboard/user") ? "navbar-link-active" : ""}`}>
                      Panel de Gestión
                    </Link>
                    <Link to="/dashboard/user/resume" className={`nav-link d-lg-none ${isActive("/dashboard/user") ? "navbar-link-active" : ""}`}>
                      <i className="bi bi-layout-sidebar fs-5"></i>
                    </Link>
                  </li>
                )}
                <li className="nav-item mx-2">
                  <button className="btn btn-link nav-link d-none d-lg-inline" onClick={() => setShowLogoutModal(true)}>
                    Cerrar sesión
                  </button>
                  <button className="btn btn-link nav-link d-lg-none" onClick={() => setShowLogoutModal(true)}>
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

      {/* Modal de confirmación de cierre de sesión */}
      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-box-arrow-left me-2 text-danger"></i>Cerrar sesión
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro que querés cerrar tu sesión?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowLogoutModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            <i className="bi bi-box-arrow-left me-1"></i> Cerrar sesión
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Navbar;
