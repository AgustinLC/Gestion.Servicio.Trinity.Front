import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { getData } from "../../../../core/services/apiService";
import { toast } from "react-toastify";
import FormModalHeader from "../../../../shared/components/form-modal-header/FormModalHeader";

// Interfaces/modelos
interface AddReadingModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (readingValue: number) => Promise<void>;
    user: number;
}

interface ReadingForm {
    readingValue: number;
}

const AddReadingModal: React.FC<AddReadingModalProps> = ({ show, onHide, onSave, user }) => {

    // Estados 
    const [lastReading, setLastReading] = useState<number>(0)

    useEffect(() => {
        const fetchLastReading = async () => {
            if (!user) return;
            try {
                const reading = await getData<number>(`/operator/reading/${user}`);
                setLastReading(reading);
            } catch (error) {
                console.error(error);
                toast.error("No se pudo obtener la última lectura");
            }
        };

        fetchLastReading();
    }, [user]);

    // Estados
    const [isSubmitting, setIsSubmitting] = useState(false);

    //Props para manejar el modal
    const { register, handleSubmit, formState: { errors }, reset, } = useForm<ReadingForm>();

    //Manejo del boton guardar
    const onSubmit = async (data: ReadingForm) => {
        setIsSubmitting(true);
        try {
            await onSave(data.readingValue);
            reset();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered contentClassName="form-modal-content" aria-labelledby="add-reading-modal-title">
            <FormModalHeader
                icon="bi bi-speedometer2"
                title="Cargar Lectura"
                onClose={onHide}
                titleId="add-reading-modal-title"
            />
            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Form.Label>
                        Lectura anterior:{" "}
                        <strong>
                            {lastReading !== null ? lastReading : "Sin lectura anterior"}
                        </strong>
                    </Form.Label>
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

export default AddReadingModal;
