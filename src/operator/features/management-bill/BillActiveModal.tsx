import { useEffect, useState, useRef } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { BillDetailsDto } from "../../../core/models/dto/BillDetailsDto";
import { UserDto } from "../../../core/models/dto/UserDto";
import { getData, deleteData, updateData } from "../../../core/services/apiService";
import ConfirmModal from "../../../shared/components/confirm/ConfirmModal";
import BillPdfGenerator, { BillPdfGeneratorRef } from "../../../shared/components/pdf/BillPdfGenerator";
import { formatCurrency, formatDate } from "../../../core/utils/formatters";
import { PaymentStatus } from "../../../core/models/dto/PaymentStatus";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";
import HintBox from "../../../shared/components/hint-box/HintBox";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import RowActions from "../../../shared/components/table/RowActions";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";

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
                return (
                    <span className="badge-soft badge-soft-danger">
                        <i className="bi bi-exclamation-circle-fill"></i> Impaga
                    </span>
                );
            case PaymentStatus.PAID_ON_TIME:
                return (
                    <span className="badge-soft badge-soft-success">
                        <i className="bi bi-check-circle-fill"></i> Pagada en término
                    </span>
                );
            case PaymentStatus.PAID_LATE:
                return (
                    <span className="badge-soft badge-soft-warning">
                        <i className="bi bi-clock-fill"></i> Pagada fuera de término
                    </span>
                );
            default:
                return <span className="badge-soft badge-soft-neutral">Desconocido</span>;
        }
    };

    // Manejar visualización de factura
    const handleViewInvoice = (bill: BillDetailsDto) => {
        setSelectedBill(bill);
        setTimeout(() => {
            pdfGeneratorRef.current?.generate();
        }, 100);
    };

    // Totales para las tarjetas resumen
    const totalConsumption = bills.reduce((sum, bill) => sum + (bill.consumption ?? 0), 0);
    const totalBilled = bills.reduce((sum, bill) => sum + (bill.total ?? 0), 0);
    const totalDiscounts = bills.reduce((sum, bill) => sum + (bill.totalDiscounts ?? 0), 0);

    // Columnas de la tabla de facturas activas
    const columns: TableColumnDefinition<BillDetailsDto>[] = [
        {
            key: "idBill",
            label: "N° Factura",
            sortable: true,
            render: (bill) => (
                <div className="d-flex align-items-center gap-2 text-start">
                    <div className="icon-badge" style={{ width: 34, height: 34, fontSize: "0.9rem" }}>
                        <i className="bi bi-file-earmark-text"></i>
                    </div>
                    <div>
                        <div className="fw-bold">{bill.idBill}</div>
                        <div className="text-muted small">{formatDate(bill.dateRegister)}</div>
                    </div>
                </div>
            ),
        },
        {
            key: "periodName",
            label: "Período",
            render: (bill) => (
                <div className="text-start">
                    <div>{bill.periodName}</div>
                    {bill.readingsBillDto?.previousReadingDate && bill.readingsBillDto?.currentReadingDate && (
                        <div className="text-muted small">
                            <i className="bi bi-calendar3 me-1"></i>
                            {formatDate(bill.readingsBillDto.previousReadingDate)} - {formatDate(bill.readingsBillDto.currentReadingDate)}
                        </div>
                    )}
                </div>
            ),
        },
        { key: "consumption", label: "Consumo (m³)", sortable: true, render: (bill) => bill.consumption.toFixed(2) },
        { key: "subTotal", label: "Subtotal", sortable: true, render: (bill) => formatCurrency(bill.subTotal) },
        { key: "totalDiscounts", label: "Descuento", render: (bill) => formatCurrency(bill.totalDiscounts) },
        { key: "total", label: "Total", sortable: true, render: (bill) => formatCurrency(bill.total) },
        { key: "paidStatus", label: "Estado de pago", render: (bill) => getPaymentStatusBadge(bill.paidStatus) },
        {
            key: "actions",
            label: "Acciones",
            actions: (bill) => (
                <RowActions
                    items={[
                        {
                            label: bill.paidStatus === PaymentStatus.UNPAID ? "Marcar como pagada" : "Marcar como impaga",
                            icon: "bi bi-cash-coin",
                            onClick: () => handleTogglePaidStatus(bill),
                        },
                        {
                            label: "Visualizar factura",
                            icon: "bi bi-eye",
                            onClick: () => handleViewInvoice(bill),
                        },
                        ...(bill.paidStatus === PaymentStatus.UNPAID
                            ? [
                                {
                                    label: "Anular factura",
                                    icon: "bi bi-trash",
                                    onClick: () => handleAnnularClick(bill.idBill),
                                    variant: "danger" as const,
                                },
                            ]
                            : []),
                    ]}
                />
            ),
        },
    ];

    return (
        <>
            <Modal show={show} onHide={onHide} size="xl" centered scrollable dialogClassName="bill-active-modal-dialog" contentClassName="form-modal-content" aria-labelledby="bill-active-modal-title">
                <FormModalHeader
                    icon="bi bi-file-earmark-spreadsheet"
                    title={`Facturas Activas - ${user?.firstName ?? ""} ${user?.lastName ?? ""}`}
                    subtitle="Consulta y gestiona las facturas activas del usuario."
                    onClose={onHide}
                    titleId="bill-active-modal-title"
                />

                <Modal.Body>
                    {loading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" />
                            <p className="mt-2">Cargando facturas...</p>
                        </div>
                    ) : bills.length === 0 ? (
                        <p className="text-center">No hay facturas activas</p>
                    ) : (
                        <>
                            <div className="d-flex flex-wrap gap-3 mb-3">
                                <div className="stat-card d-flex align-items-center gap-2 px-3 py-2 flex-fill">
                                    <div className="stat-card-icon d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(0, 119, 255, 0.1)", color: "var(--bs-primary)" }}>
                                        <i className="bi bi-file-earmark-text"></i>
                                    </div>
                                    <div>
                                        <div className="stat-label text-muted small">Total de facturas</div>
                                        <div className="stat-value fw-bold">{bills.length}</div>
                                    </div>
                                </div>
                                <div className="stat-card d-flex align-items-center gap-2 px-3 py-2 flex-fill">
                                    <div className="stat-card-icon d-flex align-items-center justify-content-center" style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}>
                                        <i className="bi bi-droplet-fill"></i>
                                    </div>
                                    <div>
                                        <div className="stat-label text-muted small">Consumo total</div>
                                        <div className="stat-value fw-bold">{totalConsumption.toFixed(2)} m³</div>
                                    </div>
                                </div>
                                <div className="stat-card d-flex align-items-center gap-2 px-3 py-2 flex-fill">
                                    <div className="stat-card-icon d-flex align-items-center justify-content-center" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
                                        <i className="bi bi-cash-stack"></i>
                                    </div>
                                    <div>
                                        <div className="stat-label text-muted small">Total facturado</div>
                                        <div className="stat-value fw-bold">{formatCurrency(totalBilled)}</div>
                                    </div>
                                </div>
                                <div className="stat-card d-flex align-items-center gap-2 px-3 py-2 flex-fill">
                                    <div className="stat-card-icon d-flex align-items-center justify-content-center" style={{ backgroundColor: "#ffedd5", color: "#c2410c" }}>
                                        <i className="bi bi-tag-fill"></i>
                                    </div>
                                    <div>
                                        <div className="stat-label text-muted small">Descuentos totales</div>
                                        <div className="stat-value fw-bold">{formatCurrency(totalDiscounts)}</div>
                                    </div>
                                </div>
                            </div>

                            <ReusableTable<BillDetailsDto>
                                data={[...bills].sort((a, b) => b.idBill - a.idBill)}
                                columns={columns}
                            />

                            <HintBox className="mt-3">
                                Las facturas pagadas no pueden ser anuladas.
                            </HintBox>
                        </>
                    )}
                </Modal.Body>
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
            <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered contentClassName="form-modal-content" aria-labelledby="payment-status-modal-title">
                <FormModalHeader
                    icon="bi bi-credit-card"
                    title="Seleccionar estado de pago"
                    onClose={() => setShowPaymentModal(false)}
                    titleId="payment-status-modal-title"
                />
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
            <Modal show={showConfirmStatusModal} onHide={() => setShowConfirmStatusModal(false)} centered contentClassName="form-modal-content" aria-labelledby="confirm-status-modal-title">
                <FormModalHeader
                    icon="bi bi-question-circle"
                    title="Confirmar cambio de estado"
                    onClose={() => setShowConfirmStatusModal(false)}
                    titleId="confirm-status-modal-title"
                />
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