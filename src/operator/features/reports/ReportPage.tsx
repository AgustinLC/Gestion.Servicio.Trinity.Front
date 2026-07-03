import { useState } from 'react';
import { Container, Row, Col, Spinner, Card } from 'react-bootstrap';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { getData } from '../../../core/services/apiService';
import { PeopleFill, Cash, FileEarmarkText, Activity } from 'react-bootstrap-icons';
import './ReportPage.css';
import { processReportData } from '../../../core/utils/flattenObject';

// Tipos
interface ReportConfig {
    id: string;
    title: string;
    Icon: any;
    endpoint: string;
    variant: string;
    exclude?: string[];
    rename?: Record<string, string>;
}

const ReportPage = () => {

    // Estados
    const [loadingReport, setLoadingReport] = useState<string | null>(null);

    // Reportes
    const REPORTS: ReportConfig[] = [
        {
            id: 'users',
            title: 'Reporte de Usuarios',
            Icon: PeopleFill,
            endpoint: '/operator/users-actives',
            variant: 'primary',
            exclude: ['password', 'residenceDto_idLocation', 'residenceDto_idResidence'],
            rename: {
                'idUser': 'ID Usuario',
                'firstName': 'Nombre',
                'lastName': 'Apellido',
                'residenceDto_district': 'Distrito',
                'residenceDto_street': 'Calle',
                'residenceDto_number': 'Número',
                'residenceDto_serialNumber': 'Número Serie',
                'residenceDto_idFee': 'Tarifa'
            }
        },
        {
            id: 'bills',
            title: 'Reporte de Facturas',
            Icon: FileEarmarkText,
            endpoint: '/operator/billing-parameter/active',
            variant: 'success',
            rename: {
                'idBill': 'N° Factura',
                'total': 'Total',
                'consumption': 'Consumo (kW)'
            }
        },
        {
            id: 'payments',
            title: 'Tarifas Existentes',
            Icon: Cash,
            endpoint: '/operator/fee',
            variant: 'warning',
            exclude: ['user_password']
        },
        {
            id: 'activity',
            title: 'Información del Sistema',
            Icon: Activity,
            endpoint: '/operator/footer',
            variant: 'danger'
        }
    ];

    // Funcion para manejar la generación de reportes
    const handleGenerateReport = async (report: ReportConfig) => {
        setLoadingReport(report.id);
        try {
            const data = await getData<any[]>(report.endpoint);

            const processedData = processReportData(data, {
                exclude: report.exclude,
                rename: report.rename
            });

            const worksheet = XLSX.utils.json_to_sheet(processedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, report.title.substring(0, 31));

            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            saveAs(blob, `${report.title}_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error('Error generando reporte:', error);
            alert(`Error al generar ${report.title}`);
        } finally {
            setLoadingReport(null);
        }
    };

    // Render
    return (
        <div className="report-page">
            <h1 className="text-center mb-5">Generador de Reportes</h1>
            <Container>
                <Row className="g-4" xs={1} md={2} lg={4}>
                    {REPORTS.map((report) => (
                        <Col key={report.id}>
                            <Card
                                onClick={() => handleGenerateReport(report)}
                                className={`report-card ${report.variant}`}
                                data-testid={`report-card-${report.id}`}
                            >
                                <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                                    <report.Icon className="report-icon" />
                                    <h3 className="report-title mt-3">{report.title}</h3>
                                    {loadingReport === report.id ? (
                                        <Spinner animation="border" variant="light" className="mt-2" />
                                    ) : (
                                        <span className="report-subtitle mt-2">Descargar Excel</span>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};

export default ReportPage;