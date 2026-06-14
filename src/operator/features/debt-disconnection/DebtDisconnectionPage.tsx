import { useState, useEffect } from "react";
import { Button, Spinner, Badge } from "react-bootstrap";
import SearchBar from "../../../shared/components/searcher/SearchBar";
import { UserDebtDto } from "../../../core/models/dto/UserDebtDto";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import { useSearch } from "../../../hooks/useSearch";
import { useDebtDisconnectionPdfs } from "../../../shared/hooks/useDebtDisconnectionPdfs";
import { getData } from "../../../core/services/apiService";

const DebtDisconnectionPage = () => {
    const { isGenerating: pdfLoading, generateDisconnectionPdf, generateWarningPdf } = useDebtDisconnectionPdfs();

    // Estados locales para la conexión con el backend
    const [debtors, setDebtors] = useState<UserDebtDto[]>([]);
    const [loadingDebtors, setLoadingDebtors] = useState(false);
    const [errorDebtors, setErrorDebtors] = useState<string | null>(null);

    // Efecto para consultar el endpoint real
    useEffect(() => {
        const fetchDebtors = async () => {
            setLoadingDebtors(true);
            setErrorDebtors(null);
            try {
                const data = await getData<UserDebtDto[]>("/operator/debtors");
                setDebtors(data);
            } catch (err) {
                console.error("Error al cargar deudores reales:", err);
                setErrorDebtors(err instanceof Error ? err.message : "Error al obtener deudores del servidor");
            } finally {
                setLoadingDebtors(false);
            }
        };
        fetchDebtors();
    }, []);

    // Hook para buscar por columnas en los deudores
    const { filteredData, handleSearch } = useSearch<UserDebtDto>(
        debtors,
        ["firstName", "lastName", "idUser"] // columnas filtrables
    );

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<UserDebtDto>[] = [
        { key: "idUser", label: "N° Conexión", sortable: true },
        { key: "firstName", label: "Nombre", sortable: false },
        { key: "lastName", label: "Apellido", sortable: false },
        { key: "dni", label: "DNI", sortable: false },
        { key: "phone", label: "Teléfono", sortable: false },
        {
            key: "periodsOwed",
            label: "Períodos Adeudados",
            sortable: true,
            render: (value: any) => {
                const periods = Number(value);
                const bg = periods >= 2 ? "danger" : "warning";
                return (
                    <div className="text-center">
                        <Badge bg={bg} className="fs-6 px-3 py-2">
                            {periods} {periods === 1 ? "Período" : "Períodos"}
                        </Badge>
                    </div>
                );
            }
        },
        {
            key: "actions",
            label: "Generar Documentos",
            actions: (row: UserDebtDto) => {
                const canCut = row.periodsOwed >= 2;
                return (
                    <div className="d-flex gap-2 justify-content-center overflow-auto text-nowrap">
                        <Button
                            variant="warning"
                            size="sm"
                            disabled={pdfLoading}
                            onClick={() => generateWarningPdf(row, row.periodsOwed)}
                            title="Generar Cuadro de Aviso de Corte"
                        >
                            Cuadro de Aviso
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            disabled={pdfLoading || !canCut}
                            onClick={() => generateDisconnectionPdf(row)}
                            title={
                                !canCut
                                    ? "Se requiere adeudar 2 o más períodos para emitir aviso de corte"
                                    : "Generar Aviso de Corte de Servicio (Orden de Corte)"
                            }
                        >
                            Aviso de Corte
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div>
            <h1 className="text-center mb-4">Gestión de Deudores</h1>
            {loadingDebtors ? (
                <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                    <span className="mb-2 fw-bold">CARGANDO DEUDORES...</span>
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            ) : errorDebtors ? (
                <div className="text-center py-5 text-danger">{errorDebtors}</div>
            ) : (
                <div>
                    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 mb-4 p-3 bg-white border rounded shadow-sm">
                        <div className="w-100 style={{ maxWidth: '400px' }}">
                            <SearchBar onSearch={handleSearch} />
                        </div>
                    </div>

                    <div className="text-muted small mb-3">
                        <span>
                            Mostrando {filteredData.length} deudores obtenidos del servidor.
                        </span>
                    </div>

                    {/* Tabla principal */}
                    <ReusableTable<UserDebtDto>
                        data={filteredData}
                        columns={columns}
                        defaultSort="idUser"
                    />
                </div>
            )}
        </div>
    );
};

export default DebtDisconnectionPage;
