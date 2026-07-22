import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { Service } from "../../../core/models/dto/Service";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";

interface AddEditModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (service: Service) => Promise<void>;
    service?: Service | any;
}

const AddEditUnitModal: React.FC<AddEditModalProps> = ({ show, onHide, onSave, service }) => {

    // Estados
    const [isSubmitting, setIsSubmitting] = useState(false); 

    // Props para manejar formulario 
    const { register, handleSubmit, reset, formState: { errors } } = useForm<Service>({
        defaultValues: service || {},
    });

    // Manejo del botón de "Guardar"
    const onSubmit = async (data: Service) => {
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
        <Modal show={show} onHide={onHide} centered contentClassName="form-modal-content" aria-labelledby="service-modal-title">
            <FormModalHeader
                icon="bi bi-gear"
                title={service ? "Editar Servicio" : "Añadir Servicio"}
                onClose={onHide}
                titleId="service-modal-title"
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