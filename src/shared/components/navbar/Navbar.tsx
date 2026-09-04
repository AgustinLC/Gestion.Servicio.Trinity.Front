import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import useAuth from "../../../hooks/useAuth";
import { useSidebar } from "../../../context/SidebarContext";
import ConfirmModal from "../confirm/ConfirmModal";
import { getData } from "../../../core/services/apiService";
import { UserDto } from "../../../core/models/dto/UserDto";
import logo from "../../../assets/img/logoNavbar.svg";

// Etiquetas legibles y accesos rápidos según el rol autenticado
const ROLE_LABELS: Record<string, string> = {
  ROLE_ADMIN: "Administrador",
  ROLE_OPERATOR: "Operador",
  ROLE_USER: "Consumidor",
};

const Navbar: React.FC = () => {
  // Hooks importados
  const { isAuthenticated, userRole, userId, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
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

  // Trae el nombre y el correo del usuario logueado para mostrarlo en la
  // barra de navegación (el token solo trae el rol y el id).
  useEffect(() => {
    if (isAuthenticated && userId) {
      getData<UserDto>(`/user/${userId}`)
        .then(setCurrentUser)
        .catch((error) => console.error("Error al obtener los datos del usuario:", error));
    } else {
      setCurrentUser(null);
    }
  }, [isAuthenticated, userId]);

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
  const fullName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : roleLabel;
  const userInitial = (currentUser?.firstName || roleLabel).charAt(0).toUpperCase();

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
            {/* Todo el link de marca (gota + texto) oculto por debajo de sm,
                no solo sus hijos: un <a> con d-flex pero con AMBOS hijos en
                d-none igual sigue en el DOM y sigue ocupando su propio
                padding/margin de Bootstrap (.navbar-brand), como una caja
                vacía "fantasma" — hay que sacar el <a> completo, no vaciarlo.
                Si no entran la marca completa + los íconos de la derecha en
                una sola fila, Bootstrap los pasa a una segunda línea (bug
                reportado); por debajo de sm la marca queda reducida al botón
                de menú nada más, para maximizar el espacio disponible del
                lado derecho — se prioriza que nunca ocurra el bug por sobre
                mantener la gota visible en mobile. */}
            <a className="navbar-brand d-none d-sm-flex align-items-center gap-2" href="#">
              <img src={logo} alt="Logo" className="navbar-brand-icon" width="36" height="36" />
              <span className="navbar-brand-text d-flex flex-column">
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

                {/* Menú de usuario */}
                <li className="nav-item">
                  <Dropdown align="end">
                    <Dropdown.Toggle as="button" className="navbar-user-toggle" id="navbar-user-dropdown">
                      {/* En mobile no hay lugar para el nombre/rol (recién aparecen
                          desde lg), así que ahí se mantiene el avatar como único
                          disparador visible del menú. */}
                      <span className="navbar-avatar d-lg-none">{userInitial}</span>
                      <span className="d-none d-lg-flex flex-column navbar-user-info">
                        <span className="navbar-user-name">{fullName}</span>
                        <span className="navbar-user-role">{roleLabel}</span>
                      </span>
                      <i className="bi bi-chevron-down navbar-user-chevron"></i>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {/* Encabezado informativo: nombre y correo del usuario
                          logueado. No es una opción clickeable, solo contexto
                          (el rol ya se ve en el botón que abre este menú). */}
                      <div className="navbar-dropdown-header d-flex align-items-center gap-3 px-3 py-2">
                        <span className="navbar-avatar navbar-avatar-lg">{userInitial}</span>
                        <div style={{ minWidth: 0 }}>
                          <div className="fw-semibold text-truncate">{fullName}</div>
                          {currentUser?.username && (
                            <div className="text-muted small text-truncate">{currentUser.username}</div>
                          )}
                        </div>
                      </div>
                      <Dropdown.Divider />
                      {/* Acá van "Mi perfil" / "Cambiar contraseña" / "Preferencias"
                          cuando esas pantallas existan (cada una como un
                          Dropdown.Item más, con el mismo estilo que Cerrar sesión). */}
                      <Dropdown.Item onClick={() => setShowLogoutModal(true)} className="navbar-dropdown-logout">
                        <i className="bi bi-box-arrow-left navbar-dropdown-logout-icon text-danger"></i>
                        <span>
                          <span className="d-block">Cerrar sesión</span>
                          <span className="d-block navbar-dropdown-logout-subtitle">Salir de la aplicación</span>
                        </span>
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
      <ConfirmModal
        show={showLogoutModal}
        onHide={() => setShowLogoutModal(false)}
        variant="question"
        icon="bi bi-box-arrow-left"
        title="Cerrar sesión"
        message="¿Estás seguro que querés cerrar tu sesión?"
        confirmText="Cerrar sesión"
        confirmIcon="bi bi-box-arrow-left"
        onConfirm={handleLogout}
      />
    </>
  );
};

export default Navbar;
