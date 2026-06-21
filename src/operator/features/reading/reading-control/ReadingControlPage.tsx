import { useEffect, useMemo, useState } from "react";
import { ReadingMatrixDto } from "../../../../core/models/dto/ReadingMatrixDto";
import { getData } from "../../../../core/services/apiService";
import { Spinner, Button, OverlayTrigger, Tooltip, Dropdown, Form } from "react-bootstrap";
import { ReadingMatrixTableRow } from "../../../../core/models/types/ReadingMatrixTableRow";
import { TableColumnDefinition } from "../../../../core/models/types/TableTypes";
import SearchBar from "../../../../shared/components/searcher/SearchBar";
import ReusableTable from "../../../../shared/components/table/ReusableTable";
import { useSearch } from "../../../../hooks/useSearch";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import useAppData from "../../../../hooks/useAppData";
type AlertType = | "decreasing" | "duplicate" | "jump" | "missing" | "noMeter" | null; //Tipos para alertas de estados de las lecturas

const ReadingControlPage = () => {

    //Estados
    const [data, setData] = useState<ReadingMatrixDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [alertFilter, setAlertFilter] = useState("all");
    const [selectedStreet, setSelectedStreet] = useState("");
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

    // Hook para buscar por columnas 
    const { filteredData, handleSearch } = useSearch<ReadingMatrixTableRow>(
        tableData,
        ["idUser", "fullName"],
        { street: selectedStreet || null }
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

    // Funcion para convertir el tipo de alerta a clase de bootstrap
    const getAlertClass = (
        alert: AlertType
    ) => {

        switch (alert) {

            case "decreasing":
                return "bg-danger text-white";
            case "duplicate":
                return "bg-dark text-white";
            case "jump":
                return "bg-warning";
            case "missing":
                return "bg-secondary text-white";
            case "noMeter":
                return "bg-info text-dark";
            default:
                return "";
        }
    };

    const alertLegendItems: { alert: Exclude<AlertType, null>; label: string }[] = [
        { alert: "decreasing", label: "Lectura decreciente" },
        { alert: "duplicate", label: "Lectura repetida" },
        { alert: "jump", label: "Salto de consumo" },
        { alert: "missing", label: "Lectura faltante" },
        { alert: "noMeter", label: "Lectura sin medidor" }
    ];

    const alertFilters: { value: string; label: string; alert?: Exclude<AlertType, null> }[] = [
        { value: "all", label: "Todas" },
        { value: "anomalies", label: "Solo inconsistencias" },
        { value: "decreasing", label: "Lecturas decrecientes", alert: "decreasing" },
        { value: "duplicate", label: "Lecturas repetidas", alert: "duplicate" },
        { value: "jump", label: "Saltos de consumo", alert: "jump" },
        { value: "missing", label: "Lecturas faltantes", alert: "missing" },
        { value: "noMeter", label: "Lecturas sin medidor", alert: "noMeter" }
    ];

    const getAlertLabel = (alert: AlertType) =>
        alertLegendItems.find(item => item.alert === alert)?.label;

    const selectedAlertFilter = alertFilters.find(filter => filter.value === alertFilter);

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
        const streetFileName = sanitizeFileNamePart(selectedStreet || "Todas_las_calles");
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
            <h1 className="text-center">Lecturas por período</h1>
            {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                    <span className="mb-2 fw-bold">CARGANDO...</span>
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : (
                <div>
                    {/* Barra de busqueda y filtros */}
                    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 mb-1">
                        <SearchBar onSearch={handleSearch} />
                        <Form.Select
                            className="w-100"
                            style={{ maxWidth: "250px" }}
                            value={selectedStreet}
                            onChange={(e) => setSelectedStreet(e.target.value)}
                        >
                            <option value="">Todas las calles</option>
                            {uniqueStreets.map(street => (
                                <option key={street} value={street}>
                                    {street}
                                </option>
                            ))}
                        </Form.Select>
                        <Dropdown className="w-100" style={{ maxWidth: "250px" }}>
                            <Dropdown.Toggle
                                variant="outline-secondary"
                                className="w-100 d-flex align-items-center justify-content-between bg-white text-dark"
                            >
                                <span className="d-inline-flex align-items-center gap-2">
                                    {selectedAlertFilter?.alert && (
                                        <span
                                            className={`d-inline-block rounded-circle ${getAlertClass(selectedAlertFilter.alert)}`}
                                            style={{ width: "12px", height: "12px" }}
                                            aria-hidden="true"
                                        ></span>
                                    )}
                                    <span>{selectedAlertFilter?.label}</span>
                                </span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="w-100">
                                {alertFilters.map(filter => (
                                    <Dropdown.Item
                                        key={filter.value}
                                        active={alertFilter === filter.value}
                                        onClick={() => setAlertFilter(filter.value)}
                                        className="d-flex align-items-center gap-2"
                                    >
                                        <span
                                            className={`d-inline-block rounded-circle ${filter.alert ? getAlertClass(filter.alert) : ""}`}
                                            style={{ width: "12px", height: "12px", opacity: filter.alert ? 1 : 0 }}
                                            aria-hidden="true"
                                        ></span>
                                        <span>{filter.label}</span>
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                        <Button
                            variant="success"
                            onClick={exportToExcel}
                            disabled={visibleData.length === 0}
                        >
                            Exportar a Excel
                        </Button>
                    </div>
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
