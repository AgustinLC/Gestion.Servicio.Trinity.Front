import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";

// Interfaces/modelos
interface AddReadingModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (date: string, readingValue: number) => Promise<void>;
}

interface ReadingForm {
    date: string;
    readingValue: number;
}

const AddReadingModal: React.FC<AddReadingModalProps> = ({ show, onHide, onSave }) => {

    // Estados
    const [isSubmitting, setIsSubmitting] = useState(false);

    //Props para manejar el modal
    const { register, handleSubmit, formState: { errors }, reset, } = useForm<ReadingForm>();

    //Manejo del boton guardar
    const onSubmit = async (data: ReadingForm) => {
        setIsSubmitting(true);
        try {
            await onSave(data.date, data.readingValue);
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
                <Modal.Title>Cargar Lectura</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Form.Group>
                        <Form.Label>Fecha</Form.Label>
                        <Form.Control
                            type="date"
                            {...register("date", { required: "La fecha es obligatoria" })}
                            isInvalid={!!errors.date}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.date?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Valor de Lectura</Form.Label>
                        <Form.Control
                            type="number"
                            {...register("readingValue", {
                                required: "El valor de lectura es obligatorio",
                                min: { value: 0, message: "El valor debe ser mayor o igual a 0" },
                            })}
                            isInvalid={!!errors.readingValue}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.readingValue?.message}
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

export default AddReadingModal;
