import React, { useState } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../../../context/SidebarContext';
import logo from '../../../assets/img/logoNavbar.svg';
import './AdminDashboard.css'
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminDashboard: React.FC = () => {

    //Estados
    const [activePopover, setActivePopover] = useState<string | null>(null);
    const { isMobile, sidebarOpen, closeSidebar } = useSidebar();
    const location = useLocation();
    const currentPath = location.pathname;

    const isWebSection = [
        '/dashboard/admin/faq',
        '/dashboard/admin/functions',
        '/dashboard/admin/data-main'
    ].some(path => currentPath === path);

    // Pop pup de web
    const WebPopover = (
        <Popover className="submenu-popover">
            <Popover.Body className="p-2">
                <div className="d-flex flex-column">
                    <Link to="/dashboard/admin/faq" className={`nav-link link-dark py-2 text-indented ${currentPath === '/dashboard/admin/faq' ? 'active' : ''}`} onClick={() => setActivePopover(null)}>
                        Preguntas frecuentes
                    </Link>
                    <Link to="/dashboard/admin/functions" className={`nav-link link-dark py-2 text-indented ${currentPath === '/dashboard/admin/functions' ? 'active' : ''}`} onClick={() => setActivePopover(null)}>
                        Funcionalidades
                    </Link>
                    <Link to="/dashboard/admin/data-main" className={`nav-link link-dark py-2 text-indented ${currentPath === '/dashboard/admin/data-main' ? 'active' : ''}`} onClick={() => setActivePopover(null)}>
                        Pagina principal
                    </Link>
                </div>
            </Popover.Body>
        </Popover>
    );

    // Render
    return (
        <div className="dashboard-container d-flex">
            {/* Sidebar */}
            <aside
                className={`sidebar d-flex flex-column p-3 ${isMobile ? (sidebarOpen ? "open" : "collapsed") : "open"}`}
            >
                <ul className="nav nav-pills flex-column w-100">

                    {/* Operarios */}
                    <li className="nav-item">
                        <Link to="/dashboard/admin/workers" className={`nav-link py-3 d-flex align-items-center ${currentPath === '/dashboard/admin/workers' ? 'active' : ''}`} title="Gestión de operarios" onClick={closeSidebar}>
                            <i className="bi bi-person-fill-gear fs-4"></i>
                            <span className="ms-2 d-lg-inline">Operarios</span>
                        </Link>
                    </li>

                    {/* Administradores */}
                    <li className="nav-item">
                        <Link to="/dashboard/admin/administrators" className={`nav-link py-3 d-flex align-items-center ${currentPath === '/dashboard/admin/administrators' ? 'active' : ''}`} title="Gestión de administradores" onClick={closeSidebar}>
                            <i className="bi bi-person-fill fs-4"></i>
                            <span className="ms-2 d-lg-inline">Admins</span>
                        </Link>
                    </li>

                    {/* Contenido pagina principal */}
                    <OverlayTrigger
                        trigger="click"
                        placement={window.innerWidth <= 768 ? 'bottom' : 'right'}
                        show={activePopover === 'web'}
                        onToggle={(show) => setActivePopover(show ? 'web' : null)}
                        overlay={WebPopover}
                        rootClose
                    >
                        <li className="nav-item popover-trigger">
                            <div className={`nav-link py-3 d-flex align-items-center ${isWebSection ? 'active-submenu' : ''}`} role="button" title="Web">
                                <i className="bi bi-file-break fs-4"></i>
                                <span className="ms-2 d-lg-inline">Web</span>
                                <i className={`bi-chevron-right ms-1 mt-1 chevron-icon d-none d-lg-inline ${activePopover === 'web' ? 'rotate' : ''}`}></i>
                            </div>
                        </li>
                    </OverlayTrigger>

                    {/* Tarifas */}
                    <li className="nav-item">
                        <Link to="/dashboard/admin/fee" className={`nav-link py-3 d-flex align-items-center ${currentPath === '/dashboard/admin/fee' ? 'active' : ''}`} title="Gestión de Tarifas" onClick={closeSidebar}>
                            <i className="bi bi-clipboard2-pulse fs-4"></i>
                            <span className="ms-2 d-lg-inline">Tarifas</span>
                        </Link>
                    </li>

                    {/* Modalidad */}
                    <li className="nav-item">
                        <Link to="/dashboard/admin/modalities" className={`nav-link py-3 d-flex align-items-center ${currentPath === '/dashboard/admin/modalities' ? 'active' : ''}`} title="Gestion de modalidad" onClick={closeSidebar}>
                            <i className="bi bi-arrow-down-up fs-4"></i>
                            <span className="ms-2 d-lg-inline">Modalidad</span>
                        </Link>
                    </li>

                    {/* Servicio/Unidad */}
                    <li className="nav-item">
                        <Link to="/dashboard/admin/services-units" className={`nav-link py-3 d-flex align-items-center ${currentPath === '/dashboard/admin/services-units' ? 'active' : ''}`} title="Gestión de Relación Servicio/Unidad" onClick={closeSidebar}>
                            <i className="bi bi-calculator fs-4"></i>
                            <span className="ms-2 d-lg-inline">Serv./Unid.</span>
                        </Link>
                    </li>

                    {/* Conceptos */}
                    <li className="nav-item">
                        <Link to="/dashboard/admin/billing-parameters" className={`nav-link py-3 d-flex align-items-center ${currentPath === '/dashboard/admin/billing-parameters' ? 'active' : ''}`} title="Gestión de Parametros de Facturación" onClick={closeSidebar}>
                            <i className="bi bi-receipt fs-4"></i>
                            <span className="ms-2 d-lg-inline">Conceptos</span>
                        </Link>
                    </li>

                    {/* Descuentos */}
                    <li className="nav-item">
                        <Link to="/dashboard/admin/discounts/management" className={`nav-link py-3 d-flex align-items-center ${currentPath === '/dashboard/admin/discounts' ? 'active' : ''}`} title="Gestion de descuentos" onClick={closeSidebar}>
                            <i className="bi bi-plus-slash-minus fs-4"></i>
                            <span className="ms-2 d-lg-inline">Descuentos</span>
                        </Link>
                    </li>

                    {/* Periodo */}
                    <li className="nav-item">
                        <Link to="/dashboard/admin/new/period" className={`nav-link py-3 d-flex align-items-center ${currentPath === '/dashboard/admin/new/period' ? 'active' : ''}`} title="Generar nueva modalidad" onClick={closeSidebar}>
                            <i className="bi bi-calendar-plus fs-4"></i>
                            <span className="ms-2 d-lg-inline">Periodo</span>
                        </Link>
                    </li>

                    {/* Parámetros PDF */}
                    <li className="nav-item">
                        <Link to="/dashboard/admin/pdf-parameters" className={`nav-link py-3 d-flex align-items-center ${currentPath === '/dashboard/admin/pdf-parameters' ? 'active' : ''}`} title="Parámetros Avisos PDF" onClick={closeSidebar}>
                            <i className="bi bi-file-pdf fs-4"></i>
                            <span className="ms-2 d-lg-inline">Avisos PDF</span>
                        </Link>
                    </li>

                    {/* Balance */}
                    <li className="nav-item">
                        <Link to="/dashboard/admin/balance" className={`nav-link py-3 d-flex align-items-center ${currentPath === '/dashboard/admin/balance' ? 'active' : ''}`} title="Balance" onClick={closeSidebar}>
                            <i className="bi bi-graph-down-arrow fs-4"></i>
                            <span className="ms-2 d-lg-inline">Balance</span>
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
            <main className="dashboard-main flex-grow-1 p-4">
                <Outlet /> {/* Aquí se cargarán las secciones dinámicamente */}
            </main>
        </div>
    );
};

export default AdminDashboard;
