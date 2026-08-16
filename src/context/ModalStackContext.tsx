import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

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

export const ModalStackProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [stack, setStack] = useState<ModalId[]>([]);

    const push = useCallback((id: ModalId) => {
        setStack((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }, []);

    const remove = useCallback((id: ModalId) => {
        setStack((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : prev
        );
    }, []);

    const isVisible = stack.length > 0;
    const topZIndex = isVisible
        ? MODAL_BASE_Z_INDEX + (stack.length - 1) * MODAL_Z_INDEX_STEP
        : MODAL_BASE_Z_INDEX;

    return (
        <ModalStackContext.Provider value={{ stack, push, remove }}>
            {children}
            {/* Montado siempre (no condicionado a isVisible): antes se sacaba
                del DOM apenas se cerraba el último modal, así que desaparecía
                de golpe mientras el <Modal> de Bootstrap todavía estaba
                haciendo su propio fade-out (~0.15s) — en ese lapso se veía el
                modal semitransparente sobre la página ya sin oscurecer, como
                un "flash". Ahora se anima con transition (ver
                .shared-modal-backdrop en index.css) igual que el modal, así
                los dos fades quedan sincronizados. */}
            <div
                className={`shared-modal-backdrop${isVisible ? " shared-modal-backdrop-visible" : ""}`}
                style={{ zIndex: topZIndex - BACKDROP_Z_OFFSET }}
            />
        </ModalStackContext.Provider>
    );
};

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

    useEffect(() => {
        return () => ctx?.remove(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!ctx) return MODAL_BASE_Z_INDEX;

    const position = ctx.stack.indexOf(id);
    const effectivePosition = position === -1 ? ctx.stack.length : position;
    return MODAL_BASE_Z_INDEX + effectivePosition * MODAL_Z_INDEX_STEP;
};
