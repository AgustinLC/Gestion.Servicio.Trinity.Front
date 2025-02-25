import { useEffect, useState, useRef } from "react";
import { Modal, Button, Table, Spinner, Badge } from "react-bootstrap";
import { toast } from "react-toastify";
import { BillDetailsDto } from "../../../core/models/dto/BillDetailsDto";
import { UserDto } from "../../../core/models/dto/UserDto";
import { getData, deleteData } from "../../../core/services/apiService";
import ConfirmModal from "../../../shared/components/confirm/ConfirmModal";
import PdfGenerator from "../../../shared/components/pdf/PdfGenerator";
import ConsorcioInvoice from "../../../shared/components/bill/bill";
import { formatCurrency } from "../../../core/utils/formatters";

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

    // Constantes
    const invoiceRef = useRef<HTMLDivElement>(null);

    // Obtener datos al montar el componente 
    useEffect(() => {
        if (show && user?.idUser) {
            fetchData(user.idUser);
        }
    }, [show, user]);

    // Obtener datos de la api
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

    // Manejar click en anular factura
    const handleAnnularClick = (idBill: number) => {
        setSelectedBillId(idBill);
        setShowConfirmModal(true);
    };

    // Manejar confirmacion para anular factura
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
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleAnnularClick(bill.idBill)}
                                                    disabled={bill.paidStatus}
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

            {selectedBill && user && (
                <PdfGenerator
                    fileName={`Factura_${selectedBill.idBill}`}
                    onGenerate={(isGenerating) => setPdfLoading(isGenerating)}
                    ref={invoiceRef}
                >
                    <ConsorcioInvoice
                        user={user}
                        bill={selectedBill}
                        periodo={`Enero/Febrero`}
                        numeroFactura={selectedBill.idBill.toString()}
                        fechaEmision={new Date("2025/02/25")}
                        fechaVencimiento={new Date("2025/03/25")}
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