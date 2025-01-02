import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/services/AuthContext";
import logo from "../../../assets/img/logoNavbar.svg";

const Navbar: React.FC = () => {
    //Hooks importados
    const { isAuthenticated, userRole, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation()

    // Funcion para redirigir al login después de cerrar sesión y borrar el token 
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
                        <img src={logo} alt="Logo" width="100" height="45" />
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>Inicio</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/faq" className={`nav-link ${isActive("/faq") ? "active" : ""}`}>Preguntas frecuentes</Link>
                            </li>
                            {isAuthenticated ? (
                                <>
                                    {/* Links para usuarios autenticados con rol admin */}
                                    {userRole === "ROLE_ADMIN" && (
                                        <li className="nav-item">
                                            <Link to="/admin" className={`nav-link ${isActive("/admin") ? "active" : ""}`}>Panel de Administración</Link>
                                        </li>
                                    )}
                                    {/* Links para usuarios autenticados con rol user */}
                                    {userRole === "ROLE_USER" && (
                                        <li className="nav-item">
                                            <Link to="/admin" className={`nav-link ${isActive("/admin") ? "active" : ""}`}>Panel de Usuario</Link>
                                        </li>
                                    )}
                                    {/* Links para usuarios autenticados con rol operatror */}
                                    {userRole === "ROLE_OPERATOR" && (
                                        <li className="nav-item">
                                            <Link to="/admin" className={`nav-link ${isActive("/admin") ? "active" : ""}`}>Panel de Operadores</Link>
                                        </li>
                                    )}
                                    <li className="nav-item">
                                        <button className="btn btn-link nav-link" onClick={handleLogout}>Cerrar sesión</button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    {/* Links para usuarios no autenticados */}
                                    <li className="nav-item">
                                        <Link to="/login" className={`nav-link ${isActive("/login") ? "active" : ""}`}>Iniciar sesión</Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;