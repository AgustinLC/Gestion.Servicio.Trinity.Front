import React, { useEffect, useState } from "react";
import { Button, Modal, Spinner, Table, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { PendigBillDetail } from "../../../core/models/dto/PendingBillDetail";
import { getData, updateData, deleteData } from "../../../core/services/apiService";
import { BillingParameter } from "../../../core/models/dto/BillingParameter";
import ConfirmModal from "../../../shared/components/confirm/ConfirmModal";

interface UserParametersModalProps {
    show: boolean;
    onHide: () => void;
    parameters: BillingParameter[];
    userName: string;
    userId: number;
}

const UserParametersModal: React.FC<UserParametersModalProps> = ({ show, onHide, userName, userId, parameters: billingParameters }) => {

    // Estados
    const [parameters, setParameters] = useState<PendigBillDetail[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [tempData, setTempData] = useState<{ billingParameterId: number; value: number; }>({ billingParameterId: 0, value: 0 });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [parameterToDelete, setParameterToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [sortAsc, setSortAsc] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    // Constantes
    const itemsPerPage = 5;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = parameters.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(parameters.length / itemsPerPage);

    // Obtener datos de la API 
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = await getData<PendigBillDetail[]>(`/operator/pending-details/user/${userId}`);
                setParameters(params);
            } catch (error) {
                console.error(error);
                toast.error("Error al obtener conceptos");
                setError("Error al cargar los conceptos");
            } finally {
                setLoading(false);
            }
        };

        if (show) fetchData();
    }, [userId, show]);

    // Manejar boton de editar
    const handleEdit = (parameter: PendigBillDetail) => {
        setEditingId(parameter.idPendingBillDetail);
        setTempData({
            billingParameterId: parameter.idBillingParameter,
            value: parameter.value
        });
    };

    // Manejar boton de guardar
    const handleSave = async (idPendingBillDetail: number) => {
        setSaving(true);
        try {
            await updateData(`/operator/pending-details/update?idReading=`, idPendingBillDetail, { idBillingParameter: tempData.billingParameterId, value: tempData.value }
            );
            toast.success("Concepto actualizado");
            setParameters(parameters.map(p => p.idPendingBillDetail === idPendingBillDetail ? {
                ...p,
                idBillingParameter: tempData.billingParameterId,
                value: tempData.value
            }
                : p
            ));
            setEditingId(null);
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar concepto");
        } finally {
            setSaving(false);
        }
    };

    // Modificar handleDelete para usar el modal de confirmación
    const handleDeleteClick = (idPendingBillDetail: number) => {
        setParameterToDelete(idPendingBillDetail);
        setShowConfirmModal(true);
    };

    // Manejar eliminación
    const handleConfirmDelete = async () => {
        if (!parameterToDelete) return;
        setIsDeleting(true);
        try {
            await deleteData(`/operator/pending-details/?idPendingBillDetail`, parameterToDelete);
            toast.success("Concepto eliminado");
            setParameters(parameters.filter(p => p.idPendingBillDetail !== parameterToDelete));
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar el concepto");
        } finally {
            setIsDeleting(false);
            setShowConfirmModal(false);
            setParameterToDelete(null);
        }
    };

    // Manejar orden asc/desc por fecha
    const handleSort = () => {
        const sortedReadings = [...parameters].sort((a, b) =>
            sortAsc ? a.idPendingBillDetail - b.idPendingBillDetail : b.idPendingBillDetail - a.idPendingBillDetail
        );
        setParameters(sortedReadings);
        setSortAsc(!sortAsc);
    };

    // Obtener nombre del parámetro
    const getParameterName = (idBillingParameter: number) => {
        return billingParameters.find(bp => bp.idBillingParameter === idBillingParameter)?.name || idBillingParameter;
    };

    return (
        <>
            <Modal show={show} size="lg" onHide={onHide} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Conceptos de {userName}</Modal.Title>
                </Modal.Header>

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
                                    <tr className="text-center align-middle">
                                        <th>ID
                                            <span style={{ cursor: "pointer", marginLeft: "5px" }} onClick={handleSort}>
                                                {sortAsc ? "▲" : "▼"}
                                            </span>
                                        </th>
                                        <th>Concepto</th>
                                        <th>Importe $</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentItems.map((parameter) => (
                                        <tr className="align-middle" key={parameter.idPendingBillDetail}>
                                            {/* ID */}
                                            <td className="text-center">{parameter.idPendingBillDetail}</td>

                                            {/* Concepto */}
                                            <td className="text-center">
                                                {editingId === parameter.idPendingBillDetail ? (
                                                    <Form.Select
                                                        value={tempData.billingParameterId}
                                                        onChange={(e) =>
                                                            setTempData(prev => ({
                                                                ...prev,
                                                                billingParameterId: Number(e.target.value)
                                                            }))
                                                        }
                                                    >
                                                        {billingParameters.map((bp) => (
                                                            <option key={bp.idBillingParameter} value={bp.idBillingParameter}>
                                                                {bp.name}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                ) : (
                                                    getParameterName(parameter.idBillingParameter)
                                                )}
                                            </td>

                                            {/* Importe */}
                                            <td className="text-center">
                                                {editingId === parameter.idPendingBillDetail ? (
                                                    <Form.Control
                                                        className="text-center"
                                                        type="number"
                                                        value={tempData.value}
                                                        onChange={(e) =>
                                                            setTempData(prev => ({
                                                                ...prev,
                                                                value: Number(e.target.value)
                                                            }))
                                                        }
                                                    />
                                                ) : (
                                                    parameter.value
                                                )}
                                            </td>

                                            {/* Acciones */}
                                            <td className="text-center">
                                                {editingId === parameter.idPendingBillDetail ? (
                                                    <Button variant="success" onClick={() => handleSave(parameter.idPendingBillDetail)} disabled={saving}>
                                                        {saving ? <Spinner as="span" animation="border" size="sm" /> : "Guardar"}
                                                    </Button>
                                                ) : (
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <Button variant="warning" onClick={() => handleEdit(parameter)}>
                                                            Editar
                                                        </Button>
                                                        <Button variant="danger" onClick={() => handleDeleteClick(parameter.idPendingBillDetail)}>
                                                            Eliminar
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            <div className="d-flex justify-content-between align-items-center">
                                <Button variant="secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
                                    Anterior
                                </Button>
                                <span>Página {currentPage} de {totalPages}</span>
                                <Button variant="secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>
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
            {/* Modal de confirmación */}
            <ConfirmModal
                show={showConfirmModal}
                onHide={() => { setShowConfirmModal(false); setParameterToDelete(null); }}
                title="Confirmar eliminación"
                message={
                    <>
                        ¿Estás seguro que deseas eliminar el concepto:
                    </>
                }
                confirmText="Confirmar"
                isLoading={isDeleting}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
};

export default UserParametersModal;