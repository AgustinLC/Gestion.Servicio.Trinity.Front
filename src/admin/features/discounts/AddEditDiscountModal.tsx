import { Button, Form, Modal } from "react-bootstrap";
import { DiscountDto } from "../../../core/models/dto/Discount";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";
import FloatingFieldset from "../../../shared/components/floating-fieldset/FloatingFieldset";
import CustomSelect from "../../../shared/components/custom-select/CustomSelect";
import { useModalLayer } from "../../../context/ModalStackContext";

interface AddEditModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (discount: DiscountDto) => Promise<void>;
    discount?: DiscountDto | any;
}

const AddEditDiscountModal: React.FC<AddEditModalProps> = ({ show, onHide, onSave, discount }) => {

    // Estados
    const [isSubmitting, setIsSubmitting] = useState(false);
    const modalZIndex = useModalLayer(show);

    // Props para manejar el mdoal 
    const { register, handleSubmit, control, formState: { errors }, reset } = useForm<DiscountDto>({
        defaultValues: discount || {},
    });

    // Manejo del botón de "Guardar"
    const onSubmit = async (data: DiscountDto) => {
        setIsSubmitting(true); // Desactivar el botón
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
        <Modal show={show} onHide={onHide} centered backdrop={false} style={{ zIndex: modalZIndex }} contentClassName="form-modal-content" aria-labelledby="discount-modal-title">
            <FormModalHeader
                icon="bi bi-plus-slash-minus"
                title={discount ? "Editar Descuento" : "Añadir Descuento"}
                onClose={onHide}
                titleId="discount-modal-title"
            />
            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Form.Group>
                        <FloatingFieldset label="Nombre"><Form.Control
                            {...register("name", { required: "Este campo es obligatorio" })}
                            isInvalid={!!errors.name}
                        /></FloatingFieldset>
                        <Form.Control.Feedback type="invalid">
                            {errors.name?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group>
                        <FloatingFieldset label="Descripción"><Form.Control
                            {...register("description", { required: "Este campo es obligatorio" })}
                            isInvalid={!!errors.description}
                        /></FloatingFieldset>
                        <Form.Control.Feedback type="invalid">
                            {errors.description?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group>
                        <FloatingFieldset label="Precio"><Form.Control
                            {...register("amount", { required: "Este campo es obligatorio" })}
                            isInvalid={!!errors.amount}
                        /></FloatingFieldset>
                        <Form.Control.Feedback type="invalid">
                            {errors.amount?.message}
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
                                            { value: "FIXED", label: "Fijo" },
                                            { value: "MANUAL", label: "Manual" },
                                        ]}
                                    />
                                </FloatingFieldset>
                            )}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.applyCondition?.message}
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
        </Modal >
    );
}

export default AddEditDiscountModal;
