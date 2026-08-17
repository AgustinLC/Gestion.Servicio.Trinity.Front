import { Status } from "../../../core/models/dto/Status";
import { ModalVariant } from "../modal-variant/modalVariant";

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

// Acciones rápidas de cambio de estado (menú de tres puntos de la tabla de
// usuarios y cualquier otra tabla que en el futuro quiera ofrecer el mismo
// acceso rápido): label, ícono y color por estado DESTINO. El color coincide
// con STATUS_DOT_COLORS para que la acción se lea como "hacia qué estado
// pasa" con el mismo lenguaje visual que el badge/punto de estado.
// actionLabel: verbo corto sin "usuario" al final, para el botón del modal
// de confirmación de cambio de estado, donde el sujeto ya es obvio por
// contexto. badgeIcon: ícono chico que se superpone sobre el avatar de
// persona en el menú de la tabla. modalVariant/modalIcon: variante y (si
// hace falta pisar el ícono por defecto de esa variante) ícono grande para
// el ConfirmModal "centrado" que confirma el cambio — incluyendo el nuevo
// "neutral" para Inactivar, ya que ese estado no es ni positivo (success)
// ni de precaución (warning).
export const STATUS_ACTION_CONFIG: Record<Status, { label: string; actionLabel: string; icon: string; badgeIcon: string; color: string; confirmVariant: string; modalVariant: ModalVariant; modalIcon?: string }> = {
    [Status.ACTIVE]: { label: "Activar usuario", actionLabel: "Activar", icon: "bi bi-check-circle", badgeIcon: "bi-check-lg", color: STATUS_DOT_COLORS[Status.ACTIVE], confirmVariant: "success", modalVariant: "success" },
    [Status.SUSPENDED]: { label: "Suspender usuario", actionLabel: "Suspender", icon: "bi bi-slash-circle", badgeIcon: "bi-pause-fill", color: STATUS_DOT_COLORS[Status.SUSPENDED], confirmVariant: "warning", modalVariant: "warning", modalIcon: "bi bi-pause-circle-fill" },
    [Status.INACTIVE]: { label: "Inactivar usuario", actionLabel: "Inactivar", icon: "bi bi-x-circle", badgeIcon: "bi-dash-lg", color: STATUS_DOT_COLORS[Status.INACTIVE], confirmVariant: "secondary", modalVariant: "neutral" },
};

// Mensaje de confirmación (toast) al aplicar cada acción rápida de estado.
export const STATUS_ACTION_SUCCESS_MESSAGE: Record<Status, string> = {
    [Status.ACTIVE]: "Usuario activado",
    [Status.SUSPENDED]: "Usuario suspendido",
    [Status.INACTIVE]: "Usuario inactivado",
};

// Orden en que se ofrecen las acciones de cambio de estado en el menú
// (se filtra el estado actual del usuario, quedan las otras dos).
export const STATUS_TRANSITION_ORDER: Status[] = [Status.ACTIVE, Status.SUSPENDED, Status.INACTIVE];

// Explicación en lenguaje llano de qué implica cada estado para el usuario,
// para mostrar como leyenda debajo del selector de estado en el formulario
// (StatusSegmentedControl). Reglas de negocio confirmadas por el cliente.
export const STATUS_DESCRIPTIONS: Record<Status, string> = {
    [Status.ACTIVE]: "Puede iniciar sesión y gestionar su cuenta con normalidad.",
    [Status.SUSPENDED]: "Puede gestionar su cuenta, pero solo se le cobra un 30% de la tarifa para no perder el servicio.",
    [Status.INACTIVE]: "No puede iniciar sesión, no se le genera lecturas ni facturas.",
};
