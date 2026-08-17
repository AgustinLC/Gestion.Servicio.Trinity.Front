import React, { useState } from "react";
import { Form, InputGroup } from "react-bootstrap";
import SearchBar from "../searcher/SearchBar";
import CustomSelect from "../custom-select/CustomSelect";
import { TableFilterConfig, TableFilterState } from "./types";
import { isNegativeInput } from "../../../core/utils/numberInput";

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

    // No hay forma de "deshacer" la búsqueda/filtros una vez tocados: el
    // buscador no tiene botón de limpiar, y un CustomSelect de filtro solo
    // tiene opción "Todos" si su config define defaultValue (varios no lo
    // hacen). searchResetKey fuerza que SearchBar se vuelva a montar (con su
    // estado interno de vuelta en "") en vez de convertirlo en un componente
    // controlado, así no hace falta tocar los ~24 lugares que usan este
    // toolbar.
    const [searchResetKey, setSearchResetKey] = useState(0);

    // Solo para habilitar/deshabilitar el botón de limpiar: SearchBar guarda
    // su propio query como estado interno (no lo expone), así que se
    // envuelve el callback para además llevar la cuenta acá. Para los
    // filtros no hace falta nada extra: enabledIds ya viene derivado de
    // useTableFilters.
    const [hasQuery, setHasQuery] = useState(false);
    const handleSearchChange = (query: string) => {
        setHasQuery(query.length > 0);
        onSearch(query);
    };
    const canReset = hasQuery || (filterState?.enabledIds.size ?? 0) > 0;

    const handleResetFilters = () => {
        onSearch("");
        setHasQuery(false);
        setSearchResetKey((key) => key + 1);
        filters.forEach((filter) => filterState?.setFilterValue(filter.id, filter.defaultValue ?? ""));
    };

    return (
        <div className="table-toolbar">
            <div className="table-toolbar-main d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2">
                {/* Buscador con ícono de lupa a la izquierda */}
                <InputGroup className="search-bar-group">
                    <InputGroup.Text>
                        <i className="bi bi-search"></i>
                    </InputGroup.Text>
                    <SearchBar key={searchResetKey} onSearch={handleSearchChange} placeholder={searchPlaceholder} />
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

                    if (filter.type === "number") {
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
                                <Form.Control
                                    type="number"
                                    min={filter.min ?? 0}
                                    max={filter.max}
                                    placeholder={filter.placeholder ?? filter.label}
                                    value={value}
                                    onChange={(event) => {
                                        if (isNegativeInput(event.target.value)) return;
                                        onChange(event.target.value);
                                    }}
                                    aria-label={filter.label}
                                />
                            </InputGroup>
                        );
                    }

                    return (
                        <div
                            key={filter.id}
                            className="table-toolbar-filter-control"
                            style={{ maxWidth: filter.maxWidth ?? "260px" }}
                        >
                            <CustomSelect
                                icon={iconClass}
                                value={value}
                                onChange={onChange}
                                placeholder={filter.emptyLabel ?? `Seleccionar ${filter.label}...`}
                                aria-label={filter.label}
                                options={
                                    // Solo se agrega la opción "vacía" a la lista cuando el
                                    // filtro define un defaultValue real (ej: "ALL" para
                                    // "Todos los períodos" en DebtControlPage): ahí "Todos"
                                    // es una opción elegible más, no un simple placeholder.
                                    // Si no hay defaultValue, no se pre-selecciona nada: el
                                    // placeholder de arriba ya indica qué elegir.
                                    filter.defaultValue !== undefined
                                        ? [
                                            { value: filter.defaultValue, label: filter.emptyLabel ?? `Seleccionar ${filter.label}...` },
                                            ...(filter.options ?? []),
                                        ]
                                        : (filter.options ?? [])
                                }
                            />
                        </div>
                    );
                })}

                {/* Limpia búsqueda + todos los filtros de un click. Deshabilitado
                    si no hay nada aplicado: además de la señal visual, evita
                    el click "inofensivo pero inútil". */}
                <button
                    type="button"
                    className="table-toolbar-reset-btn"
                    onClick={handleResetFilters}
                    disabled={!canReset}
                    title="Limpiar filtros"
                    aria-label="Limpiar filtros"
                >
                    <i className="bi bi-arrow-clockwise"></i>
                </button>

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
