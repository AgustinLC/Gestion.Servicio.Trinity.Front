import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { ReadReadingDto } from "../../../core/models/dto/ReadReadingDto";
import { getData } from "../../../core/services/apiService";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import TableToolbar from "../../../shared/components/table-toolbar/TableToolbar";
import PageHeader from "../../../shared/components/PageHeader";
import useAuth from "../../../hooks/useAuth";


const UserConsumptions: React.FC = () => {
    const [readings, setReadings] = useState<ReadReadingDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filteredData, setFilteredData] = useState<ReadReadingDto[]>([]); // Cambiar el tipo aquí

    // Hooks importados
    const { userId } = useAuth();

    // Obtener los consumos al cargar el componente
    useEffect(() => {
        if (userId) {
            fetchReadings();
        }
    }, [userId]);

    // Función para obtener los consumos desde la API
    const fetchReadings = async () => {
        setLoading(true);
        try {
            const readings = await getData<ReadReadingDto[]>(`/user/readings/${userId}`);
            setReadings(readings);
            setFilteredData(readings); // Actualizar filteredData con el tipo correcto
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al obtener los consumos");
            setError("Error al cargar los consumos");
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar la búsqueda
    const handleSearch = (query: string) => {
        const filtered = readings.filter((reading) =>
            Object.values(reading).some((value) =>
                String(value).toLowerCase().includes(query.toLowerCase())
            )
        );
        setFilteredData(filtered);
    };

    // Columnas de la tabla
    const columns: TableColumnDefinition<ReadReadingDto>[] = [
        { key: "periodName", label: "Período", sortable: true },
        { key: "date", label: "Fecha", sortable: true },
        { key: "reading", label: "Lectura actual", sortable: true },
        {
            key: "consumption", label: "Consumo", sortable: false, render: (row) =>
                row.consumption === null || row.consumption === undefined
                    ? "Aún no se realizó el cálculo"
                    : row.consumption.toString()
        },
    ];

    return (
        <div>
            <PageHeader title="Historial de Consumos" subtitle="Consultá tus lecturas y consumos registrados." icon="bi bi-clipboard-data" />
            {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center loading-vh">
                    <span className="mb-2 fw-bold">CARGANDO...</span>
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : (
                <div>
                    <TableToolbar onSearch={handleSearch} />
                    <ReusableTable
                        data={filteredData} // Ahora filteredData tiene el tipo correcto
                        columns={columns}
                    />
                </div>
            )}
        </div>
    );
};

export default UserConsumptions;