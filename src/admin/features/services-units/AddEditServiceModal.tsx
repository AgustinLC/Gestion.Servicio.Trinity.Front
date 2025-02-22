import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { Service } from "../../../core/models/dto/Service";

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
        <Modal show={show} onHide={onHide} aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title>{service ? "Editar Service" : "Añadir Service"}</Modal.Title>
            </Modal.Header>
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
                    <Button className="mt-2" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Guardando..." : "Guardar"}
                    </Button>
                    <Button className="mt-2 ms-2" variant="secondary" onClick={onHide} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddEditUnitModal;