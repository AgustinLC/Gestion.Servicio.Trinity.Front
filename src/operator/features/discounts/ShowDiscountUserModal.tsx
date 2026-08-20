import React, { useEffect, useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
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
import TableSkeleton from "../../../shared/components/table-skeleton/TableSkeleton";
import CustomSelect from "../../../shared/components/custom-select/CustomSelect";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import { formatDate, formatCurrency } from "../../../core/utils/formatters";
import { isNegativeInput } from "../../../core/utils/numberInput";
import { useModalLayer } from "../../../context/ModalStackContext";
import { onBackdropClick } from "../../../shared/hooks/useConfirmDiscard";

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
    const [showConfirmSave, setShowConfirmSave] = useState(false);
    const [pendingSaveId, setPendingSaveId] = useState<number | null>(null);
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

    // Manejar boton de guardar: pide confirmación antes de pisar el
    // descuento, ya que afecta el monto de las próximas facturas del usuario.
    const handleSaveClick = (idUserDiscount: number) => {
        setPendingSaveId(idUserDiscount);
        setShowConfirmSave(true);
    };

    const handleConfirmSave = async () => {
        if (pendingSaveId === null) return;
        setSaving(true);
        try {
            await updateData(`/operator/update-userDiscount?idUserDiscount`, pendingSaveId, {
                idDiscount: tempData.idDiscount,
                value: tempData.value
            });
            toast.success("Descuento actualizado");
            setDiscounts(discounts.map(d => d.idUserDiscount === pendingSaveId ? {
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
            setShowConfirmSave(false);
            setPendingSaveId(null);
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
                    <div className="icon-badge table-inline-edit-date-icon" style={{ width: 32, height: 32, fontSize: "0.85rem" }}>
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
                        className="table-inline-edit-field"
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
                        className="text-center table-inline-edit-field"
                        min={0}
                        value={tempData.value}
                        onChange={(e) => {
                            if (isNegativeInput(e.target.value)) return;
                            setTempData(prev => ({ ...prev, value: Number(e.target.value) }));
                        }}
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
                    <div className="d-flex justify-content-center gap-2 table-row-actions">
                        <Button variant="outline-secondary" size="sm" className="d-inline-flex align-items-center justify-content-center text-nowrap" onClick={handleCancelEdit} disabled={saving}>
                            <i className="bi bi-x-circle me-1"></i> <span className="d-none d-sm-inline">Cancelar</span>
                        </Button>
                        {/* Sin spinner propio: el ConfirmModal de abajo ya
                            anima "Guardando..." con este mismo estado
                            mientras está abierto — tenerlo acá también se veía
                            como dos cosas guardando a la vez. Solo se
                            deshabilita para evitar un segundo click. */}
                        <Button variant="success" size="sm" className="d-inline-flex align-items-center justify-content-center text-nowrap" onClick={() => handleSaveClick(discount.idUserDiscount)} disabled={saving}>
                            <i className="bi bi-check-circle me-1"></i> <span className="d-none d-sm-inline">Guardar</span>
                        </Button>
                    </div>
                ) : (
                    <div className="d-flex justify-content-center gap-2 table-row-actions">
                        <Button variant="outline-warning" size="sm" onClick={() => handleEdit(discount)}>
                            <i className="bi bi-pencil me-1"></i> <span className="d-none d-sm-inline">Editar</span>
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(discount.idUserDiscount)}>
                            <i className="bi bi-trash me-1"></i> <span className="d-none d-sm-inline">Eliminar</span>
                        </Button>
                    </div>
                ),
        },
    ];

    return (
        <>
            <Modal show={show} size="lg" onHide={onHide} onClick={onBackdropClick(onHide)} centered backdrop backdropClassName="modal-click-backdrop" style={{ zIndex: modalZIndex }} dialogClassName="scrollable-modal-fix table-mobile-scroll" contentClassName="form-modal-content" aria-labelledby="show-discount-modal-title">
                <FormModalHeader
                    icon="bi bi-plus-slash-minus"
                    title={`Descuentos de ${displayUserName}`}
                    subtitle="Consultá los descuentos registrados para este usuario."
                    onClose={onHide}
                    titleId="show-discount-modal-title"
                />

                <Modal.Body>
                    {/* Gateado en "show" para que al cerrar el body quede vacío
                        de inmediato en vez de seguir mostrando la tabla estática
                        durante el fade-out — mismo patrón que AddReadingModal
                        ("Cargar Lectura"), que no presenta el glitch al cerrar. */}
                    {show && (
                        loading ? (
                            <TableSkeleton showToolbar={false} rows={6} />
                        ) : error ? (
                            <div className="text-danger text-center">{error}</div>
                        ) : (
                            <ReusableTable<UserDiscountDto>
                                data={discounts}
                                columns={columns}
                                defaultSort="dateRegister"
                                defaultPageSize={5}
                                showPageSizeSelector={false}
                                emptyIcon="bi bi-percent"
                                emptyTitle="Sin descuentos registrados"
                                emptyMessage="Este usuario no tiene descuentos registrados actualmente."
                            />
                        )
                    )}
                </Modal.Body>
            </Modal>
            {/* Modal de confirmación */}
            <ConfirmModal
                show={showConfirmModal}
                onHide={() => { setShowConfirmModal(false); setDiscountToDelete(null); }}
                variant="error"
                title="Confirmar eliminación"
                message={
                    <>
                        ¿Estás seguro que deseas eliminar el descuento?
                    </>
                }
                hint="Esta acción no se puede deshacer."
                confirmText="Confirmar"
                confirmIcon="bi bi-trash"
                isLoading={isDeleting}
                loadingText="Eliminando..."
                onConfirm={handleConfirmDelete}
            />

            <ConfirmModal
                show={showConfirmSave}
                onHide={() => { setShowConfirmSave(false); setPendingSaveId(null); }}
                variant="warning"
                title="¿Guardar descuento?"
                message="Vas a modificar un descuento ya asignado a este usuario."
                hint="Este cambio se reflejará en las próximas facturas del usuario."
                confirmText="Guardar"
                confirmIcon="bi bi-check-circle"
                isLoading={saving}
                loadingText="Guardando..."
                onConfirm={handleConfirmSave}
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
