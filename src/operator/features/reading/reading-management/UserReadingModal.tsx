import React, { useEffect, useState } from "react";
import { Button, Modal, Spinner, Table, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { getData, updateData } from "../../../../core/services/apiService";
import { ReadReadingDto } from "../../../../core/models/dto/ReadReadingDto";
import FormModalHeader from "../../../../shared/components/form-modal-header/FormModalHeader";

interface UserReadingsModalProps {
    show: boolean;
    onHide: () => void;
    userName: string;
    userId: number;
}

const UserReadingsModal: React.FC<UserReadingsModalProps> = ({ show, onHide, userName, userId }) => {

    // Estados
    const [readings, setReadings] = useState<ReadReadingDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [tempReading, setTempReading] = useState<number>(0);
    const [saving, setSaving] = useState(false);
    const [sortAsc, setSortAsc] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Constantes
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = readings.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(readings.length / itemsPerPage);

    // Obtener datos de la API 
    useEffect(() => {
        const fetchReadings = async () => {
            setLoading(true);
            try {
                const readings = await getData<ReadReadingDto[]>(`/user/readings/${userId}`);
                setReadings(readings);
            } catch (error) {
                console.error(error);
                toast.error("Error al obtener lecturas");
                setError("Error al cargar lecturas");
            } finally {
                setLoading(false);
            }
        };

        if (show) fetchReadings();
    }, [userId, show]);

    // Manejar boton de editar
    const handleEdit = (reading: ReadReadingDto) => {
        setEditingId(reading.idReading);
        setTempReading(reading.reading);
    };

    // Manejar boton de guardar
    const handleSave = async (idReading: number) => {
        setSaving(true);
        try {
            await updateData(`/operator/update-reading?idReading=${idReading}&reading`, tempReading , {});
            toast.success("Lectura actualizada");
            setReadings(readings.map(r => (r.idReading === idReading ? { ...r, reading: tempReading } : r)));
            setEditingId(null);
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar lectura");
        } finally {
            setSaving(false);
        }
    };

    // Manejar orden asc/desc por fecha
    const handleSort = () => {
        const sortedReadings = [...readings].sort((a, b) =>
            sortAsc ? new Date(a.date).getTime() - new Date(b.date).getTime() : new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setReadings(sortedReadings);
        setSortAsc(!sortAsc);
    };

    // Render
    return (
        <Modal show={show} onHide={onHide} centered size="lg" contentClassName="form-modal-content" aria-labelledby="user-reading-modal-title">
            <FormModalHeader
                icon="bi bi-speedometer2"
                title={`Lecturas de ${userName}`}
                onClose={onHide}
                titleId="user-reading-modal-title"
            />

            <Modal.Body>
                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" />
                    </div>
                ) : error ? (
                    <div className="text-danger text-center">{error}</div>
                ) : (
                    <>
                        <Table striped bordered hover>
                            <thead>
                                <tr className="text-center">
                                    <th>
                                        Fecha
                                        <span
                                            style={{ cursor: "pointer", marginLeft: "5px" }}
                                            onClick={handleSort}
                                        >
                                            {sortAsc ? "▲" : "▼"}
                                        </span>
                                    </th>
                                    <th>Período</th>
                                    <th>Valor de Lectura</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((reading) => (
                                        <tr className="align-middle text-center" key={reading.idReading}>
                                            <td>{reading.date}</td>
                                            <td>{reading.periodName || "—"}</td>
                                            <td>
                                                {editingId === reading.idReading ? (
                                                    <Form.Control
                                                        className="text-center"
                                                        type="number"
                                                        value={tempReading}
                                                        onChange={(e) =>
                                                            setTempReading(Number(e.target.value))
                                                        }
                                                    />
                                                ) : (
                                                    reading.reading
                                                )}
                                            </td>
                                            <td>
                                                {editingId === reading.idReading ? (
                                                    <Button
                                                        variant="success"
                                                        onClick={() => handleSave(reading.idReading)}
                                                        disabled={saving}
                                                    >
                                                        {saving ? (
                                                            <Spinner as="span" animation="border" size="sm" />
                                                        ) : (
                                                            "Guardar"
                                                        )}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="warning"
                                                        onClick={() => handleEdit(reading)}
                                                    >
                                                        Editar
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center">
                                            No hay lecturas disponibles
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>

                        {/* Controles de paginación */}
                        <div className="d-flex justify-content-between align-items-center">
                            <Button
                                variant="secondary"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                                Anterior
                            </Button>
                            <span>
                                Página {currentPage} de {totalPages}
                            </span>
                            <Button
                                variant="secondary"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UserReadingsModal;
