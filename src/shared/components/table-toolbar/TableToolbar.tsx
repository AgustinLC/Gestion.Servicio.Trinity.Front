import React from "react";
import { Form } from "react-bootstrap";
import SearchBar from "../searcher/SearchBar";
import { TableFilterConfig, TableFilterState } from "./types";

interface TableToolbarProps {
    onSearch: (query: string) => void;
    searchPlaceholder?: string;
    filters?: TableFilterConfig[];
    filterState?: TableFilterState;
    children?: React.ReactNode;
}

const TableToolbar: React.FC<TableToolbarProps> = ({
    onSearch,
    searchPlaceholder,
    filters = [],
    filterState,
    children,
}) => {
    const hasFilters = filters.length > 0 && filterState;
    const enabledCount = hasFilters ? filterState.enabledIds.size : 0;

    return (
        <div className="table-toolbar mb-3">
            <div className="table-toolbar-main d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between flex-wrap gap-2">
                <div className="d-flex flex-wrap align-items-center gap-2">
                    <SearchBar onSearch={onSearch} placeholder={searchPlaceholder} />
                    {hasFilters && filters.map((filter) => (
                        <Form.Check
                            key={filter.id}
                            type="checkbox"
                            id={`table-filter-${filter.id}`}
                            label={filter.label}
                            checked={filterState.enabledIds.has(filter.id)}
                            onChange={(event) =>
                                filterState.toggleFilter(filter.id, event.target.checked)
                            }
                            className="table-toolbar-filter-check mb-0"
                        />
                    ))}
                </div>
                {children && (
                    <div className="table-toolbar-actions d-flex flex-wrap align-items-center gap-2 ms-lg-auto">
                        {children}
                    </div>
                )}
            </div>

            {hasFilters && enabledCount > 0 && (
                <div className="table-toolbar-active-filters d-flex flex-wrap align-items-center gap-2">
                    {filters
                        .filter((filter) => filterState.enabledIds.has(filter.id))
                        .map((filter) => {
                            const value = filterState.values[filter.id] ?? filter.defaultValue ?? "";
                            const onChange = (nextValue: string) =>
                                filterState.setFilterValue(filter.id, nextValue);

                            if (filter.type === "custom" && filter.render) {
                                return (
                                    <div
                                        key={filter.id}
                                        className="table-toolbar-filter-control"
                                        style={{ maxWidth: filter.maxWidth ?? "250px" }}
                                    >
                                        {filter.render({ value, onChange })}
                                    </div>
                                );
                            }

                            return (
                                <Form.Select
                                    key={filter.id}
                                    className="table-toolbar-filter-control"
                                    style={{ maxWidth: filter.maxWidth ?? "250px" }}
                                    value={value}
                                    onChange={(event) => onChange(event.target.value)}
                                    aria-label={filter.label}
                                >
                                    <option value={filter.defaultValue ?? ""}>
                                        {filter.emptyLabel ?? "Todos"}
                                    </option>
                                    {filter.options?.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            );
                        })}
                </div>
            )}
        </div>
    );
};

export default TableToolbar;
