import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import FormModalHeader from "../../../../shared/components/form-modal-header/FormModalHeader";
import FloatingFieldset from "../../../../shared/components/floating-fieldset/FloatingFieldset";
import { useModalLayer } from "../../../../context/ModalStackContext";

interface EditReadingModalProps {
    show: boolean;
    onHide: () => void;
    reading: {
        idReading: number;
        reading: number;
        date?: string;
        periodName?: string;
    };
    onSubmit: (readingValue: number) => void;
}


const EditReadingModal: React.FC<EditReadingModalProps> = ({ show, onHide, reading, onSubmit }) => {
    const [readingValue, setReadingValue] = useState(reading.reading);
    const modalZIndex = useModalLayer(show);
    const isInvalidReading = Number.isNaN(readingValue) || readingValue < 0;

    const handleSubmit = () => {
        if (isInvalidReading) return;
        onSubmit(readingValue);
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop={false} style={{ zIndex: modalZIndex }} contentClassName="form-modal-content" aria-labelledby="edit-reading-modal-title">
            <FormModalHeader
                icon="bi bi-speedometer2"
                title="Editar Lectura"
                onClose={onHide}
                titleId="edit-reading-modal-title"
            />
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <FloatingFieldset label="Fecha">
                            <Form.Control type="text" value={reading.date || ""} disabled />
                        </FloatingFieldset>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <FloatingFieldset label="Periodo">
                            <Form.Control type="text" value={reading.periodName || ""} disabled />
                        </FloatingFieldset>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <FloatingFieldset label="Valor de Lectura">
                            <Form.Control
                                type="number"
                                min="0"
                                value={readingValue}
                                onChange={(e) => setReadingValue(Number(e.target.value))}
                                isInvalid={isInvalidReading}
                            />
                        </FloatingFieldset>
                        <Form.Control.Feedback type="invalid">
                            El valor debe ser mayor o igual a 0
                        </Form.Control.Feedback>
                    </Form.Group>
                </Form>

                <div className="form-modal-footer d-flex justify-content-end gap-2 mt-3">
                    <Button variant="outline-secondary" onClick={onHide}>
                        <i className="bi bi-x-circle me-1"></i> Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={isInvalidReading}>
                        <i className="bi bi-save me-1"></i> Guardar
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default EditReadingModal;