// components/BulkGenerateTab.tsx
import { useState } from 'react';
import { Alert, Button, Spinner } from 'react-bootstrap';
import DatePeriodSelector from './DatePeriodSelector';
import { addData } from '../../../core/services/apiService';
import { toast } from 'react-toastify';

const BillBulkGeneratePage = () => {

    // Estados
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Manejar el envío del formulario
    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const periodParam = selectedDate ? selectedDate.toISOString() : null;
            await addData(`/operator/bill/generate-auto/${periodParam}`, {});
            toast.success('Facturas generadas exitosamente');
            setSelectedDate(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error desconocido');
        } finally {
            setIsLoading(false);
        }
    };

    // Render
    return (
        <div>
            <h1 className="text-center">Generación de Facturas</h1>

            <DatePeriodSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

            <Button variant="primary" onClick={handleSubmit} disabled={isLoading} aria-label="Generar facturas">
                {isLoading ? (
                <>
                    <Spinner animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Generando...
                </>
                ) : (
                'Generar Facturas'
                )}
            </Button>

            <Alert variant="info" className="mt-4">
                <strong>Nota:</strong> La generación de facturas puede tomar varios segundos.
                No cierre la página durante el proceso.
            </Alert>
        </div>
    );
};

export default BillBulkGeneratePage;