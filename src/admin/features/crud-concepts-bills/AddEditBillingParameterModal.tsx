import { useEffect, useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { BillingParameter } from "../../../core/models/dto/BillingParameter";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";
import FloatingFieldset from "../../../shared/components/floating-fieldset/FloatingFieldset";
import CustomSelect from "../../../shared/components/custom-select/CustomSelect";
import ConfirmModal from "../../../shared/components/confirm/ConfirmModal";
import { combineRules, requiredRule, minValueRule, maxValueRule, maxLengthRule } from "../../../core/utils/formValidationRules";
import { useModalLayer } from "../../../context/ModalStackContext";
import { useConfirmDiscard, onBackdropClick } from "../../../shared/hooks/useConfirmDiscard";

interface AddEditModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (billingParameter: BillingParameter) => Promise<void>;
    billingParameter?: BillingParameter | any;
}

interface BillingParameterFormProps {
    onHide: () => void;
    onSave: (billingParameter: BillingParameter) => Promise<void>;
    billingParameter?: BillingParameter | any;
    onDirtyChange: (dirty: boolean) => void;
}

// Contenido real del formulario, separado en su propio componente para que
// solo se monte mientras el modal está abierto (ver más abajo, "{show &&
// <BillingParameterForm .../>}"). Así useForm() arranca de cero cada vez que
// se abre: ni los valores tipeados ni los errores de la sesión anterior
// pueden quedar pisados, porque el componente entero (y su estado) es nuevo.
const BillingParameterForm: React.FC<BillingParameterFormProps> = ({ onHide, onSave, billingParameter, onDirtyChange }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, control, formState: { errors, isDirty } } = useForm<BillingParameter>({
        defaultValues: billingParameter || {},
        // Valida al salir por primera vez del campo y, desde entonces, vuelve a
        // validar cada cambio. Así un CustomSelect limpia su error al seleccionar
        // una opción, sin requerir otro click fuera del control.
        mode: "onTouched",
    });

    useEffect(() => { onDirtyChange(isDirty); }, [isDirty, onDirtyChange]);

    // Manejo del botón de "Guardar"
    const onSubmit = async (data: BillingParameter) => {
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
            <Form.Group>
                <FloatingFieldset label="Importe" prefix="$">
                    <Form.Control
                        type="number"
                        {...register("value", combineRules(requiredRule(), minValueRule(0.01, "El importe debe ser mayor a 0"), maxValueRule(9999999)))}
                        isInvalid={!!errors.value}
                    />
                </FloatingFieldset>
                <Form.Control.Feedback type="invalid">
                    {errors.value?.message}
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
                <Controller
                    control={control}
                    name="applyCondition"
                    rules={{ required: "Este campo es obligatorio" }}
                    render={({ field }) => (
                        <FloatingFieldset label="Condición">
                            <CustomSelect
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                isInvalid={!!errors.applyCondition}
                                options={[
                                    { value: "MANUAL", label: "Manual" },
                                    { value: "CONDITIONAL", label: "Condicional" },
                                    { value: "FIXED", label: "Fijo" },
                                ]}
                            />
                        </FloatingFieldset>
                    )}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.applyCondition?.message}
                </Form.Control.Feedback>
            </Form.Group>
            {billingParameter && (
                <Form.Group>
                    <Controller
                        control={control}
                        name="status"
                        rules={{ required: "Este campo es obligatorio" }}
                        render={({ field }) => (
                            <FloatingFieldset label="Estado">
                                <CustomSelect
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    isInvalid={!!errors.status}
                                    options={[
                                        { value: "ACTIVE", label: "Activo" },
                                        { value: "INACTIVE", label: "Inactivo" },
                                    ]}
                                />
                            </FloatingFieldset>
                        )}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.applyCondition?.message}
                    </Form.Control.Feedback>
                </Form.Group>
            )}
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

const AddEditBillingParameterModal: React.FC<AddEditModalProps> = ({ show, onHide, onSave, billingParameter }) => {
    const { requestClose, showConfirm, confirmDiscard, cancelDiscard, setIsDirty } = useConfirmDiscard({ onHide, alwaysConfirm: !!billingParameter });
    const modalZIndex = useModalLayer(show);

    return (
        <>
            <Modal show={show} onHide={requestClose} onClick={onBackdropClick(requestClose)} centered backdrop backdropClassName="modal-click-backdrop" style={{ zIndex: modalZIndex }} contentClassName="form-modal-content" aria-labelledby="billing-parameter-modal-title">
                <FormModalHeader
                    icon="bi bi-receipt"
                    title={billingParameter ? "Editar Parametro" : "Añadir Parametro"}
                    onClose={requestClose}
                    titleId="billing-parameter-modal-title"
                />
                <Modal.Body>
                    {show && <BillingParameterForm onHide={requestClose} onSave={onSave} billingParameter={billingParameter} onDirtyChange={setIsDirty} />}
                </Modal.Body>
            </Modal>
            <ConfirmModal
                show={showConfirm}
                onHide={cancelDiscard}
                title="¿Descartar cambios?"
                message="Si cerrás ahora vas a perder los cambios que hiciste en este formulario."
                confirmVariant="danger"
                confirmText="Salir sin guardar"
                onConfirm={confirmDiscard}
            />
        </>
    );
};

export default AddEditBillingParameterModal;
