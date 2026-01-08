import { useState } from 'react';
import { Alert, Button, Spinner, Card, Row, Col } from 'react-bootstrap';
import DatePeriodSelector from './DatePeriodSelector';
import UserSearchInput from './UserSearchInput';
import { addData } from '../../../core/services/apiService';
import { toast } from 'react-toastify';

const BillGeneratePage = () => {
    // Estados para generación masiva
    const [bulkSelectedDate, setBulkSelectedDate] = useState<Date | null>(null);
    const [bulkIsLoading, setBulkIsLoading] = useState(false);

    // Estados para generación individual
    const [individualSelectedDate, setIndividualSelectedDate] = useState<Date | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [individualIsLoading, setIndividualIsLoading] = useState(false);

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

    return (
        <div>
            <h1 className="text-center mb-4">Generación de Facturas</h1>

            <Row className="g-4">
                {/* Sección de Generación Masiva */}
                <Col lg={6}>
                    <Card className="h-100 shadow-sm">
                        <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0">
                                <i className="bi bi-collection me-2"></i>
                                Generación Masiva
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <p className="text-muted mb-3">
                                Genera facturas automáticamente para todos los usuarios con.
                            </p>

                            <DatePeriodSelector
                                selectedDate={bulkSelectedDate}
                                onDateChange={setBulkSelectedDate}
                            />

                            <Button
                                variant="primary"
                                onClick={handleBulkSubmit}
                                disabled={bulkIsLoading}
                                className="w-100"
                                aria-label="Generar facturas masivas"
                            >
                                {bulkIsLoading ? (
                                    <>
                                        <Spinner animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                        Generando...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-lightning-charge me-2"></i>
                                        Generar Todas las Facturas
                                    </>
                                )}
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Sección de Generación Individual */}
                <Col lg={6}>
                    <Card className="h-100 shadow-sm">
                        <Card.Header className="bg-success text-white">
                            <h5 className="mb-0">
                                <i className="bi bi-person me-2"></i>
                                Generación Individual
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <p className="text-muted mb-3">
                                Genera una factura para un usuario específico.
                            </p>

                            <UserSearchInput onUserSelected={(id) => setUserId(id)} />

                            <DatePeriodSelector
                                selectedDate={individualSelectedDate}
                                onDateChange={setIndividualSelectedDate}
                            />

                            <Button
                                variant="success"
                                onClick={handleIndividualSubmit}
                                disabled={individualIsLoading || !userId}
                                className="w-100"
                                aria-label="Generar factura individual"
                            >
                                {individualIsLoading ? (
                                    <>
                                        <Spinner animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                        Generando...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-file-earmark-plus me-2"></i>
                                        Generar Factura Individual
                                    </>
                                )}
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Alert variant="info" className="mt-4">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Nota:</strong> La generación de facturas puede tomar varios segundos.
                No cierre la página durante el proceso.
            </Alert>
        </div>
    );
};

export default BillGeneratePage;
