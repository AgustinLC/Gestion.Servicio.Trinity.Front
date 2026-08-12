import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { BillingParameter } from "../../../core/models/dto/BillingParameter";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";
import FloatingFieldset from "../../../shared/components/floating-fieldset/FloatingFieldset";
import CustomSelect from "../../../shared/components/custom-select/CustomSelect";
import { combineRules, requiredRule, minValueRule } from "../../../core/utils/formValidationRules";
import { useModalLayer } from "../../../context/ModalStackContext";

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
}

// Contenido real del formulario, separado en su propio componente para que
// solo se monte mientras el modal está abierto (ver más abajo, "{show &&
// <BillingParameterForm .../>}"). Así useForm() arranca de cero cada vez que
// se abre: ni los valores tipeados ni los errores de la sesión anterior
// pueden quedar pisados, porque el componente entero (y su estado) es nuevo.
const BillingParameterForm: React.FC<BillingParameterFormProps> = ({ onHide, onSave, billingParameter }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<BillingParameter>({
        defaultValues: billingParameter || {},
        // Valida al salir por primera vez del campo y, desde entonces, vuelve a
        // validar cada cambio. Así un CustomSelect limpia su error al seleccionar
        // una opción, sin requerir otro click fuera del control.
        mode: "onTouched",
    });

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
                        {...register("name", { required: "Este campo es obligatorio" })}
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
                        {...register("description", { required: "Este campo es obligatorio" })}
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
                        {...register("value", combineRules(requiredRule(), minValueRule(0.01, "El importe debe ser mayor a 0")))}
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
    const modalZIndex = useModalLayer(show);

    return (
        <Modal show={show} onHide={onHide} centered backdrop={false} style={{ zIndex: modalZIndex }} contentClassName="form-modal-content" aria-labelledby="billing-parameter-modal-title">
            <FormModalHeader
                icon="bi bi-receipt"
                title={billingParameter ? "Editar Parametro" : "Añadir Parametro"}
                onClose={onHide}
                titleId="billing-parameter-modal-title"
            />
            <Modal.Body>
                {show && <BillingParameterForm onHide={onHide} onSave={onSave} billingParameter={billingParameter} />}
            </Modal.Body>
        </Modal>
    );
};

export default AddEditBillingParameterModal;
