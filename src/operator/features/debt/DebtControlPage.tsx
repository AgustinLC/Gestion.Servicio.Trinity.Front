import { useEffect, useMemo, useState } from "react";
import { Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { DebtStatus } from "../../../core/models/types/DebtStatus";
import { DebtControlDto } from "../../../core/models/dto/DebtControlDto";
import { getData } from "../../../core/services/apiService";
import { UnpaidBillDto } from "../../../core/models/dto/UnpaidBillDto";
import { useSearch } from "../../../hooks/useSearch";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import SearchBar from "../../../shared/components/searcher/SearchBar";
import ReusableTable from "../../../shared/components/table/ReusableTable";

type DebtStatusFilter =
    | "ALL"
    | DebtStatus;

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

const DebtControlPage = () => {

    // Estados principales
    const [data, setData] = useState<DebtControlDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estados de los filtros
    const [statusFilter, setStatusFilter] =
        useState<DebtStatusFilter>("ALL");

    const [periodFilter, setPeriodFilter] =
        useState<string>("ALL");

    // Obtener datos del backend
    const getDebtControl = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getData<DebtControlDto>(
                "/operator/debt-control"
            );

            setData(response);
        } catch (error: any) {
            console.error(error);

            setError(
                error.message ||
                "Error al obtener el control de deudas"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDebtControl();
    }, []);

    // Datos originales de la tabla
    const tableData: UnpaidBillDto[] = useMemo(() => {
        return data?.bills ?? [];
    }, [data]);

    // Buscador por número de conexión, usuario y período
    const {
        filteredData,
        handleSearch
    } = useSearch<UnpaidBillDto>(
        tableData,
        [
            "idUser",
            "fullName",
            "periodName"
        ]
    );

    // Períodos disponibles para el selector
    const periodOptions = useMemo(() => {
        const periods = new Map<number, string>();

        tableData.forEach(bill => {
            periods.set(
                bill.idPeriod,
                bill.periodName
            );
        });

        return Array.from(periods.entries()).map(
            ([idPeriod, periodName]) => ({
                idPeriod,
                periodName
            })
        );
    }, [tableData]);

    // Aplicar filtros de período y estado
    const visibleData = useMemo(() => {
        return filteredData
            .filter(bill => {

                const matchesStatus =
                    statusFilter === "ALL" ||
                    bill.debtStatus === statusFilter;

                const matchesPeriod =
                    periodFilter === "ALL" ||
                    bill.idPeriod === Number(periodFilter);

                return matchesStatus && matchesPeriod;
            })
            .sort((a, b) => {

                const dateA = new Date(
                    a.expirationDate
                ).getTime();

                const dateB = new Date(
                    b.expirationDate
                ).getTime();

                return dateA - dateB;
            });

    }, [
        filteredData,
        statusFilter,
        periodFilter
    ]);

    // Resumen correspondiente a los filtros actuales
    const filteredSummary = useMemo(() => {

        const usersWithDebt = new Set(
            visibleData.map(bill => bill.idUser)
        ).size;

        const unpaidBillCount = visibleData.length;

        const totalDebt = visibleData.reduce(
            (total, bill) =>
                total + (bill.amountToPay ?? 0),
            0
        );

        return {
            usersWithDebt,
            unpaidBillCount,
            totalDebt
        };

    }, [visibleData]);

    // Columnas de la tabla
    const columns: TableColumnDefinition<UnpaidBillDto>[] =
        useMemo(() => [
            {
                key: "idUser",
                label: "N° Conexión",
                sortable: true
            },
            {
                key: "fullName",
                label: "Usuario",
                sortable: true
            },
            {
                key: "periodName",
                label: "Período",
                sortable: true
            },
            {
                key: "expirationDate",
                label: "Vencimiento",
                sortable: true,
                render: (row: UnpaidBillDto) => (
                    <span>
                        {formatDate(row.expirationDate)}
                    </span>
                )
            },
            {
                key: "total",
                label: "Total original",
                sortable: true,
                render: (row: UnpaidBillDto) => (
                    <span>
                        {formatCurrency(row.total)}
                    </span>
                )
            },
            {
                key: "amountToPay",
                label: "Monto a pagar",
                sortable: true,
                render: (row: UnpaidBillDto) => (
                    <span className="fw-bold">
                        {formatCurrency(row.amountToPay)}
                    </span>
                )
            },
            {
                key: "debtStatus",
                label: "Estado",
                sortable: true,
                render: (row: UnpaidBillDto) => (
                    <span
                        className={`
                            badge
                            ${getDebtStatusClass(row.debtStatus)}
                        `}
                    >
                        {getDebtStatusLabel(row.debtStatus)}
                    </span>
                )
            }
        ], []);

    if (loading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                <span className="mb-2 fw-bold">
                    CARGANDO...
                </span>

                <Spinner
                    animation="border"
                    role="status"
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-5 text-danger">
                {error}
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-center mb-4">
                Control de deudas
            </h1>

            {/* Tarjetas de resumen */}
            <Row className="g-3 mb-4">
                <Col xs={12} md={4}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="text-center">
                            <Card.Title>
                                Usuarios con deuda
                            </Card.Title>

                            <Card.Text className="fs-3 fw-bold">
                                {filteredSummary.usersWithDebt}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={12} md={4}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="text-center">
                            <Card.Title>
                                Facturas impagas
                            </Card.Title>

                            <Card.Text className="fs-3 fw-bold">
                                {filteredSummary.unpaidBillCount}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={12} md={4}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="text-center">
                            <Card.Title>
                                Deuda total actual
                            </Card.Title>

                            <Card.Text className="fs-3 fw-bold">
                                {formatCurrency(
                                    filteredSummary.totalDebt
                                )}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Barra de búsqueda y filtros */}
            <div className="d-flex flex-column flex-lg-row align-items-center justify-content-between gap-2 mb-3">

                <SearchBar onSearch={handleSearch} />

                <Form.Select
                    value={periodFilter}
                    onChange={(event) =>
                        setPeriodFilter(event.target.value)
                    }
                    style={{ maxWidth: "260px" }}
                >
                    <option value="ALL">
                        Todos los períodos
                    </option>

                    {periodOptions.map(period => (
                        <option
                            key={period.idPeriod}
                            value={period.idPeriod}
                        >
                            {period.periodName}
                        </option>
                    ))}
                </Form.Select>

                <Form.Select
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(
                            event.target.value as DebtStatusFilter
                        )
                    }
                    style={{ maxWidth: "220px" }}
                >
                    <option value="ALL">
                        Todas las facturas
                    </option>

                    <option value="PENDING">
                        Pendientes
                    </option>

                    <option value="OVERDUE">
                        Vencidas
                    </option>
                </Form.Select>
            </div>

            {/* Cantidad de resultados */}
            <div className="mb-2 text-muted">
                Resultados encontrados:{" "}
                <strong>{visibleData.length}</strong>
            </div>

            {/* Tabla */}
            <ReusableTable
                data={visibleData}
                columns={columns}
                defaultSort="expirationDate"
            />
        </div>
    );
};

export default DebtControlPage;