import React, { useId } from "react";
import { Dropdown } from "react-bootstrap";
import { RowActionItem } from "../table/RowActions";
import { ModalVariant } from "../modal-variant/modalVariant";

interface FormModalHeaderProps {
    icon?: string;
    iconContent?: React.ReactNode;
    variant?: ModalVariant;
    title: string;
    subtitle?: React.ReactNode;
    onClose: () => void;
    titleId?: string;
    actions?: RowActionItem[];
}

const FormModalHeader: React.FC<FormModalHeaderProps> = ({
    icon,
    iconContent,
    variant,
    title,
    subtitle,
    onClose,
    titleId,
    actions,
}) => {
    const menuId = useId();
    return (
        <div className="form-modal-header d-flex align-items-start justify-content-between">
            <div className="d-flex align-items-center gap-3">
                {iconContent ?? (
                    <div
                        className={`icon-badge icon-badge-lg${variant ? ` icon-badge-${variant}` : ""}`}
                    >
                        <i className={icon}></i>
                    </div>
                )}
                <div>
                    <h4 id={titleId} className="form-modal-title mb-1">
                        {title}
                    </h4>
                    {subtitle && (
                        <div className="text-muted small">{subtitle}</div>
                    )}
                </div>
            </div>
            <div className="d-flex align-items-center gap-1">
                {actions && actions.length > 0 && (
                    <Dropdown align="end">
                        <Dropdown.Toggle
                            as="button"
                            className="modal-close-btn"
                            id={menuId}
                            aria-label="Más opciones"
                        >
                            <i className="bi bi-three-dots-vertical"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {actions.map((item, idx) => (
                                <Dropdown.Item
                                    key={idx}
                                    onClick={item.onClick}
                                    disabled={item.disabled}
                                    title={item.title}
                                    className={
                                        item.variant === "danger"
                                            ? "text-danger"
                                            : undefined
                                    }
                                >
                                    {item.icon && (
                                        <i className={`${item.icon} me-2`}></i>
                                    )}
                                    {item.label}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                )}
                <button
                    type="button"
                    className="modal-close-btn"
                    onClick={onClose}
                    aria-label="Cerrar"
                >
                    <i className="bi bi-x-lg"></i>
                </button>
            </div>
        </div>
    );
};

export default FormModalHeader;
