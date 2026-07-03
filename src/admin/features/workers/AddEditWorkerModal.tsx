import React, { useEffect, useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { UserDto } from "../../../core/models/dto/UserDto";

interface AddEditModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (worker: UserDto) => Promise<void>;
    worker?: UserDto | any;
}

const AddEditWorkerModal: React.FC<AddEditModalProps> = ({ show, onHide, onSave, worker }) => {

    // Estados
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Props para manejar formulario 
    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<UserDto>({
        defaultValues: worker || {},
    });

    // Setear la contraseña igual al DNI al crear un nuevo operario
    useEffect(() => {
        if (!worker) {
            setValue("password", worker?.dni?.toString());
        }
    }, [worker, setValue]);

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
        <Modal show={show} onHide={onHide} aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title>{worker ? "Editar Operario" : "Añadir Operario"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>

                    <Form.Group>
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            {...register("firstName", { required: "Este campo es obligatorio" })}
                            isInvalid={!!errors.firstName}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.firstName?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Apellido</Form.Label>
                        <Form.Control
                            {...register("lastName", { required: "Este campo es obligatorio" })}
                            isInvalid={!!errors.lastName}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.lastName?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            {...register("username", { required: "Este campo es obligatorio" })}
                            isInvalid={!!errors.username}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.username?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                    {worker && ( // Mostrar estado solo en edición
                        <Form.Group>
                            <Form.Label>Estado</Form.Label>
                            <Form.Select
                                {...register("status", { required: "Este campo es obligatorio" })}
                                isInvalid={!!errors.status}
                            >
                                <option value="ACTIVE">Activo</option>
                                <option value="INACTIVE">Inactivo</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors.status?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                    )}
                    <Form.Group>
                        <Form.Label>DNI</Form.Label>
                        <Form.Control
                            type="number"
                            {...register("dni", { required: "Este campo es obligatorio", maxLength: { value: 8, message: "El DNI debe tener 8 números" } })}
                            isInvalid={!!errors.dni}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.dni?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control
                            {...register("phone", { required: "Este campo es obligatorio", maxLength: { value: 10, message: "El teléfono no puede tener más de 10 números" } })}
                            isInvalid={!!errors.phone}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.phone?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Button className="mt-2" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Guardando..." : "Guardar"}
                    </Button>
                    <Button className="mt-2 ms-2" variant="secondary" onClick={onHide} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddEditWorkerModal;