// Paleta de variantes para íconos de modal (ícono circular de FormModalHeader
// y del ConfirmModal "centrado"). Un solo lugar para el ícono y el color de
// botón por defecto de cada variante, así ambos componentes quedan
// consistentes entre sí en vez de definir cada uno los suyos.
export type ModalVariant = "info" | "warning" | "error" | "success" | "question";

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
};
