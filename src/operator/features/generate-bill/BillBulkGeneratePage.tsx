// components/BulkGenerateTab.tsx
import { useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import DatePeriodSelector from './DatePeriodSelector';
import { addData } from '../../../core/services/apiService';
import { toast } from 'react-toastify';

const BillBulkGeneratePage = () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const periodParam = selectedDate ? selectedDate.toISOString() : null;
            await addData(`/bill/generate-auto/${periodParam}`, {});
            toast.success('Facturas generadas exitosamente');
            setSelectedDate(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error desconocido');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-center">Generación de Facturas</h1>
            
            <Form>
                <DatePeriodSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

                <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? (
                        <Spinner animation="border" size="sm" />
                    ) : 'Generar Facturas'}
                </Button>
            </Form>
        </div>
    );
};

export default BillBulkGeneratePage;