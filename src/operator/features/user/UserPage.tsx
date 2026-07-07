import { useMemo, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import AddEditUserModal from "./AddEditUserModal";
import TableToolbar from "../../../shared/components/table-toolbar/TableToolbar";
import PageHeader from "../../../shared/components/PageHeader";
import { addData, updateData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { UserDto } from "../../../core/models/dto/UserDto";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import statusLabels from "../../../shared/components/labels-traductor/statusLabels";
import { useSearch } from "../../../hooks/useSearch";
import { useTableFilters } from "../../../hooks/useTableFilters";
import useAppData from "../../../hooks/useAppData";

const UserPage = () => {

    //Estados
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const { operatorUsers, locations, fees, loading, error, refreshOperatorUsers, refreshOperatorActiveUsers } = useAppData();

    // Estadísticas para la cabecera
    const totalUsers = operatorUsers.length;
    const activeUsers = operatorUsers.filter(u => u.status === "ACTIVE").length;
    const inactiveUsers = operatorUsers.filter(u => u.status === "INACTIVE").length;

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

    // Manejar añadir/editar
    const handleSave = async (user: UserDto) => {
        try {
            if (user.idUser) {
                await updateData("/user/update?idUser", user.idUser, user);
                toast.success("Usuario actualizado exitosamente");
            } else {
                await addData("/operator/register-user", user);
                toast.success("Usuario creado exitosamente");
            }

            // Solo se ejecuta si no hubo error
            setSelectedUser(user);
            setShowModal(false);
            // Se refresca para tablas que muestran todos los usuarios
            await refreshOperatorUsers();
            // Se refresca para tablas que muestran usuarios activos
            await refreshOperatorActiveUsers();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error al guardar el usuario");
            // No cerrar modal, no resetear formulario
        }
    };

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<UserDto>[] = [
        { key: "idUser", label: "N° Conexión", sortable: true },
        {
            key: "firstName",
            label: "Nombre",
            sortable: false,
            render: (row) => (
                <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{width:40,height:40}}>
                        <strong>{(row.firstName?.[0] || "") + (row.lastName?.[0] || "")}</strong>
                    </div>
                    <div className="text-start">
                        <div>{row.firstName} {row.lastName}</div>
                        <div className="text-muted small">{row.residenceDto?.street ?? ""}</div>
                    </div>
                </div>
            ),
        },
        { key: "lastName", label: "Apellido", sortable: false, render: () => null },
        { key: "dni", label: "DNI", sortable: false },
        { key: "phone", label: "Teléfono", sortable: false },
        { key: "status", label: "Estado", sortable: false, render: (row) => (
            <span className={`status-badge ${row.status}`}>{statusLabels[row.status] || row.status}</span>
        ) },
        {
            key: "actions", label: "Acciones", actions: (row: UserDto) => (
                <Button variant="primary" size="sm" onClick={() => { setSelectedUser(row); setShowModal(true); }}>
                    Editar
                </Button>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Usuarios"
                subtitle="Gestiona altas, modificaciones y estados de los usuarios."
                stats={[
                    { label: "Total usuarios", value: <>{totalUsers}</> },
                    { label: "Activos", value: <>{activeUsers}</> },
                    { label: "Inactivos", value: <>{inactiveUsers}</> },
                ]}
            >
                <Button onClick={() => { setSelectedUser(null); setShowModal(true); }} className="btn-primary">
                    + Nuevo Usuario
                </Button>
            </PageHeader>
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
                    >
                        <Button onClick={() => { setSelectedUser(null); setShowModal(true); }}>
                            Añadir Usuario
                        </Button>
                    </TableToolbar>

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
