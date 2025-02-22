import React, { useState } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './AdminDashboard.css'
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminDashboard: React.FC = () => {

    //Estados
    const [activePopover, setActivePopover] = useState<string | null>(null);

    // Constantes
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
        <div className="container-fluid">
            <div className="row">

                {/* Sidebar */}
                <div className="bg-primary sticky-top sidebar">
                    <div className="d-flex flex-sm-column flex-row flex-nowrap bg-primary align-items-center">
                        <ul className="nav nav-pills nav-flush flex-sm-column flex-row flex-nowrap mb-auto mx-auto text-center justify-content-between w-100 px-3">

                            {/* Operarios */}
                            <li>
                                <Link to="/dashboard/admin/workers" className={`nav-link link-light py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/admin/workers' ? 'active' : ''}`} title="Gestion de operarios">
                                    <i className="bi bi-person-fill-gear fs-4"></i>
                                    <span className="ms-2 d-none d-lg-inline">Operarios</span>
                                </Link>
                            </li>

                            {/* Administradores */}
                            <li>
                                <Link to="/dashboard/admin/administrators" className={`nav-link link-light py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/admin/administrators' ? 'active' : ''}`} title="Gestion de administradores">
                                    <i className="bi bi-person-fill fs-4"></i>
                                    <span className="ms-2 d-none d-lg-inline">Admins</span>
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
                                    <div className={`nav-link link-light py-3 px-2 d-flex align-items-center ${isWebSection ? 'active-submenu' : ''}`} role="button">
                                        <i className="bi bi-file-break fs-4"></i>
                                        <span className="ms-2 d-none d-lg-inline">Web</span>
                                        <i className={`bi-chevron-right ms-1 mt-1 chevron-icon d-none d-lg-inline ${activePopover === 'web' ? 'rotate' : ''}`}></i>
                                    </div>
                                </li>
                            </OverlayTrigger>

                            {/* Tarifas */}
                            <li className="nav-item">
                                <Link to="/dashboard/admin/fee" className={`nav-link link-light py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/admin/fee' ? 'active' : ''}`} title="Gestión de Tarifas">
                                    <i className="bi bi-clipboard2-pulse fs-4"></i>
                                    <span className="ms-2 d-none d-lg-inline">Tarifas</span>
                                </Link>
                            </li>

                            {/* Servicio/Unidad */}
                            <li className="nav-item">
                                <Link to="/dashboard/admin/services-units" className={`nav-link link-light py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/admin/services-units' ? 'active' : ''}`} title="Gestión de Relación Servicio/Unidad">
                                    <i className="bi bi-calculator fs-4"></i>
                                    <span className="ms-2 d-none d-lg-inline">Serv./Unid.</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-sm p-3 min-vh-100">
                    <main className="p-4">
                        <Outlet /> {/* Aquí se cargarán las secciones dinámicamente */}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
