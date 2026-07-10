import { useState, useEffect, useMemo } from "react";
import { Button, Spinner } from "react-bootstrap";
import TableToolbar from "../../../shared/components/table-toolbar/TableToolbar";
import PageHeader from "../../../shared/components/PageHeader";
import { UserDebtDto } from "../../../core/models/dto/UserDebtDto";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import { useSearch } from "../../../hooks/useSearch";
import { useTableFilters } from "../../../hooks/useTableFilters";
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

    // Calles únicas para el filtro
    const uniqueStreets = useMemo(
        () => Array.from(new Set(debtors.map(u => u.residenceDto?.street).filter(Boolean))) as string[],
        [debtors]
    );

    // Filtro de calle (siempre visible, Fase 3)
    const filterConfigs = useMemo(
        () => [
            {
                id: "street",
                label: "Calle",
                emptyLabel: "Seleccionar Calle...",
                options: uniqueStreets.map((street) => ({ value: street, label: street })),
            },
        ],
        [uniqueStreets]
    );
    const filterState = useTableFilters(filterConfigs);

    // Hook para buscar por columnas en los deudores
    const { filteredData, handleSearch } = useSearch<UserDebtDto>(
        debtors,
        ["firstName", "lastName", "idUser"], // columnas filtrables
        {
            "residenceDto.street": filterState.getActiveValue("street"),
        }
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
            render: (row: UserDebtDto) => {
                const periods = Number(row.periodsOwed);
                const severe = periods >= 2;
                return (
                    <div className="text-center">
                        <span className={`badge-soft ${severe ? "badge-soft-danger" : "badge-soft-warning"}`}>
                            {periods} {periods === 1 ? "Período" : "Períodos"}
                        </span>
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
                            variant="outline-warning"
                            size="sm"
                            disabled={pdfLoading}
                            onClick={() => generateWarningPdf(row, row.periodsOwed)}
                            title="Generar Intimación de Corte"
                        >
                            <i className="bi bi-file-earmark-text me-1"></i>
                            Intimación
                        </Button>
                        <Button
                            variant="outline-danger"
                            size="sm"
                            disabled={pdfLoading || !canCut}
                            onClick={() => generateDisconnectionPdf(row)}
                            title={
                                !canCut
                                    ? "Se requiere adeudar 2 o más períodos para emitir aviso de corte"
                                    : "Generar Aviso de Corte de Servicio"
                            }
                        >
                            <i className="bi bi-exclamation-octagon me-1"></i>
                            Aviso de Corte
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="d-flex flex-column" style={{ minHeight: "calc(100vh - var(--navbar-height) - 3rem)" }}>
            <PageHeader title="Gestión de Deudores" subtitle="Usuarios con períodos adeudados y generación de avisos." icon="bi bi-exclamation-triangle" />
            {loadingDebtors ? (
                <div className="d-flex flex-column justify-content-center align-items-center loading-vh">
                    <span className="mb-2 fw-bold">CARGANDO DEUDORES...</span>
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            ) : errorDebtors ? (
                <div className="text-center py-5 text-danger">{errorDebtors}</div>
            ) : (
                <div className="my-auto">
                    <TableToolbar onSearch={handleSearch} filters={filterConfigs} filterState={filterState} />

                    {/* Tabla principal (el conteo ya lo muestra el pie de ReusableTable) */}
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
