import React from "react";

interface FormSectionHeaderProps {
    icon: string; // Clase de Bootstrap Icons (ej: "bi bi-geo-alt")
    title: string;
    subtitle?: string; // Aclaración opcional debajo del título (ej. qué hace esta sección)
    className?: string;
}

// Encabezado reutilizable para una sección dentro de un formulario (ícono
// circular chico + título en negrita, con subtítulo opcional). Mismo patrón
// que se repetía con clases distintas en cada formulario (AddEditUserModal,
// BillGeneratePage).
const FormSectionHeader: React.FC<FormSectionHeaderProps> = ({ icon, title, subtitle, className = "" }) => {
    return (
        <div className={`d-flex align-items-start gap-3 ${subtitle ? "mb-3" : "mb-2"} ${className}`}>
            <div className="icon-badge">
                <i className={icon}></i>
            </div>
            <div>
                <h6 className={`form-section-title ${subtitle ? "mb-1" : "mb-0"}`}>{title}</h6>
                {subtitle && <div className="text-muted small">{subtitle}</div>}
            </div>
        </div>
    );
};

export default FormSectionHeader;
