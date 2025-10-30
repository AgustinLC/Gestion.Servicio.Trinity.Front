import { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { getData, addData } from "../../../core/services/apiService";
import { DiscountDto } from "../../../core/models/dto/Discount";
import { UserDto } from "../../../core/models/dto/UserDto";

interface AddDiscountModalProps {
    show: boolean;
    onHide: () => void;
    user: UserDto;
    onAssigned?: () => void; // callback para que el padre recargue la lista
}

const AddDiscountModal: React.FC<AddDiscountModalProps> = ({ show, onHide, user, onAssigned }) => {
    const [allDiscounts, setAllDiscounts] = useState<DiscountDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [selectedDiscountId, setSelectedDiscountId] = useState<number | null>(null);

    useEffect(() => {
        if (show) fetchAllDiscounts();
        else {
            // limpiar selección cuando se cierre
            setSelectedDiscountId(null);
        }
    }, [show]);

    // Obtener todos los descuentos
    const fetchAllDiscounts = async () => {
        setLoading(true);
        try {
            const data = await getData<DiscountDto[]>("/operator/discounts");
            // Aseguramos que sea array
            setAllDiscounts(Array.isArray(data) ? data : (data ? [data] : []));
        } catch (err) {
            console.error("Error fetching discounts:", err);
            toast.error("No se pudieron obtener los descuentos disponibles");
        } finally {
            setLoading(false);
        }
    };

    // Asignar un descuento
    const handleAssign = async () => {
        if (!selectedDiscountId) {
            toast.warn("Seleccioná un descuento primero");
            return;
        }

        setAssigning(true);
        try {
            await addData("/operator/register-userDiscount", {
                idUser: user.idUser,
                idDiscount: selectedDiscountId,
            });

            toast.success("Descuento asignado correctamente");
            onAssigned?.(); // recarga la lista de descuentos
            onHide();
        } catch (err) {
            console.error("Error assigning discount:", err);
            toast.error("No se pudo asignar el descuento");
        } finally {
            setAssigning(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Asignar descuento a {user.firstName} {user.lastName}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {loading ? (
                    <div className="text-center py-3">
                        <Spinner animation="border" />
                        <div className="mt-2">Cargando descuentos disponibles...</div>
                    </div>
                ) : (
                    <>
                        <Form.Group>
                            <Form.Label>Seleccioná un descuento</Form.Label>
                            <Form.Select
                                value={selectedDiscountId ?? ""}
                                onChange={(e) => setSelectedDiscountId(e.target.value ? Number(e.target.value) : null)}
                            >
                                <option value="">-- Seleccionar --</option>
                                {allDiscounts.map((d) => (
                                    <option key={d.idDiscount} value={d.idDiscount}>
                                        {d.name} — {d.description} — ${d.amount}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {selectedDiscountId && (
                            <div className="mt-3">
                                <strong>Detalles del descuento seleccionado:</strong>
                                <div className="mt-1">
                                    {allDiscounts.find((d) => d.idDiscount === selectedDiscountId)?.description}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={assigning}>
                    Cancelar
                </Button>
                <Button variant="success" onClick={handleAssign} disabled={assigning || loading}>
                    {assigning ? "Asignando..." : "Asignar descuento"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddDiscountModal;
