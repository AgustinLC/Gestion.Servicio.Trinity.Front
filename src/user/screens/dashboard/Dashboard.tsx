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
