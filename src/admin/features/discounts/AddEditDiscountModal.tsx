import { Button, Form, Modal } from "react-bootstrap";
import { DiscountDto } from "../../../core/models/dto/Discount";
import { useState } from "react";
import { useForm } from "react-hook-form";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";

interface AddEditModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (discount: DiscountDto) => Promise<void>;
    discount?: DiscountDto | any;
}

const AddEditDiscountModal: React.FC<AddEditModalProps> = ({ show, onHide, onSave, discount }) => {

    // Estados
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Props para manejar el mdoal 
    const { register, handleSubmit, formState: { errors }, reset } = useForm<DiscountDto>({
        defaultValues: discount || {},
    });

    // Manejo del botón de "Guardar"
    const onSubmit = async (data: DiscountDto) => {
        setIsSubmitting(true); // Desactivar el botón
        try {
            await onSave(data);
            reset();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered contentClassName="form-modal-content" aria-labelledby="discount-modal-title">
            <FormModalHeader
                icon="bi bi-plus-slash-minus"
                title={discount ? "Editar Descuento" : "Añadir Descuento"}
                onClose={onHide}
                titleId="discount-modal-title"
            />
            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Form.Group>
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            {...register("name", { required: "Este campo es obligatorio" })}
                            isInvalid={!!errors.name}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.name?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                            {...register("description", { required: "Este campo es obligatorio" })}
                            isInvalid={!!errors.description}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.description?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Precio</Form.Label>
                        <Form.Control
                            {...register("amount", { required: "Este campo es obligatorio" })}
                            isInvalid={!!errors.amount}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.amount?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Condición</Form.Label>
                        <Form.Select
                            {...register("applyCondition", { required: "Este campo es obligatorio" })}
                            isInvalid={!!errors.applyCondition}
                        >
                            <option value="FIXED">Fijo</option>
                            <option value="MANUAL">Manual</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errors.applyCondition?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <div className="form-modal-footer d-flex justify-content-end gap-2 mt-3">
                        <Button variant="outline-secondary" onClick={onHide} disabled={isSubmitting}>
                            <i className="bi bi-x-circle me-1"></i> Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            <i className="bi bi-save me-1"></i> {isSubmitting ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal >
    );
}

export default AddEditDiscountModal;