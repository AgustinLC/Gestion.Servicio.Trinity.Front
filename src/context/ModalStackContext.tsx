import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const MODAL_BASE_Z_INDEX = 1055; // mismo valor que usa Bootstrap por defecto para .modal
const MODAL_Z_INDEX_STEP = 20;
const BACKDROP_Z_OFFSET = 10;

type ModalId = symbol;

interface ModalStackContextValue {
    stack: ModalId[];
    push: (id: ModalId) => void;
    remove: (id: ModalId) => void;
}

const ModalStackContext = createContext<ModalStackContextValue | null>(null);

// Backdrop único y compartido para toda la app. Por defecto, cada <Modal> de
// Bootstrap dibuja su propio fondo oscuro; si se abren varios apilados (ej.
// un modal de confirmación sobre un modal de edición), eso significa un
// <div> de backdrop por cada uno pintándose a la vez. Acá en cambio hay un
// solo <div> fijo que se reposiciona (cambiando su z-index) para quedar
// siempre justo debajo del modal que esté más arriba en la pila, oscureciendo
// todo lo que quedó atrás (página + modales anteriores) sin duplicar nodos.
export const ModalStackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [stack, setStack] = useState<ModalId[]>([]);

    const push = useCallback((id: ModalId) => {
        setStack((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }, []);

    const remove = useCallback((id: ModalId) => {
        setStack((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev));
    }, []);

    const topZIndex = stack.length > 0 ? MODAL_BASE_Z_INDEX + (stack.length - 1) * MODAL_Z_INDEX_STEP : null;

    return (
        <ModalStackContext.Provider value={{ stack, push, remove }}>
            {children}
            {topZIndex !== null && (
                <div className="shared-modal-backdrop" style={{ zIndex: topZIndex - BACKDROP_Z_OFFSET }} />
            )}
        </ModalStackContext.Provider>
    );
};

// Cada <Modal> de la app debe llamar a este hook con su propio `show` (y
// pasarle `backdrop={false}` + `style={{ zIndex }}`, ya que el backdrop y el
// apilado los maneja este sistema en vez del de react-bootstrap). Mientras
// `show` es true, el modal queda anotado en la pila compartida y este hook
// devuelve el z-index que le toca según la posición en la que quedó.
export const useModalLayer = (show: boolean): number => {
    const ctx = useContext(ModalStackContext);
    const idRef = useRef<ModalId | null>(null);
    if (idRef.current === null) idRef.current = Symbol("modal");
    const id = idRef.current;

    useEffect(() => {
        if (!ctx) return;
        if (show) {
            ctx.push(id);
        } else {
            ctx.remove(id);
        }
    }, [show, ctx, id]);

    // Al desmontar (aunque `show` nunca haya pasado a false, ej. el
    // componente padre deja de renderizar el modal directamente).
    useEffect(() => {
        return () => ctx?.remove(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!ctx) return MODAL_BASE_Z_INDEX;

    const position = ctx.stack.indexOf(id);
    const effectivePosition = position === -1 ? ctx.stack.length : position;
    return MODAL_BASE_Z_INDEX + effectivePosition * MODAL_Z_INDEX_STEP;
};
