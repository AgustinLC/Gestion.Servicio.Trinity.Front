import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { FeatureDto } from "../../../core/models/dto/FeatureDto";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";
import FloatingFieldset from "../../../shared/components/floating-fieldset/FloatingFieldset";
import { useModalLayer } from "../../../context/ModalStackContext";
import { combineRules, requiredRule, maxLengthRule } from "../../../core/utils/formValidationRules";

interface AddEditModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (feature: FeatureDto) => Promise<void>;
    feature?: FeatureDto | any;
}

interface FeatureFormProps {
    onHide: () => void;
    onSave: (feature: FeatureDto) => Promise<void>;
    feature?: FeatureDto | any;
}

// Contenido real del formulario, separado en su propio componente para que
// solo se monte mientras el modal está abierto (ver más abajo, "{show &&
// <FeatureForm .../>}"). Así useForm() arranca de cero cada vez que se abre:
// ni los valores tipeados ni los errores de la sesión anterior pueden
// quedar pisados, porque el componente entero (y su estado) es nuevo.
const FeatureForm: React.FC<FeatureFormProps> = ({ onHide, onSave, feature }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FeatureDto>({
        defaultValues: feature || {},
        // Valida al salir por primera vez del campo y, desde entonces, vuelve a
        // validar cada cambio. Así un CustomSelect limpia su error al seleccionar
        // una opción, sin requerir otro click fuera del control.
        mode: "onTouched",
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
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group>
                <FloatingFieldset label="Funcionalidad">
                <Form.Control
                    {...register("name", combineRules(requiredRule(), maxLengthRule(60)))}
                    isInvalid={!!errors.name}
                />
                </FloatingFieldset>
                <Form.Control.Feedback type="invalid">
                    {errors.name?.message}
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
                <FloatingFieldset label="Descripción">
                <Form.Control
                    {...register("description", combineRules(requiredRule(), maxLengthRule(300)))}
                    isInvalid={!!errors.description}
                />
                </FloatingFieldset>
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
    );
};

const AddEditFeatureModal: React.FC<AddEditModalProps> = ({ show, onHide, onSave, feature }) => {
    const modalZIndex = useModalLayer(show);

    return (
        <Modal show={show} onHide={onHide} centered backdrop={false} style={{ zIndex: modalZIndex }} contentClassName="form-modal-content" aria-labelledby="feature-modal-title">
            <FormModalHeader
                icon="bi bi-file-break"
                title={feature ? "Editar Función" : "Añadir Función"}
                onClose={onHide}
                titleId="feature-modal-title"
            />
            <Modal.Body>
                {show && <FeatureForm onHide={onHide} onSave={onSave} feature={feature} />}
            </Modal.Body>
        </Modal>
    );
};

export default AddEditFeatureModal;
