import React from "react";

interface FormModalHeaderProps {
    icon: string; // Clase de Bootstrap Icons (ej: "bi bi-person")
    title: string;
    subtitle?: string;
    onClose: () => void;
    titleId?: string;
}

// Header reutilizable para modales de formulario (ícono circular + título +
// subtítulo + botón de cerrar). Reemplaza el Modal.Header genérico de
// Bootstrap para que todos los modales del sistema compartan el mismo look,
// en vez de que cada uno redefina su propio "header a mano".
const FormModalHeader: React.FC<FormModalHeaderProps> = ({ icon, title, subtitle, onClose, titleId }) => {
    return (
        <div className="form-modal-header d-flex align-items-start justify-content-between">
            <div className="d-flex align-items-center gap-3">
                <div className="icon-badge icon-badge-lg">
                    <i className={icon}></i>
                </div>
                <div>
                    <h4 id={titleId} className="form-modal-title mb-1">{title}</h4>
                    {subtitle && <div className="text-muted small">{subtitle}</div>}
                </div>
            </div>
            <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
                <i className="bi bi-x-lg"></i>
            </button>
        </div>
    );
};

export default FormModalHeader;
