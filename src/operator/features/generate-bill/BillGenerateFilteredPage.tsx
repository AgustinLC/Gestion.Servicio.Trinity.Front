import { useState } from 'react';
import { Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getData } from '../../../core/services/apiService';
import { BillDetailsDto } from '../../../core/models/dto/BillDetailsDto';
import { UserDto } from '../../../core/models/dto/UserDto';
import { useBillPdfGeneratorV2 } from '../../../shared/hooks/useBillPdfGeneratorV2';
import useAppData from '../../../hooks/useAppData';

const BillGenerateFilteredPage = () => {
    const [filters, setFilters] = useState({
        street: '',
        district: '',
        idPeriod: '',
        year: '',
        month: '',
        idModality: '',
        idUser: '',
        idFee: '',
        paidStatus: '',
        deleted: '',
        dateFrom: '',
        dateTo: '',
        digitalInvoice: '',
        minTotal: '',
        maxTotal: '',
        sortBy: 'date',
        sortDirection: 'ASC',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [filteredBills, setFilteredBills] = useState<BillDetailsDto[]>([]);
    const [users, setUsers] = useState<UserDto[]>([]);
    const { fees, operatorUsers } = useAppData();
    
    // Hook para generar PDFs (V2 - usa @react-pdf/renderer, 10-50x más rápido)
    const { isGenerating: pdfLoading, generateMultiplePdf } = useBillPdfGeneratorV2();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const buildQueryParams = () => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== '' && value !== null) params.append(key, value);
        });

        return params.toString();
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            const query = buildQueryParams();

            const allFilteredBills = await getData<BillDetailsDto[]>(`/operator/search-bills?${query}`);
            setFilteredBills(allFilteredBills);

            if (allFilteredBills.length === 0) {
                toast.warning('No se encontraron facturas con los filtros seleccionados');
            } else {
                toast.success(`${allFilteredBills.length} factura(s) encontrada(s)`);
                
                // Obtener usuarios necesarios
                const userIds = [...new Set(allFilteredBills.map(bill => bill.idUser))];
                const neededUsers = operatorUsers.filter(user => userIds.includes(user.idUser));
                setUsers(neededUsers);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error desconocido');
        } finally {
            setIsLoading(false);
        }
    };

    // Construir nombre del archivo con los filtros aplicados
    const buildFileName = (): string => {
        const parts: string[] = ['facturas_filtradas'];
        
        // Agregar filtros activos al nombre
        if (filters.year) parts.push(`anio_${filters.year}`);
        if (filters.month) parts.push(`mes_${filters.month}`);
        if (filters.street) parts.push(`calle_${filters.street.replace(/\s+/g, '-')}`);
        if (filters.idUser) parts.push(`conexion_${filters.idUser}`);
        if (filters.idFee) {
            const fee = fees.find(f => f.idFee === Number(filters.idFee));
            if (fee) parts.push(`tarifa_${fee.name.replace(/\s+/g, '-')}`);
        }
        if (filters.paidStatus) {
            parts.push(filters.paidStatus === 'true' ? 'pagadas' : 'impagas');
        }
        if (filters.dateFrom) parts.push(`desde_${filters.dateFrom}`);
        if (filters.dateTo) parts.push(`hasta_${filters.dateTo}`);
        
        // Si no hay filtros específicos, agregar la fecha actual
        if (parts.length === 1) {
            parts.push(new Date().toISOString().split('T')[0]);
        }
        
        return parts.join('_');
    };

    const handleGeneratePdf = async () => {
        if (filteredBills.length === 0) {
            toast.warning('No hay facturas para generar PDF');
            return;
        }

        if (users.length === 0) {
            toast.error('No se encontraron usuarios para las facturas');
            return;
        }

        try {
            const fileName = buildFileName();
            
            await generateMultiplePdf(filteredBills, users, {
                fileName,
                onProgress: (processed: number, total: number) => {
                    console.log(`Procesando ${processed}/${total}`);
                },
            });
        } catch (error) {
            console.error('Error generando PDF:', error);
            // El toast de error ya lo maneja el hook
        }
    };

    return (
        <div>
            <h1 className="text-center mb-4">Generación de Facturas por Filtros</h1>

            <Form>
                <Row className="mb-3">
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Calle</Form.Label>
                            <Form.Control name="street" value={filters.street} onChange={handleChange} />
                        </Form.Group>
                    </Col>

                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Ordenar por</Form.Label>
                            <Form.Select name="sortBy" value={filters.sortBy} onChange={handleChange}>
                                <option value="date">Fecha</option>
                                <option value="total">Total</option>
                                <option value="consumption">Consumo</option>
                                <option value="period">Período</option>
                                <option value="street">Calle</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Mostrar eliminados</Form.Label>
                            <Form.Select name="deleted" value={filters.deleted} onChange={handleChange}>
                                <option value="">-- No filtrar --</option>
                                <option value="true">Sí</option>
                                <option value="false">No</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    {/*
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Distrito</Form.Label>
                            <Form.Control name="district" value={filters.district} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                    */}

                    {/*
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>ID Período</Form.Label>
                            <Form.Control type="number" name="idPeriod" value={filters.idPeriod} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                    */}
                </Row>

                <Row className="mb-3">
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Año</Form.Label>
                            <Form.Control type="number" name="year" value={filters.year} onChange={handleChange} />
                        </Form.Group>
                    </Col>

                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Mes</Form.Label>
                            <Form.Control type="number" name="month" value={filters.month} onChange={handleChange} />
                        </Form.Group>
                    </Col>

                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Dirección</Form.Label>
                            <Form.Select name="sortDirection" value={filters.sortDirection} onChange={handleChange}>
                                <option value="ASC">Ascendente</option>
                                <option value="DESC">Descendente</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    {/*
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Modalidad</Form.Label>
                            <Form.Control type="number" name="idModality" value={filters.idModality} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                    */}
                </Row>

                <Row className="mb-3">
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>N° de Conexión</Form.Label>
                            <Form.Control type="number" name="idUser" value={filters.idUser} onChange={handleChange} />
                        </Form.Group>
                    </Col>

                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Tarifa</Form.Label>
                            <Form.Select
                                name="idFee"
                                value={filters.idFee}
                                onChange={handleChange}
                            >
                                <option value="">-- Seleccionar tarifa --</option>

                                {fees.map((fee) => (
                                    <option key={fee.idFee} value={fee.idFee}>
                                        {fee.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Estado de pago</Form.Label>
                            <Form.Select name="paidStatus" value={filters.paidStatus} onChange={handleChange}>
                                <option value="">-- Cualquiera --</option>
                                <option value="true">Pagado</option>
                                <option value="false">No pagado</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Fecha desde</Form.Label>
                            <Form.Control type="date" name="dateFrom" value={filters.dateFrom} onChange={handleChange} />
                        </Form.Group>
                    </Col>

                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Fecha hasta</Form.Label>
                            <Form.Control type="date" name="dateTo" value={filters.dateTo} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                    
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Factura digital</Form.Label>
                            <Form.Select name="digitalInvoice" value={filters.digitalInvoice} onChange={handleChange}>
                                <option value="">-- Cualquiera --</option>
                                <option value="true">Sí</option>
                                <option value="false">No</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Total mínimo</Form.Label>
                            <Form.Control type="number" name="minTotal" value={filters.minTotal} onChange={handleChange} />
                        </Form.Group>
                    </Col>

                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Total máximo</Form.Label>
                            <Form.Control type="number" name="maxTotal" value={filters.maxTotal} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                </Row>

                <div className="d-flex gap-2 mb-3">
                    <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Buscando...
                            </>
                        ) : (
                            'Buscar Facturas'
                        )}
                    </Button>

                    {filteredBills.length > 0 && (
                        <Button 
                            variant="success" 
                            onClick={handleGeneratePdf} 
                            disabled={pdfLoading || users.length === 0}
                        >
                            {pdfLoading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Generando PDF...
                                </>
                            ) : (
                                `Generar PDF (${filteredBills.length} factura${filteredBills.length > 1 ? 's' : ''})`
                            )}
                        </Button>
                    )}
                </div>

                {filteredBills.length > 0 && (
                    <Alert variant="success" className="mt-3">
                        <strong>{filteredBills.length}</strong> factura(s) encontrada(s) con los filtros seleccionados.
                        {users.length < filteredBills.length && (
                            <div className="text-warning mt-2">
                                <small>Advertencia: {filteredBills.length - users.length} factura(s) no tienen usuario asociado.</small>
                            </div>
                        )}
                    </Alert>
                )}

                <Alert variant="info" className="mt-4">
                    <strong>Nota:</strong> La búsqueda mediante filtros puede tardar unos segundos.
                    La generación de PDF es rápida gracias al nuevo motor de renderizado.
                </Alert>
            </Form>
        </div>
    );
};

export default BillGenerateFilteredPage;
