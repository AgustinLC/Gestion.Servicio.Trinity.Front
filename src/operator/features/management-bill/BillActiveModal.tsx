import { useEffect, useState, useRef } from "react";
import { Modal, Button, Table, Spinner, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { BillDetailsDto } from "../../../core/models/dto/BillDetailsDto";
import { UserDto } from "../../../core/models/dto/UserDto";
import { getData, deleteData, updateData } from "../../../core/services/apiService";
import ConfirmModal from "../../../shared/components/confirm/ConfirmModal";
import PdfGenerator from "../../../shared/components/pdf/PdfGenerator";
import { formatCurrency } from "../../../core/utils/formatters";
import ConsorcioInvoice from "../../../shared/components/bill/Bill";

interface BillActiveModalProps {
    show: boolean;
    onHide: () => void;
    user: UserDto | null;
}

const BillActiveModal: React.FC<BillActiveModalProps> = ({ show, onHide, user }) => {
    // Estados
    const [bills, setBills] = useState<BillDetailsDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedBillId, setSelectedBillId] = useState<number | null>(null);
    const [anulando, setAnulando] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [selectedBill, setSelectedBill] = useState<BillDetailsDto | null>(null);
    const [showConfirmStatusModal, setShowConfirmStatusModal] = useState(false);
    const [billToUpdate, setBillToUpdate] = useState<BillDetailsDto | null>(null);

    // Constantes
    const invoiceRef = useRef<HTMLDivElement>(null);

    // Obtener datos al montar el componente 
    useEffect(() => {
        if (show && user?.idUser) {
            fetchData(user.idUser);
        }
    }, [show, user]);

    // Obtener datos de la API
    const fetchData = async (idUser: number) => {
        setLoading(true);
        try {
            const response = await getData<BillDetailsDto[]>(`/user/bill-active/${idUser}`);
            setBills(response);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al obtener las facturas activas");
            setBills([]);
        } finally {
            setLoading(false);
        }
    };

    // Manejar click en anular factura
    const handleAnnularClick = (idBill: number) => {
        setSelectedBillId(idBill);
        setShowConfirmModal(true);
    };

    // Manejar confirmación para anular factura
    const handleConfirmAnnular = async () => {
        if (!selectedBillId) return;

        setAnulando(true);
        try {
            await deleteData(`/operator/bill/mark-as-deleted?idBill`, selectedBillId);
            toast.success("Factura anulada exitosamente");
            setBills(prev => prev.filter(bill => bill.idBill !== selectedBillId));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al anular la factura");
        } finally {
            setAnulando(false);
            setShowConfirmModal(false);
            setSelectedBillId(null);
        }
    };

    // Manejar el cambio de estado de pago
    const handleConfirmStatusChange = async () => {
        if (!billToUpdate) return;

        try {
            // Enviar solo el idBill al endpoint
            await updateData(`/operator/bill-payment?idBill`, billToUpdate.idBill, {});

            // Actualizar el estado localmente
            setBills(prevBills =>
                prevBills.map(b =>
                    b.idBill === billToUpdate.idBill ? { ...b, paidStatus: !b.paidStatus } : b
                )
            );

            // Mostrar notificación de éxito
            toast.success(`Estado actualizado a ${!billToUpdate.paidStatus ? "Pagada" : "Impaga"}`);
        } catch (error) {
            console.error("Error actualizando el estado:", error);
            toast.error("No se pudo actualizar el estado");
        } finally {
            setShowConfirmStatusModal(false);
            setBillToUpdate(null);
        }
    };

    // Manejar el cambio de estado (abrir modal de confirmación)
    const handleTogglePaidStatus = (bill: BillDetailsDto) => {
        setBillToUpdate(bill);
        setShowConfirmStatusModal(true);
    };

    // Manejar visualización de factura
    const handleViewInvoice = (bill: BillDetailsDto) => {
        setSelectedBill(bill);
        setTimeout(() => {
            const trigger = document.getElementById('pdf-trigger');
            if (trigger) trigger.click();
        }, 100);
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
                                    <th>Estado de pago</th>
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
                                            <Form.Check
                                                type="switch"
                                                id={`paidStatusSwitch-${bill.idBill}`}
                                                checked={bill.paidStatus}
                                                onChange={() => handleTogglePaidStatus(bill)}
                                                className="custom-switch-container"
                                            />
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2 justify-content-center">
                                                <Button variant="danger" size="sm" onClick={() => handleAnnularClick(bill.idBill)} disabled={bill.paidStatus}>
                                                    Anular
                                                </Button>
                                                <Button variant="primary" size="sm" onClick={() => handleViewInvoice(bill)}>
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

            {/* Modal de Confirmación para Anular */}
            <ConfirmModal
                show={showConfirmModal}
                onHide={() => { setShowConfirmModal(false); setSelectedBillId(null); }}
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

            {/* Modal de Confirmación para Cambiar Estado */}
            <ConfirmModal
                show={showConfirmStatusModal}
                onHide={() => setShowConfirmStatusModal(false)}
                title="Confirmar Cambio de Estado"
                message={
                    <>
                        ¿Estás seguro que deseas cambiar el estado de la factura N°{" "}
                        <strong>{billToUpdate?.idBill}</strong> a{" "}
                        <strong>{billToUpdate?.paidStatus ? "Impaga" : "Pagada"}</strong>?
                    </>
                }
                confirmText="Confirmar"
                isLoading={false}
                onConfirm={handleConfirmStatusChange} // Sin argumentos
            />

            {selectedBill && user && (
                <PdfGenerator
                    fileName={`Factura_${selectedBill.idBill}`}
                    onGenerate={(isGenerating) => setPdfLoading(isGenerating)}
                    ref={invoiceRef}
                >
                    <ConsorcioInvoice
                        user={user}
                        bill={selectedBill}
                    />
                </PdfGenerator>
            )}

            {pdfLoading && (
                <div className="pdf-loading-overlay">
                    <Spinner animation="border" />
                    <p>Generando PDF...</p>
                </div>
            )}
        </>
    );
};

export default BillActiveModal;