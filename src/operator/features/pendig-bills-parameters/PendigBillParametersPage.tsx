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

const PendigBillsParameterPage = () => {

    //Estados
    const [userData, setUserData] = useState<UserDto[]>([])
    const [parameterData, setParameterData] = useState<BillingParameter[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const [showAddParameterModal, setShowAddParameterModal] = useState(false);
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
            const parametersActive = await getData<BillingParameter[]>("/operator/billing-parameter/active");
            setParameterData(parametersActive)
        } catch (error) {
            console.error("Error fetching USER data:", error);
            setError("Error al cargar los usuarios.");
        } finally {
            setLoading(false);
        }
    };

    // Manejar añadir parametro
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
                </div>
            ),
        },
    ];

    // Render
    return (
        <div>
            <h1 className="text-center">Gestion de FAQ</h1>
            {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                    <span className="mb-2 fw-bold">CARGANDO...</span>
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : (
                <div>

                    {/* Tabla */}
                    <ReusableTable<UserDto>
                        data={userData}
                        columns={columns}
                        defaultSort="idUser"
                    />

                    <AddParameterModal
                        key={selectedUser ? selectedUser.idUser : "new"}
                        show={showAddParameterModal}
                        onHide={() => setShowAddParameterModal(false)}
                        onSave={handleSaveParameter}
                        parameters={parameterData}
                    />
                </div>
            )}
        </div>
    );
};

export default PendigBillsParameterPage;