import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { FeeDto } from "../../../core/models/dto/FeeDto";

interface AddEditModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (fee: FeeDto) => Promise<void>;
    fee?: FeeDto | any;
}

const AddEditFeeModal: React.FC<AddEditModalProps> = ({ show, onHide, onSave, fee }) => {

    // Estados
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Props para manejar formulario 
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FeeDto>({
        defaultValues: fee || {},
    });

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
        <Modal show={show} onHide={onHide} aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title>{fee ? "Editar Tarifa" : "Añadir Tarifa"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Form.Group>
                        <Form.Label>Tarifa</Form.Label>
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
                            {...register("price", { required: "Este campo es obligatorio" })}
                            isInvalid={!!errors.price}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.price?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Consumo Max.</Form.Label>
                        <Form.Control
                            {...register("consumptionMax", { required: "Este campo es obligatorio" })}
                            isInvalid={!!errors.consumptionMax}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.consumptionMax?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Costo por Exceso.</Form.Label>
                        <Form.Control
                            {...register("surplusChargePerUnit", { required: "Este campo es obligatorio" })}
                            isInvalid={!!errors.surplusChargePerUnit}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.surplusChargePerUnit?.message}
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

export default AddEditFeeModal;