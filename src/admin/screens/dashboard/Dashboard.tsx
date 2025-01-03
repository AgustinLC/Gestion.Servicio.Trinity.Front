import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const Dashboard: React.FC = () => {

    return (
        <div className="navbar-fix d-flex">
            {/* Sidebar */}
            <nav className="sidebar bg-dark text-white">
                <h2 className="text-center py-3">Consorcio</h2>
                <ul className="nav flex-column">
                    <li className="nav-item">
                        <Link to="/dashboard/usuarios" className="nav-link text-white">
                            Gestión de Usuarios
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/dashboard/pagos" className="nav-link text-white">
                            Gestión de Pagos
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/dashboard/consumos" className="nav-link text-white">
                            Registro y Consumos
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/dashboard/reportes" className="nav-link text-white">
                            Reportes
                        </Link>
                    </li>
                </ul>
            </nav>

            {/* Main Content */}
            <div className="main-content flex-grow-1">
                {/* Header */}
                <header className="bg-light border-bottom d-flex justify-content-between align-items-center px-4 py-3">
                    <h4>Bienvenido, Usuario</h4>
                    <div>
                        <button className="btn btn-primary me-2">Botón 1</button>
                        <button className="btn btn-secondary">Botón 2</button>
                    </div>
                </header>

                {/* Content */}
                <main className="p-4">
                    <Outlet /> {/* Aquí se cargarán las secciones dinámicamente */}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
