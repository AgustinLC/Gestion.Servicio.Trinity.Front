import { useMemo, useState } from "react";
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
import { useTableFilters } from "../../../hooks/useTableFilters";
import useAppData from "../../../hooks/useAppData";
import { getFullName, withFullName } from "../../../core/utils/userUtils";

type UserRow = UserDto & { fullName: string };

const PendigBillsParameterPage = () => {

    //Estados
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const [showAddParameterModal, setShowAddParameterModal] = useState(false);
    const [showUserParameters, setShowUserParameters] = useState(false);
    const { operatorActiveUsers, activeBillingParameters, loading, error } = useAppData();


    // Se agrega el nombre y apellido concatenados para poder listarlos en una sola columna
    // y para que el buscador encuentre coincidencias sin importar si se busca por
    // nombre, apellido o ambos juntos.
    const usersWithFullName = useMemo(() => withFullName(operatorActiveUsers), [operatorActiveUsers]);

    // Calles únicas para el filtro
    const uniqueStreets = useMemo(
        () => Array.from(new Set(operatorActiveUsers.map(u => u.residenceDto?.street).filter(Boolean))) as string[],
        [operatorActiveUsers]
    );

    // Filtro de calle (siempre visible, Fase 3)
    const filterConfigs = useMemo(
        () => [
            {
                id: "street",
                label: "Calle",
                emptyLabel: "Todas las calles",
                options: uniqueStreets.map((street) => ({ value: street, label: street })),
            },
        ],
        [uniqueStreets]
    );
    const filterState = useTableFilters(filterConfigs);

    // Hook para buscar por columnas
    const { filteredData, handleSearch } = useSearch<UserRow>(
            usersWithFullName,
            ["fullName", "idUser"],
            { "residenceDto.street": filterState.getActiveValue("street") }
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
    const columns: TableColumnDefinition<UserRow>[] = [
        { key: "idUser", label: "N° Conexión", sortable: true},
        { key: "fullName", label: "Nombre y Apellido", sortable: false },
        { key: "street" as keyof UserRow, label: "Calle", sortable: false, render: (row: UserRow) => row.residenceDto?.street || "Sin dirección" },
        {
            key: "actions", label: "Acciones", actions: (row: UserRow) => (
                <div className="d-flex gap-2 justify-content-center overflow-auto text-nowrap">
                    <Button variant="outline-warning" onClick={() => { setSelectedUser(row); setShowAddParameterModal(true); }}>
                        <i className="bi bi-journal-plus me-1"></i> Añadir Concepto
                    </Button>
                    <Button variant="outline-primary" onClick={() => { setSelectedUser(row); setShowUserParameters(true); }}>
                        <i className="bi bi-eye me-1"></i> Ver existentes
                    </Button>
                </div>
            ),
        },
    ];

    // Render
    return (
        <div>
            <PageHeader title="Gestión de Conceptos" subtitle="Agregá conceptos pendientes de facturación por usuario." icon="bi bi-journal-plus" />
            {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center loading-vh">
                    <span className="mb-2 fw-bold">CARGANDO...</span>
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : (
                <div>
                    <TableToolbar onSearch={handleSearch} filters={filterConfigs} filterState={filterState} />

                    {/* Tabla */}
                    <ReusableTable<UserRow>
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
                            userName={getFullName(selectedUser)}
                            userId={selectedUser.idUser}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default PendigBillsParameterPage;
