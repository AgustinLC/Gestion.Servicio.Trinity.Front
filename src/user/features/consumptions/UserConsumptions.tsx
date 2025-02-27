import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { ReadReadingDto } from "../../../core/models/dto/ReadReadingDto";
import { getData } from "../../../core/services/apiService";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import SearchBar from "../../../shared/components/searcher/SearchBar";
import useAuth from "../../../hooks/useAuth";

const UserConsumptions: React.FC = () => {
    const [readings, setReadings] = useState<ReadReadingDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filteredData, setFilteredData] = useState<ReadReadingDto[]>([]);
    // Hooks importados
    const { userId } = useAuth();

    // Obtener los consumos al cargar el componente
    useEffect(() => {
        if(userId){
            fetchReadings();
        }
    }, [userId]);

    // Función para obtener los consumos desde la API
    const fetchReadings = async () => {
        setLoading(true);
        try {
            const readings = await getData<ReadReadingDto[]>(`/user/readings/${userId}`);
            setReadings(readings);
            setFilteredData(readings);
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
        { key: "idReading", label: "ID Lectura", sortable: true },
        { key: "periodName", label: "Período", sortable: true },
        {
            key: "date",
            label: "Fecha",
            sortable: true,
            render: (row: ReadReadingDto) => new Date(row.date).toLocaleDateString(), // Formatea la fecha
        },
        {
            key: "reading",
            label: "Consumo Realizado",
            sortable: true,
            render: (row: ReadReadingDto) => row.reading.toLocaleString(), // Formatea el consumo con separadores de miles
        },
        
    ];

    return (
        <div>
            <h1 className="text-center">Historial de Consumos</h1>
            {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                    <span className="mb-2 fw-bold">CARGANDO...</span>
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : (
                <div>
                    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 mb-1">
                        <SearchBar onSearch={handleSearch} />
                    </div>
                    <ReusableTable
                        data={filteredData}
                        columns={columns}
                    />
                </div>
            )}
        </div>
    );
};

export default UserConsumptions;