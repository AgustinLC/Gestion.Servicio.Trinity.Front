import React, { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { UserDto } from "../../../core/models/dto/UserDto";
import { getData, updateData } from "../../../core/services/apiService";
import useAuth from "../../../hooks/useAuth";
import PageHeader from "../../../shared/components/PageHeader";
import FloatingFieldset from "../../../shared/components/floating-fieldset/FloatingFieldset";
import CustomSelect from "../../../shared/components/custom-select/CustomSelect";
import ConfirmModal from "../../../shared/components/confirm/ConfirmModal";
import {
    getPasswordRuleResults,
    isPasswordValid,
} from "../../../core/utils/passwordValidation";
import { isNegativeInput } from "../../../core/utils/numberInput";

const UserPersonalData: React.FC = () => {
    const { userId } = useAuth(); // Obtén el userId desde el hook useAuth
    const [user, setUser] = useState<UserDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isTogglingDigitalInvoice, setIsTogglingDigitalInvoice] =
        useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [pendingDigitalInvoice, setPendingDigitalInvoice] = useState<
        boolean | null
    >(null);

    // Obtener los datos del usuario al cargar el componente
    useEffect(() => {
        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    // Función para obtener los datos del usuario
    const fetchUserData = async () => {
        setLoading(true);
        try {
            const response = await getData<UserDto>(`/user/${userId}`);
            setUser(response);
        } catch (error) {
            console.error(error);
            toast.error("Error al obtener los datos del usuario");
            setError("Error al cargar los datos del usuario");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = () => {
        if (!user) return;
        if (userId === null) {
            toast.error("No se pudo obtener el ID del usuario");
            return;
        }
        setShowSaveConfirm(true);
    };

    const handleConfirmSave = async () => {
        if (!user || userId === null) return;
        setIsSaving(true);
        try {
            const updatedUser = {
                ...user,
                username: user.username,
                dni: user.dni,
                phone: user.phone,
            };
            await updateData("/user/update?idUser", userId, updatedUser);
            toast.success("Datos actualizados exitosamente");
        } catch (error) {
            console.error(error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Error al actualizar los datos del usuario"
            );
        } finally {
            setIsSaving(false);
            setShowSaveConfirm(false);
        }
    };

    // Valida y abre el modal de confirmación del cambio de contraseña.
    const handleChangePassword = () => {
        if (!isPasswordValid(newPassword)) {
            toast.error("La contraseña no cumple con los requisitos mínimos");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }
        if (userId === null) {
            toast.error("No se pudo obtener el ID del usuario");
            return;
        }
        setShowPasswordConfirm(true);
    };

    const handleConfirmPasswordChange = async () => {
        if (userId === null) return;
        setIsChangingPassword(true);
        try {
            await updateData(
                "/user/change-password?idUser",
                userId,
                newPassword
            );
            toast.success("Contraseña actualizada exitosamente");
            setShowPasswordFields(false);
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            console.error(error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Error al actualizar la contraseña"
            );
        } finally {
            setIsChangingPassword(false);
            setShowPasswordConfirm(false);
        }
    };

    const handleToggleDigitalInvoice = (adhered: boolean) => {
        if (!user) return;
        if (userId === null) {
            toast.error("No se pudo obtener el ID del usuario");
            return;
        }
        setPendingDigitalInvoice(adhered);
    };

    const handleConfirmDigitalInvoiceChange = async () => {
        if (!user || userId === null || pendingDigitalInvoice === null) return;
        const adhered = pendingDigitalInvoice;
        setIsTogglingDigitalInvoice(true);
        try {
            await updateData(
                "/user/change-digital-invoice?idUser",
                userId,
                adhered
            );
            setUser({ ...user, digitalInvoiceAdhered: adhered });
            toast.success("Suscripción a factura digital actualizada");
        } catch (error) {
            console.error(error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Error al actualizar la suscripción a factura digital"
            );
        } finally {
            setIsTogglingDigitalInvoice(false);
            setPendingDigitalInvoice(null);
        }
    };

    if (loading) {
        return (
            <div>
                <PageHeader
                    title="Mis Datos"
                    subtitle="Actualizá tus datos personales y contraseña."
                    icon="bi bi-person-square"
                />
                <div>
                    {[1, 2, 3].map((field) => (
                        <div className="mb-3" key={field}>
                            <div
                                className="skeleton skeleton-line mb-2"
                                style={{ width: 140, height: 14 }}
                            ></div>
                            <div
                                className="skeleton skeleton-line"
                                style={{
                                    width: "100%",
                                    height: 40,
                                    borderRadius: 10,
                                }}
                            ></div>
                        </div>
                    ))}
                    <div className="mb-3">
                        <div
                            className="skeleton skeleton-line mb-2"
                            style={{ width: 140, height: 14 }}
                        ></div>
                        <div
                            className="skeleton skeleton-line"
                            style={{ width: 220, height: 40, borderRadius: 10 }}
                        ></div>
                    </div>
                    <div className="d-flex gap-3">
                        <div
                            className="skeleton skeleton-line"
                            style={{ width: 170, height: 38, borderRadius: 8 }}
                        ></div>
                        <div
                            className="skeleton skeleton-line"
                            style={{ width: 150, height: 38, borderRadius: 8 }}
                        ></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-5">{error}</div>;
    }

    if (!user) {
        return (
            <div className="text-center py-5">
                No se encontraron datos del usuario
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Mis Datos"
                subtitle="Actualizá tus datos personales y contraseña."
                icon="bi bi-person-square"
            />
            <Form className="content-fade-in">
                {/* Campo para el correo electrónico */}
                <Form.Group className="mb-3">
                    <FloatingFieldset label="Correo Electrónico">
                        <Form.Control
                            type="email"
                            value={user.username}
                            onChange={(e) =>
                                setUser({ ...user, username: e.target.value })
                            }
                            maxLength={100}
                        />
                    </FloatingFieldset>
                </Form.Group>

                {/* Campo para el DNI */}
                <Form.Group className="mb-3">
                    <FloatingFieldset label="DNI">
                        <Form.Control
                            type="number"
                            value={user.dni}
                            onChange={(e) => {
                                if (isNegativeInput(e.target.value)) return;
                                setUser({
                                    ...user,
                                    dni: parseInt(e.target.value),
                                });
                            }}
                            min="0"
                            max="99999999"
                        />
                    </FloatingFieldset>
                </Form.Group>

                {/* Campo para el teléfono */}
                <Form.Group className="mb-3">
                    <FloatingFieldset label="Teléfono">
                        <Form.Control
                            type="text"
                            value={user.phone}
                            onChange={(e) =>
                                setUser({ ...user, phone: e.target.value })
                            }
                            maxLength={10}
                        />
                    </FloatingFieldset>
                </Form.Group>

                {/* Selector para la factura digital */}
                <Form.Group className="mb-3">
                    <FloatingFieldset label="Factura Digital">
                        <CustomSelect
                            value={user.digitalInvoiceAdhered ? "si" : "no"}
                            onChange={(v) =>
                                handleToggleDigitalInvoice(v === "si")
                            }
                            disabled={isTogglingDigitalInvoice}
                            options={[
                                { value: "si", label: "Sí" },
                                { value: "no", label: "No" },
                            ]}
                        />
                    </FloatingFieldset>
                </Form.Group>

                {/* Apilados a ancho completo hasta sm: lado a lado el texto
                    envolvía a 2 líneas. */}
                <div className="d-flex flex-column flex-sm-row gap-3 mb-3">
                    {/* Botón para mostrar campos de contraseña */}
                    <Button
                        variant="secondary"
                        onClick={() =>
                            setShowPasswordFields(!showPasswordFields)
                        }
                        className="w-100-until-sm"
                    >
                        Cambiar Contraseña
                    </Button>

                    {/* Botón para guardar cambios */}
                    <Button
                        variant="primary"
                        onClick={handleUpdateUser}
                        disabled={isSaving}
                        className="w-100-until-sm"
                    >
                        Guardar Cambios
                    </Button>
                </div>

                {/* Campos para cambiar la contraseña */}
                {showPasswordFields && (
                    <>
                        <Form.Group className="mb-3">
                            <FloatingFieldset label="Nueva Contraseña">
                                <Form.Control
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                />
                            </FloatingFieldset>
                            <ul className="list-unstyled small mt-2 mb-0">
                                {getPasswordRuleResults(newPassword).map(
                                    (rule) => (
                                        <li
                                            key={rule.key}
                                            className={
                                                rule.passed
                                                    ? "text-success"
                                                    : "text-muted"
                                            }
                                        >
                                            <i
                                                className={`bi ${rule.passed ? "bi-check-circle-fill" : "bi-circle"} me-1`}
                                            ></i>
                                            {rule.label}
                                        </li>
                                    )
                                )}
                            </ul>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <FloatingFieldset label="Confirmar Contraseña">
                                <Form.Control
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                />
                            </FloatingFieldset>
                        </Form.Group>
                        <Button
                            variant="primary"
                            onClick={handleChangePassword}
                            disabled={
                                isChangingPassword ||
                                !isPasswordValid(newPassword)
                            }
                        >
                            Actualizar Contraseña
                        </Button>
                    </>
                )}
            </Form>

            <ConfirmModal
                show={showSaveConfirm}
                onHide={() => setShowSaveConfirm(false)}
                variant="question"
                title="¿Guardar los cambios?"
                message="Se van a actualizar tus datos personales."
                confirmText="Guardar"
                confirmIcon="bi bi-check-circle"
                isLoading={isSaving}
                loadingText="Guardando..."
                onConfirm={handleConfirmSave}
            />

            <ConfirmModal
                show={showPasswordConfirm}
                onHide={() => setShowPasswordConfirm(false)}
                variant="warning"
                title="¿Cambiar tu contraseña?"
                message="Vas a necesitar la nueva contraseña la próxima vez que inicies sesión."
                confirmText="Cambiar contraseña"
                confirmIcon="bi bi-key"
                isLoading={isChangingPassword}
                loadingText="Actualizando..."
                onConfirm={handleConfirmPasswordChange}
            />

            <ConfirmModal
                show={pendingDigitalInvoice !== null}
                onHide={() => setPendingDigitalInvoice(null)}
                variant="question"
                title="¿Actualizar la suscripción a factura digital?"
                message={
                    pendingDigitalInvoice
                        ? "A partir de ahora vas a recibir tus facturas por correo electrónico."
                        : "Vas a dejar de recibir tus facturas por correo electrónico."
                }
                confirmText="Confirmar"
                confirmIcon="bi bi-check-circle"
                isLoading={isTogglingDigitalInvoice}
                loadingText="Actualizando..."
                onConfirm={handleConfirmDigitalInvoiceChange}
            />
        </div>
    );
};

export default UserPersonalData;
