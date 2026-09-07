import { useCallback, useMemo, useState } from "react";
import { TableFilterConfig } from "../shared/components/table-toolbar/types";

const EMPTY_SENTINELS = new Set(["", "ALL", "all"]);

/**
 * Hook para manejar el estado de los filtros del TableToolbar.
 *
 * A partir de la Fase 3 los filtros son SIEMPRE visibles (ya no hay un
 * checkbox previo para habilitarlos). Un filtro se considera "activo"
 * cuando su valor no es vacío ni un centinela (`""`, `"ALL"`, `"all"`).
 */
export function useTableFilters(configs: TableFilterConfig[] = []) {
    const [values, setValues] = useState<Record<string, string>>(() =>
        Object.fromEntries(configs.map((config) => [config.id, config.defaultValue ?? ""]))
    );

    const setFilterValue = useCallback((id: string, value: string) => {
        setValues((prev) => ({ ...prev, [id]: value }));
    }, []);

    const getActiveValue = useCallback((id: string): string | null => {
        const value = values[id];
        if (value === undefined || EMPTY_SENTINELS.has(value)) {
            return null;
        }
        return value;
    }, [values]);

    const isFilterEnabled = useCallback((id: string) => {
        return getActiveValue(id) !== null;
    }, [getActiveValue]);

    // Set derivado de ids con valor activo (útil para consumidores que quieran contar cuántos filtros están aplicados)
    const enabledIds = useMemo(() => {
        const set = new Set<string>();
        Object.keys(values).forEach((id) => {
            if (getActiveValue(id) !== null) set.add(id);
        });
        return set;
    }, [values, getActiveValue]);

    const activeValues = useMemo(() => {
        const result: Record<string, string | null> = {};
        Object.keys(values).forEach((id) => {
            result[id] = getActiveValue(id);
        });
        return result;
    }, [values, getActiveValue]);

    // Se mantiene como no-op para no romper componentes que aún llamen a toggleFilter,
    // pero ya no tiene efecto real: los filtros son siempre visibles.
    const toggleFilter = useCallback((_id: string, _enabled: boolean) => {
        // no-op: los filtros son siempre visibles a partir de Fase 3
    }, []);

    return {
        enabledIds,
        values,
        toggleFilter,
        setFilterValue,
        getActiveValue,
        isFilterEnabled,
        activeValues,
    };
}
