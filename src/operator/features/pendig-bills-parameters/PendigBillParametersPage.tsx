import { useState } from "react";
import { addData } from "../../../core/services/apiService";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import { Button, Spinner } from "react-bootstrap";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import { UserDto } from "../../../core/models/dto/UserDto";
import AddParameterModal from "./AddParameterModal";
import { PendigBillDetail } from "../../../core/models/dto/PendingBillDetail";
import { toast } from "react-toastify";
import TableToolbar from "../../../shared/components/table-toolbar/TableToolbar";
import PageHeader from "../../../shared/components/PageHeader";
import UserParametersModal from "./UserParameterModal";
import { useSearch } from "../../../hooks/useSearch";
import useAppData from "../../../hooks/useAppData";

const PendigBillsParameterPage = () => {

    //Estados
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const [showAddParameterModal, setShowAddParameterModal] = useState(false);
    const [showUserParameters, setShowUserParameters] = useState(false);
    const { operatorActiveUsers, activeBillingParameters, loading, error } = useAppData();


    // Hook para buscar por columnas 
    const { filteredData, handleSearch } = useSearch<UserDto>(
            operatorActiveUsers,
            ["firstName", "lastName", "idUser"]
        );

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
        { key: "idUser", label: "N° Conexión", sortable: true},
        { key: "firstName", label: "Nombre", sortable: false },
        { key: "lastName", label: "Apellido", sortable: false },
        { key: "street" as keyof UserDto, label: "Calle", sortable: false, render: (row: UserDto) => row.residenceDto?.street || "Sin dirección" },
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
        <div className="d-flex flex-column" style={{ minHeight: "calc(100vh - var(--navbar-height) - 3rem)" }}>
            <PageHeader title="Gestión de Conceptos" subtitle="Agregá conceptos pendientes de facturación por usuario." icon="bi bi-journal-plus" />
            {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center loading-vh">
                    <span className="mb-2 fw-bold">CARGANDO...</span>
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : (
                <div className="my-auto">
                    <TableToolbar onSearch={handleSearch} />

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
                        parameters={activeBillingParameters}
                    />

                    {/* Vista de conceptos del usuario */}
                    {selectedUser && showUserParameters && (
                        <UserParametersModal
                            show={showUserParameters}
                            onHide={() => setShowUserParameters(false)}
                            parameters={activeBillingParameters}
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
