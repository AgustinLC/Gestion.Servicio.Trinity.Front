import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { FeatureDto } from "../../../core/models/dto/FeatureDto";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";

interface AddEditModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (feature: FeatureDto) => Promise<void>;
    feature?: FeatureDto | any;
}

const AddEditFeatureModal: React.FC<AddEditModalProps> = ({ show, onHide, onSave, feature }) => {

    // Estados
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Props para manejar formulario 
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FeatureDto>({
        defaultValues: feature || {},
    });

    // Manejo del botón de "Guardar"
    const onSubmit = async (data: FeatureDto) => {
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
        <Modal show={show} onHide={onHide} centered contentClassName="form-modal-content" aria-labelledby="feature-modal-title">
            <FormModalHeader
                icon="bi bi-file-break"
                title={feature ? "Editar Función" : "Añadir Función"}
                onClose={onHide}
                titleId="feature-modal-title"
            />
            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Form.Group>
                        <Form.Label>Funcionalidad</Form.Label>
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

export default AddEditFeatureModal;