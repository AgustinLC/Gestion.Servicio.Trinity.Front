import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { FaqDto } from "../../../core/models/dto/FaqDto";

interface AddEditModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (faq: FaqDto) => Promise<void>;
    faq?: FaqDto | any;
}

const AddEditFaqModal: React.FC<AddEditModalProps> = ({ show, onHide, onSave, faq }) => {

    // Estados
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Props para manejar formulario 
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FaqDto>({
        defaultValues: faq || {},
    });

    // Manejo del botón de "Guardar"
    const onSubmit = async (data: FaqDto) => {
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
        <Modal show={show} onHide={onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title>{faq ? "Editar Faq" : "Añadir Faq"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Form.Group>
                        <Form.Label>Pregunta</Form.Label>
                        <Form.Control
                            {...register("question", { required: "Este campo es obligatorio" })}
                            isInvalid={!!errors.question}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.question?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Respuesta</Form.Label>
                        <Form.Control
                            {...register("answer", { required: "Este campo es obligatorio" })}
                            isInvalid={!!errors.answer}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.answer?.message}
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

export default AddEditFaqModal;