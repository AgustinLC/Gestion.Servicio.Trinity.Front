import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Modal, Button, Dropdown } from "react-bootstrap";
import useAuth from "../../../hooks/useAuth";
import { useSidebar } from "../../../context/SidebarContext";
import logo from "../../../assets/img/logoNavbar.svg";

// Etiquetas legibles y accesos rápidos según el rol autenticado
const ROLE_LABELS: Record<string, string> = {
  ROLE_ADMIN: "Administrador",
  ROLE_OPERATOR: "Operador",
  ROLE_USER: "Usuario",
};

const Navbar: React.FC = () => {
  // Hooks importados
  const { isAuthenticated, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { toggleSidebar } = useSidebar();
  const navRef = useRef<HTMLElement>(null);

  // Mide la altura real del navbar y la expone como variable CSS, para que el
  // sidebar (y el resto del layout) queden perfectamente alineados debajo,
  // sin depender de un valor fijo adivinado.
  useEffect(() => {
    const updateNavbarHeight = () => {
      if (navRef.current) {
        document.documentElement.style.setProperty("--navbar-height", `${navRef.current.offsetHeight}px`);
      }
    };
    updateNavbarHeight();
    window.addEventListener("resize", updateNavbarHeight);
    return () => window.removeEventListener("resize", updateNavbarHeight);
  }, []);

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

  const roleLabel = (userRole && ROLE_LABELS[userRole]) || "Invitado";
  const userInitial = roleLabel.charAt(0).toUpperCase();

  return (
    <>
      {/* Navbar */}
      <nav ref={navRef} className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
        <div className="container-fluid">
          {/* Marca: icono + nombre en dos líneas */}
          <div className="d-flex align-items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                className="navbar-icon-btn navbar-hamburger d-lg-none"
                onClick={toggleSidebar}
                title="Abrir/cerrar menú"
              >
                <i className="bi bi-list fs-4"></i>
              </button>
            )}
            <a className="navbar-brand d-flex align-items-center gap-2" href="#">
              <img src={logo} alt="Logo" className="navbar-brand-icon" width="36" height="36" />
              <span className="navbar-brand-text d-none d-sm-flex flex-column">
                <span className="navbar-brand-title">Consorcio</span>
                <span className="navbar-brand-subtitle">Gestión de Agua</span>
              </span>
            </a>
          </div>

          <ul className="navbar-nav ms-auto d-flex flex-row align-items-center gap-1">
            <li className="nav-item">
              <Link to="/" className={`nav-link navbar-link ${isActive("/") ? "navbar-link-active" : ""}`}>
                <i className="bi bi-house fs-5"></i>
                <span className="d-none d-lg-inline">Inicio</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/faq" className={`nav-link navbar-link ${isActive("/faq") ? "navbar-link-active" : ""}`}>
                <i className="bi bi-question-circle fs-5"></i>
                <span className="d-none d-lg-inline">Preguntas frecuentes</span>
              </Link>
            </li>
            {isAuthenticated ? (
              <>
                {/* Links para usuarios autenticados con rol admin */}
                {userRole === "ROLE_ADMIN" && (
                  <>
                    <li className="nav-item">
                      <Link
                        to="/dashboard/admin/workers"
                        className={`nav-link navbar-link ${isActive("/dashboard/admin") ? "navbar-link-active" : ""}`}
                      >
                        <i className="bi bi-shield-check fs-5"></i>
                        <span className="d-none d-lg-inline">Panel de Administración</span>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        to="/dashboard/operator/resume"
                        className={`nav-link navbar-link ${isActive("/dashboard/operator") ? "navbar-link-active" : ""}`}
                      >
                        <i className="bi bi-diagram-3 fs-5"></i>
                        <span className="d-none d-lg-inline">Panel de Operación</span>
                      </Link>
                    </li>
                  </>
                )}
                {/* Links para usuarios autenticados con rol operator */}
                {userRole === "ROLE_OPERATOR" && (
                  <li className="nav-item">
                    <Link
                      to="/dashboard/operator/resume"
                      className={`nav-link navbar-link ${isActive("/dashboard/operator") ? "navbar-link-active" : ""}`}
                    >
                      <i className="bi bi-diagram-3 fs-5"></i>
                      <span className="d-none d-lg-inline">Panel de Operación</span>
                    </Link>
                  </li>
                )}
                {/* Links para usuarios autenticados con rol user */}
                {userRole === "ROLE_USER" && (
                  <li className="nav-item">
                    <Link
                      to="/dashboard/user/resume"
                      className={`nav-link navbar-link ${isActive("/dashboard/user") ? "navbar-link-active" : ""}`}
                    >
                      <i className="bi bi-diagram-3 fs-5"></i>
                      <span className="d-none d-lg-inline">Panel de Gestión</span>
                    </Link>
                  </li>
                )}

                {/* Notificaciones: placeholder visual, sin conteo real todavía */}
                {/* TODO: conectar con un endpoint real de notificaciones cuando exista */}
                <li className="nav-item">
                  <button type="button" className="navbar-icon-btn" title="Notificaciones">
                    <i className="bi bi-bell fs-5"></i>
                  </button>
                </li>

                {/* Menú de usuario */}
                <li className="nav-item">
                  <Dropdown align="end">
                    <Dropdown.Toggle as="button" className="navbar-user-toggle" id="navbar-user-dropdown">
                      <span className="navbar-avatar">{userInitial}</span>
                      <span className="d-none d-lg-inline navbar-user-name">{roleLabel}</span>
                      <i className="bi bi-chevron-down navbar-user-chevron"></i>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setShowLogoutModal(true)}>
                        <i className="bi bi-box-arrow-left me-2 text-danger"></i>
                        Cerrar sesión
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </li>
              </>
            ) : (
              <>
                {/* Links para usuarios no autenticados */}
                <li className="nav-item">
                  <Link to="/login" className={`nav-link navbar-link ${isActive("/login") ? "navbar-link-active" : ""}`}>
                    <i className="bi bi-box-arrow-right fs-5"></i>
                    <span className="d-none d-lg-inline">Iniciar sesión</span>
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
