import { useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import AddEditUserModal from "./AddEditUserModal";
import ResetPasswordModal from "./ResetPasswordModal";
import BillActiveModal from "../management-bill/BillActiveModal";
import TableToolbar from "../../../shared/components/table-toolbar/TableToolbar";
import PageHeader from "../../../shared/components/PageHeader";
import { addData, updateData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { UserDto } from "../../../core/models/dto/UserDto";
import { Status } from "../../../core/models/dto/Status";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import TableSkeleton from "../../../shared/components/table-skeleton/TableSkeleton";
import RowActions from "../../../shared/components/table/RowActions";
import ConfirmModal from "../../../shared/components/confirm/ConfirmModal";
import statusLabels from "../../../shared/components/labels-traductor/statusLabels";
import {
    STATUS_BADGE_CLASS,
    STATUS_OPTIONS,
    STATUS_ACTION_CONFIG,
    STATUS_ACTION_SUCCESS_MESSAGE,
    STATUS_TRANSITION_ORDER,
} from "../../../shared/components/labels-traductor/statusStyles";
import DotDropdown from "../../../shared/components/dot-dropdown/DotDropdown";
import AutocompleteFilter from "../../../shared/components/autocomplete-filter/AutocompleteFilter";
import { useSearch } from "../../../hooks/useSearch";
import { useTableFilters } from "../../../hooks/useTableFilters";
import useAppData from "../../../hooks/useAppData";
import { getAvatarColor } from "../../../core/utils/avatarColors";
import { withFullName } from "../../../core/utils/userUtils";

type UserRow = UserDto & { fullName: string };

const UserPage = () => {
    //Estados
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const [userToResetPassword, setUserToResetPassword] =
        useState<UserDto | null>(null);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [statusChangeRequest, setStatusChangeRequest] = useState<{
        user: UserDto;
        nextStatus: Status;
    } | null>(null);
    const [isChangingStatus, setIsChangingStatus] = useState(false);
    const [billsUser, setBillsUser] = useState<UserDto | null>(null);
    const [showBillActiveModal, setShowBillActiveModal] = useState(false);
    const {
        operatorUsers,
        locations,
        fees,
        loading,
        error,
        refreshOperatorUsers,
        refreshOperatorActiveUsers,
    } = useAppData();

    // Estadísticas para la cabecera
    const totalUsers = operatorUsers.length;
    const activeUsers = operatorUsers.filter(
        (u) => u.status === "ACTIVE"
    ).length;
    const inactiveUsers = operatorUsers.filter(
        (u) => u.status === "INACTIVE"
    ).length;
    const suspendedUsers = operatorUsers.filter(
        (u) => u.status === "SUSPENDED"
    ).length;

    // Calles únicas para el filtro
    const uniqueStreets = useMemo(
        () =>
            Array.from(
                new Set(
                    operatorUsers
                        .map((u) => u.residenceDto?.street)
                        .filter(Boolean)
                )
            ) as string[],
        [operatorUsers]
    );

    // Filtros siempre visibles (Fase 3: sin checkbox de habilitación)
    const filterConfigs = useMemo(
        () => [
            {
                id: "street",
                label: "Calle",
                type: "custom" as const,
                render: ({
                    value,
                    onChange,
                }: {
                    value: string;
                    onChange: (value: string) => void;
                }) => (
                    <AutocompleteFilter
                        options={uniqueStreets.map((street) => ({
                            value: street,
                            label: street,
                        }))}
                        value={value}
                        onChange={onChange}
                        placeholder="Todas las calles"
                        icon="bi bi-geo-alt"
                    />
                ),
            },
            {
                id: "status",
                label: "Estado",
                type: "custom" as const,
                render: ({
                    value,
                    onChange,
                }: {
                    value: string;
                    onChange: (value: string) => void;
                }) => (
                    <DotDropdown
                        options={STATUS_OPTIONS}
                        value={value}
                        onChange={onChange}
                        placeholder="Todos los estados"
                        icon="bi bi-funnel"
                    />
                ),
            },
        ],
        [uniqueStreets]
    );
    const filterState = useTableFilters(filterConfigs);

    // Se agrega el nombre y apellido concatenados para poder listarlos en una sola columna
    // y para que el buscador encuentre coincidencias sin importar si se busca por
    // nombre, apellido o ambos juntos.
    const usersWithFullName = useMemo(
        () => withFullName(operatorUsers),
        [operatorUsers]
    );

    // Hook para buscar por columnas
    const { filteredData, handleSearch } = useSearch<UserRow>(
        usersWithFullName,
        ["fullName", "idUser"],
        {
            "residenceDto.street": filterState.getActiveValue("street"),
            status: filterState.getActiveValue("status"),
        }
    );

    // Manejar añadir/editar. El blanqueo de contraseña es una acción aparte
    // (menú de opciones del header en AddEditUserModal, o menú de la fila),
    // que reutiliza el mismo flujo de handleConfirmResetPassword de acá
    // abajo — este submit ya no lo toca.
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

    // Cambia el estado del usuario. Solo se llama después de confirmar el modal
    // que dispara el menú rápido de la fila; el formulario de edición principal
    // (handleSave) actualiza el estado directamente, sin pasar por acá.
    const handleConfirmChangeStatus = async () => {
        if (!statusChangeRequest) return;
        const { user, nextStatus } = statusChangeRequest;
        setIsChangingStatus(true);
        try {
            await updateData("/user/update?idUser", user.idUser, {
                ...user,
                status: nextStatus,
            });
            toast.success(STATUS_ACTION_SUCCESS_MESSAGE[nextStatus]);
            await refreshOperatorUsers();
            await refreshOperatorActiveUsers();
            setStatusChangeRequest(null);
        } catch (error: any) {
            console.error(error);
            toast.error(
                error.message || "Error al cambiar el estado del usuario"
            );
        } finally {
            setIsChangingStatus(false);
        }
    };

    // Restablece la contraseña del usuario. El método (temporal random, DNI,
    // o definida a mano) y su validación viven en ResetPasswordModal; acá
    // solo se recibe la contraseña ya resuelta y se manda al endpoint
    // dedicado de cambio de contraseña (el mismo que UserPersonalData.tsx):
    // /user/update?idUser ignora el campo password al editar un usuario
    // existente, solo lo toma en el alta.
    const handleConfirmResetPassword = async (newPassword: string) => {
        if (!userToResetPassword) return;
        setIsResettingPassword(true);
        try {
            await updateData(
                "/user/change-password?idUser",
                userToResetPassword.idUser,
                newPassword
            );
            toast.success("Contraseña restablecida exitosamente");
            setUserToResetPassword(null);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error al restablecer la contraseña");
        } finally {
            setIsResettingPassword(false);
        }
    };

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<UserRow>[] = [
        { key: "idUser", label: "N° Conexión", sortable: true },
        {
            key: "fullName",
            label: "Nombre y Apellido",
            sortable: false,
            render: (row) => {
                const avatarColor = getAvatarColor(
                    `${row.firstName ?? ""}${row.lastName ?? ""}${row.idUser ?? ""}`
                );
                return (
                    <div className="d-flex align-items-center gap-3">
                        <div
                            className="row-avatar"
                            style={{
                                backgroundColor: avatarColor.bg,
                                color: avatarColor.color,
                            }}
                        >
                            {(row.firstName?.[0] || "") +
                                (row.lastName?.[0] || "")}
                        </div>
                        <div className="text-start">
                            <div>{row.fullName}</div>
                            <div className="text-muted small">
                                {row.residenceDto?.street ?? ""}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        { key: "dni", label: "DNI", sortable: false },
        { key: "phone", label: "Teléfono", sortable: false },
        {
            key: "status",
            label: "Estado",
            sortable: false,
            render: (row) => (
                <span
                    className={`badge-soft ${STATUS_BADGE_CLASS[row.status]}`}
                >
                    {statusLabels[row.status] || row.status}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Acciones",
            actions: (row: UserRow) => (
                <RowActions
                    editTitle="Editar usuario"
                    onEdit={() => {
                        setSelectedUser(row);
                        setShowModal(true);
                    }}
                    items={[
                        ...STATUS_TRANSITION_ORDER.filter(
                            (status) => status !== row.status
                        ).map((status) => ({
                            label: STATUS_ACTION_CONFIG[status].label,
                            icon: STATUS_ACTION_CONFIG[status].icon,
                            color: STATUS_ACTION_CONFIG[status].color,
                            onClick: () =>
                                setStatusChangeRequest({
                                    user: row,
                                    nextStatus: status,
                                }),
                        })),
                        {
                            label: "Restablecer contraseña",
                            icon: "bi bi-key",
                            onClick: () => setUserToResetPassword(row),
                        },
                        {
                            label: "Ver facturas",
                            icon: "bi bi-receipt",
                            onClick: () => {
                                setBillsUser(row);
                                setShowBillActiveModal(true);
                            },
                        },
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
            />
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
                    >
                        <Button
                            onClick={() => {
                                setSelectedUser(null);
                                setShowModal(true);
                            }}
                        >
                            Añadir Usuario
                        </Button>
                    </TableToolbar>

                    {/* Tabla */}
                    <ReusableTable<UserRow>
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
                        onResetPasswordClick={() => {
                            if (!selectedUser) return;
                            setUserToResetPassword(selectedUser);
                        }}
                        user={selectedUser}
                        locations={locations}
                        fees={fees}
                    />

                    {/* Restablecer contraseña */}
                    <ResetPasswordModal
                        show={!!userToResetPassword}
                        user={userToResetPassword}
                        isLoading={isResettingPassword}
                        onHide={() => setUserToResetPassword(null)}
                        onConfirm={handleConfirmResetPassword}
                    />

                    {/* Confirmación de cambio de estado (solo desde el menú rápido de la fila).
                        Variant/ícono por estado destino vienen de STATUS_ACTION_CONFIG, así
                        que quedan consistentes con el resto del sistema (success/warning/neutral)
                        en vez de un modal a medida solo para este caso. */}
                    {statusChangeRequest &&
                        (() => {
                            const config =
                                STATUS_ACTION_CONFIG[
                                    statusChangeRequest.nextStatus
                                ];
                            const statusLabel =
                                STATUS_OPTIONS.find(
                                    (o) =>
                                        o.value ===
                                        statusChangeRequest.nextStatus
                                )?.label ?? statusChangeRequest.nextStatus;
                            const userName = `${statusChangeRequest.user.firstName} ${statusChangeRequest.user.lastName}`;
                            return (
                                <ConfirmModal
                                    show={!!statusChangeRequest}
                                    onHide={() => setStatusChangeRequest(null)}
                                    variant={config.modalVariant}
                                    icon={config.modalIcon}
                                    title="Cambiar estado del usuario"
                                    message={
                                        <>
                                            ¿Cambiar el estado de{" "}
                                            <strong>{userName}</strong> a "
                                            <strong
                                                style={{ color: config.color }}
                                            >
                                                {statusLabel}
                                            </strong>
                                            "?
                                        </>
                                    }
                                    confirmText={config.actionLabel}
                                    confirmIcon={`bi ${config.badgeIcon}`}
                                    isLoading={isChangingStatus}
                                    loadingText="Guardando..."
                                    onConfirm={handleConfirmChangeStatus}
                                />
                            );
                        })()}

                    {/* Facturas del usuario, acceso rápido desde el menú de la fila */}
                    <BillActiveModal
                        show={showBillActiveModal}
                        onHide={() => setShowBillActiveModal(false)}
                        user={billsUser}
                    />
                </div>
            )}
        </div>
    );
};

export default UserPage;
