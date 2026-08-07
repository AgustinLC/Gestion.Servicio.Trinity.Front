import { useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import TableToolbar from "../../../shared/components/table-toolbar/TableToolbar";
import PageHeader from "../../../shared/components/PageHeader";
// import { addData } from "../../../core/services/apiService"; // Solo lo usaba el envío de notificaciones (deshabilitado, ver nota más abajo)
// import { toast } from "react-toastify"; // Idem
import { UserDto } from "../../../core/models/dto/UserDto";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import TableSkeleton from "../../../shared/components/table-skeleton/TableSkeleton";
import BillActiveModal from "./BillActiveModal";
import BillNullModal from "./BillNullModal";
import { useSearch } from "../../../hooks/useSearch";
import { useTableFilters } from "../../../hooks/useTableFilters";
import useAppData from "../../../hooks/useAppData";
import { withFullName } from "../../../core/utils/userUtils";

type UserRow = UserDto & { fullName: string };

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

    // Se agrega el nombre y apellido concatenados para poder listarlos en una sola columna
    // y para que el buscador encuentre coincidencias sin importar si se busca por
    // nombre, apellido o ambos juntos.
    const usersWithFullName = useMemo(() => withFullName(operatorUsers), [operatorUsers]);

    // Hook para buscar por columnas
    const { filteredData, handleSearch } = useSearch<UserRow>(
        usersWithFullName,
        ["fullName", "idUser"],
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
    const columns: TableColumnDefinition<UserRow>[] = [
        { key: "idUser", label: "N° Conexión.", sortable: true },
        { key: "fullName", label: "Nombre y Apellido", sortable: false },
        { key: "street" as keyof UserRow, label: "Calle", sortable: false, render: (row: UserRow) => row.residenceDto?.street || "Sin dirección" },
        {
            key: "actions", label: "Facturas", actions: (row: UserRow) => (
                <div className="d-flex gap-2 justify-content-center overflow-auto text-nowrap">
                    <Button variant="outline-success" onClick={() => { setSelectedUser(row); setShowBillActiveModal(true); }}>
                        <i className="bi bi-file-earmark-text me-1"></i> Activas
                    </Button>
                    <Button variant="outline-danger" onClick={() => { setSelectedUser(row); setShowBillNullModal(true); }}>
                        <i className="bi bi-file-earmark-x me-1"></i> Anuladas
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <PageHeader title="Gestión de Facturas" subtitle="Consultá y administrá las facturas emitidas." icon="bi bi-file-earmark-spreadsheet" />
            {loading ? (
                <TableSkeleton />
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : (
                <div className="content-fade-in">
                    <TableToolbar
                        onSearch={handleSearch}
                        filters={filterConfigs}
                        filterState={filterState}
                    />

                    {/* Tabla principal */}
                    <ReusableTable<UserRow>
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
