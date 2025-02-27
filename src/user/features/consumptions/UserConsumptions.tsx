import React, { useEffect, useState, useMemo } from "react";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { ReadReadingDto } from "../../../core/models/dto/ReadReadingDto";
import { getData } from "../../../core/services/apiService";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import SearchBar from "../../../shared/components/searcher/SearchBar";
import useAuth from "../../../hooks/useAuth";

// Definir un tipo extendido que incluya realConsumption
type ReadingWithRealConsumption = ReadReadingDto & { realConsumption: number };

const UserConsumptions: React.FC = () => {
    const [readings, setReadings] = useState<ReadReadingDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filteredData, setFilteredData] = useState<ReadingWithRealConsumption[]>([]); // Cambiar el tipo aquí

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
            const readingsWithRealConsumption = calculateRealConsumption(readings); // Calcular el consumo real
            setFilteredData(readingsWithRealConsumption); // Actualizar filteredData con el tipo correcto
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al obtener los consumos");
            setError("Error al cargar los consumos");
        } finally {
            setLoading(false);
        }
    };

    // Calcular el consumo real por mes
    const calculateRealConsumption = (readings: ReadReadingDto[]): ReadingWithRealConsumption[] => {
        // Ordenar las lecturas por fecha
        const sortedReadings = readings.sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Calcular la diferencia entre lecturas consecutivas
        return sortedReadings.map((reading, index) => {
            const previousReading = index > 0 ? sortedReadings[index - 1].reading : 0;
            const realConsumption = reading.reading - previousReading;
            return {
                ...reading, // Mantener todas las propiedades originales
                realConsumption, // Agregar el consumo real
            };
        });
    };

    // Función para manejar la búsqueda
    const handleSearch = (query: string) => {
        const filtered = calculateRealConsumption(readings).filter((reading) =>
            Object.values(reading).some((value) =>
                String(value).toLowerCase().includes(query.toLowerCase())
            )
        );
        setFilteredData(filtered);
    };

    // Columnas de la tabla
    const columns: TableColumnDefinition<ReadingWithRealConsumption>[] = [
        { key: "idReading", label: "ID Lectura", sortable: true },
        { key: "periodName", label: "Período", sortable: true },
        {
            key: "date",
            label: "Fecha",
            sortable: true,
            render: (row: ReadingWithRealConsumption) => new Date(row.date).toLocaleDateString(), // Formatea la fecha
        },
        {
            key: "reading",
            label: "Lectura Actual",
            sortable: true,
            render: (row: ReadingWithRealConsumption) => row.reading.toLocaleString(), // Formatea el consumo con separadores de miles
        },
        {
            key: "realConsumption",
            label: "Consumo Real",
            sortable: true,
            render: (row: ReadingWithRealConsumption) => row.realConsumption.toLocaleString(), // Formatea el consumo real
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
                        data={filteredData} // Ahora filteredData tiene el tipo correcto
                        columns={columns}
                    />
                </div>
            )}
        </div>
    );
};

export default UserConsumptions;