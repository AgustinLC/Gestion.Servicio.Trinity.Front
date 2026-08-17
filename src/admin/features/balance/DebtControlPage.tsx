import { useEffect, useMemo, useState } from "react";
import { Button, Col, Row, Nav } from "react-bootstrap";
import { DebtStatus } from "../../../core/models/types/DebtStatus";
import { BalanceControlDto } from "../../../core/models/dto/BalanceControlDto";
import { CollectedBillDto } from "../../../core/models/dto/CollectedBillDto";
import { PaymentStatus } from "../../../core/models/dto/PaymentStatus";
import { getData } from "../../../core/services/apiService";
import { UnpaidBillDto } from "../../../core/models/dto/UnpaidBillDto";
import { useSearch } from "../../../hooks/useSearch";
import { useTableFilters } from "../../../hooks/useTableFilters";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import TableToolbar from "../../../shared/components/table-toolbar/TableToolbar";
import PageHeader from "../../../shared/components/PageHeader";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import TableSkeleton from "../../../shared/components/table-skeleton/TableSkeleton";
import KpiCard from "../../../shared/components/kpi-card/KpiCard";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const formatCurrency = (value: number | null | undefined): string => {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2
    }).format(value ?? 0);
};

const formatDateTime = (date: Date): string => {
    return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
};

const formatDate = (date: string | null | undefined): string => {
    if (!date) {
        return "-";
    }

    return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(new Date(date));
};

const getDebtStatusLabel = (status: DebtStatus): string => {
    switch (status) {
        case "PENDING":
            return "Pendiente";

        case "OVERDUE":
            return "Vencida";

        default:
            return status;
    }
};

const getDebtStatusClass = (status: DebtStatus): string => {
    switch (status) {
        case "PENDING":
            return "badge-soft-warning";

        case "OVERDUE":
            return "badge-soft-danger";

        default:
            return "badge-soft-neutral";
    }
};

const getPaymentStatusLabel = (status: PaymentStatus): string => {
    switch (status) {
        case PaymentStatus.PAID_ON_TIME:
            return "En término";

        case PaymentStatus.PAID_LATE:
            return "Fuera de término";

        case PaymentStatus.UNPAID:
            return "Impago";

        default:
            return status;
    }
};

const getPaymentStatusClass = (status: PaymentStatus): string => {
    switch (status) {
        case PaymentStatus.PAID_ON_TIME:
            return "badge-soft-success";

        case PaymentStatus.PAID_LATE:
            return "badge-soft-info";

        default:
            return "badge-soft-neutral";
    }
};

