import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import FormModalHeader from "../../../../shared/components/form-modal-header/FormModalHeader";

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

    const handleSubmit = () => {
        onSubmit(readingValue);
    };

    return (
        <Modal show={show} onHide={onHide} centered contentClassName="form-modal-content" aria-labelledby="edit-reading-modal-title">
            <FormModalHeader
                icon="bi bi-speedometer2"
                title="Editar Lectura"
                onClose={onHide}
                titleId="edit-reading-modal-title"
            />
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Fecha</Form.Label>
                        <Form.Control type="text" value={reading.date || ""} disabled />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Periodo</Form.Label>
                        <Form.Control type="text" value={reading.periodName || ""} disabled />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Valor de Lectura</Form.Label>
                        <Form.Control
                            type="number"
                            value={readingValue}
                            onChange={(e) => setReadingValue(Number(e.target.value))}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onHide}>
                    <i className="bi bi-x-circle me-1"></i> Cancelar
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    <i className="bi bi-save me-1"></i> Guardar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditReadingModal;