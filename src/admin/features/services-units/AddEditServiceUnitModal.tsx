import React, { useEffect, useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { ServiceUnitDto } from "../../../core/models/dto/ServiceUnitDto";
import { Service } from "../../../core/models/dto/Service";
import { Unit } from "../../../core/models/dto/Unit";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";
import FloatingFieldset from "../../../shared/components/floating-fieldset/FloatingFieldset";
import CustomSelect from "../../../shared/components/custom-select/CustomSelect";
import ConfirmModal from "../../../shared/components/confirm/ConfirmModal";
import { useModalLayer } from "../../../context/ModalStackContext";
import { useConfirmDiscard, onBackdropClick } from "../../../shared/hooks/useConfirmDiscard";

interface AddEditModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (serviceUnit: ServiceUnitDto) => Promise<void>;
    serviceUnit?: ServiceUnitDto | any;
    services: Service[];
    unities: Unit[];
}

interface ServiceUnitFormProps {
    onHide: () => void;
    onSave: (serviceUnit: ServiceUnitDto) => Promise<void>;
    serviceUnit?: ServiceUnitDto | any;
    services: Service[];
    unities: Unit[];
    onDirtyChange: (dirty: boolean) => void;
}

const ServiceUnitForm: React.FC<ServiceUnitFormProps> = ({ onHide, onSave, serviceUnit, services, unities, onDirtyChange }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { handleSubmit, reset, control, formState: { errors, isDirty } } = useForm<ServiceUnitDto>({
        defaultValues: serviceUnit || {},
        mode: "onTouched",
    });

    useEffect(() => { onDirtyChange(isDirty); }, [isDirty, onDirtyChange]);

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
        <Form onSubmit={handleSubmit(onSubmit)}>

            {/* Servicio */}
            <Form.Group>
                <Controller
                    control={control}
                    name="idService"
                    rules={{ required: "Este campo es obligatorio" }}
                    render={({ field }) => (
                        <FloatingFieldset label="Servicio">
                            <CustomSelect
                                value={field.value ? String(field.value) : ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                isInvalid={!!errors.idService}
                                options={services.map((service) => ({ value: String(service.idService), label: service.name }))}
                            />
                        </FloatingFieldset>
                    )}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.idService?.message}
                </Form.Control.Feedback>
            </Form.Group>

            {/* Unidad */}
            <Form.Group className="mt-2">
                <Controller
                    control={control}
                    name="idUnit"
                    rules={{ required: "Este campo es obligatorio" }}
                    render={({ field }) => (
                        <FloatingFieldset label="Unidad">
                            <CustomSelect
                                value={field.value ? String(field.value) : ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                isInvalid={!!errors.idUnit}
                                options={unities.map((unit) => ({ value: String(unit.idUnit), label: `${unit.name}/${unit.symbol}` }))}
                            />
                        </FloatingFieldset>
                    )}
                />
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
    );
};

const AddEditServiceUnitModal: React.FC<AddEditModalProps> = ({ show, onHide, onSave, serviceUnit, services, unities }) => {
    const { requestClose, showConfirm, confirmDiscard, cancelDiscard, setIsDirty } = useConfirmDiscard({ onHide, alwaysConfirm: !!serviceUnit });
    const modalZIndex = useModalLayer(show);

    return (
        <>
            <Modal show={show} onHide={requestClose} onClick={onBackdropClick(requestClose)} centered backdrop backdropClassName="modal-click-backdrop" style={{ zIndex: modalZIndex }} contentClassName="form-modal-content" aria-labelledby="service-unit-modal-title">
                <FormModalHeader
                    icon="bi bi-calculator"
                    title={serviceUnit ? "Editar Relación Servicio/Unidad" : "Añadir Relación Servicio/Unidad"}
                    onClose={requestClose}
                    titleId="service-unit-modal-title"
                />
                <Modal.Body>
                    {show && (
                        <ServiceUnitForm
                            onHide={requestClose}
                            onSave={onSave}
                            serviceUnit={serviceUnit}
                            services={services}
                            unities={unities}
                            onDirtyChange={setIsDirty}
                        />
                    )}
                </Modal.Body>
            </Modal>
            <ConfirmModal
                show={showConfirm}
                onHide={cancelDiscard}
                title="¿Descartar cambios?"
                message="Si cerrás ahora vas a perder los cambios que hiciste en este formulario."
                confirmVariant="danger"
                confirmText="Salir sin guardar"
                onConfirm={confirmDiscard}
            />
        </>
    );
};

export default AddEditServiceUnitModal;
