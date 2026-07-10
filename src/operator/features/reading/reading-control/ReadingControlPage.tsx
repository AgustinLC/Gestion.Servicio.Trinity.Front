import { useEffect, useMemo, useState } from "react";
import { ReadingMatrixDto } from "../../../../core/models/dto/ReadingMatrixDto";
import { getData } from "../../../../core/services/apiService";
import { Spinner, Button, OverlayTrigger, Tooltip, Dropdown } from "react-bootstrap";
import { ReadingMatrixTableRow } from "../../../../core/models/types/ReadingMatrixTableRow";
import { TableColumnDefinition } from "../../../../core/models/types/TableTypes";
import TableToolbar from "../../../../shared/components/table-toolbar/TableToolbar";
import PageHeader from "../../../../shared/components/PageHeader";
import ReusableTable from "../../../../shared/components/table/ReusableTable";
import { useSearch } from "../../../../hooks/useSearch";
import { useTableFilters } from "../../../../hooks/useTableFilters";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import useAppData from "../../../../hooks/useAppData";
type AlertType = | "decreasing" | "duplicate" | "jump" | "missing" | "noMeter" | null;

const ALERT_FILTERS: { value: string; label: string; alert?: Exclude<AlertType, null> }[] = [
    { value: "all", label: "Todas" },
    { value: "anomalies", label: "Solo inconsistencias" },
    { value: "decreasing", label: "Lecturas decrecientes", alert: "decreasing" },
    { value: "duplicate", label: "Lecturas repetidas", alert: "duplicate" },
    { value: "jump", label: "Saltos de consumo", alert: "jump" },
    { value: "missing", label: "Lecturas faltantes", alert: "missing" },
    { value: "noMeter", label: "Lecturas sin medidor", alert: "noMeter" }
];

// Clases "suaves" (pastel) para las celdas de la tabla, mismo lenguaje de
// color que el resto del sistema (badge-soft-*).
const getAlertClass = (alert: AlertType) => {
    switch (alert) {
        case "decreasing":
            return "badge-soft-danger";
        case "duplicate":
            return "badge-soft-purple";
        case "jump":
            return "badge-soft-warning";
        case "missing":
            return "badge-soft-neutral";
        case "noMeter":
            return "badge-soft-cyan";
        default:
            return "";
    }
};

// Mismos tonos, en versión sólida, para el punto indicador del selector de
// inconsistencias (ahí un fondo pastel casi no se distinguiría en 12px).
const ALERT_DOT_COLORS: Record<Exclude<AlertType, null>, string> = {
    decreasing: "#dc2626",
    duplicate: "#9333ea",
    jump: "#ea580c",
    missing: "#94a3b8",
    noMeter: "#0d9488",
};

