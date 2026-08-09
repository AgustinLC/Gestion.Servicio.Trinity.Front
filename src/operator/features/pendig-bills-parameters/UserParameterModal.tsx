import React, { useEffect, useState } from "react";
import { Button, Modal, Spinner, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { PendigBillDetail } from "../../../core/models/dto/PendingBillDetail";
import { getData, updateData, deleteData } from "../../../core/services/apiService";
import { BillingParameter } from "../../../core/models/dto/BillingParameter";
import ConfirmModal from "../../../shared/components/confirm/ConfirmModal";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import TableSkeleton from "../../../shared/components/table-skeleton/TableSkeleton";
import CustomSelect from "../../../shared/components/custom-select/CustomSelect";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import { formatDate, formatCurrency } from "../../../core/utils/formatters";
import { useModalLayer } from "../../../context/ModalStackContext";

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
    const modalZIndex = useModalLayer(show);

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

    // Manejar boton de cancelar edición
    const handleCancelEdit = () => {
        setEditingId(null);
    };

    // Manejar boton de guardar
    const handleSave = async (idPendingBillDetail: number) => {
        setSaving(true);
        try {
            await updateData(`/operator/pending-details/update?idPendingBillDetail`, idPendingBillDetail, {
                idBillingParameter: tempData.billingParameterId,
                value: tempData.value
            });
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
            await deleteData(`/operator/pending-details/delete?idPendingBillDetail`, parameterToDelete);
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

    // Obtener nombre del parámetro
    const getParameterName = (idBillingParameter: number) => {
        return billingParameters.find(bp => bp.idBillingParameter === idBillingParameter)?.name || idBillingParameter;
    };

    const columns: TableColumnDefinition<PendigBillDetail>[] = [
        {
            key: "dateRegister",
            label: "Fecha de creación",
            sortable: true,
            render: (parameter) => (
                <div className="d-flex align-items-center gap-2 text-start">
                    <div className="icon-badge" style={{ width: 32, height: 32, fontSize: "0.85rem" }}>
                        <i className="bi bi-calendar3"></i>
                    </div>
                    {formatDate(parameter.dateRegister)}
                </div>
            ),
        },
        {
            key: "idBillingParameter",
            label: "Concepto",
            render: (parameter) =>
                editingId === parameter.idPendingBillDetail ? (
                    <CustomSelect
                        value={String(tempData.billingParameterId)}
                        onChange={(v) => setTempData(prev => ({ ...prev, billingParameterId: Number(v) }))}
                        options={billingParameters.map((bp) => ({ value: String(bp.idBillingParameter), label: bp.name }))}
                    />
                ) : (
                    getParameterName(parameter.idBillingParameter)
                ),
        },
        {
            key: "value",
            label: "Importe $",
            sortable: true,
            render: (parameter) =>
                editingId === parameter.idPendingBillDetail ? (
                    <Form.Control
                        type="number"
                        className="text-center"
                        value={tempData.value}
                        onChange={(e) => setTempData(prev => ({ ...prev, value: Number(e.target.value) }))}
                    />
                ) : (
                    formatCurrency(parameter.value)
                ),
        },
        {
            key: "actions",
            label: "Acciones",
            actions: (parameter) =>
                editingId === parameter.idPendingBillDetail ? (
                    <div className="d-flex justify-content-center gap-2">
                        <Button variant="outline-secondary" size="sm" className="d-inline-flex align-items-center justify-content-center text-nowrap" onClick={handleCancelEdit} disabled={saving}>
                            <i className="bi bi-x-circle me-1"></i> Cancelar
                        </Button>
                        <Button variant="success" size="sm" className="d-inline-flex align-items-center justify-content-center text-nowrap" onClick={() => handleSave(parameter.idPendingBillDetail)} disabled={saving}>
                            {saving ? <Spinner as="span" animation="border" size="sm" /> : <><i className="bi bi-check-circle me-1"></i> Guardar</>}
                        </Button>
                    </div>
                ) : (
                    <div className="d-flex justify-content-center gap-2">
                        <Button variant="outline-warning" size="sm" onClick={() => handleEdit(parameter)}>
                            <i className="bi bi-pencil me-1"></i> Editar
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(parameter.idPendingBillDetail)}>
                            <i className="bi bi-trash me-1"></i> Eliminar
                        </Button>
                    </div>
                ),
        },
    ];

    return (
        <>
            <Modal show={show} size="lg" onHide={onHide} centered backdrop={false} style={{ zIndex: modalZIndex }} contentClassName="form-modal-content" aria-labelledby="user-parameters-modal-title">
                <FormModalHeader
                    icon="bi bi-journal-plus"
                    title={`Conceptos de ${userName}`}
                    subtitle="Consultá los conceptos registrados para este usuario."
                    onClose={onHide}
                    titleId="user-parameters-modal-title"
                />

                <Modal.Body>
                    {loading ? (
                        <TableSkeleton showToolbar={false} rows={6} />
                    ) : error ? (
                        <div className="text-danger text-center">{error}</div>
                    ) : (
                        <div className="content-fade-in">
                            <ReusableTable<PendigBillDetail>
                                data={parameters}
                                columns={columns}
                                defaultSort="dateRegister"
                                defaultPageSize={5}
                                showPageSizeSelector={false}
                            />
                        </div>
                    )}
                </Modal.Body>
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
                loadingText="Eliminando..."
                onConfirm={handleConfirmDelete}
            />
        </>
    );
};

export default UserParametersModal;
