import { BarChart, Bar, YAxis, Tooltip, Legend, PieChart, Pie, Cell, XAxis, ResponsiveContainer } from "recharts";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import { useEffect, useMemo, useState } from "react";
import { ResumeDto } from "../../../core/models/dto/ResumeDto";
import { getData } from "../../../core/services/apiService";
import { PeriodSelectorDto } from "../../../core/models/dto/PeriodSelectorDto";
import { BillCountsDto } from "../../../core/models/dto/BillCountDto";
import KpiCard, { KpiTrend } from "../../../shared/components/kpi-card/KpiCard";
import PageHeader from "../../../shared/components/PageHeader";

const Resume = () => {
    //Estados
    const [data, setData] = useState<ResumeDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [chartSize, setChartSize] = useState({ width: 500, height: 260 })
    const [periods, setPeriods] = useState<PeriodSelectorDto[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
    const [billChartData, setBillChartData] = useState<BillCountsDto | null>(null);
    const [loadingChart, setLoadingChart] = useState(false);

    // Función para actualizar el tamaño de los gráficos
    const updateChartSize = () => {
        const width = window.innerWidth < 768 ? 300 : 500; // Ajusta el ancho para móviles
        const height = window.innerWidth < 768 ? 200 : 260; // Ajusta el alto para móviles
        setChartSize({ width, height });
    };

    // Efecto para detectar cambios en el tamaño de la pantalla
    useEffect(() => {
        updateChartSize(); // Actualiza el tamaño al cargar el componente
        window.addEventListener("resize", updateChartSize); // Escucha cambios en el tamaño de la pantalla
        return () => {
            window.removeEventListener("resize", updateChartSize); // Limpia el evento al desmontar el componente
        };
    }, []);

    // Función para obtener el resumen de los datos
    const fetchResume = async () => {
        setLoading(true);
        try {
            const resume = await getData<ResumeDto>('/operator/resume-supplier');
            setData(resume);
        } catch (error) {
            setError("Error al cargar la información principal");
            alert('Error al obtener los datos' + error);
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener los periodos al cargar el componente
    const fetchPeriods = async () => {
        try {
            const response = await getData<PeriodSelectorDto[]>('/operator/periods');
            setPeriods(response);
            const activePeriod = response.find(p => p.active);
            if (activePeriod) {
                setSelectedPeriod(activePeriod.idPeriod);
            }
        } catch (error) {
            console.error(error);
            alert("Error al obtener los períodos");
        }
    };

    // Función para obtener las facturas por periodo
    const fetchBillChart = async (idPeriod: number) => {
        setLoadingChart(true);
        try {
            const response = await getData<BillCountsDto>(
                `/operator/bill-counts/${idPeriod}`
            );
            setBillChartData(response);
        } catch (error) {
            console.error(error);
            alert("Error al obtener gráfico de facturas");
        } finally {
            setLoadingChart(false);
        }
    };

    // Efecto para obtener el resumen al cargar el componente
    useEffect(() => {
        fetchResume();
        fetchPeriods();
    }, []);

    // Efecto para obtener el gráfico de facturas al seleccionar un periodo
    useEffect(() => {
        if (selectedPeriod) {
            fetchBillChart(selectedPeriod);
        }
    }, [selectedPeriod]);

    // Datos para las tarjetas KPI (Fase 5)
    const summaryData = useMemo(() => [
        { title: "Usuarios Activos", value: data?.activeUsers || 0, icon: "bi bi-people-fill", iconBg: "#dcfce7", color: "#16a34a", trend: "up" as KpiTrend },
        { title: "Usuarios Suspendidos", value: data?.suspendedUsers || 0, icon: "bi bi-person-dash-fill", iconBg: "#ffedd5", color: "#ea580c", trend: "up" as KpiTrend },
        { title: "Usuarios Inactivos", value: data?.inactiveUsers || 0, icon: "bi bi-person-x-fill", iconBg: "#fee2e2", color: "#dc2626", trend: "down" as KpiTrend },
        { title: "Medidores faltantes", value: data?.missingMeters || 0, icon: "bi bi-exclamation-triangle-fill", iconBg: "#f3e8ff", color: "#9333ea", trend: "neutral" as KpiTrend },
        { title: "Lecturas Realizadas", value: data?.fullReadings || 0, icon: "bi bi-file-earmark-text-fill", iconBg: "#dbeafe", color: "#2563eb", trend: "neutral" as KpiTrend },
        { title: "Lecturas Pendientes", value: data?.incompleteReadings || 0, icon: "bi bi-clipboard-data-fill", iconBg: "#dbeafe", color: "#2563eb", trend: "up" as KpiTrend },
        { title: "Modalidad activa", value: data?.activeModality || "No disponible", icon: "bi bi-arrow-repeat", iconBg: "#d1fae5", color: "#059669", trend: "neutral" as KpiTrend },
        { title: "Fecha de periodo (activo)", value: data?.dateActivePeriod ? new Date(data?.dateActivePeriod).toLocaleDateString() : "No disponible", icon: "bi bi-calendar-event-fill", iconBg: "#ffedd5", color: "#ea580c", trend: "neutral" as KpiTrend },
        { title: "Servicio/Unidad", value: data?.activeUnitService || "No disponible", icon: "bi bi-droplet-fill", iconBg: "#ccfbf1", color: "#0d9488", trend: "neutral" as KpiTrend },
    ], [data]);

    // Datos del gráfico de barras (Usuarios por tarifa)
    const usersForFeeData = useMemo(() =>
        data?.usersForFee?.map(fee => ({ fee: fee.fee, cantidad: fee.count })) ?? [],
        [data]);

    // Datos para el gráfico de pastel
    const invoicesData = useMemo(() => [
        { name: "Pagas", value: billChartData?.paidBills || 0, color: "#28a745" },
        { name: "Impagas", value: billChartData?.unpaidBills || 0, color: "#dc3545" },
    ], [billChartData]);

    // Render
    return (
        <div>
            <PageHeader title="Resumen" subtitle="Información general del sistema al día de hoy." icon="bi bi-person-lines-fill" />

            {/* Mostrar el mensaje de carga mientras los datos se están cargando */}
            {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center loading-vh">
                    <span className="mb-2 fw-bold">CARGANDO...</span>
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : (
                <div>

                    {/* Tarjetas de resumen (KPI) */}
                    <Row className="mb-2">
                        {summaryData.map((item, index) => (
                            <Col key={index} xl={4} md={6} className="mb-2">
                                <KpiCard
                                    icon={item.icon}
                                    iconBg={item.iconBg}
                                    iconColor={item.color}
                                    label={item.title}
                                    value={item.value}
                                    valueColor={item.color}
                                    trend={item.trend}
                                />
                            </Col>
                        ))}
                    </Row>

                    <Row>
                        {/* Gráfico de barras: Lecturas realizadas por mes */}
                        <Col md={8} className="mb-3">
                            <Card className="h-100 chart-card">
                                <Card.Body>
                                    <Card.Title>Cantidad de usuarios x tarifa</Card.Title>
                                    <ResponsiveContainer width="100%" height={chartSize.height}>
                                        <BarChart data={usersForFeeData}>
                                            <XAxis dataKey="fee" className="d-none d-md-block" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="cantidad" fill="#007bff" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Gráfico de pastel: Facturas pagas vs impagas */}
                        <Col md={4} className="mb-3">
                            <Card className="h-100 chart-card">
                                <Card.Body>
                                    {/* Header */}
                                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                                        <Card.Title className="mb-0"> Facturas Pagas/Impagas</Card.Title>
                                        <select
                                            className="form-select w-auto"
                                            value={selectedPeriod ?? ""}
                                            onChange={(e) =>
                                                setSelectedPeriod(Number(e.target.value))
                                            }
                                        >
                                            {periods.map((period) => (
                                                <option
                                                    key={period.idPeriod}
                                                    value={period.idPeriod}
                                                >
                                                    {period.label}
                                                    {period.active ? " (Actual)" : ""}

                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Gráfico */}
                                    {loadingChart ? (
                                        <div className="d-flex justify-content-center align-items-center" style={{ height: chartSize.height }}>
                                            <Spinner animation="border" />
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={chartSize.height}>
                                            <PieChart>
                                                <Pie
                                                    data={invoicesData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    label
                                                >

                                                    {invoicesData.map((entry, index) => (

                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.color}
                                                        />

                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>
            )}
        </div>
    );
};
export default Resume