import { useCallback, useState, type MouseEvent as ReactMouseEvent } from "react";

interface UseConfirmDiscardOptions {
    onHide: () => void;
    enabled?: boolean;
    // En edición los campos ya vienen precargados, así que determinar si
    // "cambió algo" es más difícil de garantizar sin falsos negativos; por
    // eso ahí se confirma siempre. En creación solo se confirma si se llegó
    // a tocar algún campo (isDirty), evitando la pregunta si el modal se
    // abrió y se cerró sin escribir nada.
    alwaysConfirm: boolean;
}

// Intercepta el cierre de un modal de creación/edición (botón "Cancelar", la
// "X" del header, Escape, o click afuera vía onBackdropClick) para preguntar
// antes de descartar cambios. `requestClose` debe reemplazar a `onHide` en
// el <Modal>, el FormModalHeader y el botón "Cancelar" del formulario interno.
export function useConfirmDiscard({ onHide, alwaysConfirm, enabled = true }: UseConfirmDiscardOptions) {
    const [isDirty, setIsDirty] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const requestClose = useCallback(() => {
        if (enabled && (alwaysConfirm || isDirty)) {
            setShowConfirm(true);
        } else {
            onHide();
        }
    }, [alwaysConfirm, enabled, isDirty, onHide]);

    const confirmDiscard = useCallback(() => {
        setShowConfirm(false);
        setIsDirty(false);
        onHide();
    }, [onHide]);

    const cancelDiscard = useCallback(() => setShowConfirm(false), []);

    return { requestClose, showConfirm, confirmDiscard, cancelDiscard, setIsDirty };
}

// Para pasarle a `onClick` del <Modal>: react-bootstrap reenvía ese onClick
// al <div class="modal-dialog"> (el "colchón" alrededor del recuadro
// blanco), no a un backdrop propio, porque acá los modales usan
// backdrop={false} (el dimming lo pinta el backdrop compartido de
// ModalStackContext). Por eso hace falta chequear que el click haya sido
// directamente sobre ese colchón (target === currentTarget) y no una
// burbuja desde algo de adentro del modal-content.
export function onBackdropClick(close: () => void) {
    return (e: ReactMouseEvent) => {
        if (e.target === e.currentTarget) close();
    };
}
