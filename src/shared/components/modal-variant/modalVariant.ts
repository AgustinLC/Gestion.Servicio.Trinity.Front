// Paleta de variantes para íconos de modal (ícono circular de FormModalHeader
// y del ConfirmModal "centrado"). Un solo lugar para el ícono y el color de
// botón por defecto de cada variante, así ambos componentes quedan
// consistentes entre sí en vez de definir cada uno los suyos.
export type ModalVariant = "info" | "warning" | "error" | "success" | "question" | "neutral";

interface ModalVariantConfig {
    icon: string; // Clase de Bootstrap Icons
    buttonVariant: string; // Variante de Bootstrap para el botón de acción principal
}

export const MODAL_VARIANTS: Record<ModalVariant, ModalVariantConfig> = {
    info: { icon: "bi bi-info-circle-fill", buttonVariant: "primary" },
    warning: { icon: "bi bi-exclamation-triangle-fill", buttonVariant: "warning" },
    error: { icon: "bi bi-x-circle-fill", buttonVariant: "danger" },
    success: { icon: "bi bi-check-circle-fill", buttonVariant: "success" },
    question: { icon: "bi bi-question-circle-fill", buttonVariant: "question" },
    // Gris — mismo tono que STATUS_DOT_COLORS[INACTIVE]/badge-soft-neutral,
    // para acciones neutras (ej: inactivar un usuario) que no son ni
    // positivas (success) ni requieren precaución (warning).
    neutral: { icon: "bi bi-dash-circle-fill", buttonVariant: "secondary" },
};
