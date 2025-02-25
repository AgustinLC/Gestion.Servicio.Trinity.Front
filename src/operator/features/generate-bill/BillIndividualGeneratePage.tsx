// components/IndividualGenerateTab.tsx
import { useState } from 'react';
import { Alert, Button, Spinner } from 'react-bootstrap';
import DatePeriodSelector from './DatePeriodSelector';
import { addData } from '../../../core/services/apiService';
import { toast } from 'react-toastify';
import UserSearchInput from './UserSearchInput';

const BillIndividualGeneratePage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!userId) {
      toast.warning('Debe seleccionar un usuario antes de generar la factura');
      return;
    }
    try {
      setIsLoading(true);
      const periodParam = selectedDate ? selectedDate.toISOString() : null;
      await addData(`/operator/bill/generate-manual/${userId}/${periodParam}`, {});
      toast.success(`Factura generada para usuario ${userId}`);
      setUserId(null);
      setSelectedDate(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-center">Generación de Factura Individual</h1>

      <UserSearchInput onUserSelected={(id) => setUserId(id)} />

      <DatePeriodSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

      <Button variant="primary" onClick={handleSubmit} disabled={isLoading || !userId} aria-label="Generar factura individual">
        {isLoading ? (
          <>
            <Spinner animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
            Generando...
          </>
        ) : (
          'Generar Factura'
        )}
      </Button>

      <Alert variant="info" className="mt-4">
        <strong>Nota:</strong> La generación de la factura puede tomar varios segundos.
        No cierre la página durante el proceso.
      </Alert>

    </div >
  );
};

export default BillIndividualGeneratePage;