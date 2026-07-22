import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { FaqDto } from "../../../core/models/dto/FaqDto";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";

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
        <Modal show={show} onHide={onHide} size="lg" centered contentClassName="form-modal-content" aria-labelledby="faq-modal-title">
            <FormModalHeader
                icon="bi bi-question-circle"
                title={faq ? "Editar Faq" : "Añadir Faq"}
                onClose={onHide}
                titleId="faq-modal-title"
            />
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

export default AddEditFaqModal;