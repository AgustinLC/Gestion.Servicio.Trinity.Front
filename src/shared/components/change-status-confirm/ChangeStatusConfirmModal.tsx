import React from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { Status } from "../../../core/models/dto/Status";
import { STATUS_ACTION_CONFIG, STATUS_BADGE_CLASS, STATUS_DOT_COLORS, STATUS_OPTIONS } from "../labels-traductor/statusStyles";
import FormModalHeader from "../form-modal-header/FormModalHeader";
import { useModalLayer } from "../../../context/ModalStackContext";
import { onBackdropClick } from "../../hooks/useConfirmDiscard";

interface ChangeStatusConfirmModalProps {
    show: boolean;
    userName: string;
    nextStatus: Status | null;
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

// Modal de confirmación específico para el cambio de estado de un usuario:
// ícono de persona con una insignia de estado superpuesta, coloreado según
// el estado DESTINO (ver STATUS_ACTION_CONFIG), y un botón de acción con el
// verbo corto ("Activar"/no "Activar usuario", ya que el sujeto es obvio
// por contexto). Reemplaza al ConfirmModal genérico solo para este caso.
const ChangeStatusConfirmModal: React.FC<ChangeStatusConfirmModalProps> = ({
    show,
    userName,
    nextStatus,
    isLoading = false,
    onConfirm,
    onCancel,
}) => {
    const modalZIndex = useModalLayer(show);

    if (!nextStatus) return null;

    const config = STATUS_ACTION_CONFIG[nextStatus];
    const statusLabel = STATUS_OPTIONS.find((o) => o.value === nextStatus)?.label ?? nextStatus;

    return (
        <Modal
            show={show}
            onHide={onCancel}
            onClick={onBackdropClick(onCancel)}
            centered
            backdrop
            backdropClassName="modal-click-backdrop"
            style={{ zIndex: modalZIndex }}
            contentClassName="form-modal-content"
            aria-labelledby="change-status-modal-title"
        >
            <div className="change-status-header">
                <FormModalHeader
                    iconContent={
                        <div className={`status-change-icon ${STATUS_BADGE_CLASS[nextStatus]}`}>
                            <i className="bi bi-person-fill"></i>
                            <span className="status-change-icon-badge" style={{ backgroundColor: STATUS_DOT_COLORS[nextStatus] }}>
                                <i className={`bi ${config.badgeIcon}`}></i>
                            </span>
                        </div>
                    }
                    title="Cambiar estado del usuario"
                    subtitle={
                        <div className="pt-2">
                            ¿Cambiar el estado de <strong className="text-dark">{userName}</strong> a "
                            <strong style={{ color: STATUS_DOT_COLORS[nextStatus] }}>{statusLabel}</strong>"?
                        </div>
                    }
                    onClose={onCancel}
                    titleId="change-status-modal-title"
                />
            </div>

            <div className="form-modal-footer d-flex justify-content-end gap-2 px-4 py-3">
                <Button variant="outline-secondary" onClick={onCancel} disabled={isLoading}>
                    <i className="bi bi-x-circle me-1"></i> Cancelar
                </Button>
                <Button variant={config.confirmVariant} onClick={onConfirm} disabled={isLoading}>
                    {isLoading ? (
                        <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                        <i className={`bi ${config.badgeIcon} me-1`}></i>
                    )}
                    {config.actionLabel}
                </Button>
            </div>
        </Modal>
    );
};

export default ChangeStatusConfirmModal;
