import { useState, useEffect } from "react";
import { Button, Spinner } from "react-bootstrap";
import SearchBar from "../../../shared/components/searcher/SearchBar";
import { getData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { UserDto } from "../../../core/models/dto/UserDto";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import BillActiveModal from "./BillActiveModal";
import BillNullModal from "./BillNullModal";

const BillManagementPage = () => {

    //Estados
    const [user, setUsers] = useState<UserDto[]>([]);
    const [filteredData, setFilteredData] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showBillActiveModal, setShowBillActiveModal] = useState(false);
    const [showBillNullModal, setShowBillNullModal] = useState(false);
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
        const filtered = user.filter((user) =>
            Object.values(user).some((value) =>
                String(value).toLowerCase().includes(query.toLowerCase())
            )
        );
        setFilteredData(filtered);
    };

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<UserDto>[] = [
        { key: "idUser", label: "ID", sortable: true },
        { key: "firstName", label: "Nombre", sortable: false },
        { key: "lastName", label: "Apellido", sortable: false },
        { key: "dni", label: "DNI", sortable: false },
        { key: "phone", label: "Teléfono", sortable: false },
        {
            key: "actions", label: "Facturas", actions: (row: UserDto) => (
                <div className="d-flex gap-2 justify-content-center overflow-auto text-nowrap">
                    <Button variant="success" onClick={() => { setSelectedUser(row); setShowBillActiveModal(true); }}>
                        Activas
                    </Button>
                    <Button variant="danger" onClick={() => { setSelectedUser(row); setShowBillNullModal(true); }}>
                        Anuladas
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <h1 className="text-center">Gestión de Facturas</h1>
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

                    {/* Modal para visualizar facturas activas */}
                    <BillActiveModal
                        show={showBillActiveModal}
                        onHide={() => setShowBillActiveModal(false)}
                        user={selectedUser}
                    />

                    {/* Modal para visualizar facturas anuladas */}
                    <BillNullModal
                        show={showBillNullModal}
                        onHide={() => setShowBillNullModal(false)}
                        user={selectedUser}
                    />
                </div>
            )}
        </div>
    );
};

export default BillManagementPage;