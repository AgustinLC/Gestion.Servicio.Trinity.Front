import React from "react";
import { Form, InputGroup } from "react-bootstrap";
import SearchBar from "../searcher/SearchBar";
import { TableFilterConfig, TableFilterState } from "./types";

interface TableToolbarProps {
    onSearch: (query: string) => void;
    searchPlaceholder?: string;
    filters?: TableFilterConfig[];
    filterState?: TableFilterState;
    children?: React.ReactNode;
}

// Iconos por defecto para los filtros más comunes. Si en el futuro se agregan
// otros tipos de filtro, alcanza con extender este mapa o pasar `icon` en el
// TableFilterConfig.
const DEFAULT_FILTER_ICONS: Record<string, string> = {
    street: "bi bi-geo-alt",
    status: "bi bi-funnel",
    period: "bi bi-calendar-event",
};

const TableToolbar: React.FC<TableToolbarProps> = ({
    onSearch,
    searchPlaceholder,
    filters = [],
    filterState,
    children,
}) => {
    const hasFilters = filters.length > 0 && !!filterState;

    return (
        <div className="table-toolbar">
            <div className="table-toolbar-main d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2">
                {/* Buscador con ícono de lupa a la izquierda */}
                <InputGroup className="search-bar-group">
                    <InputGroup.Text>
                        <i className="bi bi-search"></i>
                    </InputGroup.Text>
                    <SearchBar onSearch={onSearch} placeholder={searchPlaceholder} />
                </InputGroup>

                {/* Filtros siempre visibles (uno por config) */}
                {hasFilters && filters.map((filter) => {
                    const value = filterState!.values[filter.id] ?? filter.defaultValue ?? "";
                    const onChange = (nextValue: string) =>
                        filterState!.setFilterValue(filter.id, nextValue);

                    if (filter.type === "custom" && filter.render) {
                        return (
                            <div
                                key={filter.id}
                                className="table-toolbar-filter-control"
                                style={{ maxWidth: filter.maxWidth ?? "260px" }}
                            >
                                {filter.render({ value, onChange })}
                            </div>
                        );
                    }

                    const iconClass = filter.icon ?? DEFAULT_FILTER_ICONS[filter.id];

                    return (
                        <InputGroup
                            key={filter.id}
                            className="table-toolbar-filter-group"
                            style={{ maxWidth: filter.maxWidth ?? "260px" }}
                        >
                            {iconClass && (
                                <InputGroup.Text>
                                    <i className={iconClass}></i>
                                </InputGroup.Text>
                            )}
                            <Form.Select
                                value={value}
                                onChange={(event) => onChange(event.target.value)}
                                aria-label={filter.label}
                            >
                                <option value={filter.defaultValue ?? ""}>
                                    {filter.emptyLabel ?? `Seleccionar ${filter.label}...`}
                                </option>
                                {filter.options?.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </InputGroup>
                    );
                })}

                {/* Acciones (botones de la derecha, ej: "Nuevo Usuario") */}
                {children && (
                    <div className="table-toolbar-actions d-flex flex-wrap align-items-center gap-2 ms-lg-auto">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TableToolbar;
