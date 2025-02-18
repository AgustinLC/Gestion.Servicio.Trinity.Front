import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

interface EditReadingModalProps {
    show: boolean;
    onHide: () => void;
    reading: { idReading: number; reading: number };
    onSubmit: (readingValue: number) => void;
}

const EditReadingModal: React.FC<EditReadingModalProps> = ({ show, onHide, reading, onSubmit }) => {
    const [readingValue, setReadingValue] = useState(reading.reading);

    const handleSubmit = () => {
        onSubmit(readingValue);
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Editar Lectura</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
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
                <Button variant="secondary" onClick={onHide}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Guardar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditReadingModal;