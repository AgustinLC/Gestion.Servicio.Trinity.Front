// components/InvoiceGenerator.tsx
import { useState } from 'react';
import { Tabs, Alert } from 'react-bootstrap';

const BillGenerator = () => {
    const [key, setKey] = useState<'bulk' | 'individual'>('bulk');
    const [apiError, setApiError] = useState<string>('');
    const [apiSuccess, setApiSuccess] = useState<string>('');

    return (
        <div>
            <h1 className="text-center">Generación de Facturas</h1>

            {apiError && <Alert variant="danger" dismissible onClose={() => setApiError('')}>{apiError}</Alert>}
            {apiSuccess && <Alert variant="success" dismissible onClose={() => setApiSuccess('')}>{apiSuccess}</Alert>}

            <Tabs
                id="invoice-tabs"
                activeKey={key}
                onSelect={(k) => setKey(k as typeof key)}
                className="mb-3"
            >
            </Tabs>
        </div>
    );
};

export default BillGenerator;