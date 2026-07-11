import { useEffect, useState } from "react";
import { UserDto } from "../../../core/models/dto/UserDto";
import { addData, getData, updateData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import { Button, Spinner } from "react-bootstrap";
import TableToolbar from "../../../shared/components/table-toolbar/TableToolbar";
import PageHeader from "../../../shared/components/PageHeader";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import AddEditAdministratorModal from "./AddEditAdministratorModal";
import { useSearch } from "../../../hooks/useSearch";

const CruAdministratorPage = () => {

    //Estados
    const [administrators, setAdministrators] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedAdministrator, setSelectedAdministrator] = useState<UserDto | null>(null);

    // Obtener datos al cargar el componente
    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Hook para buscar por columnas 
    const { filteredData, handleSearch, setFilteredData } = useSearch<UserDto>(
        administrators,
        ["firstName", "lastName", "idUser"]
    );

    // Manejar añadir/editar
    const handleSave = async (administrator: UserDto) => {
        try {
            //Actualizar registro
            if (administrator.idUser) {
                await updateData("/user/update?idUser", administrator.idUser, administrator);
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
                <Button variant="outline-warning" onClick={() => { setSelectedAdministrator(row); setShowModal(true); }}>
                    Editar
                </Button>
            ),
        },
    ];

    return (
        <div>
            <PageHeader title="Gestión de administradores" subtitle="Administrá los usuarios con rol administrador." icon="bi bi-person-fill" />
            {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center loading-vh">
                    <span className="mb-2 fw-bold">CARGANDO...</span>
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : (
                <div>
                    <TableToolbar onSearch={handleSearch}>
                        <Button onClick={() => { setSelectedAdministrator(null); setShowModal(true); }}>
                            Añadir Administrador
                        </Button>
                    </TableToolbar>

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