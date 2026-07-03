import { useEffect, useState, useRef } from "react";
import { Modal, Button, Table, Spinner, Form, Badge } from "react-bootstrap";
import { toast } from "react-toastify";
import { BillDetailsDto } from "../../../core/models/dto/BillDetailsDto";
import { UserDto } from "../../../core/models/dto/UserDto";
import { getData, deleteData, updateData } from "../../../core/services/apiService";
import ConfirmModal from "../../../shared/components/confirm/ConfirmModal";
import BillPdfGenerator, { BillPdfGeneratorRef } from "../../../shared/components/pdf/BillPdfGenerator";
import { formatCurrency } from "../../../core/utils/formatters";
import { PaymentStatus } from "../../../core/models/dto/PaymentStatus";

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
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | null>(null);

    // Ref para el generador de PDF
    const pdfGeneratorRef = useRef<BillPdfGeneratorRef>(null);

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

    // Confirmar el cambio de estado
    const handleConfirmStatusChange = async () => {
        if (!billToUpdate || !selectedStatus) return;

        try {
            // Enviar el estado al endpoint
            await updateData(
                `/operator/bill-payment?idBill=${billToUpdate.idBill}&status=${selectedStatus}&_`,0,{}
            );

            // Actualizar el estado localmente
            setBills(prevBills =>
                prevBills.map(b =>
                    b.idBill === billToUpdate.idBill 
                        ? { ...b, paidStatus: selectedStatus } 
                        : b
                )
            );

            // Mensaje apropiado según el estado
            const message = selectedStatus === PaymentStatus.UNPAID 
                ? "Factura marcada como impaga"
                : selectedStatus === PaymentStatus.PAID_ON_TIME
                ? "Factura marcada como pagada en término"
                : "Factura marcada como pagada fuera de término";

            toast.success(message);
        } catch (error) {
            console.error("Error actualizando el estado:", error);
            toast.error("No se pudo actualizar el estado");
        } finally {
            setShowConfirmStatusModal(false);
            setShowPaymentModal(false);
            setBillToUpdate(null);
            setSelectedStatus(null);
        }
    };

    // Manejar el cambio de estado (abrir modal de confirmación)
    const handleTogglePaidStatus = (bill: BillDetailsDto) => {
        setBillToUpdate(bill);
        
        // Si está impaga, mostrar modal para elegir tipo de pago
        if (bill.paidStatus === PaymentStatus.UNPAID) {
            setShowPaymentModal(true);
        } else {
            // Si está pagada, marcar directamente como impaga
            setSelectedStatus(PaymentStatus.UNPAID);
            setShowConfirmStatusModal(true);
        }
    };

    // Manejar la selección del tipo de pago
    const handlePaymentTypeSelect = (status: PaymentStatus) => {
        setSelectedStatus(status);
        setShowPaymentModal(false);
        setShowConfirmStatusModal(true);
    };

    const getPaymentStatusBadge = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.UNPAID:
                return <Badge bg="danger">Impaga</Badge>;
            case PaymentStatus.PAID_ON_TIME:
                return <Badge bg="success">Pagada en término</Badge>;
            case PaymentStatus.PAID_LATE:
                return <Badge bg="warning" text="dark">Pagada fuera de término</Badge>;
            default:
                return <Badge bg="secondary">Desconocido</Badge>;
        }
    };

    // Manejar visualización de factura
    const handleViewInvoice = (bill: BillDetailsDto) => {
        setSelectedBill(bill);
        setTimeout(() => {
            pdfGeneratorRef.current?.generate();
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
                                    <th>Período</th>
                                    <th>Consumo</th>
                                    <th>Subtotal</th>
                                    <th>Descuento</th>
                                    <th>Total</th>
                                    <th>Estado de pago</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bills.map((bill) => (
                                    <tr key={bill.idBill}>
                                        <td>{bill.idBill}</td>
                                        <td>{bill.periodName}</td>
                                        <td>{bill.consumption.toFixed(2)}</td>
                                        <td>{formatCurrency(bill.subTotal)}</td>
                                        <td>{formatCurrency(bill.totalDiscounts)}</td>
                                        <td>{formatCurrency(bill.total)}</td>
                                        <td className="text-center">
                                            {getPaymentStatusBadge(bill.paidStatus)}
                                        </td>
                                        <td className="text-center">
                                            <Form.Check
                                                type="switch"
                                                id={`paidStatusSwitch-${bill.idBill}`}
                                                checked={bill.paidStatus !== PaymentStatus.UNPAID}
                                                onChange={() => handleTogglePaidStatus(bill)}
                                                className="custom-switch-container"
                                            />
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2 justify-content-center">
                                                <Button 
                                                    variant="danger" 
                                                    size="sm" 
                                                    onClick={() => handleAnnularClick(bill.idBill)} 
                                                    disabled={bill.paidStatus !== PaymentStatus.UNPAID}
                                                >
                                                    Anular
                                                </Button>
                                                <Button 
                                                    variant="primary" 
                                                    size="sm" 
                                                    onClick={() => handleViewInvoice(bill)}
                                                >
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

            {/* Modal para seleccionar tipo de pago */}
            <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Seleccionar estado de pago</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-3">
                        ¿Cómo desea marcar la factura <strong>#{billToUpdate?.idBill}</strong>?
                    </p>
                    <div className="d-grid gap-2">
                        <Button 
                            variant="success" 
                            size="lg"
                            onClick={() => handlePaymentTypeSelect(PaymentStatus.PAID_ON_TIME)}
                        >
                            <i className="bi bi-check-circle me-2"></i>
                            Pagada en término
                        </Button>
                        <Button 
                            variant="warning" 
                            size="lg"
                            onClick={() => handlePaymentTypeSelect(PaymentStatus.PAID_LATE)}
                        >
                            <i className="bi bi-clock-history me-2"></i>
                            Pagada fuera de término
                        </Button>
                    </div>
                    <p className="text-muted mt-3 small">
                        <strong>Fecha de vencimiento:</strong> {billToUpdate?.expirationDate 
                            ? new Date(billToUpdate.expirationDate).toLocaleDateString('es-AR')
                            : 'N/A'}
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
                        Cancelar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de confirmación */}
            <Modal show={showConfirmStatusModal} onHide={() => setShowConfirmStatusModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar cambio de estado</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedStatus === PaymentStatus.UNPAID ? (
                        <p>
                            ¿Está seguro que desea marcar la factura <strong>#{billToUpdate?.idBill}</strong> como <strong>impaga</strong>?
                        </p>
                    ) : (
                        <p>
                            ¿Está seguro que desea marcar la factura <strong>#{billToUpdate?.idBill}</strong> como{" "}
                            <strong>
                                {selectedStatus === PaymentStatus.PAID_ON_TIME 
                                    ? "pagada en término" 
                                    : "pagada fuera de término"}
                            </strong>?
                        </p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmStatusModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleConfirmStatusChange}>
                        Confirmar
                    </Button>
                </Modal.Footer>
            </Modal>

            {selectedBill && user && (
                <BillPdfGenerator
                    bill={selectedBill}
                    user={user}
                    includeUserName
                    includePeriod
                    onGenerate={(isGenerating) => setPdfLoading(isGenerating)}
                    ref={pdfGeneratorRef}
                />
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