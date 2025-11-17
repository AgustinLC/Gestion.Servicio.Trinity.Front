import React, { useState, useEffect } from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { Outlet, Link, useLocation } from "react-router-dom";
import "./OperatorDashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";

const DashboardOperator: React.FC = () => {
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

    const isReadingSection = [
        "/dashboard/operator/readings/management",
        "/dashboard/operator/readings/take",
    ].includes(currentPath);

    const isBillSection = [
        "/dashboard/operator/bills/management",
        "/dashboard/operator/bills/bulk-generate",
        "/dashboard/operator/bills/individual-generate",
        "/dashboard/operator/bills/generate-filtered",
    ].includes(currentPath);

    // Popovers
    const ReadingsPopover = (
        <Popover className="submenu-popover">
            <Popover.Body className="p-2 d-flex flex-column">
                <Link
                    to="/dashboard/operator/readings/management"
                    className={`nav-link link-dark py-2 text-indented ${currentPath === "/dashboard/operator/readings/management" ? "active" : ""}`}
                    onClick={() => setActivePopover(null)}
                >
                    Gestión de Lecturas
                </Link>
                <Link
                    to="/dashboard/operator/readings/take"
                    className={`nav-link link-dark py-2 text-indented ${currentPath === "/dashboard/operator/readings/take" ? "active" : ""}`}
                    onClick={() => setActivePopover(null)}
                >
                    Tomar Lecturas
                </Link>
            </Popover.Body>
        </Popover>
    );

    const BillsPopover = (
        <Popover className="submenu-popover">
            <Popover.Body className="p-2 d-flex flex-column">
                <Link
                    to="/dashboard/operator/bills/management"
                    className={`nav-link link-dark py-2 text-indented ${currentPath === "/dashboard/operator/bills/management" ? "active" : ""}`}
                    onClick={() => setActivePopover(null)}
                >
                    Consulta
                </Link>
                <Link
                    to="/dashboard/operator/bills/bulk-generate"
                    className={`nav-link link-dark py-2 text-indented ${currentPath === "/dashboard/operator/bills/bulk-generate" ? "active" : ""}`}
                    onClick={() => setActivePopover(null)}
                >
                    Generación Masiva
                </Link>
                <Link
                    to="/dashboard/operator/bills/individual-generate"
                    className={`nav-link link-dark py-2 text-indented ${currentPath === "/dashboard/operator/bills/individual-generate" ? "active" : ""}`}
                    onClick={() => setActivePopover(null)}
                >
                    Generación Individual
                </Link>
                <Link
                    to="/dashboard/operator/bills/generate-filtered"
                    className={`nav-link link-dark py-2 text-indented ${currentPath === "/dashboard/operator/bills/generate-filtered" ? "active" : ""}`}
                    onClick={() => setActivePopover(null)}
                >
                    Generación por Filtros
                </Link>
            </Popover.Body>
        </Popover>
    );

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
                    {/* Resumen */}
                    <li className="nav-item">
                        <Link
                            to="/dashboard/operator/resume"
                            className={`nav-link link-light py-3 d-flex align-items-center ${currentPath === "/dashboard/operator/resume" ? "active" : ""}`}
                        >
                            <i className="bi-person-lines-fill fs-4"></i>
                            <span className="ms-2 d-lg-inline">Resumen</span>
                        </Link>
                    </li>
                    {/* Usuarios */}
                    <li className="nav-item">
                        <Link
                            to="/dashboard/operator/users"
                            className={`nav-link link-light py-3 d-flex align-items-center ${currentPath === "/dashboard/operator/users" ? "active" : ""}`}
                        >
                            <i className="bi-people fs-4"></i>
                            <span className="ms-2 d-lg-inline">Usuarios</span>
                        </Link>
                    </li>

                    {/* Facturas */}
                    <OverlayTrigger
                        trigger="click"
                        placement={window.innerWidth <= 768 ? "bottom" : "right"}
                        show={activePopover === "bills"}
                        onToggle={(show) => setActivePopover(show ? "bills" : "")}
                        overlay={BillsPopover}
                        rootClose
                    >
                        <li className="nav-item popover-trigger">
                            <div
                                className={`nav-link link-light py-3 d-flex align-items-center ${isBillSection ? "active-submenu" : ""}`}
                                role="button"
                            >
                                <i className="bi bi-file-earmark-spreadsheet fs-4"></i>
                                <span className="ms-2 d-lg-inline">Facturas</span>
                                <i
                                    className={`bi-chevron-right ms-1 mt-1 chevron-icon d-none d-lg-inline ${activePopover === "bills" ? "rotate" : ""}`}
                                ></i>
                            </div>
                        </li>
                    </OverlayTrigger>

                    {/* Lecturas */}
                    <OverlayTrigger
                        trigger="click"
                        placement={window.innerWidth <= 768 ? "bottom" : "right"}
                        show={activePopover === "readings"}
                        onToggle={(show) => setActivePopover(show ? "readings" : "")}
                        overlay={ReadingsPopover}
                        rootClose
                    >
                        <li className="nav-item popover-trigger">
                            <div
                                className={`nav-link link-light py-3 d-flex align-items-center ${isReadingSection ? "active-submenu" : ""}`}
                                role="button"
                            >
                                <i className="bi-speedometer2 fs-4"></i>
                                <span className="ms-2  d-lg-inline">Lecturas</span>
                                <i className={`bi-chevron-right ms-1 mt-1 chevron-icon d-none d-lg-inline ${activePopover === "readings" ? "rotate" : ""}`}></i>
                            </div>
                        </li>
                    </OverlayTrigger>

                    {/* Conceptos */}
                    <li>
                        <Link to="/dashboard/operator/parameters/bills" className={`nav-link link-light py-3 d-flex align-items-center ${currentPath === "/dashboard/operator/parameters/bills" ? "active" : ""}`}>
                            <i className="bi bi-journal-plus fs-4"></i>
                            <span className="ms-2 d-lg-inline">Conceptos</span>
                        </Link>
                    </li>

                    {/* Reportes */}
                    <li className="nav-item">
                        <Link to="/dashboard/operator/reports" className={`nav-link link-light py-3 d-flex align-items-center ${currentPath === "/dashboard/operator/reports" ? "active" : ""}`}>
                            <i className="bi-clipboard-data fs-4"></i>
                            <span className="ms-2 d-lg-inline">Reportes</span>
                        </Link>
                    </li>

                    {/* Descuentos */}
                    <li className="nav-item">
                        <Link to="/dashboard/operator/discounts" className={`nav-link link-light py-3 d-flex align-items-center ${currentPath === '/dashboard/operator/discounts' ? 'active' : ''}`} title="Gestion de modalidad" onClick={() => setSidebarOpen(false)}>
                            <i className="bi bi-plus-slash-minus fs-4"></i>
                            <span className="ms-2 d-lg-inline">Descuentos</span>
                        </Link>
                    </li>
                </ul>
            </aside>

            {/* Contenido principal */}
            <main className="dashboard-main flex-grow-1 p-4 bg-light">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardOperator;
