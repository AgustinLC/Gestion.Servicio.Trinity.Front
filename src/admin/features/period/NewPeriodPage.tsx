import { useEffect, useState } from 'react';
import { Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { LightningChargeFill } from 'react-bootstrap-icons';
import { addData, getData } from '../../../core/services/apiService';
import { PeriodSelectorDto } from '../../../core/models/dto/PeriodSelectorDto';
import PageHeader from '../../../shared/components/PageHeader';
import KpiCard from '../../../shared/components/kpi-card/KpiCard';
import ConfirmModal from '../../../shared/components/confirm/ConfirmModal';
import useAppData from '../../../hooks/useAppData';
import './NewPeriodPage.css';

interface InfoItem {
    icon: string;
    iconBg: string;
    iconColor: string;
    title: string;
    description: string;
}

// Contenido estático: no depende de datos, describe el comportamiento fijo
// del proceso de generación de período.
const IMPORTANT_INFO: InfoItem[] = [
    {
        icon: 'bi bi-file-earmark-plus',
        iconBg: '#dcfce7', iconColor: '#16a34a',
        title: 'Se crearán las lecturas vacías',
        description: 'Se generará un registro de lectura vacío para cada medidor activo del nuevo período.',
    },
    {
        icon: 'bi bi-people',
        iconBg: '#dbeafe', iconColor: '#2563eb',
        title: 'Habilita la carga de lecturas',
        description: 'Una vez creado el período, los operarios podrán comenzar a cargar las lecturas.',
    },
    {
        icon: 'bi bi-lock',
        iconBg: '#ffedd5', iconColor: '#ea580c',
        title: 'El período anterior quedará bloqueado',
        description: 'El sistema exige que el ciclo anterior esté completo antes de habilitar uno nuevo.',
    },
    {
        icon: 'bi bi-clock-history',
        iconBg: '#f3e8ff', iconColor: '#9333ea',
        title: 'Proceso rápido',
        description: 'La creación del período y las lecturas vacías suele completarse en pocos segundos.',
    },
];

const WILL_HAPPEN = [
    'Se generará un registro de lectura por cada medidor activo.',
    'Todas las lecturas comenzarán vacías.',
    'Los operarios podrán comenzar a cargar lecturas.',
    'El nuevo período quedará como ACTIVO.',
    'El período anterior quedará finalizado y bloqueado para edición.',
];

const WONT_HAPPEN = [
    'No se generarán facturas.',
    'No se modificarán consumos.',
    'No se alterarán pagos ni saldos.',
];

const NewPeriodPage = () => {
    // Estados
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [periods, setPeriods] = useState<PeriodSelectorDto[]>([]);

    // Datos ya cargados en el contexto global (sin pedir nada nuevo al
    // backend para esta pantalla): sirven para mostrar el alcance real de la
    // operación en vez de un texto genérico.
    const { operatorUsers, operatorActiveUsers, operatorReadingUsers } = useAppData();
    const activeMetersCount = operatorActiveUsers.length;
    const pendingReadingCount = operatorReadingUsers.length;
    const excludedUsersCount = Math.max(operatorUsers.length - operatorActiveUsers.length, 0);
    const activePeriod = periods.find((period) => period.active);

    // Único dato que sí requiere un pedido propio de esta pantalla: el
    // período actual no está en el contexto global (solo lo cargan Resumen y
    // el selector de facturación por filtros).
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

    // Manejar boton para generar nuevo periodo
    const handleNewPeriod = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        try {
            await addData('/operator/next-period', {});
            setSuccess(true);
            setTimeout(() => setSuccess(false), 300000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setIsLoading(false);
            setShowConfirmModal(false);
        }
    };

    // Render
    return (
        <div className="d-flex flex-column" style={{ minHeight: "calc(100vh - var(--navbar-height) - 3rem)" }}>
            <PageHeader title="Generar nuevo período" subtitle="Creá el próximo período y generá las lecturas vacías para todos los medidores activos." icon="bi bi-calendar-plus" />

            <div className="my-auto content-fade-in-slide">
                {/* Tarjetas de resumen */}
                <Row className="g-3 mb-3">
                    <Col xl={3} md={6}>
                        <KpiCard
                            icon="bi bi-speedometer2"
                            iconBg="rgba(0, 119, 255, 0.1)"
                            iconColor="var(--bs-primary)"
                            label="Medidores activos"
                            value={activeMetersCount}
                            trend="neutral"
                        />
                    </Col>
                    <Col xl={3} md={6}>
                        <KpiCard
                            icon="bi bi-clipboard-data"
                            iconBg="#f3e8ff"
                            iconColor="#9333ea"
                            label="Pendientes de lectura"
                            value={pendingReadingCount}
                            trend="neutral"
                        />
                    </Col>
                    <Col xl={3} md={6}>
                        <KpiCard
                            icon="bi bi-calendar-check"
                            iconBg="#ccfbf1"
                            iconColor="#0d9488"
                            label="Período actual activo"
                            value={activePeriod?.label ?? 'Sin período activo'}
                            trend="neutral"
                        />
                    </Col>
                    <Col xl={3} md={6}>
                        <KpiCard
                            icon="bi bi-person-x"
                            iconBg="#f1f5f9"
                            iconColor="#64748b"
                            label="Usuarios no incluidos (inactivos)"
                            value={excludedUsersCount}
                            trend="neutral"
                        />
                    </Col>
                </Row>

                <Row className="g-3 mb-3">
                    {/* Información importante */}
                    <Col lg={4}>
                        <div className="card h-100">
                            <div className="card-body p-4">
                                <h6 className="fw-bold text-primary mb-3">
                                    <i className="bi bi-info-circle-fill me-2"></i>
                                    Información importante
                                </h6>
                                {IMPORTANT_INFO.map((item) => (
                                    <div key={item.title} className="d-flex gap-3 mb-3">
                                        <div
                                            className="d-flex align-items-center justify-content-center flex-shrink-0"
                                            style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: item.iconBg, color: item.iconColor }}
                                        >
                                            <i className={item.icon}></i>
                                        </div>
                                        <div>
                                            <div className="fw-semibold small">{item.title}</div>
                                            <div className="text-muted" style={{ fontSize: '0.82rem' }}>{item.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Col>

                    {/* Resumen de la operación */}
                    <Col lg={4}>
                        <div className="card h-100">
                            <div className="card-body p-4">
                                <h6 className="fw-bold mb-3">Resumen de la operación</h6>
                                <div className="d-flex flex-column gap-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="icon-badge" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>
                                            <i className="bi bi-journal-plus"></i>
                                        </div>
                                        <div>
                                            <div className="fw-bold">{activeMetersCount}</div>
                                            <div className="text-muted small">lecturas vacías se crearán</div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="icon-badge" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                                            <i className="bi bi-speedometer2"></i>
                                        </div>
                                        <div>
                                            <div className="fw-bold">{activeMetersCount}</div>
                                            <div className="text-muted small">medidores incluidos</div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="icon-badge" style={{ backgroundColor: '#ffedd5', color: '#ea580c' }}>
                                            <i className="bi bi-hourglass-split"></i>
                                        </div>
                                        <div>
                                            <div className="fw-bold">Pendiente</div>
                                            <div className="text-muted small">estado inicial de las lecturas</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>

                    {/* Qué sucederá / qué no */}
                    <Col lg={4}>
                        <div className="card h-100">
                            <div className="card-body p-4">
                                <h6 className="fw-bold mb-3">¿Qué sucederá al crear el período?</h6>
                                <ul className="list-unstyled mb-3">
                                    {WILL_HAPPEN.map((text) => (
                                        <li key={text} className="d-flex align-items-start gap-2 mb-2">
                                            <i className="bi bi-check-circle-fill text-success mt-1" style={{ fontSize: '0.8rem' }}></i>
                                            <span className="small">{text}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="rounded-3 p-3" style={{ backgroundColor: '#eff6ff' }}>
                                    <div className="fw-semibold small text-primary mb-2">¿Qué NO sucederá?</div>
                                    <ul className="list-unstyled mb-0">
                                        {WONT_HAPPEN.map((text) => (
                                            <li key={text} className="small text-muted">• {text}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Confirmación */}
                <div className="card">
                    <div className="footer-note-banner p-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="icon-badge">
                                <i className="bi bi-shield-check"></i>
                            </div>
                            <div>
                                <div className="footer-note-title">Estás a punto de crear un nuevo período</div>
                                <div className="footer-note-subtitle text-muted">Revisá la información y confirmá para continuar.</div>
                            </div>
                        </div>
                        <div className="d-flex flex-column align-items-end gap-1">
                            <Button variant="primary" onClick={() => setShowConfirmModal(true)} disabled={isLoading} className="px-4 py-2 fw-semibold">
                                {isLoading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <LightningChargeFill className="me-2" />
                                        Generar Nuevo Período
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {success && (
                    <Alert variant="success" className="mt-3 fade-in">
                        ¡Nuevo período generado exitosamente!
                    </Alert>
                )}

                {error && (
                    <Alert variant="danger" className="mt-3 fade-in">
                        Error: {error}
                    </Alert>
                )}
            </div>

            <ConfirmModal
                show={showConfirmModal}
                onHide={() => setShowConfirmModal(false)}
                title="¿Generar nuevo período?"
                icon="bi bi-shield-check"
                confirmVariant="primary"
                message={
                    <>
                        Estás a punto de crear un nuevo período y generar lecturas para posteriormente cargar a {' '}
                        <strong>{activeMetersCount} medidores</strong>. El período actual quedará
                        finalizado y bloqueado para edición.
                    </>
                }
                confirmText="Generar Período"
                isLoading={isLoading}
                loadingText="Generando..."
                onConfirm={handleNewPeriod}
            />
        </div>
    );
};

export default NewPeriodPage;
