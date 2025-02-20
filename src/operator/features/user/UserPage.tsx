import { useState, useEffect } from "react";
import { Button, Spinner } from "react-bootstrap";
import AddEditUserModal from "./AddEditUserModal";
import SearchBar from "../../../shared/components/searcher/SearchBar";
import { getData, addData, updateData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { UserDto } from "../../../core/models/dto/UserDto";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import { LocationDto } from "../../../core/models/dto/LocationDto";
import { FeeDto } from "../../../core/models/dto/FeeDto";

const UserPage = () => {

    //Estados
    const [user, setUsers] = useState<UserDto[]>([]);
    const [locations, setLocations] = useState<LocationDto[]>([]);
    const [fees, setFees] = useState<FeeDto[]>([]);
    const [filteredData, setFilteredData] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
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
            // Obtener localidades
            const locationsData = await getData<LocationDto[]>(`/operator/locations/${import.meta.env.VITE_ID_PROVINCE}`);
            setLocations(locationsData);
            // Obtener tarifas
            const feeData = await getData<FeeDto[]>("/operator/fee");
            setFees(feeData);
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

    // Manejar añadir/editar
    const handleSave = async (user: UserDto) => {
        try {
            //Actualizar registro
            if (user.idUser) {
                await updateData("/operator/update-user?idUser", user.idUser, user);
                toast.success("Usuario actualizado exitosamente");
            }
            // Añadir registro
            else {
                await addData("/operator/register-user", user);
                toast.success("Usuario creado exitosamente");
            }
            setSelectedUser(user);
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al guardar el usuario");
        }
    };

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<UserDto>[] = [
        { key: "idUser", label: "ID", sortable: true },
        { key: "firstName", label: "Nombre", sortable: false },
        { key: "lastName", label: "Apellido", sortable: false },
        { key: "dni", label: "DNI", sortable: false },
        { key: "phone", label: "Teléfono", sortable: false },
        {
            key: "actions", label: "Acciones", actions: (row: UserDto) => (
                <Button variant="warning" onClick={() => { setSelectedUser(row); setShowModal(true); }}>
                    Editar
                </Button>
            ),
        },
    ];

    return (
        <div>
            <h1 className="text-center">Gestión de Usuarios</h1>
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
                        <Button onClick={() => { setSelectedUser(null); setShowModal(true); }}>
                            Añadir Usuario
                        </Button>
                    </div>
                    
                    {/* Tabla */}
                    <ReusableTable<UserDto>
                        data={filteredData}
                        columns={columns}
                        defaultSort="idUser"
                    />

                    {/* Modal de añadir/edicion */}
                    <AddEditUserModal
                        key={selectedUser ? selectedUser.idUser : "new"}
                        show={showModal}
                        onHide={() => setShowModal(false)}
                        onSave={handleSave}
                        user={selectedUser}
                        locations={locations}
                        fees={fees}
                    />
                </div>
            )}
        </div>
    );
};

export default UserPage;