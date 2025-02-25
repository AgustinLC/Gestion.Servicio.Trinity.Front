import { useEffect, useState } from "react";
import { Modal, Button, Table, Spinner, Badge } from "react-bootstrap";
import { toast } from "react-toastify";
import { BillDetailsDto } from "../../../core/models/dto/BillDetailsDto";
import { getData, deleteData } from "../../../core/services/apiService";
import ConfirmModal from "../../../shared/components/confirm/ConfirmModal";

interface BillActiveModalProps {
    show: boolean;
    onHide: () => void;
    user: { idUser: number; firstName: string; lastName: string; dni: number } | null;
}

const BillActiveModal: React.FC<BillActiveModalProps> = ({ show, onHide, user }) => {

    // Estados
    const [bills, setBills] = useState<BillDetailsDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedBillId, setSelectedBillId] = useState<number | null>(null);
    const [anulando, setAnulando] = useState(false);

    // Obtener datos al montar el componente
    useEffect(() => {
        if (show && user?.idUser) {
            fetchData(user.idUser);
        }
    }, [show, user]);

    //
    const fetchData = async (idUser: number) => {
        setLoading(true);
        try {
            const response = await getData<BillDetailsDto[]>(`/operator/bill-active/${idUser}`);
            setBills(response);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al obtener las facturas activas");
            setBills([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAnnularClick = (idBill: number) => {
        setSelectedBillId(idBill);
        setShowConfirmModal(true);
    };

    const handleConfirmAnnular = async () => {
        if (!selectedBillId) return;

        setAnulando(true);
        try {
            await deleteData(`/operator/bill/mark-as-deleted?idBill`, selectedBillId);
            toast.success("Factura anulada exitosamente");
            setBills(prev => prev.map(bill =>
                bill.idBill === selectedBillId ? { ...bill, deleted: true } : bill
            ).filter(bill => !bill.deleted));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al anular la factura");
        } finally {
            setAnulando(false);
            setShowConfirmModal(false);
            setSelectedBillId(null);
        }
    };

    // Formatear moneda
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(value);
    };

    return (
        <>
            <Modal show={show} onHide={onHide} size="xl" centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>
                        Facturas Activas - {user?.firstName} {user?.lastName}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {loading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" />
                            <p className="mt-2">Cargando facturas...</p>
                        </div>
                    ) : bills.length === 0 ? (
                        <p className="text-center">No hay facturas activas</p>
                    ) : (
                        <Table striped bordered hover responsive className="align-middle text-center text-nowrap">
                            <thead>
                                <tr>
                                    <th>N° Factura</th>
                                    <th>Consumo</th>
                                    <th>Excedente</th>
                                    <th>Precio Excedente</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bills.map((bill) => (
                                    <tr key={bill.idBill}>
                                        <td>{bill.idBill}</td>
                                        <td>{bill.consumption.toFixed(2)}</td>
                                        <td>{bill.surplus.toFixed(2)}</td>
                                        <td>{formatCurrency(bill.surplusPrice)}</td>
                                        <td>{formatCurrency(bill.total)}</td>
                                        <td>
                                            <Badge bg={bill.paidStatus ? 'success' : 'warning'}>
                                                {bill.paidStatus ? 'Pagada' : 'Impaga'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2 justify-content-center">
                                                <Button variant="danger" size="sm" onClick={() => handleAnnularClick(bill.idBill)} disabled={bill.paidStatus}>
                                                    Anular
                                                </Button>
                                                <Button variant="primary" size="sm" onClick={() => {/* Lógica de visualización */ }}>
                                                    Visualizar
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Modal.Body>

                <Modal.Footer className="d-flex justify-content-between">
                    <small className="text-muted">
                        * Las facturas pagadas no pueden ser anuladas
                    </small>
                    <Button variant="secondary" onClick={onHide}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>

            <ConfirmModal
                show={showConfirmModal}
                onHide={() => {setShowConfirmModal(false); setSelectedBillId(null);}}
                title="¿Anular factura?"
                message={
                    <>
                        <p>Estás por anular la factura N° <strong>{selectedBillId}</strong></p>
                        <p className="text-danger fw-bold">Esta acción no se puede deshacer</p>
                    </>
                }
                confirmText="Anular"
                isLoading={anulando}
                onConfirm={handleConfirmAnnular}
            />
        </>
    );
};

export default BillActiveModal;