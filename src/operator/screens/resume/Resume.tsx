import { BarChart, Bar, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

const Resume = () => {
    //Estados
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

    // Datos de ejemplo para las tarjetas
    const summaryData = [
        { title: "Usuarios Activos", value: 120, color: "#28a745" },
        { title: "Usuarios Inactivos", value: 30, color: "#dc3545" },
        { title: "Facturas Pagas", value: 85, color: "#28a745" },
        { title: "Facturas Impagas", value: 15, color: "#dc3545" },
        { title: "Lecturas Realizadas", value: 200, color: "#007bff" },
        { title: "Lecturas Pendientes", value: 20, color: "#ffc107" },
    ];

    // Datos de ejemplo para el gráfico de barras (lecturas por mes)
    const readingsData = [
        { month: "Enero", lecturas: 150 },
        { month: "Febrero", lecturas: 200 },
        { month: "Marzo", lecturas: 180 },
        { month: "Abril", lecturas: 220 },
        { month: "Mayo", lecturas: 250 },
        { month: "Junio", lecturas: 100 },
        { month: "Julio", lecturas: 50 },
        { month: "Agosto", lecturas: 210 },
        { month: "Septiembre", lecturas: 150 },
        { month: "Octubre", lecturas: 200 },
        { month: "Noviembre", lecturas: 120 },
        { month: "Diciembre", lecturas: 190 },
    ];

    // Datos de ejemplo para el gráfico de pastel (facturas pagas vs impagas)
    const invoicesData = [
        { name: "Pagas", value: 85 },
        { name: "Impagas", value: 15 },
    ];
    const invoiceColors = ["#28a745", "#dc3545"]; // Colores para el gráfico de pastel

    return (
        <div>
            <h1 className="text-center">Resumen</h1>

            {/* Tarjetas de resumen */}
            <Row className="mb-4">
                {summaryData.map((item, index) => (
                    <Col key={index} md={4} className="mb-3">
                        <Card>
                            <Card.Body>
                                <Card.Title>{item.title}</Card.Title>
                                <Card.Text style={{ color: item.color, fontSize: "1.5rem", fontWeight: "bold" }}>
                                    {item.value}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row className="mb-4">
                {/* Gráfico de barras: Lecturas realizadas por mes */}
                <Col md={8} className="mb-4">
                    <Card>
                        <Card.Body>
                            <Card.Title>Lecturas Realizadas por Mes</Card.Title>
                            <ResponsiveContainer width="100%" height={chartSize.height}>
                                <BarChart data={readingsData}>F
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="lecturas" fill="#007bff" />
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
                                            <Cell key={`cell-${index}`} fill={invoiceColors[index % invoiceColors.length]} />
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
    );
};
export default Resume