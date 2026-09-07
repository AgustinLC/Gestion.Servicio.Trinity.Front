import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import FormModalHeader from "../../../../shared/components/form-modal-header/FormModalHeader";
import FloatingFieldset from "../../../../shared/components/floating-fieldset/FloatingFieldset";
import AppDatePicker from "../../../../shared/components/date-picker/AppDatePicker";
import ConfirmModal from "../../../../shared/components/confirm/ConfirmModal";
import { useModalLayer } from "../../../../context/ModalStackContext";
import { useConfirmDiscard, onBackdropClick } from "../../../../shared/hooks/useConfirmDiscard";
import { withNonNegativeGuard } from "../../../../core/utils/numberInput";

// Interfaces/modelos
interface AddReadingModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (date: string, readingValue: number) => Promise<void>;
}

interface ReadingForm {
    date: string;
    readingValue: number;
}

interface ReadingFormProps {
    onHide: () => void;
    onSave: (date: string, readingValue: number) => Promise<void>;
    onDirtyChange: (dirty: boolean) => void;
}

// Contenido real del formulario, separado en su propio componente para que
// solo se monte mientras el modal está abierto (ver más abajo, "{show &&
// <ReadingFormContent .../>}"). Así useForm() arranca de cero cada vez que
// se abre: ni los valores tipeados ni los errores de la sesión anterior
// pueden quedar pisados, porque el componente entero (y su estado) es nuevo.
const ReadingFormContent: React.FC<ReadingFormProps> = ({ onHide, onSave, onDirtyChange }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Valida al salir por primera vez del campo y, desde entonces, vuelve a
    // validar cada cambio. Así un CustomSelect limpia su error al seleccionar
    // una opción, sin requerir otro click fuera del control.
    // Hay que pasarle a useForm un valor (aunque sea vacío) para cada campo
    // registrado: si falta una clave, RHF compara ese campo contra
    // `undefined` en vez de contra el string vacío que en realidad tiene el
    // input, y marca el formulario como "sucio" (isDirty) desde el primer
    // render aunque no se haya tocado nada.
    const { register, control, handleSubmit, formState: { errors, isDirty }, reset, } = useForm<ReadingForm>({
        defaultValues: { date: "", readingValue: "" as unknown as number },
        mode: "onTouched",
    });

    useEffect(() => {
        onDirtyChange(isDirty);
        return () => onDirtyChange(false);
    }, [isDirty, onDirtyChange]);

    //Manejo del boton guardar
    const onSubmit = async (data: ReadingForm) => {
        setIsSubmitting(true);
        try {
            await onSave(data.date, data.readingValue);
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
                <Controller
                    name="date"
                    control={control}
                    rules={{ required: "La fecha es obligatoria" }}
                    render={({ field }) => (
                        <FloatingFieldset label="Fecha">
                            <AppDatePicker
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                isInvalid={!!errors.date}
                            />
                        </FloatingFieldset>
                    )}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.date?.message}
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
                <FloatingFieldset label="Valor de Lectura">
                    <Form.Control
                        type="number"
                        min={0}
                        {...withNonNegativeGuard(register("readingValue", {
                            required: "El valor de lectura es obligatorio",
                            min: { value: 0, message: "El valor debe ser mayor o igual a 0" },
                            max: { value: 9999999, message: "El valor no puede superar 9999999" },
                        }))}
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

const AddReadingModal: React.FC<AddReadingModalProps> = ({ show, onHide, onSave }) => {
    const { requestClose, showConfirm, confirmDiscard, cancelDiscard, setIsDirty } = useConfirmDiscard({ onHide, alwaysConfirm: false });
    const modalZIndex = useModalLayer(show);

    return (
        <>
            <Modal show={show} onHide={requestClose} onClick={onBackdropClick(requestClose)} centered backdrop backdropClassName="modal-click-backdrop" style={{ zIndex: modalZIndex }} contentClassName="form-modal-content" aria-labelledby="add-reading-modal-title">
                <FormModalHeader
                    icon="bi bi-speedometer2"
                    title="Cargar Lectura"
                    onClose={requestClose}
                    titleId="add-reading-modal-title"
                />
                <Modal.Body>
                    {show && <ReadingFormContent onHide={requestClose} onSave={onSave} onDirtyChange={setIsDirty} />}
                </Modal.Body>
            </Modal>
            <ConfirmModal
                show={showConfirm}
                onHide={cancelDiscard}
                variant="warning"
                title="¿Descartar cambios?"
                message="Si cerrás ahora vas a perder los cambios que hiciste en este formulario."
                hint="Esta acción no se puede deshacer."
                confirmText="Salir sin guardar"
                confirmIcon="bi bi-box-arrow-right"
                onConfirm={confirmDiscard}
            />
        </>
    );
};

export default AddReadingModal;
