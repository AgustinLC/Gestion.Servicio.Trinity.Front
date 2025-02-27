import { BarChart, Bar, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import { useEffect, useMemo, useState } from "react";
import { UserResumeDto } from "../../../core/models/dto/UserResumeDto";
import { ResumeDto } from "../../../core/models/dto/ResumeDto";
import { getData } from "../../../core/services/apiService";
import useAuth from "../../../hooks/useAuth";

const UserResume = () => {
    // Estados
    const [data, setData] = useState<UserResumeDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [chartSize, setChartSize] = useState({ width: 500, height: 300 });

    // Obtener el userId desde el hook useAuth
    const { userId } = useAuth();

    // Función para actualizar el tamaño de los gráficos
    const updateChartSize = () => {
        const width = window.innerWidth < 768 ? 300 : 500; // Ajusta el ancho para móviles
        const height = window.innerWidth < 768 ? 200 : 300; // Ajusta el alto para móviles
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
            const resume = await getData<UserResumeDto>(`/user/resume/${userId}`);
            setData(resume);
        } catch (error) {
            setError("Error al cargar la información del usuario");
            console.error("Error al obtener los datos:", error);
        } finally {
            setLoading(false);
        }
    };

    // Hook para obtener el resumen al cargar el componente
    useEffect(() => {
        if (userId) {
            fetchUserResume();
        }
    }, [userId]);

    // Datos para las tarjetas
    const summaryData = useMemo(() => [
        { title: "Facturas Pagas", value: data?.paidBills || 0, color: "#28a745" },
        { title: "Facturas Impagas", value: data?.unpaidBills || 0, color: "#dc3545" },
        { title: "Modalidad Activa", value: data?.activeModality || "No disponible", color: "#a15faf" },
        { title: "Fecha de Periodo (Activo)", value: data?.activePeriodDate ? new Date(data.activePeriodDate).toLocaleDateString() : "No disponible", color: "#ff5d00" },
        { title: "Servicio/Unidad", value: data?.serviceUnit || "No disponible", color: "#05c1a1" },
    ], [data]);

    // Datos del gráfico de barras (Consumo histórico)
    const consumptionData = useMemo(() =>
        data?.consumptionHistory?.map(entry => ({
            period: entry.period,
            consumption: entry.consumption,
        })) ?? [],
        [data]);

    // Render
    return (
        <div>
            <h1 className="text-center">Resumen del Usuario</h1>

            {/* Mostrar el mensaje de carga mientras los datos se están cargando */}
            {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                    <span className="mb-2 fw-bold">CARGANDO...</span>
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : (
                <div>
                    {/* Tarjetas de resumen */}
                    <Row className="mb-2">
                        {summaryData.map((item, index) => (
                            <Col key={index} md={4} className="mb-3">
                                <Card>
                                    <Card.Body>
                                        <Card.Title>{item.title}</Card.Title>
                                        <Card.Text style={{ color: item.color, fontSize: "1.3rem", fontWeight: "bold" }}>
                                            {item.value}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Gráfico de barras: Consumo histórico */}
                    <Row>
                        <Col md={12} className="mb-4">
                            <Card>
                                <Card.Body>
                                    <Card.Title>Historial de Consumo</Card.Title>
                                    <ResponsiveContainer width="100%" height={chartSize.height}>
                                        <BarChart data={consumptionData}>
                                            <XAxis dataKey="period" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="consumption" fill="#007bff" />
                                        </BarChart>
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