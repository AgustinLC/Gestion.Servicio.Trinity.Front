import { useEffect, useState } from "react";
import { addData, getData } from "../../../core/services/apiService";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import { Button, Spinner } from "react-bootstrap";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import { UserDto } from "../../../core/models/dto/UserDto";
import { BillingParameter } from "../../../core/models/dto/BillingParameter";
import AddParameterModal from "./AddParameterModal";
import { PendigBillDetail } from "../../../core/models/dto/PendingBillDetail";
import { toast } from "react-toastify";
import SearchBar from "../../../shared/components/searcher/SearchBar";
import UserParametersModal from "./UserParameterModal";

const PendigBillsParameterPage = () => {

    //Estados
    const [userData, setUserData] = useState<UserDto[]>([])
    const [parameterData, setParameterData] = useState<BillingParameter[]>([]);
    const [filteredData, setFilteredData] = useState<UserDto[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const [showAddParameterModal, setShowAddParameterModal] = useState(false);
    const [showUserParameters, setShowUserParameters] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Obtener datos al cargar el componente
    useEffect(() => {
        fetchData();
    }, []);

    //Obtener informacion de la api
    const fetchData = async () => {
        setLoading(true);
        try {
            const usersActive = await getData<UserDto[]>("/operator/users-actives");
            setUserData(usersActive);
            setFilteredData(usersActive);
            const parametersActive = await getData<BillingParameter[]>("/operator/billing-parameter/active");
            setParameterData(parametersActive)
        } catch (error) {
            console.error("Error fetching USER data:", error);
            setError("Error al cargar los usuarios.");
        } finally {
            setLoading(false);
        }
    };

    // Manejar búsqueda
    const handleSearch = (query: string) => {
        const searchTerm = query.toLowerCase();
        const filtered = userData.filter(user => {
            // Buscar en propiedades directas
            const directMatch = Object.values(user).some(value =>
                String(value).toLowerCase().includes(searchTerm)
            );
            // Buscar en propiedades anidadas de residenceDto
            const residenceMatch = Object.values(user.residenceDto).some(value =>
                String(value).toLowerCase().includes(searchTerm)
            );
            return directMatch || residenceMatch;
        });
        setFilteredData(filtered);
    };

    // Manejar añadir conceptos
    const handleSaveParameter = async (pendigBillDetail: PendigBillDetail) => {
        if (!selectedUser) return;
        try {
            await addData(`/operator/pending-details/create/${selectedUser?.idUser}`, pendigBillDetail);
            toast.success("Parámetro agregado exitosamente");
            setShowAddParameterModal(false);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al agregar el parámetro");
        }
    };

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<UserDto>[] = [
        { key: "firstName", label: "Nombre", sortable: true },
        { key: "lastName", label: "Apellido", sortable: false },
        { key: "dni", label: "DNI", sortable: false },
        { key: "street" as keyof UserDto, label: "Calle", sortable: false, render: (row: UserDto) => row.residenceDto?.street || "Sin dirección" },
        { key: "houseNumber" as keyof UserDto, label: "N° Casa", sortable: false, render: (row: UserDto) => row.residenceDto?.number || "Sin número" },
        { key: "meterNumber" as keyof UserDto, label: "N° Medidor", sortable: false, render: (row: UserDto) => row.residenceDto?.serialNumber || "Sin número" },
        {
            key: "actions", label: "Acciones", actions: (row: UserDto) => (
                <div className="d-flex gap-2 justify-content-center overflow-auto text-nowrap">
                    <Button variant="warning" onClick={() => { setSelectedUser(row); setShowAddParameterModal(true); }}>
                        Añadir Concepto
                    </Button>
                    <Button variant="primary" onClick={() => { setSelectedUser(row); setShowUserParameters(true); }}>
                        Ver existentes
                    </Button>
                </div>
            ),
        },
    ];

    // Render
    return (
        <div>
            <h1 className="text-center">Gestion de Conceptos</h1>
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

                    {/* Modal para añadir concepto */}
                    <AddParameterModal
                        key={selectedUser ? selectedUser.idUser : "new"}
                        show={showAddParameterModal}
                        onHide={() => setShowAddParameterModal(false)}
                        onSave={handleSaveParameter}
                        parameters={parameterData}
                    />

                    {/* Vista de conceptos del usuario */}
                    {selectedUser && showUserParameters && (
                        <UserParametersModal
                        show={showUserParameters}
                        onHide={() => setShowUserParameters(false)}
                        parameters={parameterData}
                        userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
                        userId={selectedUser.idUser}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default PendigBillsParameterPage;