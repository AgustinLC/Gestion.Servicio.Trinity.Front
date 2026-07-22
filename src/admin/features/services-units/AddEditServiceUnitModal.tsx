import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { ServiceUnitDto } from "../../../core/models/dto/ServiceUnitDto";
import { Service } from "../../../core/models/dto/Service";
import { Unit } from "../../../core/models/dto/Unit";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";

interface AddEditModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (serviceUnit: ServiceUnitDto) => Promise<void>;
    serviceUnit?: ServiceUnitDto | any;
    services: Service[];
    unities: Unit[];
}

const AddEditServiceUnitModal: React.FC<AddEditModalProps> = ({ show, onHide, onSave, serviceUnit, services, unities }) => {

    // Estados
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Props para manejar formulario 
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ServiceUnitDto>({
        defaultValues: serviceUnit || {},
    });

    // Manejo del botón de "Guardar"
    const onSubmit = async (data: ServiceUnitDto) => {
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
        <Modal show={show} onHide={onHide} centered contentClassName="form-modal-content" aria-labelledby="service-unit-modal-title">
            <FormModalHeader
                icon="bi bi-calculator"
                title={serviceUnit ? "Editar Relación Servicio/Unidad" : "Añadir Relación Servicio/Unidad"}
                onClose={onHide}
                titleId="service-unit-modal-title"
            />
            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>

                    {/* Servicio */}
                    <Form.Group>
                        <Form.Label>Servicio</Form.Label>
                        <Form.Select
                            {...register("idService", { required: "Este campo es obligatorio" })}
                            isInvalid={!!errors.idService}
                        >
                            <option value="">Seleccione un servicio</option>
                            {services.map((service) => (
                                <option key={service.idService} value={service.idService}>
                                    {service.name}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errors.idService?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* Unidad */}
                    <Form.Group className="mt-2">
                        <Form.Label>Unidad</Form.Label>
                        <Form.Select
                            {...register("idUnit", { required: "Este campo es obligatorio" })}
                            isInvalid={!!errors.idUnit}
                        >
                            <option value="">Seleccione una unidad</option>
                            {unities.map((unit) => (
                                <option key={unit.idUnit} value={unit.idUnit}>
                                    {unit.name}/{unit.symbol}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errors.idUnit?.message}
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

export default AddEditServiceUnitModal;