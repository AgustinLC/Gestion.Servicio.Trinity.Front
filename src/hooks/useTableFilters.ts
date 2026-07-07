import { useCallback, useMemo, useState } from "react";
import { TableFilterConfig } from "../shared/components/table-toolbar/types";

const EMPTY_SENTINELS = new Set(["", "ALL", "all"]);

export function useTableFilters(configs: TableFilterConfig[] = []) {
    const [enabledIds, setEnabledIds] = useState<Set<string>>(() => new Set());
    const [values, setValues] = useState<Record<string, string>>(() =>
        Object.fromEntries(configs.map((config) => [config.id, config.defaultValue ?? ""]))
    );

    const toggleFilter = useCallback((id: string, enabled: boolean) => {
        setEnabledIds((prev) => {
            const next = new Set(prev);
            if (enabled) {
                next.add(id);
            } else {
                next.delete(id);
            }
            return next;
        });

        if (!enabled) {
            const config = configs.find((item) => item.id === id);
            setValues((prev) => ({ ...prev, [id]: config?.defaultValue ?? "" }));
        }
    }, [configs]);

    const setFilterValue = useCallback((id: string, value: string) => {
        setValues((prev) => ({ ...prev, [id]: value }));
    }, []);

    const isFilterEnabled = useCallback((id: string) => enabledIds.has(id), [enabledIds]);

    const getActiveValue = useCallback((id: string): string | null => {
        if (!enabledIds.has(id)) {
            return null;
        }

        const value = values[id];
        if (value === undefined || EMPTY_SENTINELS.has(value)) {
            return null;
        }

        return value;
    }, [enabledIds, values]);

    const activeValues = useMemo(() => {
        const result: Record<string, string | null> = {};
        enabledIds.forEach((id) => {
            result[id] = getActiveValue(id);
        });
        return result;
    }, [enabledIds, getActiveValue]);

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
