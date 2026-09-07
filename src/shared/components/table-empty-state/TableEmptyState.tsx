import React from "react";

interface TableEmptyStateProps {
    icon?: string;
    title?: string;
    message?: string;
}

// Estado vacío reutilizable (ícono circular + título + mensaje) para
// reemplazar el viejo "No hay datos para mostrar" a secas. Lo usa
// ReusableTable como fallback cuando data=[], y también los modales que
// arman su propia validación de "sin resultados" antes de llegar a
// ReusableTable (ej. BillActiveModal/BillNullModal, que muestran un
// HintBox debajo de la tabla y por eso no pueden delegarle el vacío).
const TableEmptyState: React.FC<TableEmptyStateProps> = ({
    icon = "bi bi-inbox",
    title = "No hay datos para mostrar",
    message = "Todavía no se registró información acá.",
}) => {
    return (
        <div className="table-empty-state">
            <div className="table-empty-state-icon">
                <i className={icon}></i>
            </div>
            <div className="table-empty-state-title">{title}</div>
            <div className="table-empty-state-message">{message}</div>
        </div>
    );
};

export default TableEmptyState;
