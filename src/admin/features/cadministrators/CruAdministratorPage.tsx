import { useEffect, useState } from "react";
import { UserDto } from "../../../core/models/dto/UserDto";
import { addData, getData, updateData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import { Button, Spinner } from "react-bootstrap";
import SearchBar from "../../../shared/components/searcher/SearchBar";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import AddEditAdministratorModal from "./AddEditAdministratorModal";

const CruAdministratorPage = () => {

    //Estados
    const [administrators, setAdministrators] = useState<UserDto[]>([]);
    const [filteredData, setFilteredData] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedAdministrator, setSelectedAdministrator] = useState<UserDto | null>(null);

    // Obtener datos al cargar el componente
    useEffect(() => {
        fetchData();
    }, []);

    // Obtener datos de la api
    const fetchData = async () => {
        setLoading(true);
        try {
            // Obtener administradores
            const administrators = await getData<UserDto[]>("/admin/users-admins");
            setAdministrators(administrators);
            setFilteredData(administrators);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al obtener los administradores");
            setError("Error al cargar los administradores");
        } finally {
            setLoading(false);
        }
    };

    // Manejar búsqueda
    const handleSearch = (query: string) => {
        const filtered = administrators.filter((administrator) =>
            Object.values(administrator).some((value) =>
                String(value).toLowerCase().includes(query.toLowerCase())
            )
        );
        setFilteredData(filtered);
    };

    // Manejar añadir/editar
    const handleSave = async (administrator: UserDto) => {
        try {
            //Actualizar registro
            if (administrator.idUser) {
                await updateData("/operator/update-user?idUser", administrator.idUser, administrator);
                toast.success("Administrador actualizado exitosamente");
            }
            // Añadir registro
            else {
                await addData("/admin/register-admin", administrator);
                toast.success("Administrador creado exitosamente");
            }
            setSelectedAdministrator(administrator);
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al guardar el administrador");
        }
    };

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<UserDto>[] = [
        { key: "idUser", label: "ID", sortable: true },
        { key: "firstName", label: "Nombre", sortable: false },
        { key: "lastName", label: "Apellido", sortable: false },
        { key: "username", label: "Email/Username", sortable: false },
        { key: "dni", label: "DNI", sortable: false },
        { key: "phone", label: "Teléfono", sortable: false },
        {
            key: "actions", label: "Acciones", actions: (row: UserDto) => (
                <Button variant="warning" onClick={() => { setSelectedAdministrator(row); setShowModal(true); }}>
                    Editar
                </Button>
            ),
        },
    ];

    return (
        <div>
            <h1 className="text-center">Gestión de administradores</h1>
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
                        <Button onClick={() => { setSelectedAdministrator(null); setShowModal(true); }}>
                            Añadir Administrador
                        </Button>
                    </div>

                    {/* Tabla */}
                    <ReusableTable<UserDto>
                        data={filteredData}
                        columns={columns}
                        defaultSort="idUser"
                    />

                    {/* Modal de añadir/edicion */}
                    <AddEditAdministratorModal
                        key={selectedAdministrator ? selectedAdministrator.idUser : "new"}
                        show={showModal}
                        onHide={() => setShowModal(false)}
                        onSave={handleSave}
                        administrator={selectedAdministrator}
                    />
                </div>
            )}
        </div>
    );
};

export default CruAdministratorPage;