import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { ServiceUnitDto } from "../../../core/models/dto/ServiceUnitDto";
import { Service } from "../../../core/models/dto/Service";
import { Unit } from "../../../core/models/dto/Unit";

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
        <Modal show={show} onHide={onHide} aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title>{serviceUnit ? "Editar Relación Servicio/Unidad" : "Añadir Relación Servicio/Unidad"}</Modal.Title>
            </Modal.Header>
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

export default AddEditServiceUnitModal;