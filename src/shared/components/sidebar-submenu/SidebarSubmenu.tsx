import React from "react";
import { Collapse } from "react-bootstrap";
import { Link } from "react-router-dom";

interface SidebarSubmenuGroupProps {
    icon: string;
    label: string;
    active: boolean; // Alguna de las rutas hijas está activa
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

// Reemplaza al viejo submenú flotante (Popover): el grupo se expande debajo
// del ítem padre y queda siempre visible mientras el usuario navega dentro
// de esa sección, en vez de desaparecer al mover el mouse.
export const SidebarSubmenuGroup: React.FC<SidebarSubmenuGroupProps> = ({ icon, label, active, expanded, onToggle, children }) => {
    return (
        <li className="nav-item sidebar-submenu-group">
            <button
                type="button"
                className={`nav-link py-3 d-flex align-items-center w-100 border-0 bg-transparent ${active ? "active-submenu" : ""}`}
                onClick={onToggle}
                title={label}
                aria-expanded={expanded}
            >
                <i className={`${icon} fs-4`}></i>
                <span className="ms-2 d-lg-inline flex-grow-1 text-start">{label}</span>
                <i className={`bi-chevron-down sidebar-submenu-chevron d-none d-lg-inline ${expanded ? "rotate" : ""}`}></i>
            </button>
            <Collapse in={expanded}>
                <ul className="sidebar-submenu list-unstyled">{children}</ul>
            </Collapse>
        </li>
    );
};

interface SidebarSubmenuItemProps {
    to: string;
    label: string;
    active: boolean;
    onClick?: () => void;
}

export const SidebarSubmenuItem: React.FC<SidebarSubmenuItemProps> = ({ to, label, active, onClick }) => {
    return (
        <li>
            <Link to={to} className={`sidebar-submenu-link ${active ? "active" : ""}`} onClick={onClick}>
                <span className="sidebar-submenu-dot"></span>
                {label}
            </Link>
        </li>
    );
};
