import { useEffect, useRef, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import { getData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { BillDetailsDto } from "../../../core/models/dto/BillDetailsDto";
import BillPdfGenerator, { BillPdfGeneratorRef } from "../../../shared/components/pdf/BillPdfGenerator";
import { formatCurrency, formatDate } from "../../../core/utils/formatters";
import { UserDto } from "../../../core/models/dto/UserDto";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";
import HintBox from "../../../shared/components/hint-box/HintBox";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import TableEmptyState from "../../../shared/components/table-empty-state/TableEmptyState";
import TableSkeleton from "../../../shared/components/table-skeleton/TableSkeleton";
import RowActions from "../../../shared/components/table/RowActions";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import { useModalLayer } from "../../../context/ModalStackContext";
import { onBackdropClick } from "../../../shared/hooks/useConfirmDiscard";

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
    const modalZIndex = useModalLayer(show);

    // Ref para el generador de PDF
    const pdfGeneratorRef = useRef<BillPdfGeneratorRef>(null);

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
            pdfGeneratorRef.current?.generate();
        }, 100);
    };

    const getPaymentStatusBadge = (paid: boolean) =>
        paid ? (
            <span className="badge-soft badge-soft-success">
                <i className="bi bi-check-circle-fill"></i> Pagada
            </span>
        ) : (
            <span className="badge-soft badge-soft-warning">
                <i className="bi bi-exclamation-circle-fill"></i> Impaga
            </span>
        );

    // Totales para las tarjetas resumen

    // Columnas de la tabla de facturas anuladas
    const columns: TableColumnDefinition<BillDetailsDto>[] = [
        {
            key: "idBill",
            label: "N° Factura",
            sortable: true,
            render: (bill) => (
                <div className="d-flex align-items-center gap-2 text-start">
                    <div className="icon-badge" style={{ width: 34, height: 34, fontSize: "0.9rem" }}>
                        <i className="bi bi-file-earmark-x"></i>
                    </div>
                    <div>
                        <div className="fw-bold">{bill.idBill}</div>
                        <div className="text-muted small">{formatDate(bill.dateRegister)}</div>
                    </div>
                </div>
            ),
        },
        { key: "consumption", label: "Consumo (m³)", sortable: true, render: (bill) => bill.consumption.toFixed(2) },
        { key: "surplus", label: "Excedente", render: (bill) => bill.surplus.toFixed(2) },
        { key: "surplusPrice", label: "Precio excedente", render: (bill) => formatCurrency(bill.surplusPrice) },
        { key: "total", label: "Total", sortable: true, render: (bill) => formatCurrency(bill.total) },
        { key: "paidStatus", label: "Estado", render: (bill) => getPaymentStatusBadge(Boolean(bill.paidStatus)) },
        {
            key: "actions",
            label: "Acciones",
            actions: (bill) => (
                <RowActions
                    items={[
                        {
                            label: "Descargar factura",
                            icon: "bi bi-download",
                            onClick: () => handleViewInvoice(bill),
                        },
                    ]}
                />
            ),
        },
    ];

    // Render
    return (
        <>
            <Modal show={show} onHide={onHide} onClick={onBackdropClick(onHide)} size="xl" centered scrollable backdrop backdropClassName="modal-click-backdrop" style={{ zIndex: modalZIndex }} dialogClassName="scrollable-modal-fix table-mobile-scroll" contentClassName="form-modal-content" aria-labelledby="bill-null-modal-title">
                <FormModalHeader
                    icon="bi bi-file-earmark-x"
                    title={`Facturas Anuladas - ${user?.firstName ?? ""} ${user?.lastName ?? ""}`}
                    subtitle="Historial de facturas anuladas del usuario."
                    onClose={onHide}
                    titleId="bill-null-modal-title"
                />
                <Modal.Body>
                    {/* Gateado en "show" para que al cerrar el body quede vacío
                        de inmediato en vez de seguir mostrando la tabla estática
                        durante el fade-out — mismo patrón que AddReadingModal
                        ("Cargar Lectura"), que no presenta el glitch al cerrar. */}
                    {show && (
                        loading ? (
                            <TableSkeleton showToolbar={false} rows={6} />
                        ) : bills.length === 0 ? (
                            <TableEmptyState
                                icon="bi bi-file-earmark-x"
                                title="Sin facturas anuladas"
                                message="Este usuario no tiene facturas anuladas registradas."
                            />
                        ) : (
                            <div>
                                <ReusableTable<BillDetailsDto>
                                    data={[...bills].sort((a, b) => b.idBill - a.idBill)}
                                    columns={columns}
                                    defaultPageSize={5}
                                    showPageSizeSelector={false}
                                />
                                <HintBox className="mt-3">
                                    Las facturas anuladas quedan como registro histórico y no pueden reactivarse ni marcarse como pagadas.
                                </HintBox>
                            </div>
                        )
                    )}
                </Modal.Body>
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

export default BillNullModal;
