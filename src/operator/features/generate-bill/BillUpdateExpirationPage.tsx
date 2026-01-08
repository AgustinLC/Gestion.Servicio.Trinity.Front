import { useState } from 'react';
import { Alert, Button, Spinner, Card, Form, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axiosInstance from '../../../config/axiosConfig';
import { WebApiResponse } from '../../../core/models/types/WebApiResponse';

const BillUpdateExpirationPage = () => {
    // Estados
    const [periodDate, setPeriodDate] = useState<string>('');
    const [newExpirationDate, setNewExpirationDate] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [updatedCount, setUpdatedCount] = useState<number | null>(null);

    // Validar formulario
    const isFormValid = periodDate !== '' && newExpirationDate !== '';

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
                // Limpiar formulario después de éxito
                setPeriodDate('');
                setNewExpirationDate('');
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

    return (
        <div>
            <h1 className="text-center mb-4">Actualizar Fecha de Vencimiento</h1>

            <Row className="justify-content-center">
                <Col lg={8} xl={6}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0">
                                <i className="bi bi-calendar-event me-2"></i>
                                Modificar Vencimiento por Período
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <p className="text-muted mb-4">
                                Esta herramienta permite actualizar la fecha de vencimiento de todas las facturas
                                activas de un período específico. Ingrese una fecha que corresponda al período
                                que desea modificar y la nueva fecha de vencimiento.
                            </p>

                            <Form>
                                {/* Fecha del Período */}
                                <Form.Group className="mb-4">
                                    <Form.Label>
                                        <strong>Fecha del Período</strong>
                                        <span className="text-danger ms-1">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={periodDate}
                                        onChange={(e) => setPeriodDate(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <Form.Text className="text-muted">
                                        Ingrese cualquier fecha que pertenezca al período que desea modificar.
                                        El sistema identificará automáticamente el período correspondiente.
                                    </Form.Text>
                                </Form.Group>

                                {/* Nueva Fecha de Vencimiento */}
                                <Form.Group className="mb-4">
                                    <Form.Label>
                                        <strong>Nueva Fecha de Vencimiento</strong>
                                        <span className="text-danger ms-1">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={newExpirationDate}
                                        onChange={(e) => setNewExpirationDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        disabled={isLoading}
                                    />
                                    <Form.Text className="text-muted">
                                        Esta será la nueva fecha de vencimiento para todas las facturas del período.
                                        No puede ser anterior a la fecha actual.
                                    </Form.Text>
                                </Form.Group>

                                {/* Botones */}
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="primary"
                                        onClick={handleSubmit}
                                        disabled={isLoading || !isFormValid}
                                        className="flex-grow-1"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Actualizando...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-circle me-2"></i>
                                                Actualizar Vencimiento
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        onClick={handleClear}
                                        disabled={isLoading}
                                    >
                                        <i className="bi bi-x-circle me-2"></i>
                                        Limpiar
                                    </Button>
                                </div>
                            </Form>

                            {/* Resultado */}
                            {updatedCount !== null && (
                                <Alert variant="success" className="mt-4 mb-0">
                                    <i className="bi bi-check-circle-fill me-2"></i>
                                    <strong>Operación exitosa:</strong> Se actualizaron {updatedCount} facturas.
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Información adicional */}
                    <Alert variant="info" className="mt-4">
                        <Alert.Heading className="h6">
                            <i className="bi bi-info-circle me-2"></i>
                            Información importante
                        </Alert.Heading>
                        <ul className="mb-0 ps-3">
                            <li>Solo se actualizarán las facturas <strong>activas</strong> (no eliminadas).</li>
                            <li>La fecha de vencimiento debe ser igual o posterior a hoy.</li>
                            <li>Si el período no existe o no tiene facturas, se mostrará un error.</li>
                            <li>Esta acción afecta a todas las facturas del período seleccionado.</li>
                        </ul>
                    </Alert>
                </Col>
            </Row>
        </div>
    );
};

export default BillUpdateExpirationPage;
