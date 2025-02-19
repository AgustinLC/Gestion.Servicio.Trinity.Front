import React, { useState } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './OperatorDashboard.css'
import 'bootstrap/dist/css/bootstrap.min.css';

const DashboardOperator: React.FC = () => {

    //Estados
    const [activePopover, setActivePopover] = useState<string | null>(null);

    // Constantes
    const location = useLocation();
    const currentPath = location.pathname;

    // Función para alternar el estado de un pop pup específico
    const handlePopoverToggle = (key: string) => {
        setActivePopover(activePopover === key ? null : key);
    };

    // Pop pup de lecturas
    const ReadingsPopover = (
        <Popover className="submenu-popover">
            <Popover.Body className="p-2">
                <div className="d-flex flex-column">
                    <Link to="/dashboard/operator/readings/management" className={`nav-link link-dark py-2 text-indented ${currentPath === '/dashboard/operator/readings/management' ? 'active' : ''}`} onClick={() => setActivePopover(null)}>
                        Gestion de Lecturas
                    </Link>
                    <Link to="/dashboard/operator/readings/take" className={`nav-link link-dark py-2 text-indented ${currentPath === '/dashboard/operator/readings/take' ? 'active' : ''}`} onClick={() => setActivePopover(null)}>
                        Tomar Lecturas
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
                <div className="col-sm-auto bg-primary sticky-top sidebar">
                    <div className="d-flex flex-sm-column flex-row flex-nowrap bg-primary align-items-center">
                        <ul className="nav nav-pills nav-flush flex-sm-column flex-row flex-nowrap mb-auto mx-auto text-center justify-content-between w-100 px-3">

                            {/* Resumen */}
                            <li className="nav-item">
                                <Link to="/dashboard/operator/resume" className={`nav-link link-light py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/operator/resume' ? 'active' : ''}`} title="Gestión de Usuarios">
                                    <i className="bi-person-lines-fill fs-4"></i>
                                    <span className="ms-2 d-none d-lg-inline">Resumen</span>
                                </Link>
                            </li>

                            {/* Usuarios */}
                            <li className="nav-item">
                                <Link to="/dashboard/operator/users" className={`nav-link link-light py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/operator/users' ? 'active' : ''}`} title="Gestión de Usuarios">
                                    <i className="bi-people fs-4"></i>
                                    <span className="ms-2 d-none d-lg-inline">Usuarios</span>
                                </Link>
                            </li>

                            {/* Facturas */}
                            <li>
                                <Link to="/dashboard/pagos" className={`nav-link link-light py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/pagos' ? 'active' : ''}`} title="Gestión de Pagos">
                                    <i className="bi-table fs-4"></i>
                                    <span className="ms-2 d-none d-lg-inline">Facturas</span>
                                </Link>
                            </li>

                            {/* Lecturas */}
                            <OverlayTrigger
                                trigger="click"
                                placement={window.innerWidth <= 768 ? 'bottom' : 'right'}
                                show={activePopover === 'readings'}
                                onToggle={(show) => handlePopoverToggle(show ? 'readings' : '')}
                                overlay={ReadingsPopover}
                                rootClose
                            >
                                <li className="nav-item popover-trigger">
                                    <div className={`nav-link link-light py-3 px-2 d-flex align-items-center ${activePopover === 'readings' ? 'active-submenu' : ''}`} role="button">
                                        <i className="bi-speedometer2 fs-4"></i>
                                        <span className="ms-2 d-none d-lg-inline">Lecturas</span>
                                        <i className={`bi-chevron-right ms-1 mt-1 chevron-icon d-none d-lg-inline ${activePopover === 'readings' ? 'rotate' : ''}`}></i>
                                    </div>
                                </li>
                            </OverlayTrigger>

                            {/* Cobros */}
                            <li>
                                <Link to="/dashboard/reportes" className={`nav-link link-light py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/reportes' ? 'active' : ''}`} title="Reportes">
                                    <i className="bi-heart fs-4"></i>
                                    <span className="ms-2 d-none d-lg-inline">Cobros</span>
                                </Link>
                            </li>

                            {/* Reportes */}
                            <li className="nav-item">
                                <Link to="/dashboard/usuarios" className={`nav-link link-light py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/usuarios' ? 'active' : ''}`} title="Gestión de Usuarios">
                                    <i className="bi-clipboard-data fs-4"></i>
                                    <span className="ms-2 d-none d-lg-inline">Reportes</span>
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

export default DashboardOperator;
