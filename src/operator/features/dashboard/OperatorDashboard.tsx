import React, { useState } from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { Outlet, Link, useLocation } from "react-router-dom";
import "./OperatorDashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";

const DashboardOperator: React.FC = () => {
    const [activePopover, setActivePopover] = useState<string | null>(null);
    const location = useLocation();
    const currentPath = location.pathname;

    const isReadingSection = [
        "/dashboard/operator/readings/management",
        "/dashboard/operator/readings/take",
    ].includes(currentPath);

    const isBillSection = [
        "/dashboard/operator/bills/management",
        "/dashboard/operator/bills/bulk-generate",
        "/dashboard/operator/bills/individual-generate",
    ].includes(currentPath);

    // Popovers o submenu para el apartado de lecturas
    const ReadingsPopover = (
        <Popover className="submenu-popover">
            <Popover.Body className="p-2">
                <div className="d-flex flex-column">
                    <Link
                        to="/dashboard/operator/readings/management"
                        className={`nav-link link-dark py-2 text-indented ${currentPath === "/dashboard/operator/readings/management"
                                ? "active"
                                : ""
                            }`}
                        onClick={() => setActivePopover(null)}
                    >
                        Gestión de Lecturas
                    </Link>
                    <Link
                        to="/dashboard/operator/readings/take"
                        className={`nav-link link-dark py-2 text-indented ${currentPath === "/dashboard/operator/readings/take"
                                ? "active"
                                : ""
                            }`}
                        onClick={() => setActivePopover(null)}
                    >
                        Tomar Lecturas
                    </Link>
                </div>
            </Popover.Body>
        </Popover>
    );

    // Popovers o submenu para el apartado de facturas
    const BillsPopover = (
        <Popover className="submenu-popover">
            <Popover.Body className="p-2">
                <div className="d-flex flex-column">
                    <Link
                        to="/dashboard/operator/bills/management"
                        className={`nav-link link-dark py-2 text-indented ${currentPath === "/dashboard/operator/bills/management"
                                ? "active"
                                : ""
                            }`}
                        onClick={() => setActivePopover(null)}
                    >
                        Consulta
                    </Link>
                    <Link
                        to="/dashboard/operator/bills/bulk-generate"
                        className={`nav-link link-dark py-2 text-indented ${currentPath === "/dashboard/operator/bills/bulk-generate"
                                ? "active"
                                : ""
                            }`}
                        onClick={() => setActivePopover(null)}
                    >
                        Generación Masiva
                    </Link>
                    <Link
                        to="/dashboard/operator/bills/individual-generate"
                        className={`nav-link link-dark py-2 text-indented ${currentPath === "/dashboard/operator/bills/individual-generate"
                                ? "active"
                                : ""
                            }`}
                        onClick={() => setActivePopover(null)}
                    >
                        Generación Individual
                    </Link>
                </div>
            </Popover.Body>
        </Popover>
    );

    return (
        <div className="d-flex min-vh-100">
            {/* Sidebar */}
            <aside
                className="bg-primary text-light d-flex flex-column align-items-center p-3"
                style={{ width: "174px", position: "sticky", top: 0, height: "100vh" }}
            >
                <ul className="nav nav-pills flex-column w-100">
                    <li className="nav-item">
                        <Link
                            to="/dashboard/operator/resume"
                            className={`nav-link link-light py-3 d-flex align-items-center ${currentPath === "/dashboard/operator/resume" ? "active" : ""
                                }`}
                        >
                            <i className="bi-person-lines-fill fs-4"></i>
                            <span className="ms-2 d-none d-lg-inline">Resumen</span>
                        </Link>
                    </li>

                    <li className="nav-item">
                        <Link
                            to="/dashboard/operator/users"
                            className={`nav-link link-light py-3 d-flex align-items-center ${currentPath === "/dashboard/operator/users" ? "active" : ""
                                }`}
                        >
                            <i className="bi-people fs-4"></i>
                            <span className="ms-2 d-none d-lg-inline">Usuarios</span>
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
                                className={`nav-link link-light py-3 d-flex align-items-center ${isBillSection ? "active-submenu" : ""
                                    }`}
                                role="button"
                            >
                                <i className="bi bi-file-earmark-spreadsheet fs-4"></i>
                                <span className="ms-2 d-none d-lg-inline">Facturas</span>
                                <i
                                    className={`bi-chevron-right ms-1 mt-1 chevron-icon d-none d-lg-inline ${activePopover === "bills" ? "rotate" : ""
                                        }`}
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
                                className={`nav-link link-light py-3 d-flex align-items-center ${isReadingSection ? "active-submenu" : ""
                                    }`}
                                role="button"
                            >
                                <i className="bi-speedometer2 fs-4"></i>
                                <span className="ms-2 d-none d-lg-inline">Lecturas</span>
                                <i
                                    className={`bi-chevron-right ms-1 mt-1 chevron-icon d-none d-lg-inline ${activePopover === "readings" ? "rotate" : ""
                                        }`}
                                ></i>
                            </div>
                        </li>
                    </OverlayTrigger>

                    <li>
                        <Link
                            to="/dashboard/operator/parameters/bills"
                            className={`nav-link link-light py-3 d-flex align-items-center ${currentPath === "/dashboard/operator/parameters/bills"
                                    ? "active"
                                    : ""
                                }`}
                        >
                            <i className="bi bi-journal-plus fs-4"></i>
                            <span className="ms-2 d-none d-lg-inline">Conceptos</span>
                        </Link>
                    </li>

                    <li className="nav-item">
                        <Link
                            to="/dashboard/operator/reports"
                            className={`nav-link link-light py-3 d-flex align-items-center ${currentPath === "/dashboard/operator/reports" ? "active" : ""
                                }`}
                        >
                            <i className="bi-clipboard-data fs-4"></i>
                            <span className="ms-2 d-none d-lg-inline">Reportes</span>
                        </Link>
                    </li>
                </ul>
            </aside>

            {/* Contenido principal */}
            <main
                className="flex-grow-1 p-4 bg-light"
                style={{ overflowX: "auto" }}
            >
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardOperator;
