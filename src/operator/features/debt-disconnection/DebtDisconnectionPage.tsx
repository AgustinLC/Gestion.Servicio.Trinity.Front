import { useState, useEffect, useMemo } from "react";
import { Button, Spinner, OverlayTrigger, Tooltip } from "react-bootstrap";
import TableToolbar from "../../../shared/components/table-toolbar/TableToolbar";
import PageHeader from "../../../shared/components/PageHeader";
import { UserDebtDto } from "../../../core/models/dto/UserDebtDto";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import TableSkeleton from "../../../shared/components/table-skeleton/TableSkeleton";
import { useSearch } from "../../../hooks/useSearch";
import { useTableFilters } from "../../../hooks/useTableFilters";
import { useDebtDisconnectionPdfs } from "../../../shared/hooks/useDebtDisconnectionPdfs";
import { getData } from "../../../core/services/apiService";
import { withFullName } from "../../../core/utils/userUtils";

type UserDebtRow = UserDebtDto & { fullName: string };

const DebtDisconnectionPage = () => {
    const { generateDisconnectionPdf, generateWarningPdf } = useDebtDisconnectionPdfs();

    // Estados locales para la conexión con el backend
    const [debtors, setDebtors] = useState<UserDebtDto[]>([]);
    const [loadingDebtors, setLoadingDebtors] = useState(false);
    const [errorDebtors, setErrorDebtors] = useState<string | null>(null);

    // Qué botón puntual está generando un PDF ("warning-<idUser>" o "cut-<idUser>").
    // El hook expone un solo isGenerating compartido por toda la tabla; si lo
    // usáramos para deshabilitar, un click en una fila apagaba los botones de
    // TODAS las filas a la vez. Con esta key solo se deshabilita/marca el
    // botón realmente clickeado.
    const [processingKey, setProcessingKey] = useState<string | null>(null);

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

    // Filtros siempre visibles (Fase 3): calle y mínimo de períodos adeudados
    const filterConfigs = useMemo(
        () => [
            {
                id: "street",
                label: "Calle",
                emptyLabel: "Todas las calles",
                options: uniqueStreets.map((street) => ({ value: street, label: street })),
            },
            {
                id: "minPeriods",
                label: "Períodos adeudados",
                type: "number" as const,
                icon: "bi bi-exclamation-circle",
                min: 1,
                placeholder: "Mín. períodos",
            },
        ],
        [uniqueStreets]
    );
    const filterState = useTableFilters(filterConfigs);

    // Se agrega el nombre y apellido concatenados para poder listarlos en una sola columna
    // y para que el buscador encuentre coincidencias sin importar si se busca por
    // nombre, apellido o ambos juntos.
    const debtorsWithFullName = useMemo(() => withFullName(debtors), [debtors]);

    // El filtro de "mínimo de períodos" es un umbral (>=), no una igualdad exacta,
    // así que se aplica acá en vez de en el objeto de filtros de useSearch (que solo
    // soporta coincidencia exacta).
    const minPeriods = filterState.getActiveValue("minPeriods");
    const debtorsFilteredByPeriods = useMemo(() => {
        const min = minPeriods !== null ? Number(minPeriods) : null;
        return min !== null && !Number.isNaN(min)
            ? debtorsWithFullName.filter((debtor) => debtor.periodsOwed >= min)
            : debtorsWithFullName;
    }, [debtorsWithFullName, minPeriods]);

    // Hook para buscar por columnas en los deudores
    const { filteredData, handleSearch } = useSearch<UserDebtRow>(
        debtorsFilteredByPeriods,
        ["fullName", "idUser"], // columnas filtrables
        {
            "residenceDto.street": filterState.getActiveValue("street"),
        }
    );

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<UserDebtRow>[] = [
        { key: "idUser", label: "N° Conexión", sortable: true },
        { key: "fullName", label: "Nombre y Apellido", sortable: false },
        { key: "street" as keyof UserDebtRow, label: "Calle", sortable: false, render: (row: UserDebtRow) => row.residenceDto?.street || "Sin dirección" },
        {
            key: "periodsOwed",
            label: "Períodos Adeudados",
            sortable: true,
            render: (row: UserDebtRow) => {
                const periods = Number(row.periodsOwed);
                const severe = periods >= 2;
                return (
                    <div className="text-center">
                        <span className={`badge-soft ${severe ? "badge-soft-danger" : "badge-soft-warning"}`}>
                            {periods}
                        </span>
                    </div>
                );
            }
        },
        {
            key: "actions",
            label: "Generar Documentos",
            actions: (row: UserDebtRow) => {
                const canCut = row.periodsOwed >= 2;
                const warningKey = `warning-${row.idUser}`;
                const cutKey = `cut-${row.idUser}`;
                const isWarningProcessing = processingKey === warningKey;
                const isCutProcessing = processingKey === cutKey;
                return (
                    <div className="d-flex gap-2 justify-content-center overflow-auto text-nowrap">
                        <Button
                            variant="outline-warning"
                            size="sm"
                            disabled={isWarningProcessing}
                            onClick={() => generateWarningPdf(row, row.periodsOwed, {
                                onStart: () => setProcessingKey(warningKey),
                                onComplete: () => setProcessingKey(null),
                                onError: () => setProcessingKey(null),
                            })}
                            title="Generar Intimación de Corte"
                        >
                            {isWarningProcessing ? (
                                <Spinner animation="border" size="sm" className="me-1" />
                            ) : (
                                <i className="bi bi-file-earmark-text me-1"></i>
                            )}
                            Intimación
                        </Button>
                        {!canCut ? (
                            <OverlayTrigger
                                placement="top"
                                overlay={
                                    <Tooltip id={`cut-disabled-tooltip-${row.idUser}`}>
                                        Se requiere adeudar 2 o más períodos para emitir aviso de corte
                                    </Tooltip>
                                }
                            >
                                {/* El Button disabled no dispara eventos de mouse (por eso
                                    el title nativo no se veía); se envuelve en un span para
                                    que el OverlayTrigger pueda detectar el hover igual. */}
                                <span className="d-inline-block">
                                    <Button variant="outline-danger" size="sm" disabled style={{ pointerEvents: "none" }}>
                                        <i className="bi bi-exclamation-octagon me-1"></i>
                                        Aviso de Corte
                                    </Button>
                                </span>
                            </OverlayTrigger>
                        ) : (
                            <Button
                                variant="outline-danger"
                                size="sm"
                                disabled={isCutProcessing}
                                onClick={() => generateDisconnectionPdf(row, {
                                    onStart: () => setProcessingKey(cutKey),
                                    onComplete: () => setProcessingKey(null),
                                    onError: () => setProcessingKey(null),
                                })}
                                title="Generar Aviso de Corte de Servicio"
                            >
                                {isCutProcessing ? (
                                    <Spinner animation="border" size="sm" className="me-1" />
                                ) : (
                                    <i className="bi bi-exclamation-octagon me-1"></i>
                                )}
                                Aviso de Corte
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <div>
            <PageHeader title="Gestión de Deudores" subtitle="Usuarios con períodos adeudados y generación de avisos." icon="bi bi-exclamation-triangle" />
            {loadingDebtors ? (
                <TableSkeleton />
            ) : errorDebtors ? (
                <div className="text-center py-5 text-danger">{errorDebtors}</div>
            ) : (
                <div className="content-fade-in">
                    <TableToolbar onSearch={handleSearch} filters={filterConfigs} filterState={filterState} />

                    {/* Tabla principal (el conteo ya lo muestra el pie de ReusableTable) */}
                    <ReusableTable<UserDebtRow>
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
