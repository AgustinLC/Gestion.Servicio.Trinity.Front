import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Row, Spinner, Nav } from "react-bootstrap";
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
import ReusableTable from "../../../shared/components/table/ReusableTable";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const formatCurrency = (value: number | null | undefined): string => {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2
    }).format(value ?? 0);
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
            return "bg-warning text-dark";

        case "OVERDUE":
            return "bg-danger text-white";

        default:
            return "bg-secondary text-white";
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
            return "bg-success text-white";

        case PaymentStatus.PAID_LATE:
            return "bg-info text-dark";

        default:
            return "bg-secondary text-white";
    }
};

const DebtControlPage = () => {

    // Estados principales
    const [data, setData] = useState<BalanceControlDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"DEBTS" | "COLLECTED">("DEBTS");

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

    // Filtros activables con checkbox (período y estado)
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
    ], [periodOptions, activeTab]);
    const filterState = useTableFilters(filterConfigs);

    // Aplicar filtros de período y estado para deudas
    const visibleData = useMemo(() => {
        const periodActive = filterState.getActiveValue("period");
        const statusActive = filterState.getActiveValue("status");
        return filteredUnpaid
            .filter(bill => {
                const matchesStatus =
                    !statusActive ||
                    bill.debtStatus === statusActive;

                const matchesPeriod =
                    !periodActive ||
                    bill.idPeriod === Number(periodActive);

                return matchesStatus && matchesPeriod;
            })
            .sort((a, b) => {
                const dateA = new Date(a.expirationDate).getTime();
                const dateB = new Date(b.expirationDate).getTime();
                return dateA - dateB;
            });
    }, [filteredUnpaid, filterState]);

    // Aplicar filtros de período y estado para cobros
    const visibleDataCollected = useMemo(() => {
        const periodActive = filterState.getActiveValue("period");
        const statusActive = filterState.getActiveValue("status");
        return filteredCollected
            .filter(bill => {
                const matchesStatus =
                    !statusActive ||
                    bill.paymentStatus === statusActive;

                const matchesPeriod =
                    !periodActive ||
                    bill.idPeriod === Number(periodActive);

                return matchesStatus && matchesPeriod;
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
                <span className={`badge ${getDebtStatusClass(row.debtStatus)}`}>
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
                <span className={`badge ${getPaymentStatusClass(row.paymentStatus)}`}>
                    {getPaymentStatusLabel(row.paymentStatus)}
                </span>
            )
        }
    ], []);

    if (loading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                <span className="mb-2 fw-bold">CARGANDO...</span>
                <Spinner animation="border" role="status" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-5 text-danger">{error}</div>
        );
    }

    const currentResultsCount = activeTab === "DEBTS" ? sortedVisibleData.length : sortedVisibleDataCollected.length;

    return (
        <div>
            <h1 className="text-center mb-4">Balance</h1>

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
                        Deudas Pendientes
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="COLLECTED" className="fw-semibold">
                        Recaudado
                    </Nav.Link>
                </Nav.Item>
            </Nav>

            {/* Tarjetas de resumen */}
            <Row className="g-3 mb-4">
                <Col xs={12} md={4}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="text-center">
                            <Card.Title>
                                {activeTab === "DEBTS" ? "Usuarios con deuda" : "Usuarios con pagos"}
                            </Card.Title>
                            <Card.Text className="fs-3 fw-bold">
                                {activeTab === "DEBTS"
                                    ? filteredSummary.usersWithDebt
                                    : filteredSummaryCollected.usersWithPayment}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={12} md={4}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="text-center">
                            <Card.Title>
                                {activeTab === "DEBTS" ? "Facturas impagas" : "Facturas cobradas"}
                            </Card.Title>
                            <Card.Text className="fs-3 fw-bold">
                                {activeTab === "DEBTS"
                                    ? filteredSummary.unpaidBillCount
                                    : filteredSummaryCollected.paidBillCount}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={12} md={4}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="text-center">
                            <Card.Title>
                                {activeTab === "DEBTS" ? "Deuda total actual" : "Total recaudado"}
                            </Card.Title>
                            <Card.Text className="fs-3 fw-bold">
                                {activeTab === "DEBTS"
                                    ? formatCurrency(filteredSummary.totalDebt)
                                    : formatCurrency(filteredSummaryCollected.totalCollected)}
                            </Card.Text>
                        </Card.Body>
                    </Card>
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

            {/* Cantidad de resultados */}
            <div className="mb-2 text-muted">
                Resultados encontrados: <strong>{currentResultsCount}</strong>
            </div>

            {/* Tabla */}
            {activeTab === "DEBTS" ? (
                <ReusableTable
                    key="debts-table"
                    data={sortedVisibleData}
                    columns={columns}
                    defaultSort="expirationDate"
                />
            ) : (
                <ReusableTable
                    key="collected-table"
                    data={sortedVisibleDataCollected}
                    columns={columnsCollected}
                    defaultSort="paymentDate"
                />
            )}
        </div>
    );
};

export default DebtControlPage;
