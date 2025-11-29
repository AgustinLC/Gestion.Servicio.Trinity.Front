import { useEffect, useState } from "react"
import { Button, Spinner } from "react-bootstrap";
import { UserDto } from "../../../core/models/dto/UserDto";
import { DiscountDto } from "../../../core/models/dto/Discount";
import { getData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import ShowDiscountUserModal from "./ShowDiscountUserModal";
import AddDiscountModal from "./AddDiscountModal";
import SearchBar from "../../../shared/components/searcher/SearchBar";
import { useSearch } from "../../../hooks/useSearch";

const DiscountsPage = () => {

    // Estados principales
    const [users, setUsers] = useState<UserDto[]>([]);
    const [discountData, setDiscountData] = useState<DiscountDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estado para el modal
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const [showAddDiscountModal, setShowAddDiscountModal] = useState(false);


    // Obtener datos al cargar el componente
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Obtener datos de la api
    const fetchData = async () => {
        setLoading(true);
        try {
            // Obtener usuarios
            const users = await getData<UserDto[]>("/operator/users-actives");
            setUsers(users);
            setFilteredData(users);
            // Obtener descuentos activos
            const discountsActive = await getData<DiscountDto[]>("/operator/discounts");
            setDiscountData(discountsActive);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al obtener la información");
            setError("Error al cargar la información principal");
        } finally {
            setLoading(false);
        }
    };

    // Hook para buscar por columnas 
    const { filteredData, handleSearch, setFilteredData } = useSearch<UserDto>(
        users,
        ["firstName", "lastName", "idUser"] // columnas filtrables
    );

    // Función para ver descuentos de un usuario
    const handleViewDiscounts = (user: UserDto) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    // Columnas de la tabla de usuarios
    const columns: TableColumnDefinition<UserDto>[] = [
        { key: "idUser", label: "N° Conexión", sortable: true },
        { key: "firstName", label: "Nombre", sortable: false },
        { key: "lastName", label: "Apellido", sortable: false },
        { key: "street" as keyof UserDto, label: "Calle", sortable: false, render: (row: UserDto) => row.residenceDto?.street || "Sin dirección" },
        {
            key: "actions", label: "Acciones", actions: (row: UserDto) => (
                <div className="d-flex gap-2 justify-content-center overflow-auto text-nowrap">
                    <Button variant="warning" onClick={() => { setSelectedUser(row); setShowAddDiscountModal(true); }}>
                        Añadir Descuento
                    </Button>
                    <Button variant="primary" onClick={() => handleViewDiscounts(row)}>
                        Ver existentes
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <h1 className="text-center">Gestión de Descuentos</h1>
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

                    {/* Modal para añadir descuento */}
                    <AddDiscountModal
                        key={selectedUser ? selectedUser.idUser : "new"}
                        show={showAddDiscountModal}
                        onHide={() => setShowAddDiscountModal(false)}
                        user={selectedUser!}
                        discounts={discountData}
                    />

                    {/* Vista de descuentos del usuario */}
                    {selectedUser && (
                        <ShowDiscountUserModal
                            show={showModal}
                            onHide={() => setShowModal(false)}
                            user={selectedUser}
                            discounts={discountData}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export default DiscountsPage
