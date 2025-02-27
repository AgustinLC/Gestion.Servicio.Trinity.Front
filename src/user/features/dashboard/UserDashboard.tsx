import React, { useState } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './UserDashboard.css'
import 'bootstrap/dist/css/bootstrap.min.css';

const UserDashboard: React.FC = () => {
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

    return (
        <div className="container-fluid">
            <div className="row">

                {/* Sidebar */}
                <div className="bg-primary sticky-top sidebar">
                    <div className="d-flex flex-sm-column flex-row flex-nowrap bg-primary align-items-center">
                        <ul className="nav nav-pills nav-flush flex-sm-column flex-row flex-nowrap mb-auto mx-auto text-center justify-content-between w-100 px-3">

                            {/* Resumen */}
                            <li className="nav-item">
                                <Link to="/dashboard/user/resume" className={`nav-link link-light py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/user/resume' ? 'active' : ''}`} title="Resumen">
                                    <i className="bi-person-lines-fill fs-4"></i>
                                    <span className="ms-2 d-none d-lg-inline">Resumen</span>
                                </Link>
                            </li>

                            {/* Usuarios */}
                            <li className="nav-item">
                                <Link to="/dashboard/user/bills" className={`nav-link link-light py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/user/bills' ? 'active' : ''}`} title="Facturas">
                                    <i className="bi bi-file-earmark-spreadsheet fs-4"></i>
                                    <span className="ms-2 d-none d-lg-inline">Facturas</span>
                                </Link>
                            </li>

                            {/* Facturas */}
                            <li>
                                <Link to="/dashboard/user/consumptions" className={`nav-link link-light py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/user/consumptions' ? 'active' : ''}`} title="Consumos">
                                    <i className="bi-clipboard-data fs-4"></i>
                                    <span className="ms-2 d-none d-lg-inline">Consumos</span>
                                </Link>
                            </li>

                            {/* Reportes */}
                            <li className="nav-item">
                                <Link to="/dashboard/usuarios" className={`nav-link link-light py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/usuarios' ? 'active' : ''}`} title="Mis Datos">
                                    <i className="bi bi-person-square fs-4"></i>
                                    <span className="ms-2 d-none d-lg-inline">Mis Datos</span>
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

export default UserDashboard;