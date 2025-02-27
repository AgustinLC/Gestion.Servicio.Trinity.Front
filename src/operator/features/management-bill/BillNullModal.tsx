import { useEffect, useRef, useState } from "react";
import { Modal, Button, Table, Spinner, Badge } from "react-bootstrap";
import { getData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { BillDetailsDto } from "../../../core/models/dto/BillDetailsDto";
import PdfGenerator from "../../../shared/components/pdf/PdfGenerator";
import { formatCurrency } from "../../../core/utils/formatters";
import ConsorcioInvoice from "../../../shared/components/bill/Bill";
import { UserDto } from "../../../core/models/dto/UserDto";

interface BillNullModalProps {
    show: boolean;
    onHide: () => void;
    user: UserDto | null;
}

const BillNullModal: React.FC<BillNullModalProps> = ({ show, onHide, user }) => {

    // Estados
    const [bills, setBills] = useState<BillDetailsDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [selectedBill, setSelectedBill] = useState<BillDetailsDto | null>(null);

    // Ref para el componente de factura
    const invoiceRef = useRef<HTMLDivElement>(null);

    // Obtener datos al cargar el componente
    useEffect(() => {
        if (show && user) {
            fetchData(user.idUser);
        }
    }, [show, user]);

    // Obtener datos de la api
    const fetchData = async (idUser: number) => {
        setLoading(true);
        try {
            const response = await getData<BillDetailsDto[]>(`/operator/bill-deleted/${idUser}`);
            setBills(response);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al obtener facturas anuladas.");
        } finally {
            setLoading(false);
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

    // Render
    return (
        <>
            <Modal show={show} onHide={onHide} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Facturas Anuladas de {user?.firstName} {user?.lastName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loading ? (
                        <div className="d-flex justify-content-center">
                            <Spinner animation="border" />
                        </div>
                    ) : bills.length === 0 ? (
                        <p className="text-center">No hay facturas anuladas</p>
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
                                            <Button variant="primary" size="sm" onClick={() => handleViewInvoice(bill)}>
                                                Visualizar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>

            {selectedBill && user && (
                <PdfGenerator
                    fileName={`Factura_${selectedBill.idBill}`}
                    onGenerate={(isGenerating) => setPdfLoading(isGenerating)}
                    ref={invoiceRef}
                >
                    <ConsorcioInvoice user={user} bill={selectedBill} />
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

export default BillNullModal;
