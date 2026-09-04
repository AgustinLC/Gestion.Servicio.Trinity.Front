import React, { useId } from "react";
import { Dropdown } from "react-bootstrap";

export interface RowActionItem {
    label: string;
    icon?: string; // Clase de Bootstrap Icons (ej: "bi bi-trash")
    onClick: () => void;
    variant?: "default" | "danger";
    color?: string; // Color hex explícito (ej: para acciones de cambio de estado); tiene prioridad sobre `variant`
    disabled?: boolean;
    title?: string; // Tooltip opcional, útil para explicar por qué está deshabilitado
}

interface RowActionsProps {
    onEdit?: () => void;
    editTitle?: string;
    items?: RowActionItem[];
}

// Patrón estándar de acciones por fila: ícono de lápiz (edición rápida) + menú
// de 3 puntos con acciones secundarias. Usar en la columna "Acciones" de las
// tablas para mantener el mismo lenguaje visual en todo el sistema.
const RowActions: React.FC<RowActionsProps> = ({ onEdit, editTitle = "Editar", items = [] }) => {
    const menuId = useId();
    return (
        <div className="row-actions d-inline-flex align-items-center gap-1">
            {onEdit && (
                <button type="button" className="row-actions-edit" onClick={onEdit} title={editTitle}>
                    <i className="bi bi-pencil"></i>
                </button>
            )}
            {items.length > 0 && (
                <Dropdown align="end" drop="down">
                    <Dropdown.Toggle as="button" className="row-actions-menu" id={menuId}>
                        <i className="bi bi-three-dots-vertical"></i>
                    </Dropdown.Toggle>
                    {/* Sin popperConfig propio a propósito: el default
                        ("absolute") posiciona bien tanto en tablas sueltas
                        como en modales. strategy:"fixed" se probó y se
                        revirtió — rompía la posición dentro de modales (ver
                        .modal-dialog en index.css). */}
                    <Dropdown.Menu>
                        {items.map((item, idx) => (
                            <Dropdown.Item
                                key={idx}
                                onClick={item.onClick}
                                disabled={item.disabled}
                                title={item.title}
                                className={!item.color && item.variant === "danger" ? "text-danger" : undefined}
                                style={item.color ? { color: item.color } : undefined}
                            >
                                {item.icon && <i className={`${item.icon} me-2`}></i>}
                                {item.label}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            )}
        </div>
    );
};

export default RowActions;
