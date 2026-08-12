import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import FormModalHeader from "../../../../shared/components/form-modal-header/FormModalHeader";
import FloatingFieldset from "../../../../shared/components/floating-fieldset/FloatingFieldset";
import ConfirmModal from "../../../../shared/components/confirm/ConfirmModal";
import { useModalLayer } from "../../../../context/ModalStackContext";
import { useConfirmDiscard, onBackdropClick } from "../../../../shared/hooks/useConfirmDiscard";

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
    // En edición los valores ya vienen precargados, así que siempre se
    // confirma al cerrar (ver useConfirmDiscard).
    const { requestClose, showConfirm, confirmDiscard, cancelDiscard } = useConfirmDiscard({ onHide, alwaysConfirm: true });
    const modalZIndex = useModalLayer(show);
    const isInvalidReading = Number.isNaN(readingValue) || readingValue < 0 || readingValue > 9999999;

    const handleSubmit = () => {
        if (isInvalidReading) return;
        onSubmit(readingValue);
    };

    return (
        <>
        <Modal show={show} onHide={requestClose} onClick={onBackdropClick(requestClose)} centered backdrop backdropClassName="modal-click-backdrop" style={{ zIndex: modalZIndex }} contentClassName="form-modal-content" aria-labelledby="edit-reading-modal-title">
            <FormModalHeader
                icon="bi bi-speedometer2"
                title="Editar Lectura"
                onClose={requestClose}
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
                                max="9999999"
                                value={readingValue}
                                onChange={(e) => setReadingValue(Number(e.target.value))}
                                isInvalid={isInvalidReading}
                            />
                        </FloatingFieldset>
                        <Form.Control.Feedback type="invalid">
                            El valor debe estar entre 0 y 9999999
                        </Form.Control.Feedback>
                    </Form.Group>
                </Form>

                <div className="form-modal-footer d-flex justify-content-end gap-2 mt-3">
                    <Button variant="outline-secondary" onClick={requestClose}>
                        <i className="bi bi-x-circle me-1"></i> Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={isInvalidReading}>
                        <i className="bi bi-save me-1"></i> Guardar
                    </Button>
                </div>
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

export default EditReadingModal;
