import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './UserDashboard.css'
import 'bootstrap/dist/css/bootstrap.min.css';

const UserDashboard: React.FC = () => {

    // Constantes
    const location = useLocation();
    const currentPath = location.pathname;


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
                                <Link to="/dashboard/user/personal-data" className={`nav-link link-light py-3 px-2 d-flex align-items-center ${currentPath === '/dashboard/user/personal-data' ? 'active' : ''}`} title="Mis Datos">
                                    <i className="bi bi-person-square fs-4"></i>
                                    <span className="ms-2 d-none d-lg-inline">Mis Datos</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Main Content */}
                <div className="dashboard-main flex-grow-1 p-4 bg-light">
                    <main>
                        <Outlet /> {/* Aquí se cargarán las secciones dinámicamente */}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;