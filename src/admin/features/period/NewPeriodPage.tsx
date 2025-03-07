import { useState } from 'react';
import { Button, Spinner, Alert, Card, Stack } from 'react-bootstrap';
import { LightningChargeFill, InfoCircleFill } from 'react-bootstrap-icons';
import { addData } from '../../../core/services/apiService';
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
            setTimeout(() => setSuccess(false), 300000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setIsLoading(false);
        }
    };

    // Render
    return (
        <div>
            <h1 className="text-center">Generar nuevo periodo</h1>
            <Card className="info-card mb-4 bg-light">
                <Card.Body>
                    <Card.Title className="text-primary mb-3">
                        <InfoCircleFill className="me-2" />
                        Información Importante
                    </Card.Title>
                    <Stack gap={2}>
                        <div>
                            <strong>Verificación de lecturas completas:</strong>
                            <span className="d-block text-muted">Es requisito indispensable que todas las lecturas del período actual estén registradas para habilitar la generación de un nuevo ciclo.</span>
                        </div>
                        <div>
                            <strong>Respeto de fechas límite:</strong>
                            <span className="d-block text-muted">El sistema bloqueará la creación de nuevos períodos hasta que finalice completamente el ciclo anterior, garantizando la secuencia cronológica correcta.</span>
                        </div>
                        <div>
                            <strong>El proceso puede tomar varios minutos:</strong>
                            <span className="d-block text-muted">Debido a la gran cantidad de datos que se deben generar el proceso puede tardar un poco.</span>
                        </div>
                        <div>
                            <strong>Regularización automática:</strong>
                            <span className="d-block text-muted">En caso de períodos no generados acumulados, el sistema procesará todos los ciclos pendientes históricos, pero solo mantendrá activo y accesible el último período generado.</span>
                        </div>
                    </Stack>
                </Card.Body>
            </Card>

            <div className="button-container">
                <Button variant="primary" onClick={handleNewPeriod} disabled={isLoading} className="glowing-button">
                    {isLoading ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
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
        </div >
    );
};

export default NewPeriodPage;