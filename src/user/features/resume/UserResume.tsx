import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, Row, Col } from "react-bootstrap";
import { useEffect, useMemo, useState } from "react";
import { ReadReadingDto } from "../../../core/models/dto/ReadReadingDto";
import { SummaryDto } from "../../../core/models/dto/SummaryDto";
import { getData } from "../../../core/services/apiService";
import useAuth from "../../../hooks/useAuth";
import { toast } from "react-toastify";
import KpiCard from "../../../shared/components/kpi-card/KpiCard";
import PageHeader from "../../../shared/components/PageHeader";
import DashboardSkeleton from "../../../shared/components/dashboard-skeleton/DashboardSkeleton";

const UserResume = () => {
    // Estados
    const [data, setData] = useState<SummaryDto | null>(null);
    const [readings, setReadings] = useState<ReadReadingDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [chartSize, setChartSize] = useState({ width: 500, height: 260 });

    // Obtener el userId desde el hook useAuth
    const { userId } = useAuth();

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

    // Función para obtener el resumen de los datos del usuario
    const fetchUserResume = async () => {
        setLoading(true);
        try {
            const resume = await getData<SummaryDto>(`/user/summary/${userId}`);
            setData(resume);
        } catch (error) {
            setError("Error al cargar la información del usuario");
            console.error("Error al obtener los datos:", error);
        } finally {
            setLoading(false);
        }
    };

    // Datos para el gráfico de dona. Mismos tonos verde/rojo que ya usan las
    // KpiCard de esta pantalla (Facturas Pagas/Impagas), con un tercer tono
    // propio (naranja) para distinguir "pagas fuera de término".
    const invoicesData = useMemo(() => [
        { name: "Pagas en término", value: data?.billsPaid || 0, color: "#16a34a" },
        { name: "Pagas fuera de término", value: data?.billsPaidLate || 0, color: "#ea580c" },
        { name: "Impagas", value: data?.unpaidBills || 0, color: "#dc2626" },
    ], [data]);

    // Función para obtener los consumos desde la API
    const fetchReadings = async () => {
        setLoading(true);
        try {
            const readings = await getData<ReadReadingDto[]>(`/user/readings/${userId}`);
            setReadings(readings);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al obtener los consumos");
            setError("Error al cargar los consumos");
        } finally {
            setLoading(false);
        }
    };

    // Hook para obtener el resumen y los consumos al cargar el componente
    useEffect(() => {
        if (userId) {
            fetchUserResume();
            fetchReadings();
        }
    }, [userId]);

    // Datos para las tarjetas KPI. Misma paleta de 3 tonos que el resto del
    // sistema (ver comentario en Resume.tsx): verde = positivo, rojo = a
    // resolver, azul = dato de contexto.
    const summaryData = useMemo(() => [
        { title: "Facturas Pagas", value: data?.billsPaid || 0, icon: "bi bi-check-circle-fill", iconBg: "rgba(34, 197, 94, 0.12)", color: "#16a34a" },
        { title: "Facturas Impagas", value: data?.unpaidBills || 0, icon: "bi bi-x-circle-fill", iconBg: "rgba(239, 68, 68, 0.12)", color: "#dc2626" },
        { title: "Modalidad Activa", value: data?.activeModality || "No disponible", icon: "bi bi-arrow-repeat", iconBg: "rgba(0, 119, 255, 0.1)", color: "var(--bs-primary)" },
        { title: "Fecha de Periodo (Activo)", value: data?.activePeriod ? new Date(data.activePeriod).toLocaleDateString() : "No disponible", icon: "bi bi-calendar-event-fill", iconBg: "rgba(0, 119, 255, 0.1)", color: "var(--bs-primary)" },
        { title: "Servicio/Unidad", value: data?.activeUnitService || "No disponible", icon: "bi bi-droplet-fill", iconBg: "rgba(0, 119, 255, 0.1)", color: "var(--bs-primary)" },
        {
            title: "Estado de Cuenta",
            value: data?.statusUser === 1 ? "Activa" : "Inactiva",
            icon: data?.statusUser === 1 ? "bi bi-person-check-fill" : "bi bi-person-x-fill",
            iconBg: data?.statusUser === 1 ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)",
            color: data?.statusUser === 1 ? "#16a34a" : "#dc2626",
        },
    ], [data]);


    // Tooltip personalizado para el gráfico de barras
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div
                    className="custom-tooltip"
                    style={{
                        backgroundColor: "#fff",
                        padding: "0.75rem 1rem",
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                    }}
                >
                    <p className="mb-1 fw-semibold">{`Período: ${label}`}</p>
                    <p className="mb-1 text-primary">{`Consumo: ${payload[0].value}`}</p>
                    <p className="mb-0 text-muted small">{`Fecha: ${payload[0].payload.date}`}</p>
                </div>
            );
        }
        return null;
    };

    // Render.
    // El wrapper es flex-column con una altura mínima igual al alto visible
    // (viewport - navbar - padding de .dashboard-main); el PageHeader queda
    // como primer ítem (altura natural) y el contenido usa my-auto para
    // centrarse en el espacio sobrante. Si el contenido no entra, my-auto se
    // colapsa solo y el scroll funciona como siempre (no rompe nada).
    return (
        <div className="d-flex flex-column" style={{ minHeight: "calc(100vh - var(--navbar-height) - 3rem)" }}>
            <PageHeader title={`Resumen de ${data?.userName ?? ""} ${data?.userLastName ?? ""}`} subtitle="Información general de tu cuenta al día de hoy." icon="bi bi-person-lines-fill" />

            {/* Mientras carga, se muestra un esqueleto con la misma forma del
                contenido real (tarjetas KPI + gráficos) en vez de un spinner. */}
            {loading ? (
                <DashboardSkeleton kpiCount={6} chartHeight={chartSize.height} />
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
                                />
                            </Col>
                        ))}
                    </Row>

                    {/* Gráfico de barras: Consumos reales por mes */}
                    <Row>
                        <Col md={8} className="mb-3">
                            <Card className="h-100 chart-card">
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>Historial de Consumo</Card.Title>
                                    <div className="flex-grow-1 d-flex align-items-center">
                                        <ResponsiveContainer width="100%" height={chartSize.height}>
                                            <BarChart data={readings}>
                                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="periodName" tickLine={false} axisLine={{ stroke: "#e2e8f0" }} tick={{ fill: "#64748b", fontSize: 12 }} />
                                                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} allowDecimals={false} />
                                                <Tooltip content={<CustomTooltip />} cursor={false} />
                                                <Bar name="Consumo" dataKey="consumption" fill="#0077ff" radius={[8, 8, 0, 0]} maxBarSize={56} />
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
                                    <Card.Title>Facturas Pagas vs Impagas</Card.Title>
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
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>
            )}
        </div>
    );
};

export default UserResume;