const DebtControlPage = () => {

    // Estados principales
    const [data, setData] = useState<BalanceControlDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"DEBTS" | "COLLECTED">("DEBTS");
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Estados de los filtros (se migran a useTableFilters después de periodOptions)

    // Obtener datos del backend
    const getBalanceControl = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getData<BalanceControlDto>(
                "/operator/balance-control"
            );

            setData(response);
            setLastUpdated(new Date());
        } catch (error: any) {
            console.error(error);

            setError(
                error.message ||
                "Error al obtener el control de balance"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getBalanceControl();
    }, []);

    // Listas originales de datos
    const unpaidBillsData = useMemo(() => {
        return data?.unpaidBills ?? [];
    }, [data]);

    const collectedBillsData = useMemo(() => {
        return data?.collectedBills ?? [];
    }, [data]);

    // Buscadores por número de conexión, usuario y período
    const {
        filteredData: filteredUnpaid,
        handleSearch: handleSearchUnpaid
    } = useSearch<UnpaidBillDto>(
        unpaidBillsData,
        [
            "idUser",
            "fullName",
            "periodName"
        ]
    );

    const {
        filteredData: filteredCollected,
        handleSearch: handleSearchCollected
    } = useSearch<CollectedBillDto>(
        collectedBillsData,
        [
            "idUser",
            "fullName",
            "periodName"
        ]
    );

    const handleSearchCombined = (query: string) => {
        handleSearchUnpaid(query);
        handleSearchCollected(query);
    };

    // Períodos disponibles para el selector (unificados)
    const periodOptions = useMemo(() => {
        const periods = new Map<number, string>();

        unpaidBillsData.forEach(bill => {
            periods.set(bill.idPeriod, bill.periodName);
        });

        collectedBillsData.forEach(bill => {
            periods.set(bill.idPeriod, bill.periodName);
        });

        return Array.from(periods.entries()).map(
            ([idPeriod, periodName]) => ({
                idPeriod,
                periodName
            })
        );
    }, [unpaidBillsData, collectedBillsData]);

    // Filtros activables con checkbox (período, estado y monto mínimo)
    const filterConfigs = useMemo(() => [
        {
            id: "period",
            label: "Período",
            emptyLabel: "Todos los períodos",
            defaultValue: "ALL",
            options: periodOptions.map(p => ({ value: String(p.idPeriod), label: p.periodName })),
        },
        {
            id: "status",
            label: activeTab === "DEBTS" ? "Estado deuda" : "Estado pago",
            emptyLabel: activeTab === "DEBTS" ? "Todas las facturas" : "Todos los pagos",
            defaultValue: "ALL",
            options: activeTab === "DEBTS"
                ? [
                    { value: "PENDING", label: "Pendientes" },
                    { value: "OVERDUE", label: "Vencidas" },
                ]
                : [
                    { value: "PAID_ON_TIME", label: "En término" },
                    { value: "PAID_LATE", label: "Fuera de término" },
                ],
        },
        {
            id: "minAmount",
            label: activeTab === "DEBTS" ? "Monto a pagar (mín.)" : "Monto cobrado (mín.)",
            type: "number" as const,
            icon: "bi bi-cash-stack",
            min: 0,
            placeholder: "Monto mínimo",
        },
    ], [periodOptions, activeTab]);
    const filterState = useTableFilters(filterConfigs);

    // Aplicar filtros de período, estado y monto mínimo para deudas
    const visibleData = useMemo(() => {
        const periodActive = filterState.getActiveValue("period");
        const statusActive = filterState.getActiveValue("status");
        const minAmountActive = filterState.getActiveValue("minAmount");
        return filteredUnpaid
            .filter(bill => {
                const matchesStatus =
                    !statusActive ||
                    bill.debtStatus === statusActive;

                const matchesPeriod =
                    !periodActive ||
                    bill.idPeriod === Number(periodActive);

                const matchesAmount =
                    !minAmountActive ||
                    (bill.amountToPay ?? 0) >= Number(minAmountActive);

                return matchesStatus && matchesPeriod && matchesAmount;
            })
            .sort((a, b) => {
                const dateA = new Date(a.expirationDate).getTime();
                const dateB = new Date(b.expirationDate).getTime();
                return dateA - dateB;
            });
    }, [filteredUnpaid, filterState]);

    // Aplicar filtros de período, estado y monto mínimo para cobros
    const visibleDataCollected = useMemo(() => {
        const periodActive = filterState.getActiveValue("period");
        const statusActive = filterState.getActiveValue("status");
        const minAmountActive = filterState.getActiveValue("minAmount");
        return filteredCollected
            .filter(bill => {
                const matchesStatus =
                    !statusActive ||
                    bill.paymentStatus === statusActive;

                const matchesPeriod =
                    !periodActive ||
                    bill.idPeriod === Number(periodActive);

                const matchesAmount =
                    !minAmountActive ||
                    (bill.amountCollected ?? 0) >= Number(minAmountActive);

                return matchesStatus && matchesPeriod && matchesAmount;
            })
            .sort((a, b) => {
                const dateA = new Date(a.paymentDate).getTime();
                const dateB = new Date(b.paymentDate).getTime();
                return dateA - dateB;
            });
    }, [filteredCollected, filterState]);

    // Ordenar datos visibles por número de conexión
    const sortedVisibleData = useMemo(() => {
        return [...visibleData].sort((a, b) => a.idUser - b.idUser);
    }, [visibleData]);

    const sortedVisibleDataCollected = useMemo(() => {
        return [...visibleDataCollected].sort((a, b) => a.idUser - b.idUser);
    }, [visibleDataCollected]);

    // Exportar datos a Excel según la pestaña activa
    const exportToExcel = () => {
        if (activeTab === "DEBTS") {
            if (sortedVisibleData.length === 0) return;

            const excelData = sortedVisibleData.map(bill => ({
                "N° Conexión": bill.idUser,
                "Usuario": bill.fullName,
                "Período": bill.periodName,
                "Vencimiento": formatDate(bill.expirationDate),
                "Total original": bill.total ?? 0,
                "Monto con recargo": bill.maturityAmount ?? 0,
                "Monto a pagar": bill.amountToPay ?? 0,
                "Estado": getDebtStatusLabel(bill.debtStatus)
            }));

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(workbook, worksheet, "Deudas");

            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array"
            });

            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });

            saveAs(
                blob,
                `Control_Deudas_${new Date().toISOString().split("T")[0]}.xlsx`
            );
        } else {
            if (sortedVisibleDataCollected.length === 0) return;

            const excelData = sortedVisibleDataCollected.map(bill => ({
                "N° Conexión": bill.idUser,
                "Usuario": bill.fullName,
                "Período": bill.periodName,
                "Vencimiento": formatDate(bill.expirationDate),
                "Fecha Pago": formatDate(bill.paymentDate),
                "Total original": bill.total ?? 0,
                "Monto con recargo": bill.maturityAmount ?? 0,
                "Monto cobrado": bill.amountCollected ?? 0,
                "Estado": getPaymentStatusLabel(bill.paymentStatus)
            }));

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(workbook, worksheet, "Recaudado");

            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array"
            });

            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });

            saveAs(
                blob,
                `Control_Recaudado_${new Date().toISOString().split("T")[0]}.xlsx`
            );
        }
    };

    // Resúmenes correspondientes a los filtros actuales
    const filteredSummary = useMemo(() => {
        const usersWithDebt = new Set(visibleData.map(bill => bill.idUser)).size;
        const unpaidBillCount = visibleData.length;
        const totalDebt = visibleData.reduce((total, bill) => total + (bill.amountToPay ?? 0), 0);

        return { usersWithDebt, unpaidBillCount, totalDebt };
    }, [visibleData]);

    const filteredSummaryCollected = useMemo(() => {
        const usersWithPayment = new Set(visibleDataCollected.map(bill => bill.idUser)).size;
        const paidBillCount = visibleDataCollected.length;
        const totalCollected = visibleDataCollected.reduce((total, bill) => total + (bill.amountCollected ?? 0), 0);

        return { usersWithPayment, paidBillCount, totalCollected };
    }, [visibleDataCollected]);

    // Columnas de la tabla para deudas
    const columns: TableColumnDefinition<UnpaidBillDto>[] = useMemo(() => [
        { key: "idUser", label: "N° Conexión", sortable: true },
        { key: "fullName", label: "Usuario", sortable: true },
        { key: "periodName", label: "Período", sortable: true },
        {
            key: "expirationDate", label: "Vencimiento", sortable: true, render: (row: UnpaidBillDto) => (
                <span>{formatDate(row.expirationDate)}</span>
            )
        },
        {
            key: "total", label: "Total original", sortable: true, render: (row: UnpaidBillDto) => (
                <span>{formatCurrency(row.total)}</span>
            )
        },
        {
            key: "amountToPay", label: "Monto a pagar", sortable: true, render: (row: UnpaidBillDto) => (
                <span className="fw-bold">{formatCurrency(row.amountToPay)}</span>
            )
        },
        {
            key: "debtStatus", label: "Estado", sortable: true, render: (row: UnpaidBillDto) => (
                <span className={`badge-soft ${getDebtStatusClass(row.debtStatus)}`}>
                    {getDebtStatusLabel(row.debtStatus)}
                </span>
            )
        }
    ], []);

    // Columnas de la tabla para cobros
    const columnsCollected: TableColumnDefinition<CollectedBillDto>[] = useMemo(() => [
        { key: "idUser", label: "N° Conexión", sortable: true },
        { key: "fullName", label: "Usuario", sortable: true },
        { key: "periodName", label: "Período", sortable: true },
        {
            key: "expirationDate", label: "Vencimiento", sortable: true, render: (row: CollectedBillDto) => (
                <span>{formatDate(row.expirationDate)}</span>
            )
        },
        {
            key: "paymentDate", label: "Fecha Pago", sortable: true, render: (row: CollectedBillDto) => (
                <span>{formatDate(row.paymentDate)}</span>
            )
        },
        {
            key: "total", label: "Total original", sortable: true, render: (row: CollectedBillDto) => (
                <span>{formatCurrency(row.total)}</span>
            )
        },
        {
            key: "amountCollected", label: "Monto cobrado", sortable: true, render: (row: CollectedBillDto) => (
                <span className="fw-bold text-success">{formatCurrency(row.amountCollected)}</span>
            )
        },
        {
            key: "paymentStatus", label: "Estado", sortable: true, render: (row: CollectedBillDto) => (
                <span className={`badge-soft ${getPaymentStatusClass(row.paymentStatus)}`}>
                    {getPaymentStatusLabel(row.paymentStatus)}
                </span>
            )
        }
    ], []);

    if (loading) {
        return (
            <div>
                <PageHeader title="Balance" subtitle="Control de deudas pendientes y montos recaudados." icon="bi bi-graph-down-arrow">
                    <div className="stat-card d-flex align-items-center gap-3 px-3 py-2">
                        <div>
                            <div className="skeleton skeleton-line mb-1" style={{ width: 130, height: 10 }}></div>
                            <div className="skeleton skeleton-line" style={{ width: 100, height: 14 }}></div>
                        </div>
                        <div className="skeleton" style={{ width: 32, height: 32, borderRadius: "50%" }}></div>
                    </div>
                </PageHeader>

                {/* Esqueleto de las pestañas + tarjetas de resumen, por encima del
                    esqueleto de la tabla. */}
                <div className="skeleton skeleton-line mb-4" style={{ width: 320, height: 38, borderRadius: 8 }}></div>
                <Row className="g-3 mb-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Col xs={12} md={4} key={index}>
                            <div className="kpi-card">
                                <div className="kpi-card-icon skeleton"></div>
                                <div className="kpi-card-body flex-grow-1">
                                    <div className="skeleton skeleton-line mb-2" style={{ width: "70%", height: 12 }}></div>
                                    <div className="skeleton skeleton-line" style={{ width: "45%", height: 18 }}></div>
                                </div>
                                <div className="kpi-card-trend skeleton"></div>
                            </div>
                        </Col>
                    ))}
                </Row>

                <TableSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-5 text-danger">{error}</div>
        );
    }

    const currentResultsCount = activeTab === "DEBTS" ? sortedVisibleData.length : sortedVisibleDataCollected.length;

    // Deuda pendiente = mala noticia (rojo), recaudado = buena noticia (verde).
    // Mismos tonos que usa KpiCard para el badge de tendencia, para que todo
    // el conjunto (ícono, valor y badge) sea consistente entre sí.
    const summaryColor = activeTab === "DEBTS" ? "#dc2626" : "#16a34a";
    const summaryBg = activeTab === "DEBTS" ? "#fee2e2" : "#dcfce7";

    return (
        <div>
            <PageHeader title="Balance" subtitle="Control de deudas pendientes y montos recaudados." icon="bi bi-graph-down-arrow">
                <div className="stat-card d-flex align-items-center gap-3 px-3 py-2">
                    <div>
                        <div className="stat-label text-muted small">Última actualización</div>
                        <div className="stat-value fw-bold" style={{ fontSize: "0.95rem" }}>
                            {lastUpdated ? formatDateTime(lastUpdated) : "-"}
                        </div>
                    </div>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center p-0"
                        style={{ width: 32, height: 32 }}
                        onClick={getBalanceControl}
                        title="Actualizar"
                    >
                        <i className="bi bi-arrow-clockwise"></i>
                    </button>
                </div>
            </PageHeader>

            <div className="content-fade-in">
            {/* Alternancia de pestañas */}
            <Nav
                variant="tabs"
                activeKey={activeTab}
                onSelect={(k) => {
                    setActiveTab(k as "DEBTS" | "COLLECTED");
                    filterState.setFilterValue("status", "ALL");
                }}
                className="mb-4"
            >
                <Nav.Item>
                    <Nav.Link eventKey="DEBTS" className="fw-semibold">
                        <i className="bi bi-clock-history me-2"></i>
                        Deudas Pendientes
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="COLLECTED" className="fw-semibold">
                        <i className="bi bi-wallet2 me-2"></i>
                        Recaudado
                    </Nav.Link>
                </Nav.Item>
            </Nav>

            {/* Tarjetas de resumen */}
            <Row className="g-3 mb-4">
                <Col xs={12} md={4}>
                    <KpiCard
                        icon="bi bi-people-fill"
                        iconBg={summaryBg}
                        iconColor={summaryColor}
                        label={activeTab === "DEBTS" ? "Usuarios con deuda" : "Usuarios con pagos"}
                        value={activeTab === "DEBTS" ? filteredSummary.usersWithDebt : filteredSummaryCollected.usersWithPayment}
                        valueColor={summaryColor}
                        trend={activeTab === "DEBTS" ? "down" : "up"}
                    />
                </Col>

                <Col xs={12} md={4}>
                    <KpiCard
                        icon="bi bi-file-earmark-text-fill"
                        iconBg={summaryBg}
                        iconColor={summaryColor}
                        label={activeTab === "DEBTS" ? "Facturas impagas" : "Facturas cobradas"}
                        value={activeTab === "DEBTS" ? filteredSummary.unpaidBillCount : filteredSummaryCollected.paidBillCount}
                        valueColor={summaryColor}
                        trend={activeTab === "DEBTS" ? "down" : "up"}
                    />
                </Col>

                <Col xs={12} md={4}>
                    <KpiCard
                        icon="bi bi-cash-stack"
                        iconBg={summaryBg}
                        iconColor={summaryColor}
                        label={activeTab === "DEBTS" ? "Deuda total actual" : "Total recaudado"}
                        value={activeTab === "DEBTS" ? formatCurrency(filteredSummary.totalDebt) : formatCurrency(filteredSummaryCollected.totalCollected)}
                        valueColor={summaryColor}
                        trend={activeTab === "DEBTS" ? "down" : "up"}
                    />
                </Col>
            </Row>

            {/* Barra de búsqueda y filtros */}
            <TableToolbar
                onSearch={handleSearchCombined}
                filters={filterConfigs}
                filterState={filterState}
            >
                <Button
                    variant="success"
                    onClick={exportToExcel}
                    disabled={currentResultsCount === 0}
                >
                    Exportar a Excel
                </Button>
            </TableToolbar>

            {/* Tabla (el conteo de resultados ya lo muestra el pie de ReusableTable) */}
            {activeTab === "DEBTS" ? (
                <ReusableTable
                    key="debts-table"
                    data={sortedVisibleData}
                    columns={columns}
                    defaultSort="expirationDate"
                    emptyIcon="bi bi-check-circle"
                    emptyTitle="Sin deudas pendientes"
                    emptyMessage="No hay facturas impagas para este período/filtro."
                />
            ) : (
                <ReusableTable
                    key="collected-table"
                    data={sortedVisibleDataCollected}
                    columns={columnsCollected}
                    defaultSort="paymentDate"
                    emptyIcon="bi bi-cash-stack"
                    emptyTitle="Sin cobros registrados"
                    emptyMessage="Todavía no se registraron facturas cobradas para este período/filtro."
                />
            )}
            </div>
        </div>
    );
};

export default DebtControlPage;
