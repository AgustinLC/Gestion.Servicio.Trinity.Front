import { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { getData, addData } from "../../../core/services/apiService";
import { DiscountDto } from "../../../core/models/dto/Discount";
import { UserDto } from "../../../core/models/dto/UserDto";
import { ApplyCondition } from "../../../core/models/dto/ApplyCondition";

interface AddDiscountModalProps {
    show: boolean;
    onHide: () => void;
    user: UserDto;
    discounts?: DiscountDto[]; // Descuentos pasados desde el padre
    onAssigned?: () => void; // callback para que el padre recargue la lista
}

const AddDiscountModal: React.FC<AddDiscountModalProps> = ({ show, onHide, user, discounts, onAssigned }) => {
    const [allDiscounts, setAllDiscounts] = useState<DiscountDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [selectedDiscountId, setSelectedDiscountId] = useState<number | null>(null);
    const [amount, setAmount] = useState<number>(0);

    useEffect(() => {
        if (show) {
            if (discounts && discounts.length > 0) {
                setAllDiscounts(discounts);
            } else {
                fetchAllDiscounts();
            }
        } else {
            // limpiar selección cuando se cierre
            setSelectedDiscountId(null);
            setAmount(0);
        }
    }, [show, discounts]);

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

    // Manejar cambio en el selector de descuentos
    const handleDiscountChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = parseInt(event.target.value);
        setSelectedDiscountId(selectedId || null);
        
        if (selectedId) {
            const selectedDiscount = allDiscounts.find(d => d.idDiscount === selectedId);
            if (selectedDiscount) {
                // Si es FIXED, establecer el amount y no permitir modificación
                // Si es MANUAL, establecer el amount por defecto pero permitir modificación
                setAmount(selectedDiscount.amount);
            }
        } else {
            setAmount(0);
        }
    };

    // Obtener el descuento seleccionado
    const selectedDiscount = selectedDiscountId 
        ? allDiscounts.find(d => d.idDiscount === selectedDiscountId)
        : null;

    // Verificar si el descuento es fijo
    const isFixed = selectedDiscount?.applyCondition === ApplyCondition.FIXED;

    // Asignar un descuento
    const handleAssign = async () => {
        if (!selectedDiscountId) {
            toast.warn("Seleccioná un descuento primero");
            return;
        }

        if (!amount || amount <= 0) {
            toast.warn("El importe debe ser mayor a 0");
            return;
        }

        setAssigning(true);
        try {
            await addData("/operator/register-userDiscount", {
                idUser: user.idUser,
                idDiscount: selectedDiscountId,
                amount: amount,
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
        <Modal show={show} onHide={onHide} aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title>Agregar Descuento</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {loading ? (
                    <div className="text-center py-3">
                        <Spinner animation="border" />
                        <div className="mt-2">Cargando descuentos disponibles...</div>
                    </div>
                ) : (
                    <>
                        {/* Selector de descuentos */}
                        <Form.Group controlId="discountSelect" className="mb-3">
                            <Form.Label>Seleccione un descuento</Form.Label>
                            <Form.Select
                                value={selectedDiscountId ?? ""}
                                onChange={handleDiscountChange}
                            >
                                <option value="">Seleccione...</option>
                                {allDiscounts.map((d) => (
                                    <option key={d.idDiscount} value={d.idDiscount}>
                                        {d.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {/* Input numérico para el importe */}
                        {selectedDiscountId && (
                            <Form.Group controlId="discountAmount" className="mb-3">
                                <Form.Label>Importe $</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    disabled={isFixed || !selectedDiscountId}
                                    isInvalid={amount <= 0}
                                />
                                {isFixed && (
                                    <Form.Text className="text-muted">
                                        Este descuento es fijo, el importe no se puede modificar.
                                    </Form.Text>
                                )}
                                <Form.Control.Feedback type="invalid">
                                    El importe debe ser mayor a 0
                                </Form.Control.Feedback>
                            </Form.Group>
                        )}
                    </>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={assigning}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleAssign} disabled={assigning || loading || !selectedDiscountId}>
                    {assigning ? "Guardando..." : "Guardar"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddDiscountModal;
