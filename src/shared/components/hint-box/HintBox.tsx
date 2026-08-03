import React from "react";

interface HintBoxProps {
    icon?: string; // Clase de Bootstrap Icons
    variant?: "info" | "danger"; // info (celeste, default) o danger (rojo, ej. fecha vencida)
    className?: string;
    children: React.ReactNode;
}

// Caja de aviso/nota reutilizable (ícono + texto sobre fondo pastel), para
// aclaraciones dentro de cualquier formulario del sistema. variant="danger"
// para cuando la nota advierte algo (ej. una fecha ya vencida) en vez de
// solo informar.
const HintBox: React.FC<HintBoxProps> = ({ icon, variant = "info", className = "", children }) => {
    const resolvedIcon = icon ?? (variant === "danger" ? "bi bi-exclamation-triangle-fill" : "bi bi-info-circle-fill");
    return (
        <div className={`hint-box ${variant === "danger" ? "hint-box-danger" : ""} ${className}`}>
            <i className={resolvedIcon}></i>
            <span>{children}</span>
        </div>
    );
};

export default HintBox;
