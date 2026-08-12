import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { FaqDto } from "../../../core/models/dto/FaqDto";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";
import FloatingFieldset from "../../../shared/components/floating-fieldset/FloatingFieldset";
import { useModalLayer } from "../../../context/ModalStackContext";
import { combineRules, requiredRule, maxLengthRule } from "../../../core/utils/formValidationRules";

interface AddEditModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (faq: FaqDto) => Promise<void>;
    faq?: FaqDto | any;
}

interface FaqFormProps {
    onHide: () => void;
    onSave: (faq: FaqDto) => Promise<void>;
    faq?: FaqDto | any;
}

// Contenido real del formulario, separado en su propio componente para que
// solo se monte mientras el modal está abierto (ver más abajo, "{show &&
// <FaqForm .../>}"). Así useForm() arranca de cero cada vez que se abre: ni
// los valores tipeados ni los errores de la sesión anterior pueden quedar
// pisados, porque el componente entero (y su estado) es nuevo.
const FaqForm: React.FC<FaqFormProps> = ({ onHide, onSave, faq }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FaqDto>({
        defaultValues: faq || {},
        // Valida al salir por primera vez del campo y, desde entonces, vuelve a
        // validar cada cambio. Así un CustomSelect limpia su error al seleccionar
        // una opción, sin requerir otro click fuera del control.
        mode: "onTouched",
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
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group>
                <FloatingFieldset label="Pregunta"><Form.Control
                    {...register("question", combineRules(requiredRule(), maxLengthRule(200)))}
                    isInvalid={!!errors.question}
                /></FloatingFieldset>
                <Form.Control.Feedback type="invalid">
                    {errors.question?.message}
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
                <FloatingFieldset label="Respuesta"><Form.Control
                    {...register("answer", combineRules(requiredRule(), maxLengthRule(500)))}
                    isInvalid={!!errors.answer}
                /></FloatingFieldset>
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
    );
};

const AddEditFaqModal: React.FC<AddEditModalProps> = ({ show, onHide, onSave, faq }) => {
    const modalZIndex = useModalLayer(show);

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop={false} style={{ zIndex: modalZIndex }} contentClassName="form-modal-content" aria-labelledby="faq-modal-title">
            <FormModalHeader
                icon="bi bi-question-circle"
                title={faq ? "Editar Faq" : "Añadir Faq"}
                onClose={onHide}
                titleId="faq-modal-title"
            />
            <Modal.Body>
                {show && <FaqForm onHide={onHide} onSave={onSave} faq={faq} />}
            </Modal.Body>
        </Modal>
    );
};

export default AddEditFaqModal;
