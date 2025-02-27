import React, { useEffect, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { UserDto } from "../../../core/models/dto/UserDto";
import { getData, updateData } from "../../../core/services/apiService";
import useAuth from "../../../hooks/useAuth";

const UserPersonalData: React.FC = () => {
    const { userId } = useAuth(); // Obtén el userId desde el hook useAuth
    const [user, setUser] = useState<UserDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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

    // Función para actualizar los datos del usuario
const handleUpdateUser = async () => {
    if (!user) return;

    setLoading(true);
    try {
        // Crear un objeto con los datos actuales del usuario y los campos actualizados
        const updatedUser = {
            ...user, // Mantén todos los campos existentes
            username: user.username, // Campo actualizado
            dni: user.dni, // Campo actualizado
            phone: user.phone, // Campo actualizado
        };

        // Enviar el objeto completo al endpoint
        await updateData("/user/update?idUser", userId, updatedUser);
        toast.success("Datos actualizados exitosamente");
    } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Error al actualizar los datos del usuario");
    } finally {
        setLoading(false);
    }
};

    // Función para cambiar la contraseña
    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        setLoading(true);
        try {
            await updateData("/user/change-password?idUser", userId, newPassword);
            toast.success("Contraseña actualizada exitosamente");
            setShowPasswordFields(false); // Oculta los campos de contraseña después de la actualización
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al actualizar la contraseña");
        } finally {
            setLoading(false);
        }
    };

    // Función para actualizar la suscripción a factura digital
    const handleToggleDigitalInvoice = async (adhered: boolean) => {
        if (!user) return;

        setLoading(true);
        try {
            await updateData("/user/change-digital-invoice?idUser", userId, adhered);
            setUser({ ...user, digitalInvoiceAdhered: adhered });
            toast.success("Suscripción a factura digital actualizada");
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al actualizar la suscripción a factura digital");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                <span className="mb-2 fw-bold">CARGANDO...</span>
                <Spinner animation="border" role="status"></Spinner>
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-5">{error}</div>;
    }

    if (!user) {
        return <div className="text-center py-5">No se encontraron datos del usuario</div>;
    }

    return (
        <div className="container mt-4">
    <h1 className="text-center">Actualizar Mis Datos Personales</h1>
    <Form>
        {/* Campo para el correo electrónico */}
        <Form.Group className="mb-3">
            <Form.Label>Correo Electrónico</Form.Label>
            <Form.Control
                type="email"
                value={user.username}
                onChange={(e) => setUser({ ...user, username: e.target.value })}
            />
        </Form.Group>

        {/* Campo para el DNI */}
        <Form.Group className="mb-3">
            <Form.Label>DNI</Form.Label>
            <Form.Control
                type="number"
                value={user.dni}
                onChange={(e) => setUser({ ...user, dni: parseInt(e.target.value) })}
            />
        </Form.Group>

        {/* Campo para el teléfono */}
        <Form.Group className="mb-3">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
                type="text"
                value={user.phone}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
            />
        </Form.Group>

        {/* Switch para la factura digital */}
        <Form.Group className="mb-3">
            <Form.Label>Factura Digital</Form.Label>
            <div className="d-flex align-items-center">
                <Form.Check
                    type="switch"
                    id="digital-invoice-switch"
                    label={user.digitalInvoiceAdhered ? "Adherido" : "No Adherido"}
                    checked={user.digitalInvoiceAdhered || false}
                    onChange={(e) => handleToggleDigitalInvoice(e.target.checked)}
                />
            </div>
        </Form.Group>

        {/* Contenedor para los botones */}
        <div className="d-flex gap-3 mb-3">
            {/* Botón para mostrar campos de contraseña */}
            <Button
                variant="secondary"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
            >
                Cambiar Contraseña
            </Button>

            {/* Botón para guardar cambios */}
            <Button
                variant="primary"
                onClick={handleUpdateUser}
                disabled={loading}
            >
                Guardar Cambios
            </Button>
        </div>

        {/* Campos para cambiar la contraseña */}
        {showPasswordFields && (
            <>
                <Form.Group className="mb-3">
                    <Form.Label>Nueva Contraseña</Form.Label>
                    <Form.Control
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Confirmar Contraseña</Form.Label>
                    <Form.Control
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </Form.Group>
                <Button
                    variant="primary"
                    onClick={handleChangePassword}
                    disabled={loading}
                >
                    Actualizar Contraseña
                </Button>
            </>
        )}
    </Form>
</div>
    );
};

export default UserPersonalData;