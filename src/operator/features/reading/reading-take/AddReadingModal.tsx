import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { getData } from "../../../../core/services/apiService";
import { toast } from "react-toastify";
import FormModalHeader from "../../../../shared/components/form-modal-header/FormModalHeader";
import FloatingFieldset from "../../../../shared/components/floating-fieldset/FloatingFieldset";
import { useModalLayer } from "../../../../context/ModalStackContext";

// Interfaces/modelos
interface AddReadingModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (readingValue: number) => Promise<void>;
    user: number;
}

interface ReadingForm {
    readingValue: number;
}

interface ReadingFormProps {
    onHide: () => void;
    onSave: (readingValue: number) => Promise<void>;
    lastReading: number;
}

// Contenido real del formulario, separado en su propio componente para que
// solo se monte mientras el modal está abierto (ver más abajo, "{show &&
// <ReadingFormContent .../>}"). Así useForm() arranca de cero cada vez que
// se abre: ni el valor tipeado ni los errores de la sesión anterior pueden
// quedar pisados, porque el componente entero (y su estado) es nuevo.
const ReadingFormContent: React.FC<ReadingFormProps> = ({ onHide, onSave, lastReading }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Valida al salir por primera vez del campo y, desde entonces, vuelve a
    // validar cada cambio. Así un CustomSelect limpia su error al seleccionar
    // una opción, sin requerir otro click fuera del control.
    const { register, handleSubmit, formState: { errors }, reset, } = useForm<ReadingForm>({ mode: "onTouched" });

    //Manejo del boton guardar
    const onSubmit = async (data: ReadingForm) => {
        setIsSubmitting(true);
        try {
            await onSave(data.readingValue);
            reset();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Label>
                Lectura anterior:{" "}
                <strong>
                    {lastReading !== null ? lastReading : "Sin lectura anterior"}
                </strong>
            </Form.Label>
            <Form.Group>
                <FloatingFieldset label="Valor de Lectura">
                    <Form.Control
                        type="number"
                        {...register("readingValue", {
                            required: "El valor de lectura es obligatorio",
                            min: { value: 0, message: "El valor debe ser mayor o igual a 0" },
                        })}
                        isInvalid={!!errors.readingValue}
                    />
                </FloatingFieldset>
                <Form.Control.Feedback type="invalid">
                    {errors.readingValue?.message}
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

const AddReadingModal: React.FC<AddReadingModalProps> = ({ show, onHide, onSave, user }) => {

    // Estados
    const [lastReading, setLastReading] = useState<number>(0)
    const modalZIndex = useModalLayer(show);

    useEffect(() => {
        const fetchLastReading = async () => {
            if (!user) return;
            try {
                const reading = await getData<number>(`/operator/reading/${user}`);
                setLastReading(reading);
            } catch (error) {
                console.error(error);
                toast.error("No se pudo obtener la última lectura");
            }
        };

        fetchLastReading();
    }, [user]);

    return (
        <Modal show={show} onHide={onHide} centered backdrop={false} style={{ zIndex: modalZIndex }} contentClassName="form-modal-content" aria-labelledby="add-reading-modal-title">
            <FormModalHeader
                icon="bi bi-speedometer2"
                title="Cargar Lectura"
                onClose={onHide}
                titleId="add-reading-modal-title"
            />
            <Modal.Body>
                {show && <ReadingFormContent onHide={onHide} onSave={onSave} lastReading={lastReading} />}
            </Modal.Body>
        </Modal>
    );
};

export default AddReadingModal;
