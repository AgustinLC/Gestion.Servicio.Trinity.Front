import React from "react";

interface TableSkeletonProps {
    columns?: number;
    rows?: number;
    showToolbar?: boolean;
}

// Esqueleto de carga genérico para pantallas de tabla: no depende de las
// columnas reales, así que sirve para reemplazar el Spinner en cualquier
// tabla del sistema (ReusableTable + TableToolbar) con la misma forma.
// rows=10 por defecto: mismo tamaño de página inicial que usa ReusableTable,
// para que el esqueleto ocupe el mismo espacio que una página real ya cargada.
// De las `columns`, la primera y la última quedan reservadas para el
// "avatar"/marca de fila y para la columna de acciones respectivamente; el
// resto son franjas de texto genéricas.
const TableSkeleton: React.FC<TableSkeletonProps> = ({ columns = 5, rows = 9, showToolbar = true }) => {
    const middleColumns = Math.max(columns - 2, 1);

    return (
        <div>
            {showToolbar && (
                <div className="table-toolbar">
                    {/* Mismo wrapper que TableToolbar.tsx (.table-toolbar-main): la
                        card exterior es flex-column porque puede apilar varias filas
                        de filtros, así que el layout horizontal vive acá adentro. */}
                    <div className="table-toolbar-main d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2">
                        {/* Buscador */}
                        <div className="table-skeleton-field table-skeleton-field-search">
                            <i className="bi bi-search"></i>
                            <div className="skeleton skeleton-line" style={{ width: "60%", height: 12 }}></div>
                        </div>

                        {/* Filtro: no se sabe qué representa hasta que cargue la configuración
                            real de la página, así que se usa un ícono de interrogación genérico
                            en vez de adivinar uno (embudo, calendario, etc.). */}
                        <div className="table-skeleton-field table-skeleton-field-filter">
                            <i className="bi bi-question-circle"></i>
                            <div className="skeleton skeleton-line flex-grow-1" style={{ height: 12 }}></div>
                            <i className="bi bi-chevron-down small"></i>
                        </div>

                        {/* Botón de "Limpiar filtros" (ver TableToolbar.tsx): mismo tamaño
                            que el real, para que no salte el layout al terminar de cargar. */}
                        <div className="skeleton" style={{ width: 38, height: 38, borderRadius: 8, flexShrink: 0 }}></div>

                        {/* Botón de acción principal (ej: "Añadir Usuario") */}
                        <div className="table-skeleton-primary-btn">
                            <div className="skeleton skeleton-line skeleton-on-primary" style={{ width: 110, height: 12 }}></div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`reusable-table-card ${showToolbar ? "" : "overflow-hidden"}`}>
                <div className="table-skeleton-row">
                    <div className="table-skeleton-cell table-skeleton-avatar-cell"></div>
                    {Array.from({ length: middleColumns }).map((_, colIndex) => (
                        <div key={colIndex} className="table-skeleton-cell">
                            <div className="skeleton skeleton-line" style={{ width: "55%", height: 12 }}></div>
                        </div>
                    ))}
                    <div className="table-skeleton-cell table-skeleton-actions-cell">
                        <div className="skeleton skeleton-line" style={{ width: 110, height: 12 }}></div>
                    </div>
                </div>

                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="table-skeleton-row">
                        <div className="table-skeleton-cell table-skeleton-avatar-cell">
                            <div className="skeleton" style={{ width: 28, height: 28, borderRadius: "50%" }}></div>
                        </div>

                        {Array.from({ length: middleColumns }).map((_, colIndex) => (
                            <div key={colIndex} className="table-skeleton-cell">
                                <div
                                    className="skeleton skeleton-line"
                                    style={{ width: `${40 + ((rowIndex * 13 + colIndex * 23) % 45)}%`, height: 14 }}
                                ></div>
                            </div>
                        ))}

                        <div className="table-skeleton-cell table-skeleton-actions-cell">
                            <div className="skeleton" style={{ width: 68, height: 30, borderRadius: 8 }}></div>
                            <div className="skeleton" style={{ width: 68, height: 30, borderRadius: 8 }}></div>
                            <i className="bi bi-three-dots-vertical"></i>
                        </div>
                    </div>
                ))}

                {showToolbar && (
                    <div className="reusable-table-footer d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 mt-2">
                        <div className="skeleton skeleton-line" style={{ width: 180, height: 14 }}></div>
                        <div className="d-flex gap-1">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="skeleton" style={{ width: 32, height: 32, borderRadius: 8 }}></div>
                            ))}
                        </div>
                        <div className="skeleton skeleton-line" style={{ width: 130, height: 32, borderRadius: 8 }}></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TableSkeleton;
