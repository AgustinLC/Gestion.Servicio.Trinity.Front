import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { BillingParameter } from "../../../core/models/dto/BillingParameter";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";
import FloatingFieldset from "../../../shared/components/floating-fieldset/FloatingFieldset";
import CustomSelect from "../../../shared/components/custom-select/CustomSelect";
import { useModalLayer } from "../../../context/ModalStackContext";

interface AddEditModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (billingParameter: BillingParameter) => Promise<void>;
    billingParameter?: BillingParameter | any;
}

const AddEditBillingParameterModal: React.FC<AddEditModalProps> = ({ show, onHide, onSave, billingParameter }) => {

    // Estados
    const [isSubmitting, setIsSubmitting] = useState(false);
    const modalZIndex = useModalLayer(show);

    // Props para manejar formulario 
    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<BillingParameter>({
        defaultValues: billingParameter || {},
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
        <Modal show={show} onHide={onHide} centered backdrop={false} style={{ zIndex: modalZIndex }} contentClassName="form-modal-content" aria-labelledby="billing-parameter-modal-title">
            <FormModalHeader
                icon="bi bi-receipt"
                title={billingParameter ? "Editar Parametro" : "Añadir Parametro"}
                onClose={onHide}
                titleId="billing-parameter-modal-title"
            />
            <Modal.Body>
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
                                {...register("value", { required: "Este campo es obligatorio" })}
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
            </Modal.Body>
        </Modal>
    );
};

export default AddEditBillingParameterModal;