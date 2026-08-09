// components/DatePeriodSelector.tsx
import { Form } from 'react-bootstrap';
import HintBox from '../../../shared/components/hint-box/HintBox';
import FloatingFieldset from '../../../shared/components/floating-fieldset/FloatingFieldset';

const DatePeriodSelector = ({
  selectedDate,
  onDateChange
}: {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
}) => {
  return (
    <Form.Group className="mb-0">
      <FloatingFieldset label="Seleccionar período (opcional)">
        <Form.Control
          type="date"
          value={selectedDate?.toISOString().split('T')[0] || ''}
          onChange={(e) =>
            onDateChange(e.target.value ? new Date(e.target.value) : null)
          }
        />
      </FloatingFieldset>
      <HintBox className="mt-3">
        <strong>Nota:</strong> Dejá en blanco para usar el período activo actual.
      </HintBox>
    </Form.Group>
  );
};

export default DatePeriodSelector;