import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './UserDashboard.css'
import 'bootstrap/dist/css/bootstrap.min.css';

const UserDashboard: React.FC = () => {

    // Constantes
    const location = useLocation();
    const currentPath = location.pathname;
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 992);

    // Detecta cambios de tamaño de pantalla
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 992);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const sidebarWidth = isMobile ? 240 : 200;
    const buttonLeft = sidebarOpen ? sidebarWidth : 0;

    return (
        <div className="dashboard-container d-flex">
            {/* Botón flotante solo en móvil */}
            {isMobile && (
                <button
                    className="sidebar-toggle-btn"
                    style={{ left: `${buttonLeft}px` }}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    <i className={`bi ${sidebarOpen ? "bi-chevron-left" : "bi-chevron-right"}`}></i>
                </button>
            )}

            {/* Sidebar */}
            <aside
                className={`sidebar bg-primary text-light d-flex flex-column align-items-center p-3 ${isMobile ? (sidebarOpen ? "open" : "collapsed") : "open"
                    }`}
            >
                <ul className="nav nav-pills flex-column w-100">

                    {/* Resumen */}
                    <li className="nav-item">
                        <Link to="/dashboard/user/resume" className={`nav-link link-light py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/user/resume' ? 'active' : ''}`} title="Resumen">
                            <i className="bi-person-lines-fill fs-4"></i>
                            <span className="ms-2 d-lg-inline">Resumen</span>
                        </Link>
                    </li>

                    {/* Usuarios */}
                    <li className="nav-item">
                        <Link to="/dashboard/user/bills" className={`nav-link link-light py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/user/bills' ? 'active' : ''}`} title="Facturas">
                            <i className="bi bi-file-earmark-spreadsheet fs-4"></i>
                            <span className="ms-2 d-lg-inline">Facturas</span>
                        </Link>
                    </li>

                    {/* Facturas */}
                    <li>
                        <Link to="/dashboard/user/consumptions" className={`nav-link link-light py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/user/consumptions' ? 'active' : ''}`} title="Consumos">
                            <i className="bi-clipboard-data fs-4"></i>
                            <span className="ms-2 d-lg-inline">Consumos</span>
                        </Link>
                    </li>

                    {/* Reportes */}
                    <li className="nav-item">
                        <Link to="/dashboard/user/personal-data" className={`nav-link link-light py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/user/personal-data' ? 'active' : ''}`} title="Mis Datos">
                            <i className="bi bi-person-square fs-4"></i>
                            <span className="ms-2 d-lg-inline">Mis Datos</span>
                        </Link>
                    </li>
                </ul>
            </aside>

            {/* Main Content */}
            <div className="dashboard-main flex-grow-1 p-4 bg-light">
                <main>
                    <Outlet /> {/* Aquí se cargarán las secciones dinámicamente */}
                </main>
            </div>
        </div>
    );
};

export default UserDashboard;