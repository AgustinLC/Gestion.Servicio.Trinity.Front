import { ReactNode } from "react";

export interface TableFilterOption {
    value: string;
    label: string;
}

export interface TableFilterRenderProps {
    value: string;
    onChange: (value: string) => void;
}

export interface TableFilterConfig {
    id: string;
    label: string;
    type?: "select" | "custom";
    options?: TableFilterOption[];
    emptyLabel?: string;
    defaultValue?: string;
    maxWidth?: string;
    icon?: string; // Clase de Bootstrap Icons (ej: "bi bi-geo-alt"). Opcional.
    render?: (props: TableFilterRenderProps) => ReactNode;
}

export interface TableFilterState {
    enabledIds: Set<string>;
    values: Record<string, string>;
    toggleFilter: (id: string, enabled: boolean) => void;
    setFilterValue: (id: string, value: string) => void;
    getActiveValue: (id: string) => string | null;
    isFilterEnabled: (id: string) => boolean;
}
