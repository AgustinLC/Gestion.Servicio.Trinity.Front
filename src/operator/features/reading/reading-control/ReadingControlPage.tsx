import { useEffect, useMemo, useState } from "react";
import { ReadingMatrixDto } from "../../../../core/models/dto/ReadingMatrixDto";
import { getData } from "../../../../core/services/apiService";
import { Spinner, Button } from "react-bootstrap";
import { ReadingMatrixTableRow } from "../../../../core/models/types/ReadingMatrixTableRow";
import { TableColumnDefinition } from "../../../../core/models/types/TableTypes";
import SearchBar from "../../../../shared/components/searcher/SearchBar";
import ReusableTable from "../../../../shared/components/table/ReusableTable";
import { useSearch } from "../../../../hooks/useSearch";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
type AlertType = | "danger" | "warning" | "secondary" | null; //Tipos para alertas de estados de las lecturas

const ReadingControlPage = () => {

    //Estados
    const [data, setData] = useState<ReadingMatrixDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    // Datos para la tabla 
    const tableData: ReadingMatrixTableRow[] = useMemo(() => {
        if (!data) return [];
        return data.rows.map(row => {
            const result: ReadingMatrixTableRow = {
                idUser: row.idUser,
                fullName: row.fullName
            };
            row.readings.forEach((reading, index) => {
                result[`period${index}`] = reading;
            });

            return result;
        });
    }, [data]);

    // Hook para buscar por columnas 
    const { filteredData, handleSearch } = useSearch<ReadingMatrixTableRow>(
        tableData,
        ["idUser", "fullName"]
    );

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

                    return (
                        <span
                            className={`px-2 py-1 rounded ${getAlertClass(alert)}`}
                        >
                            {value ?? "-"}
                        </span>
                    );
                }

            }));

        return [
            ...baseColumns,
            ...periodColumns
        ];

    }, [data]);

    // Ordenar los datos por numero de conexion 
    const sortedData = [...filteredData].sort(
        (a, b) => a.idUser - b.idUser
    );

    // Funcion para exportar datos a excel 
    const exportToExcel = () => {
        if (!data || tableData.length === 0) return;

        const excelData = sortedData.map(row => {
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
        saveAs(
            blob,
            `Lecturas_${new Date().toISOString().split("T")[0]}.xlsx`
        );
    };

    // Funcion para determinar el estado de la lectura
    const getReadingAlert = (
        row: ReadingMatrixTableRow,
        index: number
    ): AlertType => {

        const current = row[`period${index}`] as number | null;

        // Lectura faltante
        if (current === null) {
            return "secondary";
        }
        // Primera columna
        if (index === 0) {
            return null;
        }
        const previous = row[`period${index - 1}`] as number | null;

        if (previous === null) {
            return null;
        }
        // Lectura menor
        if (current < previous) {
            return "danger";
        }
        // Consumo anormal
        if ((current - previous) > 500) {
            return "warning";
        }

        return null;
    };

    // Funcion para convertir el tipo de alerta a clase de bootstrap
    const getAlertClass = (
        alert: AlertType
    ) => {

        switch (alert) {

            case "danger":
                return "bg-danger text-white";

            case "warning":
                return "bg-warning";

            case "secondary":
                return "bg-secondary text-white";

            default:
                return "";
        }
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
                        <Button variant="success" onClick={exportToExcel}>
                            Exportar a Excel
                        </Button>
                    </div>
                    {/* Tabla de usuarios */}
                    <ReusableTable
                        data={filteredData}
                        columns={columns}
                        defaultSort="idUser"
                    />
                </div>
            )}
        </div>
    );
}

export default ReadingControlPage;