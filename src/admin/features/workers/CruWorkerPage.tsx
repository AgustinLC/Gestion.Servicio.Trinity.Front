import { useEffect, useState } from "react";
import { UserDto } from "../../../core/models/dto/UserDto";
import { addData, getData, updateData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import { Button, Spinner } from "react-bootstrap";
import TableToolbar from "../../../shared/components/table-toolbar/TableToolbar";
import PageHeader from "../../../shared/components/PageHeader";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import AddEditWorkerModal from "./AddEditWorkerModal";
import { useSearch } from "../../../hooks/useSearch";

const CruWorkerPage = () => {

    //Estados
    const [workers, setWorkers] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState<UserDto | null>(null);

    // Obtener datos al cargar el componente
    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Obtener datos de la api
    const fetchData = async () => {
        setLoading(true);
        try {
            // Obtener operarios
            const workers = await getData<UserDto[]>("/admin/users-operators");
            setWorkers(workers);
            setFilteredData(workers);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al obtener los operarios");
            setError("Error al cargar los operarios");
        } finally {
            setLoading(false);
        }
    };

    // Hook para buscar por columnas 
    const { filteredData, handleSearch, setFilteredData } = useSearch<UserDto>(
        workers,
        ["firstName", "lastName", "idUser"]
    );

    // Manejar añadir/editar
    const handleSave = async (worker: UserDto) => {
        try {
            //Actualizar registro
            if (worker.idUser) {
                await updateData("/user/update?idUser", worker.idUser, worker);
                toast.success("Usuario actualizado exitosamente");
            }
            // Añadir registro
            else {
                await addData("/admin/register-operator", worker);
                toast.success("Usuario creado exitosamente");
            }
            setSelectedWorker(worker);
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
        { key: "username", label: "Email", sortable: false },
        { key: "dni", label: "DNI", sortable: false },
        { key: "phone", label: "Teléfono", sortable: false },
        {
            key: "actions", label: "Acciones", actions: (row: UserDto) => (
                <Button variant="outline-warning" onClick={() => { setSelectedWorker(row); setShowModal(true); }}>
                    Editar
                </Button>
            ),
        },
    ];

    return (
        <div>
            <PageHeader title="Gestión de Operarios" subtitle="Administrá los operarios del sistema." icon="bi bi-person-fill-gear" />
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
                        <Button onClick={() => { setSelectedWorker(null); setShowModal(true); }}>
                            Añadir Operario
                        </Button>
                    </TableToolbar>
                    <ReusableTable<UserDto>
                        data={filteredData}
                        columns={columns}
                        defaultSort="idUser"
                    />
                    <AddEditWorkerModal
                        key={selectedWorker ? selectedWorker.idUser : "new"}
                        show={showModal}
                        onHide={() => setShowModal(false)}
                        onSave={handleSave}
                        worker={selectedWorker}
                    />
                </div>
            )}
        </div>
    );
};

export default CruWorkerPage;