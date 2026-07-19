import { Status } from "../../../core/models/dto/Status";

// Única fuente de verdad para los colores del estado de usuario (Activo/
// Inactivo/Suspendido). Antes había 3 sistemas paralelos: las clases
// .status-badge.<ESTADO> de index.css, y dos mapas locales duplicados en
// AddEditUserModal.tsx (STATUS_DOT_COLORS/STATUS_BADGE_CLASS). Se unifican
// acá para que cualquier chip, punto de color o dropdown de estado en el
// sistema (formulario, filtros de tabla, badges) use siempre lo mismo.

// Tonos saturados para puntos de color (7-10px): un pastel casi no se
// distinguiría a ese tamaño, mismo criterio que ALERT_DOT_COLORS en
// ReadingControlPage.
export const STATUS_DOT_COLORS: Record<Status, string> = {
    [Status.ACTIVE]: "#16a34a",
    [Status.SUSPENDED]: "#ea580c",
    [Status.INACTIVE]: "#64748b",
};

// Clase badge-soft-* (fondo pastel) para chips/badges de estado.
export const STATUS_BADGE_CLASS: Record<Status, string> = {
    [Status.ACTIVE]: "badge-soft-success",
    [Status.SUSPENDED]: "badge-soft-warning",
    [Status.INACTIVE]: "badge-soft-neutral",
};

// Opciones listas para selects/dropdowns (formulario de usuario, filtro de
// tabla, y cualquier futuro uso): label corto en formato título, más el
// color de punto correspondiente.
export const STATUS_OPTIONS: { value: Status; label: string; color: string }[] = [
    { value: Status.ACTIVE, label: "Activo", color: STATUS_DOT_COLORS[Status.ACTIVE] },
    { value: Status.SUSPENDED, label: "Suspendido", color: STATUS_DOT_COLORS[Status.SUSPENDED] },
    { value: Status.INACTIVE, label: "Inactivo", color: STATUS_DOT_COLORS[Status.INACTIVE] },
];
