import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button, Spinner, Card, Form } from 'react-bootstrap';
import DatePeriodSelector from './DatePeriodSelector';
import UserSearchInput from './UserSearchInput';
import { addData, getData } from '../../../core/services/apiService';
import { toast } from 'react-toastify';
import PageHeader from '../../../shared/components/PageHeader';
import { PeriodSelectorDto } from '../../../core/models/dto/PeriodSelectorDto';
import { Status } from '../../../core/models/dto/Status';
import useAppData from '../../../hooks/useAppData';
import './BillGeneratePage.css';

type GenerationMode = 'bulk' | 'individual';

const formatPreviewDate = (date: Date) => date.toLocaleDateString('es-AR');

const BillGeneratePage = () => {
    const [mode, setMode] = useState<GenerationMode>('bulk');
    const { operatorUsers } = useAppData();

    // Estados para generación masiva
    const [bulkSelectedDate, setBulkSelectedDate] = useState<Date | null>(null);
    const [bulkIsLoading, setBulkIsLoading] = useState(false);

    // Estados para generación individual
    const [individualSelectedDate, setIndividualSelectedDate] = useState<Date | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [individualIsLoading, setIndividualIsLoading] = useState(false);

    // Períodos (para mostrar el label del período activo en la Vista previa
    // cuando no se elige una fecha puntual)
    const [periods, setPeriods] = useState<PeriodSelectorDto[]>([]);

    useEffect(() => {
        const fetchPeriods = async () => {
            try {
                const response = await getData<PeriodSelectorDto[]>('/operator/periods');
                setPeriods(response);
            } catch (error) {
                console.error('Error al obtener los períodos:', error);
            }
        };
        fetchPeriods();
    }, []);

    const activePeriod = useMemo(() => periods.find((period) => period.active), [periods]);

    // Usuarios activos o suspendidos: son los que efectivamente reciben
    // factura en la generación masiva (los inactivos quedan afuera).
    const eligibleUsersCount = useMemo(
        () => operatorUsers.filter((user) => user.status === Status.ACTIVE || user.status === Status.SUSPENDED).length,
        [operatorUsers]
    );

    const selectedDate = mode === 'bulk' ? bulkSelectedDate : individualSelectedDate;
    const periodPreviewLabel = selectedDate
        ? formatPreviewDate(selectedDate)
        : activePeriod?.label ?? 'Período activo actual';

    const periodStat = { label: 'Período', value: periodPreviewLabel };
    const billsStat = { label: 'Facturas a generar', value: mode === 'bulk' ? eligibleUsersCount : (userId ? 1 : 0) };

    const previewItems = mode === 'bulk'
        ? [
            periodStat,
            { label: 'Usuarios en condición de facturar', value: eligibleUsersCount },
            billsStat,
        ]
        : [periodStat, billsStat];

    // Manejar generación masiva
    const handleBulkSubmit = async () => {
        setBulkIsLoading(true);
        try {
            const periodParam = bulkSelectedDate ? bulkSelectedDate.toISOString().split('T')[0] : null;
            await addData(`/operator/bill/generate-auto/${periodParam}`, {});
            toast.success('Facturas generadas exitosamente');
            setBulkSelectedDate(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error desconocido');
        } finally {
            setBulkIsLoading(false);
        }
    };

    // Manejar generación individual
    const handleIndividualSubmit = async () => {
        if (!userId) {
            toast.warning('Debe seleccionar un usuario antes de generar la factura');
            return;
        }
        setIndividualIsLoading(true);
        try {
            const periodParam = individualSelectedDate ? individualSelectedDate.toISOString().split('T')[0] : null;
            await addData(`/operator/bill/generate-manual/${userId}/${periodParam}`, {});
            toast.success(`Factura generada para usuario ${userId}`);
            setUserId(null);
            setIndividualSelectedDate(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error desconocido');
        } finally {
            setIndividualIsLoading(false);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (mode === 'bulk') {
            handleBulkSubmit();
        } else {
            handleIndividualSubmit();
        }
    };

    const isLoading = mode === 'bulk' ? bulkIsLoading : individualIsLoading;

    return (
        <div className="d-flex flex-column" style={{ minHeight: "calc(100vh - var(--navbar-height) - 3rem)" }}>
            <PageHeader title="Generación de Facturas" subtitle="Generá facturas de forma masiva o individual." icon="bi bi-file-earmark-plus" />

            <div className="bill-generate-container">
                <Card className="bill-generate-card border-0">
                    <div className="mode-tabs-row d-flex">
                        <button
                            type="button"
                            className={`mode-tab ${mode === 'bulk' ? 'active' : ''}`}
                            onClick={() => setMode('bulk')}
                            aria-pressed={mode === 'bulk'}
                        >
                            <div className="mode-tab-icon">
                                <i className="bi bi-calendar-check"></i>
                            </div>
                            <div>
                                <div className="mode-tab-title">Generación Masiva</div>
                                <div className="mode-tab-subtitle text-muted">Todas las facturas del período</div>
                            </div>
                        </button>
                        <button
                            type="button"
                            className={`mode-tab ${mode === 'individual' ? 'active' : ''}`}
                            onClick={() => setMode('individual')}
                            aria-pressed={mode === 'individual'}
                        >
                            <div className="mode-tab-icon">
                                <i className="bi bi-person"></i>
                            </div>
                            <div>
                                <div className="mode-tab-title">Generación Individual</div>
                                <div className="mode-tab-subtitle text-muted">Una factura para un usuario específico</div>
                            </div>
                        </button>
                    </div>

                    <Form onSubmit={handleSubmit}>
                        <div className="p-4">
                            {mode === 'individual' && (
                                <div className="form-section mb-4 pb-4 border-bottom">
                                    <div className="d-flex align-items-start gap-3 mb-3">
                                        <div className="section-icon">
                                            <i className="bi bi-person"></i>
                                        </div>
                                        <div>
                                            <h6 className="section-title-sm mb-1">Buscar usuario</h6>
                                            <div className="text-muted small">Selecciona el usuario para el cual se generará la factura.</div>
                                        </div>
                                    </div>
                                    <UserSearchInput onUserSelected={(id) => setUserId(id)} />
                                </div>
                            )}

                            <div className="form-section mb-4 pb-4 border-bottom">
                                <div className="d-flex align-items-start gap-3 mb-3">
                                    <div className="section-icon">
                                        <i className="bi bi-calendar-week"></i>
                                    </div>
                                    <div>
                                        <h6 className="section-title-sm mb-1">Período de facturación</h6>
                                        <div className="text-muted small">
                                            {mode === 'bulk'
                                                ? 'Selecciona el período para el cual se generarán las facturas de todos los usuarios activos.'
                                                : 'Selecciona el período para el cual se generará la factura.'}
                                        </div>
                                    </div>
                                </div>
                                <DatePeriodSelector
                                    selectedDate={mode === 'bulk' ? bulkSelectedDate : individualSelectedDate}
                                    onDateChange={mode === 'bulk' ? setBulkSelectedDate : setIndividualSelectedDate}
                                />
                            </div>

                            <div className="d-flex flex-column flex-md-row gap-4">
                                <div className="form-section flex-fill">
                                    <div className="d-flex align-items-start gap-3 mb-3">
                                        <div className="section-icon">
                                            <i className="bi bi-eye"></i>
                                        </div>
                                        <div>
                                            <h6 className="section-title-sm mb-1">Vista previa</h6>
                                            <div className="text-muted small">Resumen con los datos actuales del formulario.</div>
                                        </div>
                                    </div>
                                    <div className="preview-list">
                                        {previewItems.map((item) => (
                                            <div key={item.label} className="preview-list-item">
                                                <span className="preview-list-label">{item.label}</span>
                                                <span className="preview-list-value">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-section flex-fill">
                                    <div className="d-flex align-items-start gap-3 mb-3">
                                        <div className="section-icon">
                                            <i className="bi bi-list-check"></i>
                                        </div>
                                        <div>
                                            <h6 className="section-title-sm mb-1">Qué ocurrirá y qué no</h6>
                                            <div className="text-muted small">Alcance de esta acción.</div>
                                        </div>
                                    </div>
                                    <ul className="outcome-list">
                                        <li className="outcome-list-item outcome-yes">
                                            <i className="bi bi-check-circle-fill"></i>
                                            Se crearán las facturas en el sistema.
                                        </li>
                                        <li className="outcome-list-item outcome-no">
                                            <i className="bi bi-x-circle-fill"></i>
                                            No se generarán los PDF.
                                        </li>
                                        <li className="outcome-list-item outcome-yes">
                                            <i className="bi bi-check-circle-fill"></i>
                                            Se asociarán al período actual.
                                        </li>
                                        <li className="outcome-list-item outcome-no">
                                            <i className="bi bi-x-circle-fill"></i>
                                            No se registrarán pagos.
                                        </li>
                                        <li className="outcome-list-item outcome-yes">
                                            <i className="bi bi-check-circle-fill"></i>
                                            Se asignará una fecha de vencimiento.
                                        </li>
                                        <li className="outcome-list-item outcome-no">
                                            <i className="bi bi-x-circle-fill"></i>
                                            No se cargaran lecturas.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bill-generate-footer p-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
                            <div className="footer-note d-flex align-items-center gap-3">
                                <div className="footer-note-icon">
                                    <i className="bi bi-clock-history"></i>
                                </div>
                                <div>
                                    <div className="footer-note-title">La generación de facturas puede tomar varios segundos.</div>
                                    <div className="footer-note-subtitle text-muted">No cierres la página durante el proceso.</div>
                                </div>
                            </div>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isLoading || (mode === 'individual' && !userId)}
                                className="px-4 py-2 fw-semibold btn-submit"
                                aria-label={mode === 'bulk' ? 'Generar facturas masivas' : 'Generar factura individual'}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                        Generando...
                                    </>
                                ) : mode === 'bulk' ? (
                                    <>
                                        <i className="bi bi-lightning-charge me-2"></i>
                                        Generar Facturas
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-file-earmark-plus me-2"></i>
                                        Generar Factura
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default BillGeneratePage;
