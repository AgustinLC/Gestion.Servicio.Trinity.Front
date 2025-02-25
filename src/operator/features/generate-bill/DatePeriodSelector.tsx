// components/DatePeriodSelector.tsx
import { Form } from 'react-bootstrap';

const DatePeriodSelector = ({ 
  selectedDate,
  onDateChange 
}: {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
}) => {
  return (
    <Form.Group className="mb-3">
      <Form.Label>Seleccionar Periodo (Opcional)</Form.Label>
      <Form.Control
        type="date"
        value={selectedDate?.toISOString().split('T')[0] || ''}
        onChange={(e) => 
          onDateChange(e.target.value ? new Date(e.target.value) : null)
        }
      />
      <Form.Text className="text-muted">
        <i>Nota</i>: Dejar en blanco para usar el periodo activo actual
      </Form.Text>
    </Form.Group>
  );
};

export default DatePeriodSelector;