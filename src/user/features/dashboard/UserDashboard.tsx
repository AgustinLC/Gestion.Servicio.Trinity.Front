import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../../../context/SidebarContext';
import logo from '../../../assets/img/logoNavbar.svg';
import './UserDashboard.css'
import 'bootstrap/dist/css/bootstrap.min.css';

const UserDashboard: React.FC = () => {

    // Constantes
    const location = useLocation();
    const currentPath = location.pathname;
    const { isMobile, sidebarOpen, closeSidebar } = useSidebar();

    return (
        <div className="dashboard-container d-flex">
            {/* Sidebar */}
            <aside
                className={`sidebar d-flex flex-column p-3 ${isMobile ? (sidebarOpen ? "open" : "collapsed") : "open"}`}
            >
                <ul className="nav nav-pills flex-column w-100">

                    {/* Resumen */}
                    <li className="nav-item">
                        <Link to="/dashboard/user/resume" className={`nav-link py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/user/resume' ? 'active' : ''}`} title="Resumen" onClick={closeSidebar}>
                            <i className="bi-person-lines-fill fs-4"></i>
                            <span className="ms-2 d-lg-inline">Resumen</span>
                        </Link>
                    </li>

                    {/* Facturas */}
                    <li className="nav-item">
                        <Link to="/dashboard/user/bills" className={`nav-link py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/user/bills' ? 'active' : ''}`} title="Facturas" onClick={closeSidebar}>
                            <i className="bi bi-file-earmark-spreadsheet fs-4"></i>
                            <span className="ms-2 d-lg-inline">Facturas</span>
                        </Link>
                    </li>

                    {/* Consumos */}
                    <li>
                        <Link to="/dashboard/user/consumptions" className={`nav-link py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/user/consumptions' ? 'active' : ''}`} title="Consumos" onClick={closeSidebar}>
                            <i className="bi-clipboard-data fs-4"></i>
                            <span className="ms-2 d-lg-inline">Consumos</span>
                        </Link>
                    </li>

                    {/* Mis datos */}
                    <li className="nav-item">
                        <Link to="/dashboard/user/personal-data" className={`nav-link py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/user/personal-data' ? 'active' : ''}`} title="Mis Datos" onClick={closeSidebar}>
                            <i className="bi bi-person-square fs-4"></i>
                            <span className="ms-2 d-lg-inline">Mis Datos</span>
                        </Link>
                    </li>
                </ul>

                {/* Tarjeta de marca */}
                <div className="sidebar-footer mt-auto w-100">
                    <div className="sidebar-footer-icon">
                        <img src={logo} alt="Logo" />
                    </div>
                    <div className="sidebar-footer-text">
                        <div className="sidebar-footer-title">Sistema de gestión</div>
                        <div className="sidebar-footer-subtitle">Consorcio de Agua</div>
                        <div className="sidebar-footer-version">Versión 1.0.0</div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="dashboard-main flex-grow-1 p-4">
                <main>
                    <Outlet /> {/* Aquí se cargarán las secciones dinámicamente */}
                </main>
            </div>
        </div>
    );
};

export default UserDashboard;
