import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { BillingParameter } from "../../../core/models/dto/BillingParameter";
import { PendigBillDetail } from "../../../core/models/dto/PendingBillDetail";
import { useForm, Controller } from "react-hook-form";
import applyConditionLabels from "../../../shared/components/labels-traductor/applyConditionLabels";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";
import FloatingFieldset from "../../../shared/components/floating-fieldset/FloatingFieldset";
import CustomSelect from "../../../shared/components/custom-select/CustomSelect";
import { useModalLayer } from "../../../context/ModalStackContext";

interface AddParameterModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (pendigBillDetail: PendigBillDetail) => Promise<void>;
    parameters: BillingParameter[];
}

const AddParameterModal: React.FC<AddParameterModalProps> = ({ show, onHide, onSave, parameters }) => {
    // Estados
    const [isSubmitting, setIsSubmitting] = useState(false);
    const modalZIndex = useModalLayer(show);

    // Props para manejar formulario
    const {register, handleSubmit, reset, watch, setValue, control, formState: { errors }, } = useForm<PendigBillDetail>({
        defaultValues: {},
    });

    // Observar el valor seleccionado en el selector de parámetros
    const selectedParameterId = watch("idBillingParameter");

    // Manejar cambio en el selector de parámetros
    const handleParameterChange = (value: string) => {
        const selectedId = parseInt(value);
        const selectedParameter = parameters.find(param => param.idBillingParameter === selectedId);
        if (selectedParameter) {
            setValue("idBillingParameter", selectedParameter.idBillingParameter);
            setValue("value", selectedParameter.value); // Establecer el valor predeterminado
        }
    };

    // Manejo del botón de "Guardar"
    const onSubmit = async (data: PendigBillDetail) => {
        setIsSubmitting(true);
        try {
            await onSave(data);
            reset(); 
            onHide();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop={false} style={{ zIndex: modalZIndex }} contentClassName="form-modal-content" aria-labelledby="add-parameter-modal-title">
            <FormModalHeader
                icon="bi bi-journal-plus"
                title="Agregar Concepto"
                onClose={onHide}
                titleId="add-parameter-modal-title"
            />
            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    {/* Selector de parámetros */}
                    <Form.Group controlId="parameterSelect" className="mb-3">
                        <Controller
                            control={control}
                            name="idBillingParameter"
                            rules={{ required: "Este campo es obligatorio" }}
                            render={({ field }) => (
                                <FloatingFieldset label="Seleccione un parámetro">
                                    <CustomSelect
                                        value={field.value ? String(field.value) : ""}
                                        onChange={handleParameterChange}
                                        onBlur={field.onBlur}
                                        isInvalid={!!errors.idBillingParameter}
                                        placeholder="Seleccione..."
                                        options={parameters.map((param) => ({
                                            value: String(param.idBillingParameter),
                                            label: `${param.name} - ${applyConditionLabels[param.applyCondition]}`,
                                        }))}
                                    />
                                </FloatingFieldset>
                            )}
                        />
                        {errors.idBillingParameter && (
                            <Form.Control.Feedback type="invalid">
                                {errors.idBillingParameter.message}
                            </Form.Control.Feedback>
                        )}
                    </Form.Group>

                    {/* Input numérico */}
                    <Form.Group controlId="parameterValue" className="mb-3">
                        <FloatingFieldset label="Importe" prefix="$">
                            <Form.Control
                                type="number"
                                {...register("value", {
                                    required: "Este campo es obligatorio",
                                    valueAsNumber: true,
                                })}
                                disabled={!selectedParameterId}
                                isInvalid={!!errors.value}
                            />
                        </FloatingFieldset>
                        <Form.Control.Feedback type="invalid">
                            {errors.value?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* Botones del modal */}
                    <div className="form-modal-footer d-flex justify-content-end gap-2 mt-3">
                        <Button variant="outline-secondary" onClick={onHide} disabled={isSubmitting}>
                            <i className="bi bi-x-circle me-1"></i> Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            <i className="bi bi-save me-1"></i> {isSubmitting ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddParameterModal;