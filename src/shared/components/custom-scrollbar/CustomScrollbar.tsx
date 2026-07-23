import React, { useCallback, useEffect, useRef, useState } from "react";
import "./CustomScrollbar.css";

interface CustomScrollbarProps {
    targetId: string;
}

const MIN_THUMB_HEIGHT = 32;

// Barra de scroll propia, dibujada con un div en vez de depender de la
// nativa del navegador. Se hizo porque Chrome/Edge en Windows tienen un
// bug conocido ("Fluent scrollbars") que ignora el estilo con
// ::-webkit-scrollbar y fuerza el look nativo (ancha, gris, con flechitas)
// sin importar el CSS de la página; esto es inmune a eso porque no es una
// scrollbar real, es un elemento posicionado que refleja el scroll real.
const CustomScrollbar: React.FC<CustomScrollbarProps> = ({ targetId }) => {
    const [thumb, setThumb] = useState<{ top: number; height: number; trackTop: number } | null>(null);
    const draggingRef = useRef(false);

    const update = useCallback(() => {
        const target = document.getElementById(targetId);
        if (!target) return;

        const { scrollTop, scrollHeight, clientHeight } = target;
        if (scrollHeight <= clientHeight + 1) {
            setThumb(null);
            return;
        }

        const rect = target.getBoundingClientRect();
        const trackHeight = rect.height;
        const thumbHeight = Math.max(MIN_THUMB_HEIGHT, (clientHeight / scrollHeight) * trackHeight);
        const maxThumbTop = trackHeight - thumbHeight;
        const scrollRatio = scrollTop / (scrollHeight - clientHeight);

        setThumb({ top: scrollRatio * maxThumbTop, height: thumbHeight, trackTop: rect.top });
    }, [targetId]);

    useEffect(() => {
        const target = document.getElementById(targetId);
        if (!target) return;

        update();
        target.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);

        const resizeObserver = new ResizeObserver(update);
        resizeObserver.observe(target);

        // Detecta cambios de contenido (ej: se cargan datos por API y la
        // página pasa a tener overflow) sin necesitar un scroll/resize.
        const mutationObserver = new MutationObserver(update);
        mutationObserver.observe(target, { childList: true, subtree: true });

        return () => {
            target.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, [targetId, update]);

    const handleThumbMouseDown = (e: React.MouseEvent) => {
        const target = document.getElementById(targetId);
        if (!target) return;

        e.preventDefault();
        draggingRef.current = true;
        const startMouseY = e.clientY;
        const startScrollTop = target.scrollTop;
        document.body.style.userSelect = "none";

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!draggingRef.current) return;

            const rect = target.getBoundingClientRect();
            const { scrollHeight, clientHeight } = target;
            const trackHeight = rect.height;
            const thumbHeight = Math.max(MIN_THUMB_HEIGHT, (clientHeight / scrollHeight) * trackHeight);
            const maxThumbTop = trackHeight - thumbHeight;
            const scrollableDistance = scrollHeight - clientHeight;

            const deltaY = moveEvent.clientY - startMouseY;
            target.scrollTop = startScrollTop + (deltaY / maxThumbTop) * scrollableDistance;
        };

        const handleMouseUp = () => {
            draggingRef.current = false;
            document.body.style.userSelect = "";
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    // Click en el track (fuera del thumb) salta el scroll a esa posición.
    const handleTrackClick = (e: React.MouseEvent) => {
        if (!thumb || draggingRef.current) return;
        const target = document.getElementById(targetId);
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const { scrollHeight, clientHeight } = target;
        const clickY = e.clientY - rect.top;
        const ratio = (clickY - thumb.height / 2) / (rect.height - thumb.height);
        target.scrollTop = Math.max(0, Math.min(1, ratio)) * (scrollHeight - clientHeight);
    };

    if (!thumb) return null;

    return (
        <div className="custom-scrollbar-track" style={{ top: thumb.trackTop }} onClick={handleTrackClick}>
            <div
                className="custom-scrollbar-thumb"
                style={{ top: thumb.top, height: thumb.height }}
                onMouseDown={handleThumbMouseDown}
            />
        </div>
    );
};

export default CustomScrollbar;
