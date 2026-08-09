import React, { useEffect, useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { UserDto } from "../../../core/models/dto/UserDto";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";
import FloatingFieldset from "../../../shared/components/floating-fieldset/FloatingFieldset";
import CustomSelect from "../../../shared/components/custom-select/CustomSelect";
import { useModalLayer } from "../../../context/ModalStackContext";

interface AddEditModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (administrator: UserDto) => Promise<void>;
    administrator?: UserDto | any;
}

const AddEditAdministratorModal: React.FC<AddEditModalProps> = ({ show, onHide, onSave, administrator }) => {

    // Estados
    const [isSubmitting, setIsSubmitting] = useState(false);
    const modalZIndex = useModalLayer(show);

    // Props para manejar formulario 
    const { register, handleSubmit, reset, control, formState: { errors }, setValue } = useForm<UserDto>({
        defaultValues: administrator || {},
    });

    // Setear la contraseña igual al DNI al crear un nuevo operario
    useEffect(() => {
        if (!administrator) {
            setValue("password", administrator?.dni?.toString());
        }
    }, [administrator, setValue]);

    // Manejo del botón de "Guardar"
    const onSubmit = async (data: UserDto) => {
        // Desactivar el botón
        setIsSubmitting(true);
        try {
            if (!administrator) {
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
        <Modal show={show} onHide={onHide} centered backdrop={false} style={{ zIndex: modalZIndex }} contentClassName="form-modal-content" aria-labelledby="administrator-modal-title">
            <FormModalHeader
                icon={administrator ? "bi bi-person-gear" : "bi bi-person-add"}
                title={administrator ? "Editar Administrador" : "Añadir Administrador"}
                onClose={onHide}
                titleId="administrator-modal-title"
            />
            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>

                    <Form.Group>
                        <FloatingFieldset label="Nombre">
                            <Form.Control
                                {...register("firstName", { required: "Este campo es obligatorio" })}
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
                                {...register("lastName", { required: "Este campo es obligatorio" })}
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
                                {...register("username", { required: "Este campo es obligatorio" })}
                                isInvalid={!!errors.username}
                            />
                        </FloatingFieldset>
                        <Form.Control.Feedback type="invalid">
                            {errors.username?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                    {administrator && ( // Mostrar estado solo en edición
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
                                {...register("dni", { required: "Este campo es obligatorio", maxLength: { value: 8, message: "El DNI debe tener 8 números" } })}
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
                                {...register("phone", { required: "Este campo es obligatorio", maxLength: { value: 10, message: "El teléfono no puede tener más de 10 números" } })}
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
            </Modal.Body>
        </Modal>
    );
};

export default AddEditAdministratorModal;