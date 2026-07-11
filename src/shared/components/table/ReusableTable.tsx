import { useEffect, useState } from "react";
import { Form, Table } from "react-bootstrap";
import { ReusableTableProps, TableColumnDefinition } from "../../../core/models/types/TableTypes";
import React from "react";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 30];

const ReusableTable = <T,>({
    data,
    columns,
    defaultSort,
    defaultSortDirection = "desc",
}: ReusableTableProps<T>) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState<keyof T | undefined>(defaultSort);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">(defaultSortDirection);

    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const rangeEnd = Math.min(currentPage * itemsPerPage, totalItems);

    // Si el tamaño de página o un filtro externo reducen totalPages por debajo
    // de la página en la que estábamos parados, la reacomoda para no mostrar
    // una página vacía.
    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    // Ordenar los datos
    const sortedData = [...data].sort((a, b) => {
        if (!sortField) return 0;
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (typeof aValue === "string" && typeof bValue === "string") {
            return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
            return sortDirection === "desc" ? aValue - bValue : bValue - aValue;
        }
        return 0;
    });

    // Paginación
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Funcion para cambiar de pagina
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Funcion para cambiar la cantidad de resultados por página
    const handlePageSizeChange = (size: number) => {
        setItemsPerPage(size);
        setCurrentPage(1);
    };

    // Funcion para ordenar de manera asc o desc
    const handleSort = (field: keyof T) => {
        if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // Funcion para renderizar o no la columna de acciones
    const renderCellContent = (column: TableColumnDefinition<T>, row: T) => {
        if ("actions" in column) {
            return column.actions(row);
        }
        if (column.render) {
            return column.render(row, column.key);
        }
        return String(row[column.key as keyof T]);
    };

    // Validacion de datos para que data y columns no esten vacios
    if (!data || data.length === 0) {
        return <div className="reusable-table-card text-muted p-4">No hay datos para mostrar.</div>;
    }
    if (!columns || columns.length === 0) {
        return <div className="reusable-table-card text-muted p-4">No hay columnas definidas.</div>;
    }

    return (
        <div className="reusable-table reusable-table-card">
            <Table hover responsive>
                <thead>
                    <tr className="text-center">
                        {columns.map((column) => (
                            <th
                                className="align-middle"
                                key={String(column.key)}
                                onClick={() =>
                                    "sortable" in column && column.sortable && handleSort(column.key as keyof T)
                                }
                                style={{ cursor: "sortable" in column && column.sortable ? "pointer" : "default" }}
                                aria-sort={sortField === column.key ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                            >
                                <div className="header-content">
                                    <span className="header-text">{column.label}</span>
                                    {"sortable" in column &&
                                        column.sortable &&
                                        sortField === column.key && (
                                            <span className="sort-arrow">
                                                {sortDirection === "asc" ? "▲" : "▼"}
                                            </span>
                                        )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="text-center align-middle">
                    {paginatedData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((column) => (
                                <td key={String(column.key)}>
                                    {renderCellContent(column, row)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Pie de tabla: resultados + paginación + tamaño de página */}
            <div className="reusable-table-footer d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 mt-2">
                <div className="reusable-table-count text-muted small d-flex align-items-center gap-2">
                    <i className="bi bi-list-ul"></i>
                    Mostrando {rangeStart} a {rangeEnd} de {totalItems} resultados
                </div>

                <div className="table-pagination d-flex align-items-center gap-1 flex-wrap justify-content-center">
                    <button
                        type="button"
                        className="table-pagination-nav"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Página anterior"
                    >
                        <i className="bi bi-chevron-left"></i>
                    </button>

                    {(() => {
                        const visiblePages = 5; // cantidad de botones visibles
                        const pages = [];

                        let start = Math.max(1, currentPage - Math.floor(visiblePages / 2));
                        const end = Math.min(totalPages, start + visiblePages - 1);

                        if (end - start < visiblePages - 1) {
                            start = Math.max(1, end - visiblePages + 1);
                        }

                        // Mostrar primer botón y puntos suspensivos
                        if (start > 1) {
                            pages.push(
                                <button key={1} type="button" className="table-pagination-item" onClick={() => handlePageChange(1)}>
                                    1
                                </button>
                            );
                            if (start > 2) {
                                pages.push(
                                    <span key="start-ellipsis" className="table-pagination-ellipsis">…</span>
                                );
                            }
                        }

                        // Páginas visibles
                        for (let i = start; i <= end; i++) {
                            pages.push(
                                <button
                                    key={i}
                                    type="button"
                                    className={`table-pagination-item${i === currentPage ? " active" : ""}`}
                                    onClick={() => handlePageChange(i)}
                                    aria-current={i === currentPage ? "page" : undefined}
                                >
                                    {i}
                                </button>
                            );
                        }

                        // Mostrar puntos suspensivos finales
                        if (end < totalPages) {
                            if (end < totalPages - 1) {
                                pages.push(
                                    <span key="end-ellipsis" className="table-pagination-ellipsis">…</span>
                                );
                            }
                            pages.push(
                                <button
                                    key={totalPages}
                                    type="button"
                                    className="table-pagination-item"
                                    onClick={() => handlePageChange(totalPages)}
                                >
                                    {totalPages}
                                </button>
                            );
                        }

                        return pages;
                    })()}

                    <button
                        type="button"
                        className="table-pagination-nav"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Página siguiente"
                    >
                        <i className="bi bi-chevron-right"></i>
                    </button>
                </div>

                <Form.Select
                    size="sm"
                    className="table-page-size-select"
                    value={itemsPerPage}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    aria-label="Resultados por página"
                >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                            {size} por página
                        </option>
                    ))}
                </Form.Select>
            </div>
        </div>
    );
};

export default React.memo(ReusableTable) as <T>(props: ReusableTableProps<T>) => JSX.Element;