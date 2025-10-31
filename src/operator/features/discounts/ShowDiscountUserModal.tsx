import { useEffect, useState } from "react";
import { Modal, Button, Table, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { getData, deleteData } from "../../../core/services/apiService";
import { UserDto } from "../../../core/models/dto/UserDto";
import AddDiscountModal from "./AddDiscountModal";
import { UserDiscountDto } from "../../../core/models/dto/UserDiscountDto";
import ConfirmModal from "../../../shared/components/confirm/ConfirmModal";

interface ShowDiscountUserModalProps {
    show: boolean;
    onHide: () => void;
    user: UserDto;
}

const ShowDiscountUserModal: React.FC<ShowDiscountUserModalProps> = ({ show, onHide, user }) => {

    const [userDiscounts, setUserDiscounts] = useState<UserDiscountDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [discountToDelete, setDiscountToDelete] = useState<number | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (show) fetchDiscounts();
    }, [show]);

    // Obtener descuentos de un usuario
    const fetchDiscounts = async () => {
        setLoading(true);
        try {
            const data = await getData<UserDiscountDto[]>(`/operator/userDiscount/${user.idUser}`);
            setUserDiscounts(data);
        } catch {
            toast.error("Error al obtener los descuentos");
        } finally {
            setLoading(false);
        }
    };

    // Funcion para mostrar el modal de confirmación de eliminacion
    const handleDeleteClick = (idUserDiscount: number) => {
        setDiscountToDelete(idUserDiscount);
        setShowConfirmModal(true);
    };

    // Funcion para eliminar un desceunto de un usuario
    const handleDelete = async () => {
        if (!discountToDelete) return;
        setIsDeleting(true);
        try {
            await deleteData("/operator/delete-userDiscount?idUserDiscount", discountToDelete);
            toast.success("Descuento eliminado");
            fetchDiscounts();
        } catch {
            toast.error("Error al eliminar el descuento");
        } finally {
            setIsDeleting(false);
            setShowConfirmModal(false);
            setDiscountToDelete(null);
        };
    }

    return (
        <>
            <Modal show={show} onHide={onHide} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Descuentos de {user.firstName} {user.lastName}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loading ? (
                        <div className="text-center py-3">
                            <Spinner animation="border" />
                            <p className="mt-2">Cargando descuentos...</p>
                        </div>
                    ) : userDiscounts.length === 0 ? (
                        <p className="text-center">No hay descuentos registrados.</p>
                    ) : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Monto</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userDiscounts.map((userDiscount) => (
                                    <tr key={userDiscount.idDiscount}>
                                        <td>{userDiscount.idDiscount}</td>
                                        <td>{userDiscount.name}</td>
                                        <td>{userDiscount.description}</td>
                                        <td>{userDiscount.amount}</td>
                                        <td>
                                            <Button variant="danger" onClick={() => handleDeleteClick(userDiscount.idUserDiscount)}>
                                                Eliminar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={() => setShowAddModal(true)}>
                        + Añadir descuento
                    </Button>
                    <Button variant="secondary" onClick={onHide}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de confirmación */}
            <ConfirmModal
                show={showConfirmModal}
                onHide={() => { setShowConfirmModal(false); setDiscountToDelete(null); }}
                title="Confirmar eliminación"
                message={
                    <>
                        ¿Estás seguro que deseas eliminar el concepto:
                    </>
                }
                confirmText="Confirmar"
                isLoading={isDeleting}
                onConfirm={handleDelete}
            />

            <AddDiscountModal
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                user={user}
                onAssigned={() => fetchDiscounts()}
            />
        </>
    );
};

export default ShowDiscountUserModal;