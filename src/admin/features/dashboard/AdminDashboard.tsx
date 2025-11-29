import React, { useEffect, useState } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './AdminDashboard.css'
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminDashboard: React.FC = () => {

    //Estados
    const [activePopover, setActivePopover] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 992);
    const location = useLocation();
    const currentPath = location.pathname;

    // Detecta cambios de tamaño de pantalla
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 992);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const sidebarWidth = isMobile ? 220 : 180;
    const buttonLeft = sidebarOpen ? sidebarWidth : 0;

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

                    {/* Operarios */}
                    <li className="nav-item">
                        <Link to="/dashboard/admin/workers" className={`nav-link link-light py-3 d-flex align-items-center ${currentPath === '/dashboard/admin/workers' ? 'active' : ''}`} title="Gestión de operarios" onClick={() => setSidebarOpen(false)}>
                            <i className="bi bi-person-fill-gear fs-4"></i>
                            <span className="ms-2 d-lg-inline">Operarios</span>
                        </Link>
                    </li>

                    {/* Administradores */}
                    <li className="nav-item">
                        <Link to="/dashboard/admin/administrators" className={`nav-link link-light py-3 d-flex align-items-center ${currentPath === '/dashboard/admin/administrators' ? 'active' : ''}`} title="Gestión de administradores" onClick={() => setSidebarOpen(false)}>
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
                            <div className={`nav-link link-light py-3 d-flex align-items-center ${isWebSection ? 'active-submenu' : ''}`} role="button">
                                <i className="bi bi-file-break fs-4"></i>
                                <span className="ms-2 d-lg-inline">Web</span>
                                <i className={`bi-chevron-right ms-1 mt-1 chevron-icon d-none d-lg-inline ${activePopover === 'web' ? 'rotate' : ''}`}></i>
                            </div>
                        </li>
                    </OverlayTrigger>

                    {/* Tarifas */}
                    <li className="nav-item">
                        <Link to="/dashboard/admin/fee" className={`nav-link link-light py-3 d-flex align-items-center ${currentPath === '/dashboard/admin/fee' ? 'active' : ''}`} title="Gestión de Tarifas" onClick={() => setSidebarOpen(false)}>
                            <i className="bi bi-clipboard2-pulse fs-4"></i>
                            <span className="ms-2 d-lg-inline">Tarifas</span>
                        </Link>
                    </li>

                    {/* Modalidad */}
                    <li className="nav-item">
                        <Link to="/dashboard/admin/modalities" className={`nav-link link-light py-3 d-flex align-items-center ${currentPath === '/dashboard/admin/modalities' ? 'active' : ''}`} title="Gestion de modalidad" onClick={() => setSidebarOpen(false)}>
                            <i className="bi bi-arrow-down-up fs-4"></i>
                            <span className="ms-2 d-lg-inline">Modalidad</span>
                        </Link>
                    </li>

                    {/* Servicio/Unidad */}
                    <li className="nav-item">
                        <Link to="/dashboard/admin/services-units" className={`nav-link link-light py-3 d-flex align-items-center ${currentPath === '/dashboard/admin/services-units' ? 'active' : ''}`} title="Gestión de Relación Servicio/Unidad" onClick={() => setSidebarOpen(false)}>
                            <i className="bi bi-calculator fs-4"></i>
                            <span className="ms-2 d-lg-inline">Serv./Unid.</span>
                        </Link>
                    </li>
                    
                    {/* Conceptos */}
                    <li className="nav-item">
                        <Link to="/dashboard/admin/billing-parameters" className={`nav-link link-light py-3 d-flex align-items-center ${currentPath === '/dashboard/admin/billing-parameters' ? 'active' : ''}`} title="Gestión de Parametros de Facturación" onClick={() => setSidebarOpen(false)}>
                            <i className="bi bi-receipt fs-4"></i>
                            <span className="ms-2 d-lg-inline">Conceptos</span>
                        </Link>
                    </li>

                     {/* Descuentos */}
                    <li className="nav-item">
                        <Link to="/dashboard/admin/discounts/management" className={`nav-link link-light py-3 d-flex align-items-center ${currentPath === '/dashboard/admin/discounts' ? 'active' : ''}`} title="Gestion de descuentos" onClick={() => setSidebarOpen(false)}>
                            <i className="bi bi-plus-slash-minus fs-4"></i>
                            <span className="ms-2 d-lg-inline">Descuentos</span>
                        </Link>
                    </li>
                    
                    {/* Periodo */}
                    <li className="nav-item">
                        <Link to="/dashboard/admin/new/period" className={`nav-link link-light py-3 d-flex align-items-center ${currentPath === '/dashboard/admin/new/period' ? 'active' : ''}`} title="Generar nueva modalidad" onClick={() => setSidebarOpen(false)}>
                            <i className="bi bi-calendar-plus fs-4"></i>
                            <span className="ms-2 d-lg-inline">Periodo</span>
                        </Link>
                    </li>
                </ul>
            </aside>


            {/* Main Content */}
            <main className="dashboard-main flex-grow-1 p-4 bg-light">
                <Outlet /> {/* Aquí se cargarán las secciones dinámicamente */}
            </main>
        </div>
    );
};

export default AdminDashboard;
