import { Modal, Button, ModalProps } from "react-bootstrap";
import FormModalHeader from "../form-modal-header/FormModalHeader";
import HintBox from "../hint-box/HintBox";
import { useModalLayer } from "../../../context/ModalStackContext";
import { onBackdropClick } from "../../hooks/useConfirmDiscard";
import { ModalVariant, MODAL_VARIANTS } from "../modal-variant/modalVariant";

// HintBox solo tiene 3 variantes de color (info/danger/warning); mapeamos
// las 5 del modal a la más parecida.
const HINT_VARIANT: Record<ModalVariant, "info" | "danger" | "warning"> = {
    info: "info",
    warning: "warning",
    error: "danger",
    success: "info",
    question: "info",
};

// Ícono por defecto según confirmVariant, para el layout "clásico" (sin la
// prop variant) — se mantiene tal cual para no alterar los usos existentes.
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
    // Layout "centrado" (ícono grande arriba, título y mensaje debajo, todo
    // centrado — ver Figma) con el color de ícono/botón de modalVariant.ts.
    // Sin esta prop, ConfirmModal sigue con el layout de siempre
    // (FormModalHeader a la izquierda) para no alterar los usos existentes.
    variant?: ModalVariant;
    // Nota aparte dentro de una cajita tipo HintBox (ej. "Esta acción no se
    // puede deshacer"), debajo del mensaje. Solo se usa en el layout
    // centrado (con variant).
    hint?: React.ReactNode;
    hintIcon?: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: string;
    // Íconos de los botones del footer. cancelIcon ya tiene el mismo default
    // de siempre (bi-x-circle); confirmIcon no tenía ícono antes, así que
    // por default sigue sin él salvo que se pase explícitamente.
    cancelIcon?: string;
    confirmIcon?: string;
    isLoading?: boolean;
    loadingText?: string;
    confirmDisabled?: boolean; // Deshabilita el botón de confirmar independientemente de isLoading (ej: validación de un campo)
    onConfirm: () => void;
    onCancel?: () => void;
}

const ConfirmModal = ({
    title,
    message,
    icon,
    variant,
    hint,
    hintIcon,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    confirmVariant,
    cancelIcon = "bi bi-x-circle",
    confirmIcon,
    isLoading = false,
    loadingText = "Procesando...",
    confirmDisabled = false,
    onConfirm,
    onCancel,
    ...props
}: ConfirmModalProps) => {
    const handleCancel = onCancel || (() => props.onHide?.());
    const modalZIndex = useModalLayer(props.show ?? false);

    const resolvedIcon = variant
        ? icon ?? MODAL_VARIANTS[variant].icon
        : icon ?? DEFAULT_VARIANT_ICON[confirmVariant ?? "danger"] ?? "bi bi-question-circle-fill";
    const resolvedButtonVariant = confirmVariant ?? (variant ? MODAL_VARIANTS[variant].buttonVariant : "danger");

    // Render
    return (
        <Modal
            {...props}
            centered
            backdrop
            backdropClassName="modal-click-backdrop"
            style={{ zIndex: modalZIndex }}
            contentClassName="form-modal-content"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-description"
            onClick={onBackdropClick(handleCancel)}
        >
            {variant ? (
                <>
                    <button type="button" className="modal-close-btn confirm-modal-close" onClick={handleCancel} aria-label="Cerrar">
                        <i className="bi bi-x-lg"></i>
                    </button>
                    <div className="confirm-modal-centered">
                        <div className={`icon-badge icon-badge-xl icon-badge-${variant}`}>
                            <i className={resolvedIcon}></i>
                        </div>
                        <h4 id="confirm-modal-title" className="confirm-modal-title mt-3 mb-2">{title}</h4>
                        <div id="confirm-modal-description" className="confirm-modal-message">{message}</div>
                        {hint && (
                            <HintBox variant={HINT_VARIANT[variant]} icon={hintIcon} className="mt-3 w-100">
                                {hint}
                            </HintBox>
                        )}
                    </div>
                    <div className="confirm-modal-footer form-modal-footer d-flex gap-2 p-3">
                        <Button
                            variant="outline-secondary"
                            className="flex-fill"
                            onClick={handleCancel}
                            aria-label={cancelText}
                            disabled={isLoading}
                        >
                            {cancelIcon && <i className={`${cancelIcon} me-1`}></i>} {cancelText}
                        </Button>
                        <Button
                            variant={resolvedButtonVariant}
                            className="flex-fill"
                            onClick={onConfirm}
                            aria-label={confirmText}
                            disabled={isLoading || confirmDisabled}
                        >
                            {isLoading ? loadingText : <>{confirmIcon && <i className={`${confirmIcon} me-1`}></i>} {confirmText}</>}
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <FormModalHeader
                        icon={resolvedIcon}
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
                                {cancelIcon && <i className={`${cancelIcon} me-1`}></i>} {cancelText}
                            </Button>
                            <Button
                                variant={resolvedButtonVariant}
                                onClick={onConfirm}
                                aria-label={confirmText}
                                disabled={isLoading || confirmDisabled}
                            >
                                {isLoading ? loadingText : <>{confirmIcon && <i className={`${confirmIcon} me-1`}></i>} {confirmText}</>}
                            </Button>
                        </div>
                    </Modal.Body>
                </>
            )}
        </Modal>
    );
};

export default ConfirmModal;
