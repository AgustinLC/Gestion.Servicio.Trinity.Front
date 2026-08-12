import { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { getData, addData } from "../../../core/services/apiService";
import { DiscountDto } from "../../../core/models/dto/Discount";
import { UserDto } from "../../../core/models/dto/UserDto";
import { ApplyCondition } from "../../../core/models/dto/ApplyCondition";
import applyConditionLabels from "../../../shared/components/labels-traductor/applyConditionLabels";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";
import FloatingFieldset from "../../../shared/components/floating-fieldset/FloatingFieldset";
import CustomSelect from "../../../shared/components/custom-select/CustomSelect";
import { useModalLayer } from "../../../context/ModalStackContext";

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
    const modalZIndex = useModalLayer(show);

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
    const handleDiscountChange = (value: string) => {
        const selectedId = parseInt(value);
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
        <Modal show={show} onHide={onHide} centered backdrop={false} style={{ zIndex: modalZIndex }} contentClassName="form-modal-content" aria-labelledby="add-discount-modal-title">
            <FormModalHeader
                icon="bi bi-plus-slash-minus"
                title="Agregar Descuento"
                onClose={onHide}
                titleId="add-discount-modal-title"
            />

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
                            <FloatingFieldset label="Descuento">
                                <CustomSelect
                                    value={selectedDiscountId ? String(selectedDiscountId) : ""}
                                    onChange={handleDiscountChange}
                                    options={allDiscounts.map((d) => ({
                                        value: String(d.idDiscount),
                                        label: `${d.name} - ${applyConditionLabels[d.applyCondition]}`,
                                    }))}
                                />
                            </FloatingFieldset>
                        </Form.Group>

                        {/* Input numérico para el importe */}
                        {selectedDiscountId && (
                            <Form.Group controlId="discountAmount" className="mb-3">
                                <FloatingFieldset label="Importe" prefix="$">
                                    <Form.Control
                                        type="number"
                                        min="0.01"
                                        max="9999999"
                                        value={amount}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        disabled={isFixed || !selectedDiscountId}
                                        isInvalid={amount <= 0}
                                    />
                                </FloatingFieldset>
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

                <div className="form-modal-footer d-flex justify-content-end gap-2 mt-3">
                    <Button variant="outline-secondary" onClick={onHide} disabled={assigning}>
                        <i className="bi bi-x-circle me-1"></i> Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleAssign} disabled={assigning || loading || !selectedDiscountId}>
                        <i className="bi bi-save me-1"></i> {assigning ? "Guardando..." : "Guardar"}
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default AddDiscountModal;
