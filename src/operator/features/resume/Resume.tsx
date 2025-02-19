import { BarChart, Bar, YAxis, Tooltip, Legend, PieChart, Pie, Cell, XAxis, ResponsiveContainer } from "recharts";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import { useEffect, useMemo, useState } from "react";
import { ResumeDto } from "../../../core/models/dto/ResumeDto";
import { getData } from "../../../core/services/apiService";

const Resume = () => {
    //Estados
    const [data, setData] = useState<ResumeDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [chartSize, setChartSize] = useState({ width: 500, height: 300 })

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

    // Función para obtener el resumen de los datos
    const fetchResumes = async () => {
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

    // Hook para obtener el resumen al cargar el componente
    useEffect(() => {
        fetchResumes();
    }, []);

    // Datos para las tarjetas
    const summaryData = useMemo(() => [
        { title: "Usuarios Activos", value: data?.activeUsers || 0, color: "#28a745" },
        { title: "Usuarios Inactivos", value: data?.inactiveUsers || 0, color: "#dc3545" },
        { title: "Facturas Pagas", value: data?.billsPaid || 0, color: "#28a745" },
        { title: "Facturas Impagas", value: data?.unpaidBills || 0, color: "#dc3545" },
        { title: "Lecturas Realizadas", value: data?.fullReadings || 0, color: "#007bff" },
        { title: "Lecturas Pendientes", value: data?.incompleteReadings || 0, color: "#ffc707" },
        { title: "Modalidad activa", value: data?.activeModality || "No disponible", color: "#a15faf" },
        { title: "Fecha de periodo (activo)", value: data?.dateActivePeriod ? new Date(data?.dateActivePeriod).toLocaleDateString() : "No disponible", color: "#ff5d00" },
        { title: "Servicio/Unidad", value: data?.activeUnitService || "No disponible", color: "#05c1a1" }
    ], [data]);

    // Datos del gráfico de barras (Usuarios por tarifa)
    const usersForFeeData = useMemo(() =>
        data?.usersForFee?.map(fee => ({ fee: fee.fee, cantidad: fee.count })) ?? [],
        [data]);

    // Datos para el gráfico de pastel
    const invoicesData = useMemo(() => [
        { name: "Pagas", value: data?.billsPaid || 0, color: "#28a745" },
        { name: "Impagas", value: data?.unpaidBills || 0, color: "#dc3545" },
    ], [data]);

    // Render
    return (
        <div>
            <h1 className="text-center">Resumen</h1>

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

                    <Row>
                        {/* Gráfico de barras: Lecturas realizadas por mes */}
                        <Col md={8} className="mb-4">
                            <Card>
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
                        <Col md={4} className="mb-4">
                            <Card>
                                <Card.Body>
                                    <Card.Title>Facturas Pagas vs Impagas</Card.Title>
                                    <ResponsiveContainer width="100%" height={chartSize.height}>
                                        <PieChart>
                                            <Pie data={invoicesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
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
export default Resume