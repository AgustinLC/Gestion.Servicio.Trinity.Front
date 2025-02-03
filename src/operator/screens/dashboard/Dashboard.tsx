import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <div className="container-fluid">
            <div className="row">

                {/* Sidebar */}
                <div className="col-sm-auto bg-primary sticky-top">
                    <div className="d-flex flex-sm-column flex-row flex-nowrap bg-primary align-items-center">
                        <ul className="nav nav-pills nav-flush flex-sm-column flex-row flex-nowrap mb-auto mx-auto text-center justify-content-between w-100 px-3">
                            <li className="nav-item">
                                <Link to="/dashboard/usuarios" className={`nav-link link-light py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/usuarios' ? 'active' : ''}`} title="Gestión de Usuarios">
                                    <i className="bi-person-lines-fill fs-4"></i>
                                    <span className="ms-2 d-none d-lg-inline">Resumen</span>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/dashboard/admin/users" className={`nav-link link-light py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/admin/users' ? 'active' : ''}`} title="Gestión de Usuarios">
                                    <i className="bi-people fs-4"></i>
                                    <span className="ms-2 d-none d-lg-inline">Usuarios</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/pagos" className={`nav-link link-light py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/pagos' ? 'active' : ''}`} title="Gestión de Pagos">
                                    <i className="bi-table fs-4"></i>
                                    <span className="ms-2 d-none d-lg-inline">Facturas</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/consumos" className={`nav-link link-light py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/consumos' ? 'active' : ''}`} title="Registro y Consumos">
                                    <i className="bi-speedometer2 fs-4"></i>
                                    <span className="ms-2 d-none d-lg-inline">Lecturas</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/reportes" className={`nav-link link-light py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/reportes' ? 'active' : ''}`} title="Reportes">
                                    <i className="bi-heart fs-4"></i>
                                    <span className="ms-2 d-none d-lg-inline">Cobros</span>
                                </Link>
                            </li>
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

export default Dashboard;
