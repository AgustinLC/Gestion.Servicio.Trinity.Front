import { useState } from "react"
import { Button, Spinner } from "react-bootstrap";
import { UserDto } from "../../../core/models/dto/UserDto";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import ShowDiscountUserModal from "./ShowDiscountUserModal";
import AddDiscountModal from "./AddDiscountModal";
import SearchBar from "../../../shared/components/searcher/SearchBar";
import { useSearch } from "../../../hooks/useSearch";
import useAppData from "../../../hooks/useAppData";

const DiscountsPage = () => {

    // Estados principales
    const { operatorActiveUsers, discounts, loading, error } = useAppData();

    // Estado para el modal
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const [showAddDiscountModal, setShowAddDiscountModal] = useState(false);


    // Hook para buscar por columnas 
    const { filteredData, handleSearch } = useSearch<UserDto>(
        operatorActiveUsers,
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
                    <div className="table-toolbar d-flex flex-column flex-lg-row align-items-center justify-content-between flex-wrap gap-2 mb-3">
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
                        discounts={discounts}
                    />

                    {/* Vista de descuentos del usuario */}
                    {selectedUser && (
                        <ShowDiscountUserModal
                            show={showModal}
                            onHide={() => setShowModal(false)}
                            user={selectedUser}
                            discounts={discounts}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export default DiscountsPage
