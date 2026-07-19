import React from "react";

interface HintBoxProps {
    icon?: string; // Clase de Bootstrap Icons
    className?: string;
    children: React.ReactNode;
}

// Caja de aviso/nota reutilizable (ícono + texto sobre fondo celeste
// pastel), para aclaraciones dentro de cualquier formulario del sistema.
const HintBox: React.FC<HintBoxProps> = ({ icon = "bi bi-info-circle-fill", className = "", children }) => {
    return (
        <div className={`hint-box ${className}`}>
            <i className={icon}></i>
            <span>{children}</span>
        </div>
    );
};

export default HintBox;
