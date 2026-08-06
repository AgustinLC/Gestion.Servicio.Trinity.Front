import React, { useEffect, useState } from "react";
import { Button, Modal, Spinner, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { UserDiscountDto } from "../../../core/models/dto/UserDiscountDto";
import { getData, updateData, deleteData } from "../../../core/services/apiService";
import { DiscountDto } from "../../../core/models/dto/Discount";
import { UserDto } from "../../../core/models/dto/UserDto";
import ConfirmModal from "../../../shared/components/confirm/ConfirmModal";
import AddDiscountModal from "./AddDiscountModal";
import { ApplyCondition } from "../../../core/models/dto/ApplyCondition";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import CustomSelect from "../../../shared/components/custom-select/CustomSelect";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import { formatDate, formatCurrency } from "../../../core/utils/formatters";
import { useModalLayer } from "../../../context/ModalStackContext";

interface ShowDiscountUserModalProps {
    show: boolean;
    onHide: () => void;
    discounts: DiscountDto[];
    userName?: string;
    user: UserDto;
}

const ShowDiscountUserModal: React.FC<ShowDiscountUserModalProps> = ({ show, onHide, discounts: billingDiscounts, userName, user }) => {

    // Estados
    const [discounts, setDiscounts] = useState<UserDiscountDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [tempData, setTempData] = useState<{ idDiscount: number; value: number; }>({ idDiscount: 0, value: 0 });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [discountToDelete, setDiscountToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const modalZIndex = useModalLayer(show);

    // Obtener datos de la API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getData<UserDiscountDto[]>(`/operator/userDiscount/${user.idUser}`);
                setDiscounts(data);
            } catch (error) {
                console.error(error);
                toast.error("Error al obtener descuentos");
                setError("Error al cargar los descuentos");
            } finally {
                setLoading(false);
            }
        };

        if (show) fetchData();
    }, [user.idUser, show]);

    // Manejar boton de editar
    const handleEdit = (discount: UserDiscountDto) => {
        setEditingId(discount.idUserDiscount);
        setTempData({
            idDiscount: discount.idDiscount,
            value: discount.value
        });
    };

    // Manejar boton de cancelar edición
    const handleCancelEdit = () => {
        setEditingId(null);
    };

    // Obtener el tipo de descuento (FIXED o MANUAL)
    const getDiscountType = (idDiscount: number): ApplyCondition | null => {
        const discount = billingDiscounts.find(d => d.idDiscount === idDiscount);
        return discount?.applyCondition || null;
    };

    // Manejar boton de guardar
    const handleSave = async (idUserDiscount: number) => {
        setSaving(true);
        try {
            await updateData(`/operator/update-userDiscount?idUserDiscount`, idUserDiscount, {
                idDiscount: tempData.idDiscount,
                value: tempData.value
            });
            toast.success("Descuento actualizado");
            setDiscounts(discounts.map(d => d.idUserDiscount === idUserDiscount ? {
                ...d,
                idDiscount: tempData.idDiscount,
                value: tempData.value
            }
                : d
            ));
            setEditingId(null);
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar descuento");
        } finally {
            setSaving(false);
        }
    };

    // Modificar handleDelete para usar el modal de confirmación
    const handleDeleteClick = (idUserDiscount: number) => {
        setDiscountToDelete(idUserDiscount);
        setShowConfirmModal(true);
    };

    // Manejar eliminación
    const handleConfirmDelete = async () => {
        if (!discountToDelete) return;
        setIsDeleting(true);
        try {
            await deleteData(`/operator/delete-userDiscount?idUserDiscount`, discountToDelete);
            toast.success("Descuento eliminado");
            setDiscounts(discounts.filter(d => d.idUserDiscount !== discountToDelete));
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar el descuento");
        } finally {
            setIsDeleting(false);
            setShowConfirmModal(false);
            setDiscountToDelete(null);
        }
    };

    // Obtener nombre del descuento
    const getDiscountName = (idDiscount: number) => {
        return billingDiscounts.find(bd => bd.idDiscount === idDiscount)?.name || idDiscount;
    };

    const displayUserName = userName || `${user.firstName} ${user.lastName}`;

    const columns: TableColumnDefinition<UserDiscountDto>[] = [
        {
            key: "dateRegister",
            label: "Fecha de creación",
            sortable: true,
            render: (discount) => (
                <div className="d-flex align-items-center gap-2 text-start">
                    <div className="icon-badge" style={{ width: 32, height: 32, fontSize: "0.85rem" }}>
                        <i className="bi bi-calendar3"></i>
                    </div>
                    {formatDate(discount.dateRegister)}
                </div>
            ),
        },
        {
            key: "idDiscount",
            label: "Descuento",
            render: (discount) =>
                editingId === discount.idUserDiscount ? (
                    <CustomSelect
                        value={String(tempData.idDiscount)}
                        onChange={(v) => setTempData(prev => ({ ...prev, idDiscount: Number(v) }))}
                        options={billingDiscounts.map((bd) => ({ value: String(bd.idDiscount), label: bd.name }))}
                    />
                ) : (
                    getDiscountName(discount.idDiscount)
                ),
        },
        {
            key: "value",
            label: "Importe $",
            sortable: true,
            render: (discount) => {
                const isEditing = editingId === discount.idUserDiscount;
                const isFixed = getDiscountType(discount.idDiscount) === ApplyCondition.FIXED;
                return isEditing ? (
                    <Form.Control
                        type="number"
                        className="text-center"
                        value={tempData.value}
                        onChange={(e) => setTempData(prev => ({ ...prev, value: Number(e.target.value) }))}
                        disabled={isFixed}
                    />
                ) : (
                    formatCurrency(discount.value)
                );
            },
        },
        {
            key: "actions",
            label: "Acciones",
            actions: (discount) =>
                editingId === discount.idUserDiscount ? (
                    <div className="d-flex justify-content-center gap-2">
                        <Button variant="outline-secondary" size="sm" className="d-inline-flex align-items-center justify-content-center text-nowrap" onClick={handleCancelEdit} disabled={saving}>
                            <i className="bi bi-x-circle me-1"></i> Cancelar
                        </Button>
                        <Button variant="success" size="sm" className="d-inline-flex align-items-center justify-content-center text-nowrap" onClick={() => handleSave(discount.idUserDiscount)} disabled={saving}>
                            {saving ? <Spinner as="span" animation="border" size="sm" /> : <><i className="bi bi-check-circle me-1"></i> Guardar</>}
                        </Button>
                    </div>
                ) : (
                    <div className="d-flex justify-content-center gap-2">
                        <Button variant="outline-warning" size="sm" onClick={() => handleEdit(discount)}>
                            <i className="bi bi-pencil me-1"></i> Editar
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(discount.idUserDiscount)}>
                            <i className="bi bi-trash me-1"></i> Eliminar
                        </Button>
                    </div>
                ),
        },
    ];

    return (
        <>
            <Modal show={show} size="lg" onHide={onHide} centered backdrop={false} style={{ zIndex: modalZIndex }} contentClassName="form-modal-content" aria-labelledby="show-discount-modal-title">
                <FormModalHeader
                    icon="bi bi-plus-slash-minus"
                    title={`Descuentos de ${displayUserName}`}
                    subtitle="Consultá los descuentos registrados para este usuario."
                    onClose={onHide}
                    titleId="show-discount-modal-title"
                />

                <Modal.Body>
                    {loading ? (
                        <div className="text-center">
                            <Spinner animation="border" />
                        </div>
                    ) : error ? (
                        <div className="text-danger text-center">{error}</div>
                    ) : (
                        <ReusableTable<UserDiscountDto>
                            data={discounts}
                            columns={columns}
                            defaultSort="dateRegister"
                        />
                    )}
                </Modal.Body>
            </Modal>
            {/* Modal de confirmación */}
            <ConfirmModal
                show={showConfirmModal}
                onHide={() => { setShowConfirmModal(false); setDiscountToDelete(null); }}
                title="Confirmar eliminación"
                message={
                    <>
                        ¿Estás seguro que deseas eliminar el descuento?
                    </>
                }
                confirmText="Confirmar"
                isLoading={isDeleting}
                loadingText="Eliminando..."
                onConfirm={handleConfirmDelete}
            />

            <AddDiscountModal
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                user={user}
                discounts={billingDiscounts}
                onAssigned={() => {
                    const fetchData = async () => {
                        setLoading(true);
                        try {
                            const data = await getData<UserDiscountDto[]>(`/operator/userDiscount/${user.idUser}`);
                            setDiscounts(data);
                        } catch (error) {
                            console.error(error);
                            toast.error("Error al obtener descuentos");
                        } finally {
                            setLoading(false);
                        }
                    };
                    fetchData();
                }}
            />
        </>
    );
};

export default ShowDiscountUserModal;
