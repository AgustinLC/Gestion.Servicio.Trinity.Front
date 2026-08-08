import { BarChart, Bar, YAxis, Tooltip, PieChart, Pie, Cell, XAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import { useEffect, useMemo, useState } from "react";
import { ResumeDto } from "../../../core/models/dto/ResumeDto";
import { getData } from "../../../core/services/apiService";
import { PeriodSelectorDto } from "../../../core/models/dto/PeriodSelectorDto";
import { BillCountsDto } from "../../../core/models/dto/BillCountDto";
import KpiCard, { KpiTrend } from "../../../shared/components/kpi-card/KpiCard";
import PageHeader from "../../../shared/components/PageHeader";
import CustomSelect from "../../../shared/components/custom-select/CustomSelect";
import DashboardSkeleton from "../../../shared/components/dashboard-skeleton/DashboardSkeleton";

// Ilustración "sin datos": una dona fantasma en tonos grises + algunos
// puntos decorativos alrededor, en vez de dejar el gráfico real vacío.
const EmptyDonutIllustration = () => (
    <svg width={150} height={140} viewBox="0 0 220 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx={25} cy={95} r={7} stroke="#cbd5e1" strokeWidth={2} />
        <circle cx={45} cy={152} r={4} fill="#cbd5e1" />
        <circle cx={196} cy={58} r={5} fill="#cbd5e1" />
        <path d="M185 100v20M175 110h20" stroke="#cbd5e1" strokeWidth={2} strokeLinecap="round" />

        <circle cx={110} cy={100} r={55} stroke="#e2e8f0" strokeWidth={30} strokeDasharray="121 225" strokeDashoffset="0" transform="rotate(-90 110 100)" />
        <circle cx={110} cy={100} r={55} stroke="#eef1f5" strokeWidth={30} strokeDasharray="86 259" strokeDashoffset="-121" transform="rotate(-90 110 100)" />
        <circle cx={110} cy={100} r={55} stroke="#dde3ea" strokeWidth={30} strokeDasharray="69 276" strokeDashoffset="-207" transform="rotate(-90 110 100)" />
        <circle cx={110} cy={100} r={55} stroke="#e7ebf0" strokeWidth={30} strokeDasharray="69 276" strokeDashoffset="-276" transform="rotate(-90 110 100)" />
    </svg>
);

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

    // Mismo período activo que ya se usa para preseleccionar el filtro del
    // gráfico de facturas: se reutiliza el label que manda el back (ej.
    // "Mayo - Junio 2026") en vez de mostrar una fecha suelta, igual que en
    // Generación de Facturas y Generar Nuevo Período.
    const activePeriod = useMemo(() => periods.find((period) => period.active), [periods]);

    // Datos para las tarjetas KPI (Fase 5)
    const summaryData = useMemo(() => [
        { title: "Usuarios Activos", value: data?.activeUsers || 0, icon: "bi bi-people-fill", iconBg: "#dcfce7", color: "#16a34a", trend: "up" as KpiTrend },
        { title: "Usuarios Suspendidos", value: data?.suspendedUsers || 0, icon: "bi bi-person-dash-fill", iconBg: "#ffedd5", color: "#ea580c", trend: "down" as KpiTrend },
        { title: "Usuarios Inactivos", value: data?.inactiveUsers || 0, icon: "bi bi-person-x-fill", iconBg: "#fee2e2", color: "#dc2626", trend: "down" as KpiTrend },
        { title: "Medidores faltantes", value: data?.missingMeters || 0, icon: "bi bi-exclamation-triangle-fill", iconBg: "#f3e8ff", color: "#9333ea", trend: "down" as KpiTrend },
        { title: "Lecturas Realizadas", value: data?.fullReadings || 0, icon: "bi bi-file-earmark-text-fill", iconBg: "#dbeafe", color: "#2563eb", trend: "up" as KpiTrend },
        { title: "Lecturas Pendientes", value: data?.incompleteReadings || 0, icon: "bi bi-clipboard-data-fill", iconBg: "#dbeafe", color: "#2563eb", trend: "down" as KpiTrend },
        { title: "Modalidad activa", value: data?.activeModality || "No disponible", icon: "bi bi-arrow-repeat", iconBg: "#d1fae5", color: "#059669", trend: "neutral" as KpiTrend },
        { title: "Período activo", value: activePeriod?.label ?? "No disponible", icon: "bi bi-calendar-event-fill", iconBg: "#ffedd5", color: "#ea580c", trend: "neutral" as KpiTrend },
        { title: "Servicio/Unidad", value: data?.activeUnitService || "No disponible", icon: "bi bi-droplet-fill", iconBg: "#ccfbf1", color: "#0d9488", trend: "neutral" as KpiTrend },
    ], [data, activePeriod]);

    // Datos del gráfico de barras (Usuarios por tarifa)
    const usersForFeeData = useMemo(() =>
        data?.usersForFee?.map(fee => ({ fee: fee.fee, cantidad: fee.count })) ?? [],
        [data]);

    // Datos para el gráfico de dona. Mismos tonos que ya usan las KpiCard de
    // esta pantalla (Usuarios Activos/Inactivos), un poco más suaves que el
    // verde/rojo puro de Bootstrap.
    const invoicesData = useMemo(() => [
        { name: "Pagas", value: billChartData?.paidBills || 0, color: "#16a34a" },
        { name: "Impagas", value: billChartData?.unpaidBills || 0, color: "#dc2626" },
    ], [billChartData]);

    // Si el período no tiene facturas, el gráfico de torta no tiene nada para
    // dibujar (Recharts renderiza el círculo vacío, sin ningún aviso).
    const hasInvoiceData = invoicesData.some((entry) => entry.value > 0);

    // Render.
    // El wrapper es flex-column con una altura mínima igual al alto visible
    // (viewport - navbar - padding de .dashboard-main); el PageHeader queda
    // como primer ítem (altura natural) y el contenido usa my-auto para
    // centrarse en el espacio sobrante. Si el contenido no entra, my-auto se
    // colapsa solo y el scroll funciona como siempre (no rompe nada).
    return (
        <div className="d-flex flex-column" style={{ minHeight: "calc(100vh - var(--navbar-height) - 3rem)" }}>
            <PageHeader title="Resumen" subtitle="Información general del sistema al día de hoy." icon="bi bi-person-lines-fill" />

            {/* Mientras carga, se muestra un esqueleto con la misma forma del
                contenido real (tarjetas KPI + gráficos) en vez de un spinner. */}
            {loading ? (
                <DashboardSkeleton kpiCount={9} chartHeight={chartSize.height} />
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : (
                <div className="my-auto content-fade-in">

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
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>Cantidad de usuarios por tarifa</Card.Title>
                                    <div className="flex-grow-1 d-flex align-items-center">
                                        <ResponsiveContainer width="100%" height={chartSize.height}>
                                            <BarChart data={usersForFeeData}>
                                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="fee" tickLine={false} axisLine={{ stroke: "#e2e8f0" }} tick={{ fill: "#64748b", fontSize: 12 }} />
                                                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} allowDecimals={false} />
                                                <Tooltip
                                                    cursor={false}
                                                    contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}
                                                />
                                                <Bar name="Usuarios" dataKey="cantidad" fill="#0077ff" radius={[8, 8, 0, 0]} maxBarSize={56} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
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
                                        <CustomSelect
                                            fullWidth={false}
                                            value={selectedPeriod !== null ? String(selectedPeriod) : ""}
                                            onChange={(v) => setSelectedPeriod(Number(v))}
                                            options={periods.map((period) => ({
                                                value: String(period.idPeriod),
                                                label: `${period.label}${period.active ? " (Actual)" : ""}`,
                                            }))}
                                        />
                                    </div>

                                    {/* Gráfico */}
                                    {loadingChart ? (
                                        <div className="d-flex justify-content-center align-items-center" style={{ height: chartSize.height }}>
                                            <Spinner animation="border" />
                                        </div>
                                    ) : !hasInvoiceData ? (
                                        <div className="d-flex flex-column align-items-center justify-content-center text-center" style={{ height: chartSize.height }}>
                                            <EmptyDonutIllustration />
                                            <div className="fw-bold mt-2" style={{ color: "#1e293b" }}>No hay datos para visualizar</div>
                                            <div className="text-muted small mt-1" style={{ maxWidth: 260 }}>
                                                Las estadísticas aparecerán automáticamente cuando existan facturas emitidas en este período.
                                            </div>
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
                                                    innerRadius={55}
                                                    outerRadius={80}
                                                    paddingAngle={3}
                                                    cornerRadius={6}
                                                    fill="#8884d8"
                                                    label={({ percent }) => `${Math.round((percent ?? 0) * 100)}%`}
                                                    labelLine={false}
                                                >

                                                    {invoicesData.map((entry, index) => (

                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.color}
                                                        />

                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}

                                    {/* Leyenda con el mismo estilo tanto con datos reales como en el
                                        estado vacío (ahí queda en 0 / 0). */}
                                    {!loadingChart && (
                                        <div className="d-flex align-items-center justify-content-center gap-3 pt-3 mt-2 border-top">
                                            {invoicesData.flatMap((entry, index) => [
                                                ...(index > 0
                                                    ? [<div key={`divider-${index}`} style={{ width: 1, height: 24, background: "#e2e8f0" }}></div>]
                                                    : []),
                                                <div key={entry.name} className="d-flex align-items-center gap-2">
                                                    <span style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: entry.color, display: "inline-block" }}></span>
                                                    <span className="fw-semibold" style={{ color: "#1e293b" }}>{entry.name}</span>
                                                    <span className="text-muted">{entry.value}</span>
                                                </div>,
                                            ])}
                                        </div>
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