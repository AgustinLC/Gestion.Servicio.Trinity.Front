import { useState } from 'react';
import { Button, Spinner, Form, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axiosInstance from '../../../config/axiosConfig';
import { WebApiResponse } from '../../../core/models/types/WebApiResponse';
import PageHeader from '../../../shared/components/PageHeader';
import FormSectionHeader from '../../../shared/components/form-section-header/FormSectionHeader';
import HintBox from '../../../shared/components/hint-box/HintBox';

const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// Los períodos de facturación son bimestrales (Ene-Feb, Mar-Abr, ...);
// dada cualquier fecha del período, se deriva el bimestre al que pertenece,
// igual que hace el backend al recibir periodDate.
const getPeriodLabel = (dateStr: string): string | null => {
    if (!dateStr) return null;
    const date = new Date(`${dateStr}T00:00:00`);
    if (isNaN(date.getTime())) return null;
    const month = date.getMonth();
    const pairStart = month % 2 === 0 ? month : month - 1;
    return `${MONTH_NAMES[pairStart]} - ${MONTH_NAMES[pairStart + 1]}`;
};

const BillUpdateExpirationPage = () => {
    // Estados
    const [periodDate, setPeriodDate] = useState<string>('');
    const [newExpirationDate, setNewExpirationDate] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [updatedCount, setUpdatedCount] = useState<number | null>(null);

    // Validar formulario
    const isFormValid = periodDate !== '' && newExpirationDate !== '';
    const periodLabel = getPeriodLabel(periodDate);

    // Manejar envío del formulario
    const handleSubmit = async () => {
        if (!isFormValid) {
            toast.warning('Debe completar ambas fechas');
            return;
        }

        // Validar que la fecha de vencimiento no sea anterior a hoy
        const today = new Date().toISOString().split('T')[0];
        if (newExpirationDate < today) {
            toast.warning('La fecha de vencimiento no puede ser anterior a hoy');
            return;
        }

        setIsLoading(true);
        setUpdatedCount(null);

        try {
            const response = await axiosInstance.put<WebApiResponse<number>>(
                `/operator/bill/update-expiration-date?periodDate=${periodDate}&newExpirationDate=${newExpirationDate}`
            );

            if (response.data.success) {
                setUpdatedCount(response.data.data);
                toast.success(response.data.message || `Se actualizaron ${response.data.data} facturas`);
            } else {
                throw new Error(response.data.message || response.data.error || 'Error desconocido');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar las fechas';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Limpiar formulario
    const handleClear = () => {
        setPeriodDate('');
        setNewExpirationDate('');
        setUpdatedCount(null);
    };

    const impactStats = [
        {
            icon: 'bi bi-receipt',
            iconBg: '#dcfce7',
            iconColor: '#16a34a',
            value: updatedCount !== null ? `${updatedCount}` : '—',
            label: 'Facturas activas',
            sublabel: updatedCount !== null ? 'Fueron actualizadas' : 'Se sabrá al confirmar',
        },
        {
            icon: 'bi bi-calendar3',
            iconBg: '#dcfce7',
            iconColor: '#16a34a',
            value: periodLabel ?? '—',
            label: 'Período seleccionado',
            sublabel: 'Período a modificar',
        },
        {
            icon: 'bi bi-clock-history',
            iconBg: '#dcfce7',
            iconColor: '#16a34a',
            value: 'Inmediato',
            label: 'Aplicación del cambio',
            sublabel: 'Se actualizará al confirmar',
        },
        {
            icon: 'bi bi-file-earmark-text',
            iconBg: '#dcfce7',
            iconColor: '#16a34a',
            value: 'Sin eliminar',
            label: 'Las facturas',
            sublabel: 'Solo se actualiza la fecha',
        },
    ];

    return (
        <div className="d-flex flex-column" style={{ minHeight: "calc(100vh - var(--navbar-height) - 3rem)" }}>
            <PageHeader title="Actualizar Fecha de Vencimiento" subtitle="Modificá el vencimiento de las facturas de un período." icon="bi bi-calendar-event" />

            <div className="mx-auto my-auto content-fade-in-slide" style={{ maxWidth: 1200, width: "100%" }}>
            <div className="card shadow-lg">
                <div className="card-body p-4">
                    <Row className="g-4">
                        <Col md={6}>
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <div className="icon-badge">
                                    <i className="bi bi-calendar3"></i>
                                </div>
                                <div className="fw-bold">Fecha del Período <span className="text-danger">*</span></div>
                            </div>
                            <div className="text-muted small mb-2">Seleccioná el período del cual querés modificar el vencimiento.</div>
                            <Form.Control
                                type="date"
                                value={periodDate}
                                onChange={(e) => setPeriodDate(e.target.value)}
                                disabled={isLoading}
                            />
                            <HintBox className="mt-2">El sistema identificará automáticamente el período correspondiente.</HintBox>
                        </Col>

                        <Col md={6}>
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <div className="icon-badge">
                                    <i className="bi bi-calendar-check"></i>
                                </div>
                                <div className="fw-bold">Nueva Fecha de Vencimiento <span className="text-danger">*</span></div>
                            </div>
                            <div className="text-muted small mb-2">Ingresá la nueva fecha de vencimiento para todas las facturas activas de este período.</div>
                            <Form.Control
                                type="date"
                                value={newExpirationDate}
                                onChange={(e) => setNewExpirationDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                disabled={isLoading}
                            />
                            <HintBox className="mt-2">La nueva fecha debe ser igual o posterior a la fecha actual.</HintBox>
                        </Col>
                    </Row>

                    <div className="impact-panel mt-4">
                        <FormSectionHeader icon="bi bi-activity" title="Impacto de la actualización" subtitle="Esta acción afectará:" />
                        <div className="d-flex flex-wrap gap-3">
                            {impactStats.map((stat, idx) => (
                                <div key={idx} className="stat-card d-flex align-items-center gap-2 px-3 py-2">
                                    <div className="stat-card-icon d-flex align-items-center justify-content-center" style={{ backgroundColor: stat.iconBg, color: stat.iconColor }}>
                                        <i className={stat.icon}></i>
                                    </div>
                                    <div>
                                        <div className="stat-value fw-bold">{stat.value}</div>
                                        <div className="stat-label text-muted small">{stat.label}</div>
                                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>{stat.sublabel}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <Button variant="outline-secondary" onClick={handleClear} disabled={isLoading}>
                            <i className="bi bi-x-circle me-1"></i> Limpiar
                        </Button>
                        <Button variant="primary" onClick={handleSubmit} disabled={isLoading || !isFormValid}>
                            {isLoading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Actualizando...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-circle me-1"></i> Actualizar Vencimiento
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="hint-box mt-3">
                <div className="icon-badge">
                    <i className="bi bi-info-circle-fill"></i>
                </div>
                <div className="fw-bold me-4" style={{ minWidth: 150, color: 'var(--bs-primary)' }}>Información importante</div>
                <ul className="list-unstyled mb-0 flex-grow-1">
                    {[
                        <>Solo se actualizarán las facturas <strong>activas</strong> (no anuladas).</>,
                        <>La fecha de vencimiento debe ser igual o posterior a hoy.</>,
                        <>Si el período no existe o no tiene facturas, se mostrará un error.</>,
                        <>Esta acción afecta a todas las facturas del período seleccionado.</>,
                    ].map((text, idx) => (
                        <li key={idx} className="d-flex align-items-start gap-2 mb-1">
                            <i className="bi bi-check-circle-fill text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                            <span>{text}</span>
                        </li>
                    ))}
                </ul>
            </div>
            </div>
        </div>
    );
};

export default BillUpdateExpirationPage;
