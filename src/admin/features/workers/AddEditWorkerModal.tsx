import React, { useEffect, useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { UserDto } from "../../../core/models/dto/UserDto";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";
import FloatingFieldset from "../../../shared/components/floating-fieldset/FloatingFieldset";
import CustomSelect from "../../../shared/components/custom-select/CustomSelect";
import ConfirmModal from "../../../shared/components/confirm/ConfirmModal";
import { useModalLayer } from "../../../context/ModalStackContext";
import { useConfirmDiscard, onBackdropClick } from "../../../shared/hooks/useConfirmDiscard";
import { combineRules, requiredRule, emailRule, exactLengthRule, maxLengthRule, onlyDigitsRule, noSpecialCharsRule } from "../../../core/utils/formValidationRules";

interface AddEditModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (worker: UserDto) => Promise<void>;
    worker?: UserDto | any;
}

interface WorkerFormProps {
    onHide: () => void;
    onSave: (worker: UserDto) => Promise<void>;
    worker?: UserDto | any;
    onDirtyChange: (dirty: boolean) => void;
}

// Contenido real del formulario, separado en su propio componente para que
// solo se monte mientras el modal está abierto (ver más abajo, "{show &&
// <WorkerForm .../>}"). Así useForm() arranca de cero cada vez que se abre:
// ni los valores tipeados ni los errores de la sesión anterior pueden
// quedar pisados, porque el componente entero (y su estado) es nuevo.
const WorkerForm: React.FC<WorkerFormProps> = ({ onHide, onSave, worker, onDirtyChange }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, control, formState: { errors, isDirty } } = useForm<UserDto>({
        // Hay que pasarle a useForm un valor (aunque sea vacío) para cada
        // campo registrado: si falta una clave, RHF compara ese campo contra
        // `undefined` en vez de contra el string vacío que en realidad tiene
        // el input, y marca el formulario como "sucio" (isDirty) desde el
        // primer render aunque no se haya tocado nada.
        defaultValues: worker || { firstName: "", lastName: "", username: "", dni: "", phone: "" },
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
    const onSubmit = async (data: UserDto) => {
        // Desactivar el botón
        setIsSubmitting(true);
        try {
            if (!worker) {
                // Asegura que la contraseña sea igual al DNI al crear
                data.password = data.dni?.toString();
            }
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
                        {...register("firstName", combineRules(requiredRule(), noSpecialCharsRule(), maxLengthRule(40)))}
                        isInvalid={!!errors.firstName}
                    />
                </FloatingFieldset>
                <Form.Control.Feedback type="invalid">
                    {errors.firstName?.message}
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
                <FloatingFieldset label="Apellido">
                    <Form.Control
                        {...register("lastName", combineRules(requiredRule(), noSpecialCharsRule(), maxLengthRule(40)))}
                        isInvalid={!!errors.lastName}
                    />
                </FloatingFieldset>
                <Form.Control.Feedback type="invalid">
                    {errors.lastName?.message}
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
                <FloatingFieldset label="Email">
                    <Form.Control
                        {...register("username", combineRules(requiredRule(), emailRule(), maxLengthRule(100)))}
                        isInvalid={!!errors.username}
                    />
                </FloatingFieldset>
                <Form.Control.Feedback type="invalid">
                    {errors.username?.message}
                </Form.Control.Feedback>
            </Form.Group>
            {worker && ( // Mostrar estado solo en edición
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
                        {errors.status?.message}
                    </Form.Control.Feedback>
                </Form.Group>
            )}
            <Form.Group>
                <FloatingFieldset label="DNI">
                    <Form.Control
                        type="number"
                        {...register("dni", combineRules(requiredRule(), exactLengthRule(8, "El DNI debe tener 8 números")))}
                        isInvalid={!!errors.dni}
                    />
                </FloatingFieldset>
                <Form.Control.Feedback type="invalid">
                    {errors.dni?.message}
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
                <FloatingFieldset label="Teléfono">
                    <Form.Control
                        {...register("phone", combineRules(requiredRule(), onlyDigitsRule("El teléfono solo puede contener números"), maxLengthRule(10, "El teléfono no puede tener más de 10 números")))}
                        isInvalid={!!errors.phone}
                    />
                </FloatingFieldset>
                <Form.Control.Feedback type="invalid">
                    {errors.phone?.message}
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

const AddEditWorkerModal: React.FC<AddEditModalProps> = ({ show, onHide, onSave, worker }) => {
    const { requestClose, showConfirm, confirmDiscard, cancelDiscard, setIsDirty } = useConfirmDiscard({ onHide, alwaysConfirm: false });
    const modalZIndex = useModalLayer(show);

    return (
        <>
            <Modal show={show} onHide={requestClose} onClick={onBackdropClick(requestClose)} centered backdrop backdropClassName="modal-click-backdrop" style={{ zIndex: modalZIndex }} contentClassName="form-modal-content" aria-labelledby="worker-modal-title">
                <FormModalHeader
                    icon={worker ? "bi bi-person-gear" : "bi bi-person-add"}
                    title={worker ? "Editar Operario" : "Añadir Operario"}
                    onClose={requestClose}
                    titleId="worker-modal-title"
                />
                <Modal.Body>
                    {show && <WorkerForm onHide={requestClose} onSave={onSave} worker={worker} onDirtyChange={setIsDirty} />}
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

export default AddEditWorkerModal;
