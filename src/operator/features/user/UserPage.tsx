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
import RowActions from "../../../shared/components/table/RowActions";
import statusLabels from "../../../shared/components/labels-traductor/statusLabels";
import { STATUS_BADGE_CLASS, STATUS_OPTIONS } from "../../../shared/components/labels-traductor/statusStyles";
import DotDropdown from "../../../shared/components/dot-dropdown/DotDropdown";
import { useSearch } from "../../../hooks/useSearch";
import { useTableFilters } from "../../../hooks/useTableFilters";
import useAppData from "../../../hooks/useAppData";
import { getAvatarColor } from "../../../core/utils/avatarColors";

const UserPage = () => {

    //Estados
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const { operatorUsers, locations, fees, loading, error, refreshOperatorUsers, refreshOperatorActiveUsers } = useAppData();

    // Estadísticas para la cabecera
    const totalUsers = operatorUsers.length;
    const activeUsers = operatorUsers.filter(u => u.status === "ACTIVE").length;
    const inactiveUsers = operatorUsers.filter(u => u.status === "INACTIVE").length;
    const suspendedUsers = operatorUsers.filter(u => u.status === "SUSPENDED").length;

    // Calles únicas para el filtro
    const uniqueStreets = useMemo(
        () => Array.from(new Set(operatorUsers.map(u => u.residenceDto?.street).filter(Boolean))) as string[],
        [operatorUsers]
    );

    // Filtros siempre visibles (Fase 3: sin checkbox de habilitación)
    const filterConfigs = useMemo(
        () => [
            {
                id: "street",
                label: "Calle",
                emptyLabel: "Seleccionar Calle...",
                options: uniqueStreets.map((street) => ({ value: street, label: street })),
            },
            {
                id: "status",
                label: "Estado",
                type: "custom" as const,
                render: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
                    <DotDropdown
                        options={[{ value: "", label: "Todos" }, ...STATUS_OPTIONS]}
                        value={value}
                        onChange={onChange}
                        placeholder="Seleccionar Estado..."
                        icon="bi bi-funnel"
                    />
                ),
            },
        ],
        [uniqueStreets]
    );
    const filterState = useTableFilters(filterConfigs);

    // Hook para buscar por columnas 
    const { filteredData, handleSearch } = useSearch<UserDto>(
        operatorUsers,
        ["firstName", "lastName", "idUser"],
        {
            "residenceDto.street": filterState.getActiveValue("street"),
            status: filterState.getActiveValue("status"),
        }
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

    // Alterna Activo/Suspendido rápidamente desde el menú de acciones de la fila
    const handleToggleStatus = async (user: UserDto) => {
        const nextStatus = user.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
        try {
            await updateData("/user/update?idUser", user.idUser, { ...user, status: nextStatus });
            toast.success(nextStatus === "SUSPENDED" ? "Usuario suspendido" : "Usuario activado");
            await refreshOperatorUsers();
            await refreshOperatorActiveUsers();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error al cambiar el estado del usuario");
        }
    };

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<UserDto>[] = [
        { key: "idUser", label: "N° Conexión", sortable: true },
        {
            key: "firstName",
            label: "Nombre",
            sortable: false,
            render: (row) => {
                const avatarColor = getAvatarColor(`${row.firstName ?? ""}${row.lastName ?? ""}${row.idUser ?? ""}`);
                return (
                    <div className="d-flex align-items-center gap-3">
                        <div className="row-avatar" style={{ backgroundColor: avatarColor.bg, color: avatarColor.color }}>
                            {(row.firstName?.[0] || "") + (row.lastName?.[0] || "")}
                        </div>
                        <div className="text-start">
                            <div>{row.firstName}</div>
                            <div className="text-muted small">{row.residenceDto?.street ?? ""}</div>
                        </div>
                    </div>
                );
            },
        },
        { key: "lastName", label: "Apellido", sortable: false, render: (row) => row.lastName },
        { key: "dni", label: "DNI", sortable: false },
        { key: "phone", label: "Teléfono", sortable: false },
        { key: "status", label: "Estado", sortable: false, render: (row) => (
            <span className={`badge-soft ${STATUS_BADGE_CLASS[row.status]}`}>
                {statusLabels[row.status] || row.status}
            </span>
        ) },
        {
            key: "actions", label: "Acciones", actions: (row: UserDto) => (
                <RowActions
                    editTitle="Editar usuario"
                    onEdit={() => { setSelectedUser(row); setShowModal(true); }}
                    items={[
                        row.status === "SUSPENDED"
                            ? { label: "Activar usuario", icon: "bi bi-check-circle", onClick: () => handleToggleStatus(row) }
                            : { label: "Suspender usuario", icon: "bi bi-slash-circle", onClick: () => handleToggleStatus(row), variant: "danger" },
                    ]}
                />
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Usuarios"
                subtitle="Gestiona altas, modificaciones y estados de los usuarios."
                icon="bi bi-people-fill"
                stats={[
                    { label: "Total usuarios", value: <>{totalUsers}</>, icon: "bi bi-people-fill", iconBg: "rgba(0, 119, 255, 0.1)", iconColor: "#0077ff" },
                    { label: "Activos", value: <>{activeUsers}</>, icon: "bi bi-check-circle-fill", iconBg: "#dcfce7", iconColor: "#16a34a" },
                    { label: "Suspendidos", value: <>{suspendedUsers}</>, icon: "bi bi-slash-circle-fill", iconBg: "#ffedd5", iconColor: "#ea580c" },
                    { label: "Inactivos", value: <>{inactiveUsers}</>, icon: "bi bi-x-circle-fill", iconBg: "#f1f5f9", iconColor: "#64748b" },
                ]}
            />
            {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center loading-vh">
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
