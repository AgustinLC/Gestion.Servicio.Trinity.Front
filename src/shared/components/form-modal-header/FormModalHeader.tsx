import React, { useId } from "react";
import { Dropdown } from "react-bootstrap";
import { RowActionItem } from "../table/RowActions";

interface FormModalHeaderProps {
    icon?: string; // Clase de Bootstrap Icons (ej: "bi bi-person"). Ignorado si se pasa iconContent.
    // Reemplaza el icon-badge por defecto con un ícono a medida (ej. un
    // ícono compuesto con una insignia superpuesta). Ver
    // ChangeStatusConfirmModal para un ejemplo de uso.
    iconContent?: React.ReactNode;
    title: string;
    subtitle?: React.ReactNode;
    onClose: () => void;
    titleId?: string;
    // Menú de opciones (3 puntos) entre el título y el botón de cerrar, para
    // acciones secundarias del registro que se edita (ej: restablecer
    // contraseña, eliminar) que no ameritan un botón propio en el footer.
    actions?: RowActionItem[];
}

// Header reutilizable para modales de formulario (ícono circular + título +
// subtítulo + botón de cerrar). Reemplaza el Modal.Header genérico de
// Bootstrap para que todos los modales del sistema compartan el mismo look,
// en vez de que cada uno redefina su propio "header a mano".
const FormModalHeader: React.FC<FormModalHeaderProps> = ({ icon, iconContent, title, subtitle, onClose, titleId, actions }) => {
    const menuId = useId();
    return (
        <div className="form-modal-header d-flex align-items-start justify-content-between">
            <div className="d-flex align-items-center gap-3">
                {iconContent ?? (
                    <div className="icon-badge icon-badge-lg">
                        <i className={icon}></i>
                    </div>
                )}
                <div>
                    <h4 id={titleId} className="form-modal-title mb-1">{title}</h4>
                    {subtitle && <div className="text-muted small">{subtitle}</div>}
                </div>
            </div>
            <div className="d-flex align-items-center gap-1">
                {actions && actions.length > 0 && (
                    <Dropdown align="end">
                        <Dropdown.Toggle as="button" className="modal-close-btn" id={menuId} aria-label="Más opciones">
                            <i className="bi bi-three-dots-vertical"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {actions.map((item, idx) => (
                                <Dropdown.Item
                                    key={idx}
                                    onClick={item.onClick}
                                    disabled={item.disabled}
                                    title={item.title}
                                    className={item.variant === "danger" ? "text-danger" : undefined}
                                >
                                    {item.icon && <i className={`${item.icon} me-2`}></i>}
                                    {item.label}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                )}
                <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
                    <i className="bi bi-x-lg"></i>
                </button>
            </div>
        </div>
    );
};

export default FormModalHeader;
