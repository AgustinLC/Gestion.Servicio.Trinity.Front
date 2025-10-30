import { useEffect, useState } from "react";
import { Modal, Button, Table, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { getData, deleteData } from "../../../core/services/apiService";
import { UserDto } from "../../../core/models/dto/UserDto";
import { DiscountDto } from "../../../core/models/dto/Discount";
import AddDiscountModal from "./AddDiscountModal";

interface ShowDiscountUserModalProps {
    show: boolean;
    onHide: () => void;
    user: UserDto;
}

const ShowDiscountUserModal: React.FC<ShowDiscountUserModalProps> = ({ show, onHide, user }) => {

    const [discounts, setDiscounts] = useState<DiscountDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        if (show) fetchDiscounts();
    }, [show]);

    // Obtener descuentos de un usuario
    const fetchDiscounts = async () => {
        setLoading(true);
        try {
            const data = await getData<DiscountDto[]>(`/operator/userDiscount/${user.idUser}`);
            setDiscounts(data);
        } catch {
            toast.error("Error al obtener los descuentos");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (idDiscount: number) => {
        if (!confirm("¿Seguro que deseas eliminar este descuento?")) return;
        try {
            await deleteData("/operator/discounts/", idDiscount);
            toast.success("Descuento eliminado");
            fetchDiscounts();
        } catch {
            toast.error("Error al eliminar el descuento");
        }
    };

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
                    ) : discounts.length === 0 ? (
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
                                {discounts.map((discount) => (
                                    <tr key={discount.idDiscount}>
                                        <td>{discount.idDiscount}</td>
                                        <td>{discount.name}</td>
                                        <td>{discount.description}</td>
                                        <td>{discount.amount}</td>
                                        <td>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => toast.info("Editar descuento próximamente")}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDelete(discount.idDiscount)}
                                            >
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
