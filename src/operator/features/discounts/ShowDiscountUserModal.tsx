import React, { useEffect, useState } from "react";
import { Button, Modal, Spinner, Table, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { UserDiscountDto } from "../../../core/models/dto/UserDiscountDto";
import { getData, updateData, deleteData } from "../../../core/services/apiService";
import { DiscountDto } from "../../../core/models/dto/Discount";
import { UserDto } from "../../../core/models/dto/UserDto";
import ConfirmModal from "../../../shared/components/confirm/ConfirmModal";
import AddDiscountModal from "./AddDiscountModal";
import { ApplyCondition } from "../../../core/models/dto/ApplyCondition";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";

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
    const [sortAsc, setSortAsc] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);

    // Constantes
    const itemsPerPage = 5;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = discounts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(discounts.length / itemsPerPage);

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

    // Manejar orden asc/desc por ID
    const handleSort = () => {
        const sortedDiscounts = [...discounts].sort((a, b) =>
            sortAsc ? a.idUserDiscount - b.idUserDiscount : b.idUserDiscount - a.idUserDiscount
        );
        setDiscounts(sortedDiscounts);
        setSortAsc(!sortAsc);
    };

    // Obtener nombre del descuento
    const getDiscountName = (idDiscount: number) => {
        return billingDiscounts.find(bd => bd.idDiscount === idDiscount)?.name || idDiscount;
    };

    const displayUserName = userName || `${user.firstName} ${user.lastName}`;

    return (
        <>
            <Modal show={show} size="lg" onHide={onHide} centered contentClassName="form-modal-content" aria-labelledby="show-discount-modal-title">
                <FormModalHeader
                    icon="bi bi-plus-slash-minus"
                    title={`Descuentos de ${displayUserName}`}
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
                        <>
                            <Table striped bordered hover>
                                <thead>
                                    <tr className="text-center align-middle">
                                        <th>Fecha de creación
                                            <span style={{ cursor: "pointer", marginLeft: "5px" }} onClick={handleSort}>
                                                {sortAsc ? "▲" : "▼"}
                                            </span>
                                        </th>
                                        <th>Descuento</th>
                                        <th>Importe $</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentItems.map((discount) => {
                                        const discountType = getDiscountType(discount.idDiscount);
                                        const isFixed = discountType === ApplyCondition.FIXED;
                                        const isEditing = editingId === discount.idUserDiscount;

                                        return (
                                            <tr className="align-middle" key={discount.idUserDiscount}>
                                                {/* ID */}
                                                <td className="text-center">{new Date(discount.dateRegister).toLocaleDateString("es-AR")}</td>

                                                {/* Descuento */}
                                                <td className="text-center">
                                                    {isEditing ? (
                                                        <Form.Select
                                                            value={tempData.idDiscount}
                                                            onChange={(e) =>
                                                                setTempData(prev => ({
                                                                    ...prev,
                                                                    idDiscount: Number(e.target.value)
                                                                }))
                                                            }
                                                        >
                                                            {billingDiscounts.map((bd) => (
                                                                <option key={bd.idDiscount} value={bd.idDiscount}>
                                                                    {bd.name}
                                                                </option>
                                                            ))}
                                                        </Form.Select>
                                                    ) : (
                                                        getDiscountName(discount.idDiscount)
                                                    )}
                                                </td>

                                                {/* Importe */}
                                                <td className="text-center">
                                                    {isEditing ? (
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
                                                            disabled={isFixed}
                                                        />
                                                    ) : (
                                                        discount.value
                                                    )}
                                                </td>

                                                {/* Acciones */}
                                                <td className="text-center">
                                                    {isEditing ? (
                                                        <Button variant="success" onClick={() => handleSave(discount.idUserDiscount)} disabled={saving}>
                                                            {saving ? <Spinner as="span" animation="border" size="sm" /> : "Guardar"}
                                                        </Button>
                                                    ) : (
                                                        <div className="d-flex justify-content-center gap-2">
                                                            <Button variant="warning" onClick={() => handleEdit(discount)}>
                                                                Editar
                                                            </Button>
                                                            <Button variant="danger" onClick={() => handleDeleteClick(discount.idUserDiscount)}>
                                                                Eliminar
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
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
                onHide={() => { setShowConfirmModal(false); setDiscountToDelete(null); }}
                title="Confirmar eliminación"
                message={
                    <>
                        ¿Estás seguro que deseas eliminar el descuento?
                    </>
                }
                confirmText="Confirmar"
                isLoading={isDeleting}
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