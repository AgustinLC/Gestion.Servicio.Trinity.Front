import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import { useEffect, useMemo, useState } from "react";
import { ReadReadingDto } from "../../../core/models/dto/ReadReadingDto";
import { SummaryDto } from "../../../core/models/dto/SummaryDto";
import { getData } from "../../../core/services/apiService";
import useAuth from "../../../hooks/useAuth";
import { toast } from "react-toastify";

const UserResume = () => {
    // Estados
    const [data, setData] = useState<SummaryDto | null>(null);
    const [readings, setReadings] = useState<ReadReadingDto[]>([]);
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
            const resume = await getData<SummaryDto>(`/user/summary/${userId}`);
            setData(resume);
        } catch (error) {
            setError("Error al cargar la información del usuario");
            console.error("Error al obtener los datos:", error);
        } finally {
            setLoading(false);
        }
    };

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

    // Datos para las tarjetas
    const summaryData = useMemo(() => [
        { title: "Facturas Pagas", value: data?.billsPaid || 0, color: "#28a745" },
        { title: "Facturas Impagas", value: data?.unpaidBills || 0, color: "#dc3545" },
        { title: "Modalidad Activa", value: data?.activeModality || "No disponible", color: "#a15faf" },
        { title: "Fecha de Periodo (Activo)", value: data?.activePeriod ? new Date(data.activePeriod).toLocaleDateString() : "No disponible", color: "#ff5d00" },
        { title: "Servicio/Unidad", value: data?.activeUnitService || "No disponible", color: "#05c1a1" },
        { title: "Estado de Cuenta", value: data?.statusUser === 1 ? "Activa" : "Inactiva", color: data?.statusUser === 1 ? "#28a745" : "#dc3545" }, // Nuevo cuadro para el estado de actividad
    ], [data]);

    // Calcular el consumo real por mes
    const calculateRealConsumption = (readings: ReadReadingDto[]) => {
        // Ordenar las lecturas por fecha
        const sortedReadings = readings.sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Calcular la diferencia entre lecturas consecutivas
        return sortedReadings.map((reading, index) => {
            const previousReading = index > 0 ? sortedReadings[index - 1].reading : 0;
            const realConsumption = reading.reading - previousReading;
            return {
                period: reading.periodName, // Usamos periodName para el eje X
                consumption: realConsumption, // Consumo real del mes
                date: new Date(reading.date).toLocaleDateString(), // Formateamos la fecha para el tooltip
            };
        });
    };

    // Datos del gráfico de barras (Consumos reales por mes)
    const consumptionData = useMemo(() => 
        calculateRealConsumption(readings),
        [readings]
    );

    // Tooltip personalizado para el gráfico de barras
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{ backgroundColor: "#fff", padding: "10px", border: "1px solid #ccc" }}>
                    <p>{`Periodo: ${label}`}</p>
                    <p>{`Consumo: ${payload[0].value}`}</p>
                    <p>{`Fecha: ${payload[0].payload.date}`}</p>
                </div>
            );
        }
        return null;
    };

    // Render
    return (
        <div>
            <h1 className="text-center">Resumen de {data?.userName} {data?.userLastName}</h1>

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

                    {/* Gráfico de barras: Consumos reales por mes */}
                    <Row>
                        <Col md={12} className="mb-4">
                            <Card>
                                <Card.Body>
                                    <Card.Title>Historial de Consumo</Card.Title>
                                    <ResponsiveContainer width="100%" height={chartSize.height}>
                                        <BarChart data={consumptionData}>
                                            <XAxis dataKey="period" />
                                            <YAxis />
                                            <Tooltip content={<CustomTooltip />} />
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