import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../../context/SidebarContext";
import {
    SidebarSubmenuGroup,
    SidebarSubmenuItem,
} from "../../../shared/components/sidebar-submenu/SidebarSubmenu";
import logo from "../../../assets/img/logoNavbar.svg";
import "./OperatorDashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";

const DashboardOperator: React.FC = () => {
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
    const { isMobile, sidebarOpen, closeSidebar } = useSidebar();
    const location = useLocation();
    const currentPath = location.pathname;

    const isReadingSection = [
        "/dashboard/operator/readings/management",
        "/dashboard/operator/readings/take",
        "/dashboard/operator/readings/control",
    ].includes(currentPath);

    const isBillSection = [
        "/dashboard/operator/bills/management",
        "/dashboard/operator/bills/generate",
        "/dashboard/operator/bills/generate-filtered",
        "/dashboard/operator/bills/update-expiration",
    ].includes(currentPath);

    // Expande automáticamente el grupo correspondiente al entrar en una de
    // sus rutas (por link directo, F5, etc.), sin pisar un cierre manual
    // posterior mientras se sigue navegando dentro de la misma sección.
    useEffect(() => {
        if (isReadingSection) setExpandedMenu("readings");
    }, [isReadingSection]);

    useEffect(() => {
        if (isBillSection) setExpandedMenu("bills");
    }, [isBillSection]);

    return (
        <div className="dashboard-container d-flex">
            {/* Sidebar */}
            <aside
                className={`sidebar d-flex flex-column p-3 ${isMobile ? (sidebarOpen ? "open" : "collapsed") : "open"}`}
            >
                <ul className="nav nav-pills flex-column w-100">
                    {/* Resumen */}
                    <li className="nav-item">
                        <Link
                            to="/dashboard/operator/resume"
                            className={`nav-link py-3 d-flex align-items-center ${currentPath === "/dashboard/operator/resume" ? "active" : ""}`}
                            title="Resumen"
                            onClick={closeSidebar}
                        >
                            <i className="bi-person-lines-fill fs-4"></i>
                            <span className="ms-2 d-lg-inline">Resumen</span>
                        </Link>
                    </li>
                    {/* Usuarios */}
                    <li className="nav-item">
                        <Link
                            to="/dashboard/operator/users"
                            className={`nav-link py-3 d-flex align-items-center ${currentPath === "/dashboard/operator/users" ? "active" : ""}`}
                            title="Usuarios"
                            onClick={closeSidebar}
                        >
                            <i className="bi-people fs-4"></i>
                            <span className="ms-2 d-lg-inline">Usuarios</span>
                        </Link>
                    </li>

                    {/* Lecturas */}
                    <SidebarSubmenuGroup
                        icon="bi-speedometer2"
                        label="Lecturas"
                        active={isReadingSection}
                        expanded={expandedMenu === "readings"}
                        onToggle={() =>
                            setExpandedMenu((prev) =>
                                prev === "readings" ? null : "readings"
                            )
                        }
                    >
                        <SidebarSubmenuItem
                            to="/dashboard/operator/readings/management"
                            icon="bi bi-bar-chart-line-fill"
                            label="Gestionar"
                            active={
                                currentPath ===
                                "/dashboard/operator/readings/management"
                            }
                            onClick={closeSidebar}
                        />
                        <SidebarSubmenuItem
                            to="/dashboard/operator/readings/take"
                            icon="bi bi-calendar2-check-fill"
                            label="Cargar actuales"
                            active={
                                currentPath ===
                                "/dashboard/operator/readings/take"
                            }
                            onClick={closeSidebar}
                        />
                        <SidebarSubmenuItem
                            to="/dashboard/operator/readings/control"
                            icon="bi bi-shield-check"
                            label="Controlar"
                            active={
                                currentPath ===
                                "/dashboard/operator/readings/control"
                            }
                            onClick={closeSidebar}
                        />
                    </SidebarSubmenuGroup>

                    {/* Facturas */}
                    <SidebarSubmenuGroup
                        icon="bi bi-file-earmark-spreadsheet"
                        label="Facturas"
                        active={isBillSection}
                        expanded={expandedMenu === "bills"}
                        onToggle={() =>
                            setExpandedMenu((prev) =>
                                prev === "bills" ? null : "bills"
                            )
                        }
                    >
                        <SidebarSubmenuItem
                            to="/dashboard/operator/bills/management"
                            icon="bi bi-search"
                            label="Gestionar"
                            active={
                                currentPath ===
                                "/dashboard/operator/bills/management"
                            }
                            onClick={closeSidebar}
                        />
                        <SidebarSubmenuItem
                            to="/dashboard/operator/bills/generate"
                            icon="bi bi-file-earmark-plus-fill"
                            label="Generar"
                            active={
                                currentPath ===
                                "/dashboard/operator/bills/generate"
                            }
                            onClick={closeSidebar}
                        />
                        <SidebarSubmenuItem
                            to="/dashboard/operator/bills/generate-filtered"
                            icon="bi bi-file-earmark-pdf-fill"
                            label="Descargar PDF's"
                            active={
                                currentPath ===
                                "/dashboard/operator/bills/generate-filtered"
                            }
                            onClick={closeSidebar}
                        />
                        <SidebarSubmenuItem
                            to="/dashboard/operator/bills/update-expiration"
                            icon="bi bi-calendar-event-fill"
                            label="Actualizar Vencimiento"
                            active={
                                currentPath ===
                                "/dashboard/operator/bills/update-expiration"
                            }
                            onClick={closeSidebar}
                        />
                    </SidebarSubmenuGroup>

                    {/* Deudores */}
                    <li className="nav-item">
                        <Link
                            to="/dashboard/operator/debt-disconnection"
                            className={`nav-link py-3 d-flex align-items-center ${currentPath === "/dashboard/operator/debt-disconnection" ? "active" : ""}`}
                            title="Deudores"
                            onClick={closeSidebar}
                        >
                            <i className="bi bi-exclamation-triangle fs-4"></i>
                            <span className="ms-2 d-lg-inline">Deudores</span>
                        </Link>
                    </li>

                    {/* Conceptos */}
                    <li>
                        <Link
                            to="/dashboard/operator/parameters/bills"
                            className={`nav-link py-3 d-flex align-items-center ${currentPath === "/dashboard/operator/parameters/bills" ? "active" : ""}`}
                            title="Conceptos"
                            onClick={closeSidebar}
                        >
                            <i className="bi bi-journal-plus fs-4"></i>
                            <span className="ms-2 d-lg-inline">Conceptos</span>
                        </Link>
                    </li>

                    {/* Descuentos */}
                    <li className="nav-item">
                        <Link
                            to="/dashboard/operator/discounts"
                            className={`nav-link py-3 d-flex align-items-center ${currentPath === "/dashboard/operator/discounts" ? "active" : ""}`}
                            title="Descuentos"
                            onClick={closeSidebar}
                        >
                            <i className="bi bi-plus-slash-minus fs-4"></i>
                            <span className="ms-2 d-lg-inline">Descuentos</span>
                        </Link>
                    </li>

                    {/* Reportes */}
                    <li className="nav-item">
                        <Link
                            to="/dashboard/operator/reports"
                            className={`nav-link py-3 d-flex align-items-center ${currentPath === "/dashboard/operator/reports" ? "active" : ""}`}
                            title="Reportes"
                            onClick={closeSidebar}
                        >
                            <i className="bi-clipboard-data fs-4"></i>
                            <span className="ms-2 d-lg-inline">Reportes</span>
                        </Link>
                    </li>
                </ul>

                {/* Tarjeta de marca */}
                <div className="sidebar-footer mt-auto w-100">
                    <div className="sidebar-footer-icon">
                        <img src={logo} alt="Logo" />
                    </div>
                    <div className="sidebar-footer-text">
                        <div className="sidebar-footer-title">
                            Sistema de gestión
                        </div>
                        <div className="sidebar-footer-subtitle">
                            Consorcio de Agua
                        </div>
                        <div className="sidebar-footer-version">
                            Versión 1.0.0
                        </div>
                    </div>
                </div>
            </aside>

            {/* Contenido principal */}
            <main className="dashboard-main flex-grow-1 p-4">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardOperator;
