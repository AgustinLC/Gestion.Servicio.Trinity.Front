// components/DatePeriodSelector.tsx
import { Form } from 'react-bootstrap';
import HintBox from '../../../shared/components/hint-box/HintBox';

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
      <HintBox className="mt-3">
        <strong>Nota:</strong> Dejá en blanco para usar el período activo actual.
      </HintBox>
    </Form.Group>
  );
};

export default DatePeriodSelector;