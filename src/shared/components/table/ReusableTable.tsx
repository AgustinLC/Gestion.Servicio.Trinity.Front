import { useState } from "react";
import { Table, Pagination } from "react-bootstrap";
import { ReusableTableProps, TableColumnDefinition } from "../../../core/models/types/TableTypes";
import React from "react";

const ReusableTable = <T,>({
    data,
    columns,
    defaultSort,
    defaultSortDirection = "desc",
}: ReusableTableProps<T>) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<keyof T | undefined>(defaultSort);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">(defaultSortDirection);

    const itemsPerPage = 10;
    const totalPages = Math.ceil(data.length / itemsPerPage);

    // Ordenar los datos
    const sortedData = [...data].sort((a, b) => {
        if (!sortField) return 0;
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (typeof aValue === "string" && typeof bValue === "string") {
            return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
            return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
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
            return column.render(row);
        }
        return String(row[column.key as keyof T]);
    };

    // Validacion de datos para que data y columns no esten vacios
    if (!data || data.length === 0) {
        return <div>No hay datos para mostrar.</div>;
    }
    if (!columns || columns.length === 0) {
        return <div>No hay columnas definidas.</div>;
    }

    return (
        <div className="mt-2">
            <Table striped bordered hover responsive>
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

            {/* Paginación */}
            <Pagination>
                <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                />
                {Array.from({ length: totalPages }, (_, index) => (
                    <Pagination.Item
                        key={index + 1}
                        active={index + 1 === currentPage}
                        onClick={() => handlePageChange(index + 1)}
                    >
                        {index + 1}
                    </Pagination.Item>
                ))}
                <Pagination.Next
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                />
            </Pagination>
        </div>
    );
};

export default React.memo(ReusableTable) as <T>(props: ReusableTableProps<T>) => JSX.Element;