const ReadingControlPage = () => {

    //Estados
    const [data, setData] = useState<ReadingMatrixDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { operatorReadingUsers } = useAppData();

    // Funcion para obterner los datos
    const getReadingMatrix = async () => {
        setLoading(true);
        try {
            const response = await getData<ReadingMatrixDto>("/operator/reading-matrix");
            setData(response);
        } catch (error: any) {
            console.error(error);
            setError(error.message || "Error al obtener los datos");
        } finally {
            setLoading(false);
        }
    }

    // Efecto para cargar los datos
    useEffect(() => {
        getReadingMatrix();
    }, []);

    const usersById = useMemo(
        () => new Map(operatorReadingUsers.map(user => [user.idUser, user])),
        [operatorReadingUsers]
    );

    const uniqueStreets = useMemo(
        () => Array.from(
            new Set(operatorReadingUsers.map(user => user.residenceDto?.street).filter(Boolean))
        ).sort() as string[],
        [operatorReadingUsers]
    );

    // Datos para la tabla 
    const tableData: ReadingMatrixTableRow[] = useMemo(() => {
        if (!data) return [];
        return data.rows.map(row => {
            const user = usersById.get(row.idUser);
            const result: ReadingMatrixTableRow = {
                idUser: row.idUser,
                fullName: row.fullName,
                street: user?.residenceDto?.street || ""
            };
            row.readings.forEach((reading, index) => {
                result[`period${index}`] = reading;
            });

            return result;
        });
    }, [data, usersById]);

    const filterConfigs = useMemo(
        () => [
            {
                id: "street",
                label: "Calle",
                emptyLabel: "Todas las calles",
                options: uniqueStreets.map((street) => ({ value: street, label: street })),
            },
            {
                id: "alert",
                label: "Inconsistencias",
                type: "custom" as const,
                defaultValue: "all",
                maxWidth: "250px",
                render: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
                    const selectedFilter = ALERT_FILTERS.find((filter) => filter.value === value);

                    return (
                        <Dropdown className="w-100">
                            <Dropdown.Toggle
                                variant="outline-secondary"
                                className="alert-filter-toggle w-100 d-flex align-items-center justify-content-between"
                            >
                                <span className="d-inline-flex align-items-center gap-2">
                                    <i className="bi bi-funnel text-secondary"></i>
                                    {selectedFilter?.alert && (
                                        <span
                                            className="d-inline-block rounded-circle"
                                            style={{ width: "10px", height: "10px", backgroundColor: ALERT_DOT_COLORS[selectedFilter.alert] }}
                                            aria-hidden="true"
                                        ></span>
                                    )}
                                    <span>{selectedFilter?.label ?? "Todas"}</span>
                                </span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="w-100">
                                {ALERT_FILTERS.map((filter) => (
                                    <Dropdown.Item
                                        key={filter.value}
                                        active={value === filter.value}
                                        onClick={() => onChange(filter.value)}
                                        className="d-flex align-items-center gap-2"
                                    >
                                        <span
                                            className="d-inline-block rounded-circle"
                                            style={{
                                                width: "10px",
                                                height: "10px",
                                                backgroundColor: filter.alert ? ALERT_DOT_COLORS[filter.alert] : "transparent",
                                            }}
                                            aria-hidden="true"
                                        ></span>
                                        <span>{filter.label}</span>
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    );
                },
            },
        ],
        [uniqueStreets]
    );
    const filterState = useTableFilters(filterConfigs);

    const alertFilter = filterState.isFilterEnabled("alert")
        ? (filterState.values.alert ?? "all")
        : "all";

    // Hook para buscar por columnas 
    const { filteredData, handleSearch } = useSearch<ReadingMatrixTableRow>(
        tableData,
        ["idUser", "fullName"],
        { street: filterState.getActiveValue("street") }
    );

    // Funcion para determinar el estado de la lectura
    const getReadingAlert = (
        row: ReadingMatrixTableRow,
        index: number
    ): AlertType => {
        const current = row[`period${index}`] as number | null;
        // Lectura faltante
        if (current === null) {
            return "missing";
        }
        if (index === 0) {
            return null;
        }
        const previous = row[`period${index - 1}`] as number | null;
        if (previous === null) {
            return null;
        }
        // Lectura sin medidor: se marca a partir del segundo cero consecutivo
        if (current === 0 && previous === 0) {
            return "noMeter";
        }
        // Lectura menor
        if (current < previous) {
            return "decreasing";
        }
        // Lectura repetida
        if (current === previous) {
            return "duplicate";
        }
        // Salto grande
        if (current - previous > 500) {
            return "jump";
        }
        return null;
    };

    // Funcion para convertir el tipo de alerta a clase de bootstrap — ver getAlertClass (módulo)

    const alertLegendItems: { alert: Exclude<AlertType, null>; label: string }[] = [
        { alert: "decreasing", label: "Lectura decreciente" },
        { alert: "duplicate", label: "Lectura repetida" },
        { alert: "jump", label: "Salto de consumo" },
        { alert: "missing", label: "Lectura faltante" },
        { alert: "noMeter", label: "Lectura sin medidor" }
    ];

    const getAlertLabel = (alert: AlertType) =>
        alertLegendItems.find(item => item.alert === alert)?.label;

    const selectedAlertFilter = ALERT_FILTERS.find(filter => filter.value === alertFilter);

    const sanitizeFileNamePart = (value: string) =>
        value
            .trim()
            .replace(/[\\/:*?"<>|]/g, "")
            .replace(/\s+/g, "_");

    // Determina si la fila tiene una alerta
    const hasAlertType = (
        row: ReadingMatrixTableRow,
        type: string
    ) => {

        if (!data) return false;

        return data.periods.some((_, index) => {
            const alert = getReadingAlert(row, index);

            if (type === "anomalies")
                return alert !== null;

            return alert === type;
        });
    };

    // Mostrar los datos segun el filtro de alerta seleccionado 
    const visibleData = useMemo(() => {
        const filtered = filteredData.filter(row => {

            if (alertFilter === "all") {
                return true;
            }
            return hasAlertType(row, alertFilter);
        });
        return filtered.sort(
            (a, b) => a.idUser - b.idUser
        );

    }, [filteredData, alertFilter, data]);

    // Datos de las columnas para la tabla
    const columns: TableColumnDefinition<ReadingMatrixTableRow>[] = useMemo(() => {

        if (!data) return [];

        const baseColumns: TableColumnDefinition<ReadingMatrixTableRow>[] = [
            {
                key: "idUser",
                label: "N° Conexión",
                sortable: true
            },
            {
                key: "fullName",
                label: "Usuario",
                sortable: true
            }
        ];

        const periodColumns: TableColumnDefinition<ReadingMatrixTableRow>[] =
            data.periods.map((period, index) => ({
                key: `period${index}` as keyof ReadingMatrixTableRow,
                label: period,
                sortable: false,
                render: (row: ReadingMatrixTableRow) => {
                    const value = row[`period${index}`] as number | null;
                    const alert = getReadingAlert(row, index);
                    const alertLabel = getAlertLabel(alert);
                    const readingContent = (
                        <span
                            className={`px-2 py-1 rounded ${getAlertClass(alert)}`}
                            style={{ cursor: alert ? "pointer" : "default" }}
                            aria-label={alertLabel}
                        >
                            {value ?? "-"}
                        </span>
                    );

                    if (!alertLabel) {
                        return readingContent;
                    }

                    return (
                        <OverlayTrigger
                            placement="top"
                            overlay={
                                <Tooltip id={`reading-alert-${row.idUser}-${index}`}>
                                    {alertLabel}
                                </Tooltip>
                            }
                        >
                            {readingContent}
                        </OverlayTrigger>
                    );
                }

            }));

        return [
            ...baseColumns,
            ...periodColumns
        ];

    }, [data]);

    // Funcion para exportar datos a excel 
    const exportToExcel = () => {
        if (!data || tableData.length === 0) return;

        const excelData = visibleData.map(row => {
            const excelRow: Record<string, any> = {
                "N° Conexión": row.idUser,
                "Usuario": row.fullName
            };

            data.periods.forEach((period, index) => {
                excelRow[period] = row[`period${index}`] ?? "-";
            });

            return excelRow;
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Lecturas"
        );
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array"
        });
        const blob = new Blob(
            [excelBuffer],
            {
                type:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
        );
        const streetFileName = sanitizeFileNamePart(filterState.getActiveValue("street") || "Todas_las_calles");
        const alertFilterFileName = alertFilter === "all"
            ? ""
            : `_${sanitizeFileNamePart(selectedAlertFilter?.label || "Inconsistencias")}`;
        const dateFileName = new Date().toISOString().split("T")[0];

        saveAs(
            blob,
            `Lecturas_${streetFileName}${alertFilterFileName}_${dateFileName}.xlsx`
        );
    };

    return (
        <div>
            <PageHeader title="Lecturas por período" subtitle="Control de inconsistencias en las lecturas registradas." icon="bi bi-speedometer2" />
            {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center loading-vh">
                    <span className="mb-2 fw-bold">CARGANDO...</span>
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : (
                <div>
                    {/* Barra de busqueda y filtros */}
                    <TableToolbar
                        onSearch={handleSearch}
                        filters={filterConfigs}
                        filterState={filterState}
                    >
                        <Button
                            variant="success"
                            onClick={exportToExcel}
                            disabled={visibleData.length === 0}
                        >
                            Exportar a Excel
                        </Button>
                    </TableToolbar>
                    {/* Tabla de usuarios */}
                    <ReusableTable
                        data={visibleData}
                        columns={columns}
                        defaultSort="idUser"
                    />
                </div>
            )}
        </div>
    );
}

export default ReadingControlPage;
