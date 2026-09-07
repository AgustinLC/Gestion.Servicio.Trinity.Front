import { useEffect, useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { BillingParameter } from "../../../core/models/dto/BillingParameter";
import { PendigBillDetail } from "../../../core/models/dto/PendingBillDetail";
import { useForm, Controller } from "react-hook-form";
import applyConditionLabels from "../../../shared/components/labels-traductor/applyConditionLabels";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";
import FloatingFieldset from "../../../shared/components/floating-fieldset/FloatingFieldset";
import CustomSelect from "../../../shared/components/custom-select/CustomSelect";
import ConfirmModal from "../../../shared/components/confirm/ConfirmModal";
import { useModalLayer } from "../../../context/ModalStackContext";
import { useConfirmDiscard, onBackdropClick } from "../../../shared/hooks/useConfirmDiscard";
import { withNonNegativeGuard } from "../../../core/utils/numberInput";

interface AddParameterModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (pendigBillDetail: PendigBillDetail) => Promise<void>;
    parameters: BillingParameter[];
}

interface ParameterFormProps {
    onHide: () => void;
    onSave: (pendigBillDetail: PendigBillDetail) => Promise<void>;
    parameters: BillingParameter[];
    onDirtyChange: (dirty: boolean) => void;
}

const ParameterForm: React.FC<ParameterFormProps> = ({ onHide, onSave, parameters, onDirtyChange }) => {
    // Estados
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Props para manejar formulario
    // Hay que pasarle a useForm un valor (aunque sea vacío) para cada campo
    // registrado: si falta una clave, RHF compara ese campo contra
    // `undefined` en vez de contra el valor real que va a tener el input, y
    // marca el formulario como "sucio" (isDirty) desde el primer render
    // aunque no se haya tocado nada. "value" usa valueAsNumber, así que un
    // input vacío se lee como NaN (no ""), y el default tiene que matchear
    // eso — si no, nunca hay igualdad y queda "sucio" para siempre.
    const { register, handleSubmit, reset, watch, setValue, control, formState: { errors, isDirty }, } = useForm<PendigBillDetail>({
        defaultValues: { idBillingParameter: "" as unknown as number, value: NaN },
        mode: "onTouched",
    });

    useEffect(() => {
        onDirtyChange(isDirty);
        return () => onDirtyChange(false);
    }, [isDirty, onDirtyChange]);

    const selectedParameterId = watch("idBillingParameter");

    const handleParameterChange = (value: string) => {
        const selectedId = parseInt(value);
        const selectedParameter = parameters.find(param => param.idBillingParameter === selectedId);
        if (selectedParameter) {
            setValue("idBillingParameter", selectedParameter.idBillingParameter, { shouldValidate: true });
            setValue("value", selectedParameter.value, { shouldValidate: true }); 
        }
    };

    // Manejo del botón de "Guardar"
    const onSubmit = async (data: PendigBillDetail) => {
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
            {/* Selector de parámetros */}
            <Form.Group controlId="parameterSelect" className="mb-3">
                <Controller
                    control={control}
                    name="idBillingParameter"
                    rules={{ required: "Este campo es obligatorio" }}
                    render={({ field }) => (
                        <FloatingFieldset label="Concepto">
                            <CustomSelect
                                value={field.value ? String(field.value) : ""}
                                onChange={handleParameterChange}
                                onBlur={field.onBlur}
                                isInvalid={!!errors.idBillingParameter}
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
                        min={0.01}
                        {...withNonNegativeGuard(register("value", {
                            required: "Este campo es obligatorio",
                            valueAsNumber: true,
                            min: { value: 0.01, message: "El importe debe ser mayor a 0" },
                            max: { value: 9999999, message: "El valor no puede superar 9999999" },
                        }))}
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
    );
};

const AddParameterModal: React.FC<AddParameterModalProps> = ({ show, onHide, onSave, parameters }) => {
    const { requestClose, showConfirm, confirmDiscard, cancelDiscard, setIsDirty } = useConfirmDiscard({ onHide, alwaysConfirm: false });
    const modalZIndex = useModalLayer(show);

    return (
        <>
            <Modal show={show} onHide={requestClose} onClick={onBackdropClick(requestClose)} centered backdrop backdropClassName="modal-click-backdrop" style={{ zIndex: modalZIndex }} contentClassName="form-modal-content" aria-labelledby="add-parameter-modal-title">
                <FormModalHeader
                    icon="bi bi-journal-plus"
                    title="Agregar Concepto"
                    onClose={requestClose}
                    titleId="add-parameter-modal-title"
                />
                <Modal.Body>
                    {show && <ParameterForm onHide={requestClose} onSave={onSave} parameters={parameters} onDirtyChange={setIsDirty} />}
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

export default AddParameterModal;
