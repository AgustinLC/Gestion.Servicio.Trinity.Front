import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { Unit } from "../../../core/models/dto/Unit";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";

interface AddEditModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (unit: Unit) => Promise<void>;
    unit?: Unit | any;
}

const AddEditUnitModal: React.FC<AddEditModalProps> = ({ show, onHide, onSave, unit }) => {

    // Estados
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Props para manejar formulario 
    const { register, handleSubmit, reset, formState: { errors } } = useForm<Unit>({
        defaultValues: unit || {},
    });

    // Manejo del botón de "Guardar"
    const onSubmit = async (data: Unit) => {
        setIsSubmitting(true);
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
        <Modal show={show} onHide={onHide} centered contentClassName="form-modal-content" aria-labelledby="unit-modal-title">
            <FormModalHeader
                icon="bi bi-rulers"
                title={unit ? "Editar Unidad" : "Añadir Unidad"}
                onClose={onHide}
                titleId="unit-modal-title"
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
                        <Form.Label>Simbolo</Form.Label>
                        <Form.Control
                            {...register("symbol", { required: "Este campo es obligatorio" })}
                            isInvalid={!!errors.symbol}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.symbol?.message}
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
        </Modal>
    );
};

export default AddEditUnitModal;