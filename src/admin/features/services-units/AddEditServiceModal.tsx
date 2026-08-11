import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { Service } from "../../../core/models/dto/Service";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";
import FloatingFieldset from "../../../shared/components/floating-fieldset/FloatingFieldset";
import { useModalLayer } from "../../../context/ModalStackContext";

interface AddEditModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (service: Service) => Promise<void>;
    service?: Service | any;
}

interface ServiceFormProps {
    onHide: () => void;
    onSave: (service: Service) => Promise<void>;
    service?: Service | any;
}

// Contenido real del formulario, separado en su propio componente para que
// solo se monte mientras el modal está abierto (ver más abajo, "{show &&
// <ServiceForm .../>}"). Así useForm() arranca de cero cada vez que se abre:
// ni los valores tipeados ni los errores de la sesión anterior pueden
// quedar pisados, porque el componente entero (y su estado) es nuevo.
const ServiceForm: React.FC<ServiceFormProps> = ({ onHide, onSave, service }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<Service>({
        defaultValues: service || {},
        // Valida al salir por primera vez del campo y, desde entonces, vuelve a
        // validar cada cambio. Así un CustomSelect limpia su error al seleccionar
        // una opción, sin requerir otro click fuera del control.
        mode: "onTouched",
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
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group>
                <FloatingFieldset label="Nombre">
                    <Form.Control
                        {...register("name", { required: "Este campo es obligatorio" })}
                        isInvalid={!!errors.name}
                    />
                </FloatingFieldset>
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
    );
};

const AddEditUnitModal: React.FC<AddEditModalProps> = ({ show, onHide, onSave, service }) => {
    const modalZIndex = useModalLayer(show);

    return (
        <Modal show={show} onHide={onHide} centered backdrop={false} style={{ zIndex: modalZIndex }} contentClassName="form-modal-content" aria-labelledby="service-modal-title">
            <FormModalHeader
                icon="bi bi-gear"
                title={service ? "Editar Servicio" : "Añadir Servicio"}
                onClose={onHide}
                titleId="service-modal-title"
            />
            <Modal.Body>
                {show && <ServiceForm onHide={onHide} onSave={onSave} service={service} />}
            </Modal.Body>
        </Modal>
    );
};

export default AddEditUnitModal;
