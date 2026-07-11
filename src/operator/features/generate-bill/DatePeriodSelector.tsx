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
    <Form.Group className="mb-0">
      <Form.Label>Seleccionar período <span className="text-muted fw-normal">(opcional)</span></Form.Label>
      <Form.Control
        type="date"
        value={selectedDate?.toISOString().split('T')[0] || ''}
        onChange={(e) =>
          onDateChange(e.target.value ? new Date(e.target.value) : null)
        }
      />
      <div className="hint-box mt-3">
        <i className="bi bi-info-circle-fill"></i>
        <span><strong>Nota:</strong> Dejá en blanco para usar el período activo actual.</span>
      </div>
    </Form.Group>
  );
};

export default DatePeriodSelector;