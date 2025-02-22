import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { Unit } from "../../../core/models/dto/Unit";

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
        <Modal show={show} onHide={onHide} aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title>{unit ? "Editar Unidad" : "Añadir Unidad"}</Modal.Title>
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