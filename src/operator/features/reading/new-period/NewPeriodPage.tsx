import { useState } from 'react';
import { Button, Spinner, Alert, Card, Stack } from 'react-bootstrap';
import { LightningChargeFill, InfoCircleFill } from 'react-bootstrap-icons';
import { addData } from '../../../../core/services/apiService';
import './NewPeriodPage.css';

const NewPeriodPage = () => {

    // Estados
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Manejar boton para generar nuevo periodo
    const handleNewPeriod = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        try {
            await addData('/operator/next-period', {});
            setSuccess(true);
            setTimeout(() => setSuccess(false), 10000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setIsLoading(false);
        }
    };

    // Render
    return (
        <div className="new-period-container">
            <Card className="info-card mb-4 bg-light">
                <Card.Body>
                    <Card.Title className="text-primary mb-3">
                        <InfoCircleFill className="me-2" />
                        Información Importante
                    </Card.Title>
                    <Stack gap={2}>
                        <div className="d-flex align-items-start">
                            <span className="bullet">•</span>
                            <span>INFO</span>
                        </div>
                        <div className="d-flex align-items-start">
                            <span className="bullet">•</span>
                            <span>INFO</span>
                        </div>
                        <div className="d-flex align-items-start">
                            <span className="bullet">•</span>
                            <span>El proceso puede tomar varios minutos</span>
                        </div>
                        <div className="d-flex align-items-start">
                            <span className="bullet">•</span>
                            <span>Verifique que todas las lecturas estén actualizadas</span>
                        </div>
                    </Stack>
                </Card.Body>
            </Card>

            <div className="button-container">
                <Button
                    variant="primary"
                    onClick={handleNewPeriod}
                    disabled={isLoading}
                    className="glowing-button"
                >
                    {isLoading ? (
                        <>
                            <Spinner
                                animation="border"
                                size="sm"
                                className="me-2"
                            />
                            Procesando...
                        </>
                    ) : (
                        <>
                            <LightningChargeFill className="button-icon" />
                            Generar Nuevo Período
                        </>
                    )}
                </Button>

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
        </div>
    );
};

export default NewPeriodPage;