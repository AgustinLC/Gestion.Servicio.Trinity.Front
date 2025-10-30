import { useEffect, useState } from "react"
import { Button, Spinner } from "react-bootstrap";
import { UserDto } from "../../../core/models/dto/UserDto";
import { getData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import ShowDiscountUserModal from "./ShowDiscountUserModal";
import SearchBar from "../../../shared/components/searcher/SearchBar";

const DiscountsPage = () => {

    // Estados principales
    const [users, setUsers] = useState<UserDto[]>([]);
    const [filteredData, setFilteredData] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estado para el modal
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);


    // Obtener datos al cargar el componente
    useEffect(() => {
        fetchData();
    }, []);

    // Obtener datos de la api
    const fetchData = async () => {
        setLoading(true);
        try {
            // Obtener usuarios
            const users = await getData<UserDto[]>("/operator/users");
            setUsers(users);
            setFilteredData(users);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al obtener la información");
            setError("Error al cargar la información principal");
        } finally {
            setLoading(false);
        }
    };

    // Manejar búsqueda
    const handleSearch = (query: string) => {
        const filtered = users.filter((user) =>
            Object.values(user).some((value) =>
                String(value).toLowerCase().includes(query.toLowerCase())
            )
        );
        setFilteredData(filtered);
    };

    // Función para ver descuentos de un usuario
    const handleViewDiscounts = (user: UserDto) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    // Columnas de la tabla de usuarios
    const columns: TableColumnDefinition<UserDto>[] = [
        { key: "idUser", label: "ID", sortable: true },
        { key: "firstName", label: "Nombre", sortable: false },
        { key: "lastName", label: "Apellido", sortable: false },
        { key: "dni", label: "DNI", sortable: false },
        { key: "phone", label: "Teléfono", sortable: false },
        {
            key: "actions", label: "Acciones",
            actions: (row: UserDto) => (
                <Button variant="warning" onClick={() => handleViewDiscounts(row)}>
                    Ver descuentos
                </Button>
            ),
        },
    ];


    return (
        <div>
            <h1 className="text-center">Gestión de descuentos</h1>
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
                    {/* Tabla */}
                    <ReusableTable<UserDto>
                        data={filteredData}
                        columns={columns}
                        defaultSort="idUser"
                    />

                    {/* Modal para ver los descuentos de un usuario */}
                    {selectedUser && (
                        <ShowDiscountUserModal
                            show={showModal}
                            onHide={() => setShowModal(false)}
                            user={selectedUser}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export default DiscountsPage
