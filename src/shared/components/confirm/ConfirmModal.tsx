import { Modal, Button, ModalProps } from "react-bootstrap";
import FormModalHeader from "../form-modal-header/FormModalHeader";

// Ícono por defecto según la variante, para no tener que pasarlo en cada uso.
const DEFAULT_VARIANT_ICON: Record<string, string> = {
    danger: "bi bi-exclamation-triangle-fill",
    warning: "bi bi-exclamation-circle-fill",
    success: "bi bi-check-circle-fill",
    info: "bi bi-info-circle-fill",
};

// Propiedades del modal de confirmación
interface ConfirmModalProps extends ModalProps {
    title: string;
    message: string | React.ReactNode;
    icon?: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: string;
    isLoading?: boolean;
    loadingText?: string;
    confirmDisabled?: boolean; // Deshabilita el botón de confirmar independientemente de isLoading (ej: validación de un campo)
    onConfirm: () => void;
    onCancel?: () => void;
}

// Componente de modal de confirmación, con el mismo header (ícono circular +
// título) y footer que el resto de los modales del sistema.
const ConfirmModal = ({
    title,
    message,
    icon,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    confirmVariant = "danger",
    isLoading = false,
    loadingText = "Procesando...",
    confirmDisabled = false,
    onConfirm,
    onCancel,
    ...props
}: ConfirmModalProps) => {

    const handleCancel = onCancel || (() => props.onHide?.());

    // Render
    return (
        <Modal
            {...props}
            centered
            backdrop="static"
            contentClassName="form-modal-content"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-description"
        >
            <FormModalHeader
                icon={icon ?? DEFAULT_VARIANT_ICON[confirmVariant] ?? "bi bi-question-circle-fill"}
                title={title}
                onClose={handleCancel}
                titleId="confirm-modal-title"
            />

            <Modal.Body id="confirm-modal-description">
                {message}

                <div className="form-modal-footer d-flex justify-content-end gap-2 mt-3">
                    <Button
                        variant="outline-secondary"
                        onClick={handleCancel}
                        aria-label={cancelText}
                        disabled={isLoading}
                    >
                        <i className="bi bi-x-circle me-1"></i> {cancelText}
                    </Button>
                    <Button
                        variant={confirmVariant}
                        onClick={onConfirm}
                        aria-label={confirmText}
                        disabled={isLoading || confirmDisabled}
                    >
                        {isLoading ? loadingText : confirmText}
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ConfirmModal;