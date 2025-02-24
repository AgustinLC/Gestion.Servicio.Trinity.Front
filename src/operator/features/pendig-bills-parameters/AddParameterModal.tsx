import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { BillingParameter } from "../../../core/models/dto/BillingParameter";
import { PendigBillDetail } from "../../../core/models/dto/PendingBillDetail";
import { useForm } from "react-hook-form";

interface AddParameterModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (pendigBillDetail: PendigBillDetail) => Promise<void>;
    parameters: BillingParameter[];
}

const AddParameterModal: React.FC<AddParameterModalProps> = ({ show, onHide, onSave, parameters }) => {
    // Estados
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Props para manejar formulario
    const {register, handleSubmit, reset, watch, setValue, formState: { errors }, } = useForm<PendigBillDetail>({
        defaultValues: {},
    });

    // Observar el valor seleccionado en el selector de parámetros
    const selectedParameterId = watch("idBillingParameter");

    // Manejar cambio en el selector de parámetros
    const handleParameterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = parseInt(event.target.value);
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
        <Modal show={show} onHide={onHide} aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title>Agregar Parámetro</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    {/* Selector de parámetros */}
                    <Form.Group controlId="parameterSelect" className="mb-3">
                        <Form.Label>Seleccione un parámetro</Form.Label>
                        <Form.Select
                            {...register("idBillingParameter", { required: "Este campo es obligatorio" })}
                            onChange={handleParameterChange}
                            isInvalid={!!errors.idBillingParameter}
                        >
                            <option value="">Seleccione...</option>
                            {parameters.map(param => (
                                <option key={param.idBillingParameter} value={param.idBillingParameter}>
                                    {param.name}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errors.idBillingParameter?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* Input numérico */}
                    <Form.Group controlId="parameterValue" className="mb-3">
                        <Form.Label>Importe $</Form.Label>
                        <Form.Control
                            type="number"
                            {...register("value", {
                                required: "Este campo es obligatorio",
                                valueAsNumber: true,
                            })}
                            disabled={!selectedParameterId}
                            isInvalid={!!errors.value}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.value?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* Botones del modal */}
                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddParameterModal;