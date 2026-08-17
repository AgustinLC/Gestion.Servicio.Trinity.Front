import { useState, useMemo } from 'react';
import { Button, Form, Row, Col, Spinner, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getData } from '../../../core/services/apiService';
import { BillDetailsDto } from '../../../core/models/dto/BillDetailsDto';
import { UserDto } from '../../../core/models/dto/UserDto';
import { PaymentStatus } from '../../../core/models/dto/PaymentStatus';
import { TableColumnDefinition } from '../../../core/models/types/TableTypes';
import { useBillPdfGeneratorV2 } from '../../../shared/hooks/useBillPdfGeneratorV2';
import useAppData from '../../../hooks/useAppData';
import ReusableTable from '../../../shared/components/table/ReusableTable';
import PageHeader from '../../../shared/components/PageHeader';
import FloatingFieldset from '../../../shared/components/floating-fieldset/FloatingFieldset';
import CustomSelect from '../../../shared/components/custom-select/CustomSelect';
import HintBox from '../../../shared/components/hint-box/HintBox';
import AutocompleteFilter from '../../../shared/components/autocomplete-filter/AutocompleteFilter';
import './BillGenerateFilteredPage.css';

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
    const { isGenerating: pdfLoading, generateSinglePdf, generateMultiplePdf } = useBillPdfGeneratorV2();

    // Obtener calles únicas de los usuarios
    const uniqueStreets = useMemo(() => {
        return Array.from(
            new Set(
                operatorUsers
                    .map((user) => user.residenceDto?.street)
                    .filter(Boolean)
            )
        ).sort() as string[];
    }, [operatorUsers]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleClearFilters = () => {
        setFilters({
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
        setFilteredBills([]);
        setUsers([]);
        toast.info('Filtros reiniciados');
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
                setUsers([]);
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

    // Calcular estadísticas
    const totalAmount = useMemo(() => {
        return filteredBills.reduce((acc, bill) => acc + bill.total, 0);
    }, [filteredBills]);

    const paidCount = useMemo(() => {
        return filteredBills.filter(bill => bill.paidStatus !== PaymentStatus.UNPAID).length;
    }, [filteredBills]);

    const unpaidCount = useMemo(() => {
        return filteredBills.filter(bill => bill.paidStatus === PaymentStatus.UNPAID).length;
    }, [filteredBills]);

    // Facturas sin usuario cargado en la app. Ojo: NO es "filteredBills.length
    // - users.length" (eso compara cantidad de facturas contra cantidad de
    // usuarios ÚNICOS, y da falsos positivos apenas un mismo usuario tiene
    // más de una factura en el rango filtrado, ej. varios períodos de un
    // mismo año). Acá se cuenta factura por factura, igual que el resaltado
    // de filas de la tabla.
    const billsWithoutUserCount = useMemo(() => {
        return filteredBills.filter(bill => !users.some(u => u.idUser === bill.idUser)).length;
    }, [filteredBills, users]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(amount);
    };

    // Columnas para ReusableTable
    const columns = useMemo((): TableColumnDefinition<BillDetailsDto>[] => [
        {
            key: "idBill",
            label: "N° Factura",
            sortable: true,
        },
        {
            key: "idUser",
            label: "Conexión",
            sortable: true,
        },
        {
            key: "idUser" as keyof BillDetailsDto,
            label: "Usuario",
            sortable: false,
            render: (row: BillDetailsDto) => {
                const user = users.find(u => u.idUser === row.idUser);
                return user ? `${user.firstName} ${user.lastName}` : `N° Conexión: ${row.idUser}`;
            }
        } as TableColumnDefinition<BillDetailsDto>,
        {
            key: "periodName",
            label: "Período",
            sortable: true,
        },
        {
            key: "dateRegister",
            label: "Emisión",
            sortable: true,
            render: (row: BillDetailsDto) => {
                return new Date(row.dateRegister).toLocaleDateString('es-AR');
            }
        },
        {
            key: "consumption",
            label: "Consumo",
            sortable: true,
            render: (row: BillDetailsDto) => `${row.consumption} m³`
        },
        {
            key: "total",
            label: "Total",
            sortable: true,
            render: (row: BillDetailsDto) => formatCurrency(row.total)
        },
        {
            key: "paidStatus",
            label: "Estado",
            sortable: true,
            render: (row: BillDetailsDto) => {
                switch (row.paidStatus) {
                    case PaymentStatus.PAID_ON_TIME:
                        return (
                            <span className="badge-soft badge-soft-success">
                                <i className="bi bi-check-circle-fill"></i> Pagada en término
                            </span>
                        );
                    case PaymentStatus.PAID_LATE:
                        return (
                            <span className="badge-soft badge-soft-warning">
                                <i className="bi bi-clock-fill"></i> Pagada fuera de término
                            </span>
                        );
                    case PaymentStatus.UNPAID:
                        return (
                            <span className="badge-soft badge-soft-danger">
                                <i className="bi bi-exclamation-circle-fill"></i> Impaga
                            </span>
                        );
                    default:
                        return <span className="badge-soft badge-soft-neutral">Desconocido</span>;
                }
            }
        },
        {
            key: "actions" as const,
            label: "Acción",
            actions: (row: BillDetailsDto) => {
                const user = users.find(u => u.idUser === row.idUser);
                return (
                    <Button 
                        variant="outline-primary" 
                        size="sm"
                        className="btn-action-download"
                        disabled={pdfLoading || !user}
                        onClick={() => {
                            if (user) {
                                generateSinglePdf(row, user, {
                                    fileName: `Factura_${row.idBill}_Conexion_${row.idUser}`
                                });
                            }
                        }}
                    >
                        <i className="bi bi-file-pdf"></i> PDF
                    </Button>
                );
            }
        }
    ], [users, pdfLoading, generateSinglePdf]);

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
        }
    };

    return (
        <div className="generate-filtered-container d-flex flex-column" style={{ minHeight: "calc(100vh - var(--navbar-height) - 3rem)" }}>
            <PageHeader title="Generación de Facturas por Filtros" subtitle="Buscá facturas por criterios y descargalas en PDF." icon="bi bi-funnel-fill" />

            <div className="my-auto content-fade-in-slide">
            <Form className="mb-4">
                <Card className="filter-card border-0 shadow-lg">
                    <Row>
                        {/* Grupo 1: Ubicación e Identificación */}
                        <Col lg={6} className="mb-3">
                            <h5 className="filter-section-title">
                                <i className="bi bi-geo-alt-fill text-primary"></i> Ubicación y Cliente
                            </h5>
                            <Row>
                                <Col md={12} className="mb-3">
                                    <Form.Group>
                                        <FloatingFieldset label="Calle">
                                            <AutocompleteFilter
                                                options={uniqueStreets.map((street) => ({ value: street, label: street }))}
                                                value={filters.street}
                                                onChange={(value) => setFilters(prev => ({ ...prev, street: value }))}
                                                freeText
                                            />
                                        </FloatingFieldset>
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <FloatingFieldset label="N° de Conexión">
                                            <Form.Control
                                                type="number"
                                                name="idUser"
                                                value={filters.idUser}
                                                onChange={handleChange}
                                            />
                                        </FloatingFieldset>
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <FloatingFieldset label="Mostrar Eliminados">
                                            <CustomSelect
                                                value={filters.deleted}
                                                onChange={(v) => setFilters((prev) => ({ ...prev, deleted: v }))}
                                                placeholder="No filtrar"
                                                options={[
                                                    { value: "true", label: "Sí" },
                                                    { value: "false", label: "No" },
                                                ]}
                                            />
                                        </FloatingFieldset>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Col>

                        {/* Grupo 2: Fechas y Períodos */}
                        <Col lg={6} className="mb-3">
                            <h5 className="filter-section-title">
                                <i className="bi bi-calendar3 text-primary"></i> Período y Fechas
                            </h5>
                            <Row>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <FloatingFieldset label="Año">
                                            <Form.Control
                                                type="number"
                                                name="year"
                                                value={filters.year}
                                                onChange={handleChange}
                                            />
                                        </FloatingFieldset>
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <FloatingFieldset label="Mes">
                                            <Form.Control
                                                type="number"
                                                name="month"
                                                value={filters.month}
                                                onChange={handleChange}
                                            />
                                        </FloatingFieldset>
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <FloatingFieldset label="Fecha Desde">
                                            <Form.Control type="date" name="dateFrom" value={filters.dateFrom} onChange={handleChange} />
                                        </FloatingFieldset>
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <FloatingFieldset label="Fecha Hasta">
                                            <Form.Control type="date" name="dateTo" value={filters.dateTo} onChange={handleChange} />
                                        </FloatingFieldset>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Col>

                        {/* Grupo 3: Condiciones Financieras */}
                        <Col lg={6} className="mb-3">
                            <h5 className="filter-section-title">
                                <i className="bi bi-cash-coin text-primary"></i> Facturación y Tarifas
                            </h5>
                            <Row>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <FloatingFieldset label="Tarifa">
                                            <CustomSelect
                                                value={filters.idFee}
                                                onChange={(v) => setFilters((prev) => ({ ...prev, idFee: v }))}
                                                placeholder="Seleccionar tarifa"
                                                options={fees.map((fee) => ({ value: String(fee.idFee), label: fee.name }))}
                                            />
                                        </FloatingFieldset>
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <FloatingFieldset label="Estado de Pago">
                                            <CustomSelect
                                                value={filters.paidStatus}
                                                onChange={(v) => setFilters((prev) => ({ ...prev, paidStatus: v }))}
                                                placeholder="Cualquiera"
                                                options={[
                                                    { value: "true", label: "Pagado" },
                                                    { value: "false", label: "No pagado" },
                                                ]}
                                            />
                                        </FloatingFieldset>
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <FloatingFieldset label="Factura Digital">
                                            <CustomSelect
                                                value={filters.digitalInvoice}
                                                onChange={(v) => setFilters((prev) => ({ ...prev, digitalInvoice: v }))}
                                                placeholder="Cualquiera"
                                                options={[
                                                    { value: "true", label: "Sí" },
                                                    { value: "false", label: "No" },
                                                ]}
                                            />
                                        </FloatingFieldset>
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Row>
                                        <Col xs={6}>
                                            <Form.Group>
                                                <FloatingFieldset label="Total Mínimo">
                                                    <Form.Control type="number" name="minTotal" value={filters.minTotal} onChange={handleChange} />
                                                </FloatingFieldset>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={6}>
                                            <Form.Group>
                                                <FloatingFieldset label="Total Máximo">
                                                    <Form.Control type="number" name="maxTotal" value={filters.maxTotal} onChange={handleChange} />
                                                </FloatingFieldset>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>

                        {/* Grupo 4: Ordenamiento */}
                        <Col lg={6} className="mb-3">
                            <h5 className="filter-section-title">
                                <i className="bi bi-sort-down text-primary"></i> Ordenamiento
                            </h5>
                            <Row>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <FloatingFieldset label="Ordenar por">
                                            <CustomSelect
                                                value={filters.sortBy}
                                                onChange={(v) => setFilters((prev) => ({ ...prev, sortBy: v }))}
                                                options={[
                                                    { value: "date", label: "Fecha" },
                                                    { value: "total", label: "Total" },
                                                    { value: "consumption", label: "Consumo" },
                                                    { value: "period", label: "Período" },
                                                    { value: "street", label: "Calle" },
                                                ]}
                                            />
                                        </FloatingFieldset>
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <FloatingFieldset label="Dirección">
                                            <CustomSelect
                                                value={filters.sortDirection}
                                                onChange={(v) => setFilters((prev) => ({ ...prev, sortDirection: v }))}
                                                options={[
                                                    { value: "ASC", label: "Ascendente" },
                                                    { value: "DESC", label: "Descendente" },
                                                ]}
                                            />
                                        </FloatingFieldset>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    {/* Botones de acción */}
                    <div className="d-flex gap-3 justify-content-end mt-3">
                        <Button variant="outline-secondary" onClick={handleClearFilters} disabled={isLoading} className="px-4 py-2" style={{ borderRadius: '10px' }}>
                            <i className="bi bi-arrow-counterclockwise me-1"></i> Reiniciar Filtros
                        </Button>
                        <Button variant="primary" onClick={handleSubmit} disabled={isLoading} className="px-4 py-2" style={{ borderRadius: '10px' }}>
                            {isLoading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Buscando...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-search me-1"></i> Buscar Facturas
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            </Form>

            {/* Mensaje de ayuda / intro */}
            {!isLoading && filteredBills.length === 0 && (
                <HintBox>
                    Utiliza los filtros superiores para buscar facturas. Podrás previsualizarlas en una tabla interactiva y descargarlas de forma masiva o individual.
                </HintBox>
            )}

            {/* Resultados */}
            {filteredBills.length > 0 && (
                <div className="search-results-section mt-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                        <h4 className="fw-bold text-secondary mb-0">Facturas Encontradas</h4>
                        <Button 
                            variant="success" 
                            onClick={handleGeneratePdf} 
                            disabled={pdfLoading || users.length === 0}
                            className="px-4 py-2 shadow-sm"
                            style={{ borderRadius: '10px' }}
                        >
                            {pdfLoading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Generando PDF...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-file-pdf-fill me-1"></i> Descargar Todo en PDF ({filteredBills.length})
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Tarjetas Estadísticas */}
                    <Row className="stats-row">
                        <Col md={4} className="mb-3">
                            <div className="stat-card-gradient stat-card-blue">
                                <div className="stat-title">Total Facturas</div>
                                <div className="stat-value">{filteredBills.length}</div>
                                <div className="stat-subtitle">Facturas coinciden con la búsqueda</div>
                            </div>
                        </Col>
                        <Col md={4} className="mb-3">
                            <div className="stat-card-gradient stat-card-green">
                                <div className="stat-title">Monto Acumulado</div>
                                <div className="stat-value">{formatCurrency(totalAmount)}</div>
                                <div className="stat-subtitle">Suma total de los montos facturados</div>
                            </div>
                        </Col>
                        <Col md={4} className="mb-3">
                            <div className="stat-card-gradient stat-card-orange">
                                <div className="stat-title">Estado de Pago</div>
                                <div className="stat-value">{paidCount} <span className="fs-6 opacity-75">Pagadas</span> / {unpaidCount} <span className="fs-6 opacity-75">Impagas</span></div>
                                <div className="stat-subtitle">Distribución de deudas</div>
                            </div>
                        </Col>
                    </Row>

                    {/* Alertas de consistencia */}
                    {billsWithoutUserCount > 0 && (
                        <HintBox variant="danger" className="mb-3">
                            <strong>{billsWithoutUserCount}</strong> factura(s) no tienen un usuario asociado cargado en la aplicación. La descarga de estos archivos individuales no estará disponible.
                        </HintBox>
                    )}

                    {/* Tabla de Facturas */}
                    <Card className="border-0 shadow-sm rounded-4 p-3 mb-4">
                        <ReusableTable
                            data={filteredBills}
                            columns={columns}
                            defaultSort="idBill"
                            defaultSortDirection="desc"
                            getRowClassName={(row) =>
                                users.some((u) => u.idUser === row.idUser) ? undefined : "table-row-danger"
                            }
                        />
                    </Card>
                </div>
            )}
            </div>
        </div>
    );
};

export default BillGenerateFilteredPage;

