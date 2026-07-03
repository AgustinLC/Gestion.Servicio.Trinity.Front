import { useState, useEffect, useMemo, useRef } from 'react';
import { Button, Form, Row, Col, Spinner, Alert, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getData } from '../../../core/services/apiService';
import { BillDetailsDto } from '../../../core/models/dto/BillDetailsDto';
import { UserDto } from '../../../core/models/dto/UserDto';
import { PaymentStatus } from '../../../core/models/dto/PaymentStatus';
import { TableColumnDefinition } from '../../../core/models/types/TableTypes';
import { useBillPdfGeneratorV2 } from '../../../shared/hooks/useBillPdfGeneratorV2';
import useAppData from '../../../hooks/useAppData';
import ReusableTable from '../../../shared/components/table/ReusableTable';
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

    // Autocomplete para la calle
    const [streetSearch, setStreetSearch] = useState('');
    const [showStreetSuggestions, setShowStreetSuggestions] = useState(false);
    const suggestionsRef = useRef<HTMLDivElement>(null);

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

    // Filtrar sugerencias
    const streetSuggestions = useMemo(() => {
        const term = streetSearch.trim().toLowerCase();
        const filtered = term
            ? uniqueStreets.filter((st) => st.toLowerCase().includes(term))
            : uniqueStreets;
        return filtered.slice(0, 50); // Limitar a 50 para rendimiento
    }, [streetSearch, uniqueStreets]);

    // Cerrar sugerencias al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node)
            ) {
                setShowStreetSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
        setStreetSearch('');
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
                const isPaid = row.paidStatus !== PaymentStatus.UNPAID;
                return (
                    <span className={`badge bg-${isPaid ? 'success' : 'danger'}`}>
                        {row.paidStatus === PaymentStatus.PAID_ON_TIME ? 'Pagada' :
                         row.paidStatus === PaymentStatus.PAID_LATE ? 'Pagada Fuera de Término' : 'Impaga'}
                    </span>
                );
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
        <div className="generate-filtered-container">
            <h2 className="mb-4 text-center fw-bold text-primary">Generación de Facturas por Filtros</h2>

            <Form className="mb-4">
                <Card className="filter-card border-0 shadow-sm">
                    <Row>
                        {/* Grupo 1: Ubicación e Identificación */}
                        <Col lg={6} className="mb-4">
                            <h5 className="filter-section-title">
                                <i className="bi bi-geo-alt-fill text-primary"></i> Ubicación y Cliente
                            </h5>
                            <Row>
                                <Col md={12} className="mb-3">
                                    <Form.Group className="street-autocomplete-wrapper" ref={suggestionsRef}>
                                        <Form.Label>Calle</Form.Label>
                                        <div className="input-with-clear">
                                            <Form.Control
                                                name="street"
                                                value={streetSearch}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setStreetSearch(val);
                                                    setFilters(prev => ({ ...prev, street: val }));
                                                    setShowStreetSuggestions(true);
                                                }}
                                                onFocus={() => setShowStreetSuggestions(true)}
                                                placeholder="Escriba o seleccione una calle..."
                                            />
                                            {streetSearch && (
                                                <button
                                                    type="button"
                                                    className="input-clear-btn"
                                                    onClick={() => {
                                                        setStreetSearch('');
                                                        setFilters(prev => ({ ...prev, street: '' }));
                                                        setShowStreetSuggestions(false);
                                                    }}
                                                >
                                                    <i className="bi bi-x"></i>
                                                </button>
                                            )}
                                        </div>
                                        
                                        {showStreetSuggestions && streetSuggestions.length > 0 && (
                                            <ul className="street-suggestions-list">
                                                {streetSuggestions.map((street) => (
                                                    <li
                                                        key={street}
                                                        className="street-suggestion-item"
                                                        onClick={() => {
                                                            setStreetSearch(street);
                                                            setFilters(prev => ({ ...prev, street }));
                                                            setShowStreetSuggestions(false);
                                                        }}
                                                    >
                                                        <i className="bi bi-geo-alt text-muted"></i> {street}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>N° de Conexión</Form.Label>
                                        <Form.Control 
                                            type="number" 
                                            name="idUser" 
                                            value={filters.idUser} 
                                            onChange={handleChange} 
                                            placeholder="N° Conexión"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>Mostrar Eliminados</Form.Label>
                                        <Form.Select name="deleted" value={filters.deleted} onChange={handleChange}>
                                            <option value="">-- No filtrar --</option>
                                            <option value="true">Sí</option>
                                            <option value="false">No</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Col>

                        {/* Grupo 2: Fechas y Períodos */}
                        <Col lg={6} className="mb-4">
                            <h5 className="filter-section-title">
                                <i className="bi bi-calendar3 text-primary"></i> Período y Fechas
                            </h5>
                            <Row>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>Año</Form.Label>
                                        <Form.Control 
                                            type="number" 
                                            name="year" 
                                            value={filters.year} 
                                            onChange={handleChange} 
                                            placeholder="Ej. 2026"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>Mes</Form.Label>
                                        <Form.Control 
                                            type="number" 
                                            name="month" 
                                            value={filters.month} 
                                            onChange={handleChange} 
                                            placeholder="Ej. 6"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>Fecha Desde</Form.Label>
                                        <Form.Control type="date" name="dateFrom" value={filters.dateFrom} onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>Fecha Hasta</Form.Label>
                                        <Form.Control type="date" name="dateTo" value={filters.dateTo} onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Col>

                        {/* Grupo 3: Condiciones Financieras */}
                        <Col lg={6} className="mb-4">
                            <h5 className="filter-section-title">
                                <i className="bi bi-cash-coin text-primary"></i> Facturación y Tarifas
                            </h5>
                            <Row>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>Tarifa</Form.Label>
                                        <Form.Select name="idFee" value={filters.idFee} onChange={handleChange}>
                                            <option value="">-- Seleccionar tarifa --</option>
                                            {fees.map((fee) => (
                                                <option key={fee.idFee} value={fee.idFee}>
                                                    {fee.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>Estado de Pago</Form.Label>
                                        <Form.Select name="paidStatus" value={filters.paidStatus} onChange={handleChange}>
                                            <option value="">-- Cualquiera --</option>
                                            <option value="true">Pagado</option>
                                            <option value="false">No pagado</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>Factura Digital</Form.Label>
                                        <Form.Select name="digitalInvoice" value={filters.digitalInvoice} onChange={handleChange}>
                                            <option value="">-- Cualquiera --</option>
                                            <option value="true">Sí</option>
                                            <option value="false">No</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Row>
                                        <Col xs={6}>
                                            <Form.Group>
                                                <Form.Label>Total Mínimo</Form.Label>
                                                <Form.Control type="number" name="minTotal" value={filters.minTotal} onChange={handleChange} placeholder="Mínimo" />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={6}>
                                            <Form.Group>
                                                <Form.Label>Total Máximo</Form.Label>
                                                <Form.Control type="number" name="maxTotal" value={filters.maxTotal} onChange={handleChange} placeholder="Máximo" />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>

                        {/* Grupo 4: Ordenamiento */}
                        <Col lg={6} className="mb-4">
                            <h5 className="filter-section-title">
                                <i className="bi bi-sort-down text-primary"></i> Ordenamiento
                            </h5>
                            <Row>
                                <Col md={6} className="mb-3">
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
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>Dirección</Form.Label>
                                        <Form.Select name="sortDirection" value={filters.sortDirection} onChange={handleChange}>
                                            <option value="ASC">Ascendente</option>
                                            <option value="DESC">Descendente</option>
                                        </Form.Select>
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
                <Alert variant="info" className="d-flex align-items-center gap-2 rounded-4">
                    <i className="bi bi-info-circle-fill fs-5"></i>
                    <div>
                        <strong>Nota:</strong> Utiliza los filtros superiores para buscar facturas. Podrás previsualizarlas en una tabla interactiva y descargarlas de forma masiva o individual.
                    </div>
                </Alert>
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
                    {users.length < filteredBills.length && (
                        <Alert variant="warning" className="d-flex align-items-center gap-2 mb-3 rounded-4">
                            <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                            <div>
                                Advertencia: <strong>{filteredBills.length - users.length}</strong> factura(s) no tienen un usuario asociado cargado en la aplicación. La descarga de estos archivos individuales no estará disponible.
                            </div>
                        </Alert>
                    )}

                    {/* Tabla de Facturas */}
                    <Card className="border-0 shadow-sm rounded-4 p-3 mb-4">
                        <ReusableTable
                            data={filteredBills}
                            columns={columns}
                            defaultSort="idBill"
                            defaultSortDirection="desc"
                        />
                    </Card>
                </div>
            )}
        </div>
    );
};

export default BillGenerateFilteredPage;

