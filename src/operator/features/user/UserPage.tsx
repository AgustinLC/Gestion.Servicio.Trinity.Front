import { useMemo, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import AddEditUserModal from "./AddEditUserModal";
import BillActiveModal from "../management-bill/BillActiveModal";
import TableToolbar from "../../../shared/components/table-toolbar/TableToolbar";
import PageHeader from "../../../shared/components/PageHeader";
import { addData, updateData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { UserDto } from "../../../core/models/dto/UserDto";
import { Status } from "../../../core/models/dto/Status";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import ReusableTable from "../../../shared/components/table/ReusableTable";
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
import { useSearch } from "../../../hooks/useSearch";
import { useTableFilters } from "../../../hooks/useTableFilters";
import useAppData from "../../../hooks/useAppData";
import { getAvatarColor } from "../../../core/utils/avatarColors";
import { withFullName } from "../../../core/utils/userUtils";
import { getPasswordRuleResults, isPasswordValid } from "../../../core/utils/passwordValidation";

type UserRow = UserDto & { fullName: string };

const UserPage = () => {

    //Estados
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const [userToResetPassword, setUserToResetPassword] = useState<UserDto | null>(null);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [resetPasswordMode, setResetPasswordMode] = useState<"dni" | "custom">("dni");
    const [customPassword, setCustomPassword] = useState("");
    const [statusChangeRequest, setStatusChangeRequest] = useState<{ user: UserDto; nextStatus: Status } | null>(null);
    const [isChangingStatus, setIsChangingStatus] = useState(false);
    const [billsUser, setBillsUser] = useState<UserDto | null>(null);
    const [showBillActiveModal, setShowBillActiveModal] = useState(false);
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
                emptyLabel: "Todas las calles",
                options: uniqueStreets.map((street) => ({ value: street, label: street })),
            },
            {
                id: "status",
                label: "Estado",
                type: "custom" as const,
                render: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
                    <DotDropdown
                        options={[{ value: "", label: "Todos los estados" }, ...STATUS_OPTIONS]}
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
    const usersWithFullName = useMemo(() => withFullName(operatorUsers), [operatorUsers]);

    // Hook para buscar por columnas
    const { filteredData, handleSearch } = useSearch<UserRow>(
        usersWithFullName,
        ["fullName", "idUser"],
        {
            "residenceDto.street": filterState.getActiveValue("street"),
            status: filterState.getActiveValue("status"),
        }
    );

    // Manejar añadir/editar. El blanqueo de contraseña desde el formulario de
    // edición (AddEditUserModal) llega como segundo parámetro y se manda por
    // separado a /user/change-password?idUser, ya que /user/update?idUser
    // ignora el campo password al editar un usuario existente.
    const handleSave = async (user: UserDto, newPassword?: string) => {
        try {
            if (user.idUser) {
                await updateData("/user/update?idUser", user.idUser, user);
                if (newPassword) {
                    await updateData("/user/change-password?idUser", user.idUser, newPassword);
                }
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
            await updateData("/user/update?idUser", user.idUser, { ...user, status: nextStatus });
            toast.success(STATUS_ACTION_SUCCESS_MESSAGE[nextStatus]);
            await refreshOperatorUsers();
            await refreshOperatorActiveUsers();
            setStatusChangeRequest(null);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error al cambiar el estado del usuario");
        } finally {
            setIsChangingStatus(false);
        }
    };

    // Restablece la contraseña del usuario, ya sea al valor por defecto (su
    // DNI, mismo criterio que se usa al dar de alta un usuario nuevo en
    // AddEditUserModal) o a una contraseña nueva definida a mano.
    // Usa el endpoint dedicado de cambio de contraseña (el mismo que
    // UserPersonalData.tsx): /user/update?idUser ignora el campo password al
    // editar un usuario existente, solo lo toma en el alta.
    const handleConfirmResetPassword = async () => {
        if (!userToResetPassword) return;
        if (resetPasswordMode === "custom" && !isCustomPasswordValid) return;
        const newPassword = resetPasswordMode === "dni" ? userToResetPassword.dni?.toString() : customPassword.trim();
        setIsResettingPassword(true);
        try {
            await updateData("/user/change-password?idUser", userToResetPassword.idUser, newPassword);
            toast.success(
                resetPasswordMode === "dni"
                    ? "Contraseña restablecida al DNI del usuario"
                    : "Contraseña actualizada exitosamente"
            );
            setUserToResetPassword(null);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error al restablecer la contraseña");
        } finally {
            setIsResettingPassword(false);
        }
    };

    // Validación de la contraseña personalizada (solo aplica cuando se elige
    // "Definir una nueva contraseña"; el reseteo al DNI nunca pasa por acá).
    const trimmedCustomPassword = customPassword.trim();
    const passwordRuleResults = getPasswordRuleResults(trimmedCustomPassword);
    const isCustomPasswordValid = isPasswordValid(trimmedCustomPassword);
    const isCustomPasswordInvalid = trimmedCustomPassword.length > 0 && !isCustomPasswordValid;

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<UserRow>[] = [
        { key: "idUser", label: "N° Conexión", sortable: true },
        {
            key: "fullName",
            label: "Nombre y Apellido",
            sortable: false,
            render: (row) => {
                const avatarColor = getAvatarColor(`${row.firstName ?? ""}${row.lastName ?? ""}${row.idUser ?? ""}`);
                return (
                    <div className="d-flex align-items-center gap-3">
                        <div className="row-avatar" style={{ backgroundColor: avatarColor.bg, color: avatarColor.color }}>
                            {(row.firstName?.[0] || "") + (row.lastName?.[0] || "")}
                        </div>
                        <div className="text-start">
                            <div>{row.fullName}</div>
                            <div className="text-muted small">{row.residenceDto?.street ?? ""}</div>
                        </div>
                    </div>
                );
            },
        },
        { key: "dni", label: "DNI", sortable: false },
        { key: "phone", label: "Teléfono", sortable: false },
        { key: "status", label: "Estado", sortable: false, render: (row) => (
            <span className={`badge-soft ${STATUS_BADGE_CLASS[row.status]}`}>
                {statusLabels[row.status] || row.status}
            </span>
        ) },
        {
            key: "actions", label: "Acciones", actions: (row: UserRow) => (
                <RowActions
                    editTitle="Editar usuario"
                    onEdit={() => { setSelectedUser(row); setShowModal(true); }}
                    items={[
                        ...STATUS_TRANSITION_ORDER
                            .filter((status) => status !== row.status)
                            .map((status) => ({
                                label: STATUS_ACTION_CONFIG[status].label,
                                icon: STATUS_ACTION_CONFIG[status].icon,
                                color: STATUS_ACTION_CONFIG[status].color,
                                onClick: () => setStatusChangeRequest({ user: row, nextStatus: status }),
                            })),
                        {
                            label: "Restablecer contraseña",
                            icon: "bi bi-key",
                            onClick: () => {
                                setUserToResetPassword(row);
                                setResetPasswordMode("dni");
                                setCustomPassword("");
                            },
                        },
                        {
                            label: "Ver facturas",
                            icon: "bi bi-receipt",
                            onClick: () => { setBillsUser(row); setShowBillActiveModal(true); },
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
                        user={selectedUser}
                        locations={locations}
                        fees={fees}
                    />

                    {/* Confirmación de restablecer contraseña */}
                    <ConfirmModal
                        show={!!userToResetPassword}
                        onHide={() => setUserToResetPassword(null)}
                        title="Restablecer contraseña"
                        message={
                            userToResetPassword ? (
                                <>
                                    <p className="mb-3">
                                        Restablecer la contraseña de <strong>{userToResetPassword.firstName} {userToResetPassword.lastName}</strong>:
                                    </p>
                                    <Form.Check
                                        type="radio"
                                        id="reset-password-dni"
                                        name="resetPasswordMode"
                                        label={`Usar su DNI (${userToResetPassword.dni})`}
                                        checked={resetPasswordMode === "dni"}
                                        onChange={() => setResetPasswordMode("dni")}
                                        className="mb-2"
                                    />
                                    <Form.Check
                                        type="radio"
                                        id="reset-password-custom"
                                        name="resetPasswordMode"
                                        label="Definir una nueva contraseña"
                                        checked={resetPasswordMode === "custom"}
                                        onChange={() => setResetPasswordMode("custom")}
                                    />
                                    {resetPasswordMode === "custom" && (
                                        <>
                                            <Form.Control
                                                type="text"
                                                placeholder="Nueva contraseña"
                                                value={customPassword}
                                                onChange={(e) => setCustomPassword(e.target.value)}
                                                isInvalid={isCustomPasswordInvalid}
                                                className="mt-2"
                                                autoFocus
                                            />
                                            <ul className="list-unstyled small mt-2 mb-0">
                                                {passwordRuleResults.map((rule) => (
                                                    <li key={rule.key} className={rule.passed ? "text-success" : "text-muted"}>
                                                        <i className={`bi ${rule.passed ? "bi-check-circle-fill" : "bi-circle"} me-1`}></i>
                                                        {rule.label}
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </>
                            ) : ""
                        }
                        confirmText="Restablecer"
                        confirmVariant="warning"
                        isLoading={isResettingPassword}
                        loadingText="Restableciendo..."
                        confirmDisabled={resetPasswordMode === "custom" && !isCustomPasswordValid}
                        onConfirm={handleConfirmResetPassword}
                    />

                    {/* Confirmación de cambio de estado (solo desde el menú rápido de la fila) */}
                    <ConfirmModal
                        show={!!statusChangeRequest}
                        onHide={() => setStatusChangeRequest(null)}
                        title="Cambiar estado del usuario"
                        message={
                            statusChangeRequest
                                ? `¿Cambiar el estado de ${statusChangeRequest.user.firstName} ${statusChangeRequest.user.lastName} a "${STATUS_OPTIONS.find(o => o.value === statusChangeRequest.nextStatus)?.label}"?`
                                : ""
                        }
                        confirmText={statusChangeRequest ? STATUS_ACTION_CONFIG[statusChangeRequest.nextStatus].label : "Confirmar"}
                        confirmVariant={statusChangeRequest ? STATUS_ACTION_CONFIG[statusChangeRequest.nextStatus].confirmVariant : "primary"}
                        isLoading={isChangingStatus}
                        loadingText="Cambiando estado..."
                        onConfirm={handleConfirmChangeStatus}
                    />

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
