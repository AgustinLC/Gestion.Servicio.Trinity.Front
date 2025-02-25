import { Modal, Button, ModalProps } from "react-bootstrap";

// Propiedades del modal de confirmación
interface ConfirmModalProps extends ModalProps {
    title: string;
    message: string | React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: string;
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
}

// Componente de modal de confirmación
const ConfirmModal = ({ 
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    confirmVariant = "danger",
    isLoading = false,
    onConfirm,
    onCancel,
    ...props
}: ConfirmModalProps) => {

    // Render
    return (
        <Modal
            {...props}
            centered
            backdrop="static"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-description"
        >
            <Modal.Header closeButton>
                <Modal.Title id="confirm-modal-title">{title}</Modal.Title>
            </Modal.Header>

            <Modal.Body id="confirm-modal-description">
                {message}
            </Modal.Body>

            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={onCancel || (() => props.onHide?.())}
                    aria-label={cancelText}
                >
                    {cancelText}
                </Button>
                <Button
                    variant={confirmVariant}
                    onClick={onConfirm}
                    aria-label={confirmText}
                    disabled={isLoading}
                >
                    {isLoading ? "Eliminando..." : "Confirmar"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmModal;