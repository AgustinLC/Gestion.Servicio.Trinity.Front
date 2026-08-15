import { useEffect, useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { FeeDto } from "../../../core/models/dto/FeeDto";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";
import FloatingFieldset from "../../../shared/components/floating-fieldset/FloatingFieldset";
import ConfirmModal from "../../../shared/components/confirm/ConfirmModal";
import { useModalLayer } from "../../../context/ModalStackContext";
import { useConfirmDiscard, onBackdropClick } from "../../../shared/hooks/useConfirmDiscard";
import { combineRules, requiredRule, minValueRule, maxValueRule, maxLengthRule } from "../../../core/utils/formValidationRules";

interface AddEditModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (fee: FeeDto) => Promise<void>;
    fee?: FeeDto | any;
}

interface FeeFormProps {
    onHide: () => void;
    onSave: (fee: FeeDto) => Promise<void>;
    fee?: FeeDto | any;
    onDirtyChange: (dirty: boolean) => void;
}

// Contenido real del formulario, separado en su propio componente para que
// solo se monte mientras el modal está abierto (ver más abajo, "{show &&
// <FeeForm .../>}"). Así useForm() arranca de cero cada vez que se abre: ni
// los valores tipeados ni los errores de la sesión anterior pueden quedar
// pisados, porque el componente entero (y su estado) es nuevo.
const FeeForm: React.FC<FeeFormProps> = ({ onHide, onSave, fee, onDirtyChange }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FeeDto>({
        // Hay que pasarle a useForm un valor (aunque sea vacío) para cada
        // campo registrado: si falta una clave, RHF compara ese campo contra
        // `undefined` en vez de contra el string vacío que en realidad tiene
        // el input, y marca el formulario como "sucio" (isDirty) desde el
        // primer render aunque no se haya tocado nada.
        defaultValues: fee || { name: "", description: "", price: "", consumptionMax: "", surplusChargePerUnit: "", maturityAmount: "" },
        // Valida al salir por primera vez del campo y, desde entonces, vuelve a
        // validar cada cambio. Así un CustomSelect limpia su error al seleccionar
        // una opción, sin requerir otro click fuera del control.
        mode: "onTouched",
    });

    useEffect(() => {
        onDirtyChange(isDirty);
        return () => onDirtyChange(false);
    }, [isDirty, onDirtyChange]);

    // Manejo del botón de "Guardar"
    const onSubmit = async (data: FeeDto) => {
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
                <FloatingFieldset label="Tarifa">
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
                <FloatingFieldset label="Precio" prefix="$">
                    <Form.Control
                        type="number"
                        {...register("price", combineRules(requiredRule(), minValueRule(0.01, "El precio debe ser mayor a 0"), maxValueRule(9999999)))}
                        isInvalid={!!errors.price}
                    />
                </FloatingFieldset>
                <Form.Control.Feedback type="invalid">
                    {errors.price?.message}
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
                <FloatingFieldset label="Consumo Max.">
                    <Form.Control
                        type="number"
                        {...register("consumptionMax", combineRules(requiredRule(), minValueRule(0), maxValueRule(9999999)))}
                        isInvalid={!!errors.consumptionMax}
                    />
                </FloatingFieldset>
                <Form.Control.Feedback type="invalid">
                    {errors.consumptionMax?.message}
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
                <FloatingFieldset label="Costo por Exceso" prefix="$">
                    <Form.Control
                        type="number"
                        {...register("surplusChargePerUnit", combineRules(requiredRule(), minValueRule(0), maxValueRule(9999999)))}
                        isInvalid={!!errors.surplusChargePerUnit}
                    />
                </FloatingFieldset>
                <Form.Control.Feedback type="invalid">
                    {errors.surplusChargePerUnit?.message}
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
                <FloatingFieldset label="Costo por Vencimiento" prefix="$">
                    <Form.Control
                        type="number"
                        {...register("maturityAmount", combineRules(requiredRule(), minValueRule(0), maxValueRule(9999999)))}
                        isInvalid={!!errors.maturityAmount}
                    />
                </FloatingFieldset>
                <Form.Control.Feedback type="invalid">
                    {errors.maturityAmount?.message}
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

const AddEditFeeModal: React.FC<AddEditModalProps> = ({ show, onHide, onSave, fee }) => {
    const { requestClose, showConfirm, confirmDiscard, cancelDiscard, setIsDirty } = useConfirmDiscard({ onHide, alwaysConfirm: false });
    const modalZIndex = useModalLayer(show);

    return (
        <>
            <Modal show={show} onHide={requestClose} onClick={onBackdropClick(requestClose)} centered backdrop backdropClassName="modal-click-backdrop" style={{ zIndex: modalZIndex }} contentClassName="form-modal-content" aria-labelledby="fee-modal-title">
                <FormModalHeader
                    icon="bi bi-clipboard2-pulse"
                    title={fee ? "Editar Tarifa" : "Añadir Tarifa"}
                    onClose={requestClose}
                    titleId="fee-modal-title"
                />
                <Modal.Body>
                    {show && <FeeForm onHide={requestClose} onSave={onSave} fee={fee} onDirtyChange={setIsDirty} />}
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

export default AddEditFeeModal;
