import { useMemo, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import TableToolbar from "../../../shared/components/table-toolbar/TableToolbar";
// import { addData } from "../../../core/services/apiService"; // Solo lo usaba el envío de notificaciones (deshabilitado, ver nota más abajo)
// import { toast } from "react-toastify"; // Idem
import { UserDto } from "../../../core/models/dto/UserDto";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import BillActiveModal from "./BillActiveModal";
import BillNullModal from "./BillNullModal";
import { useSearch } from "../../../hooks/useSearch";
import { useTableFilters } from "../../../hooks/useTableFilters";
import useAppData from "../../../hooks/useAppData";

const BillManagementPage = () => {
    // Estados existentes
    const { operatorUsers, loading, error } = useAppData();
    const [showBillActiveModal, setShowBillActiveModal] = useState(false);
    const [showBillNullModal, setShowBillNullModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    // const [isSending, setIsSending] = useState(false); // Solo lo usaba el envío de notificaciones (deshabilitado, ver nota más abajo)

    // Calles únicas para el filtro
    const uniqueStreets = useMemo(
        () => Array.from(new Set(operatorUsers.map(u => u.residenceDto?.street).filter(Boolean))) as string[],
        [operatorUsers]
    );

    // Filtros activables con checkbox
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
    const { filteredData, handleSearch } = useSearch<UserDto>(
        operatorUsers,
        ["firstName", "lastName", "idUser"],
        { "residenceDto.street": filterState.getActiveValue("street") }
    );

    // NOTA (pendiente): este botón enviaba notificaciones de facturas a TODOS los usuarios
    // de la tabla en un único envío masivo, sin posibilidad de elegir destinatarios,
    // previsualizar el mensaje ni ver un historial de envíos. Se comenta hasta contemplar
    // una vista particular de "Envío de Notificaciones" (selección de usuarios/filtros,
    // plantilla y confirmación) en lugar de dispararlo directamente desde esta pantalla.
    // const handleSendBillNotifications = async () => {
    //     setIsSending(true);
    //     try {
    //         await addData(`/operator/bill/send-notifications`, {});
    //         toast.success("Envío de correos electrónicos realizado exitosamente");
    //     } catch (error) {
    //         console.error(error);
    //         toast.error(error instanceof Error ? error.message : "Error al enviar correos electrónicos");
    //     } finally {
    //         setIsSending(false);
    //     }
    // };

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<UserDto>[] = [
        { key: "idUser", label: "N° Conexión.", sortable: true },
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
                    <TableToolbar
                        onSearch={handleSearch}
                        filters={filterConfigs}
                        filterState={filterState}
                    />

                    {/* Tabla principal */}
                    <ReusableTable<UserDto>
                        data={filteredData}
                        columns={columns}
                        defaultSort="idUser"
                    />

                    {/* Modales */}
                    <BillActiveModal
                        show={showBillActiveModal}
                        onHide={() => setShowBillActiveModal(false)}
                        user={selectedUser}
                    />

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
