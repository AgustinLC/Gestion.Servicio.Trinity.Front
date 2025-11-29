import { Button, Form, Modal } from "react-bootstrap";
import { DiscountDto } from "../../../core/models/dto/Discount";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface AddEditModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (discount: DiscountDto) => Promise<void>;
    discount?: DiscountDto | any;
}

const AddEditDiscountModal: React.FC<AddEditModalProps> = ({ show, onHide, onSave, discount }) => {

    // Estados
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Props para manejar el mdoal 
    const { register, handleSubmit, formState: { errors }, reset } = useForm<DiscountDto>({
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
        <Modal show={show} onHide={onHide} aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title>{discount ? "Editar Descuento" : "Añadir Descuento"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Form.Group>
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            {...register("name", { required: "Este campo es obligatorio" })}
                            isInvalid={!!errors.name}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.name?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                            {...register("description", { required: "Este campo es obligatorio" })}
                            isInvalid={!!errors.description}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.description?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Precio</Form.Label>
                        <Form.Control
                            {...register("amount", { required: "Este campo es obligatorio" })}
                            isInvalid={!!errors.amount}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.amount?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Condición</Form.Label>
                        <Form.Select
                            {...register("applyCondition", { required: "Este campo es obligatorio" })}
                            isInvalid={!!errors.applyCondition}
                        >
                            <option value="FIXED">Fijo</option>
                            <option value="MANUAL">Manual</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errors.applyCondition?.message}
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
        </Modal >
    );
}

export default AddEditDiscountModal;