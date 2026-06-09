import { useState, useMemo } from "react";
import { Button, Spinner, Badge } from "react-bootstrap";
import SearchBar from "../../../shared/components/searcher/SearchBar";
import { UserDto } from "../../../core/models/dto/UserDto";
import { Status } from "../../../core/models/dto/Status";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import { useSearch } from "../../../hooks/useSearch";
import useAppData from "../../../hooks/useAppData";
import { useDebtDisconnectionPdfs } from "../../../shared/hooks/useDebtDisconnectionPdfs";

// Tipo extendido para incluir la simulación de deuda
interface DebtorUserDto extends UserDto {
    periodsOwed: number;
}

// Usuarios ficticios para simulación y pruebas del frontend
const MOCK_DEBTORS: DebtorUserDto[] = [
    {
        idUser: 2,
        username: "ppichilli",
        firstName: "Pedro Carmelo",
        lastName: "Pichilli",
        dni: 15234567,
        phone: "2635036918",
        status: Status.ACTIVE,
        dateRegister: "2025-10-14",
        password: "",
        digitalInvoiceAdhered: true,
        ivaInvoiceAdhered: false,
        pdfInvoiceAdhered: true,
        residenceDto: {
            idLocation: 1,
            idResidence: 9001,
            district: "Santa María de Oro",
            street: "Almirante Brown",
            number: 0,
            serialNumber: "M-9001",
            idFee: 1,
            valueMeter: 150
        },
        periodsOwed: 2 // Permite generar Orden de Corte (>= 2 períodos)
    },
    {
        idUser: 105,
        username: "jdominguez",
        firstName: "Juan Carlos",
        lastName: "Domínguez",
        dni: 27483920,
        phone: "2634567890",
        status: Status.ACTIVE,
        dateRegister: "2024-01-15",
        password: "",
        digitalInvoiceAdhered: true,
        ivaInvoiceAdhered: false,
        pdfInvoiceAdhered: true,
        residenceDto: {
            idLocation: 1,
            idResidence: 9002,
            district: "Santa María de Oro",
            street: "San Martín",
            number: 450,
            serialNumber: "M-9002",
            idFee: 1,
            valueMeter: 120
        },
        periodsOwed: 1 // Solo permite generar Cuadro de Aviso (< 2 períodos)
    },
    {
        idUser: 210,
        username: "mgarcia",
        firstName: "María Rosa",
        lastName: "García",
        dni: 31849204,
        phone: "2634001122",
        status: Status.ACTIVE,
        dateRegister: "2023-11-20",
        password: "",
        digitalInvoiceAdhered: false,
        ivaInvoiceAdhered: false,
        pdfInvoiceAdhered: true,
        residenceDto: {
            idLocation: 1,
            idResidence: 9003,
            district: "Santa María de Oro",
            street: "Belgrano",
            number: 1250,
            serialNumber: "M-9003",
            idFee: 2,
            valueMeter: 340
        },
        periodsOwed: 3 // Permite generar Orden de Corte (>= 2 períodos)
    }
];

const DebtDisconnectionPage = () => {
    const { operatorUsers, loading, error } = useAppData();
    const { isGenerating: pdfLoading, generateDisconnectionPdf, generateWarningPdf } = useDebtDisconnectionPdfs();
    const [useMockSimulation, setUseMockSimulation] = useState(true);

    // Calcular el conjunto de datos de deudores según si se activa la simulación o no
    const debtorsData: DebtorUserDto[] = useMemo(() => {
        if (useMockSimulation) {
            return MOCK_DEBTORS;
        }

        if (!operatorUsers) return [];
        return operatorUsers
            .map(user => {
                // Simulación en base a usuarios reales
                let periodsOwed = 0;
                if (user.idUser % 3 === 0) periodsOwed = 1;
                else if (user.idUser % 5 === 0) periodsOwed = 2;
                else if (user.idUser % 7 === 0) periodsOwed = 3;

                return {
                    ...user,
                    periodsOwed,
                };
            })
            .filter(user => user.periodsOwed > 0);
    }, [operatorUsers, useMockSimulation]);

    // Hook para buscar por columnas en los deudores
    const { filteredData, handleSearch } = useSearch<DebtorUserDto>(
        debtorsData,
        ["firstName", "lastName", "idUser"] // columnas filtrables
    );

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<DebtorUserDto>[] = [
        { key: "idUser", label: "N° Conexión", sortable: true },
        { key: "firstName", label: "Nombre", sortable: false },
        { key: "lastName", label: "Apellido", sortable: false },
        { key: "dni", label: "DNI", sortable: false },
        { key: "phone", label: "Teléfono", sortable: false },
        {
            key: "periodsOwed",
            label: "Períodos Adeudados",
            sortable: true,
            render: (value: any) => {
                const periods = Number(value);
                const bg = periods >= 2 ? "danger" : "warning";
                return (
                    <div className="text-center">
                        <Badge bg={bg} className="fs-6 px-3 py-2">
                            {periods} {periods === 1 ? "Período" : "Períodos"}
                        </Badge>
                    </div>
                );
            }
        },
        {
            key: "actions",
            label: "Generar Documentos",
            actions: (row: DebtorUserDto) => {
                const canCut = row.periodsOwed >= 2;
                return (
                    <div className="d-flex gap-2 justify-content-center overflow-auto text-nowrap">
                        <Button
                            variant="warning"
                            size="sm"
                            disabled={pdfLoading}
                            onClick={() => generateWarningPdf(row, row.periodsOwed)}
                            title="Generar Cuadro de Aviso de Corte"
                        >
                            Cuadro de Aviso
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            disabled={pdfLoading || !canCut}
                            onClick={() => generateDisconnectionPdf(row)}
                            title={
                                !canCut
                                    ? "Se requiere adeudar 2 o más períodos para emitir aviso de corte"
                                    : "Generar Aviso de Corte de Servicio (Orden de Corte)"
                            }
                        >
                            Aviso de Corte
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div>
            <h1 className="text-center mb-4">Gestión de Deudores y Avisos de Corte</h1>
            {loading && !useMockSimulation ? (
                <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                    <span className="mb-2 fw-bold">CARGANDO...</span>
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            ) : error && !useMockSimulation ? (
                <div className="text-center py-5 text-danger">{error}</div>
            ) : (
                <div>
                    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 mb-4 p-3 bg-white border rounded shadow-sm">
                        <div className="w-100 style={{ maxWidth: '400px' }}">
                            <SearchBar onSearch={handleSearch} />
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <span className="fw-semibold text-secondary small">Fuente de Datos:</span>
                            <Button
                                variant={useMockSimulation ? "success" : "outline-primary"}
                                size="sm"
                                onClick={() => setUseMockSimulation(true)}
                                className="px-3"
                            >
                                Simulación (Pruebas)
                            </Button>
                            <Button
                                variant={!useMockSimulation ? "primary" : "outline-primary"}
                                size="sm"
                                onClick={() => setUseMockSimulation(false)}
                                className="px-3"
                                disabled={operatorUsers.length === 0}
                            >
                                Base de Datos
                            </Button>
                        </div>
                    </div>

                    <div className="text-muted small mb-3">
                        {useMockSimulation ? (
                            <Badge bg="success" className="px-2 py-1">
                                Modo Simulación activo: Mostrando {filteredData.length} deudores ficticios con datos pre-configurados para pruebas.
                            </Badge>
                        ) : (
                            <span>
                                Base de datos activa: Mostrando {filteredData.length} deudores de {operatorUsers.length} conexiones.
                            </span>
                        )}
                    </div>

                    {/* Tabla principal */}
                    <ReusableTable<DebtorUserDto>
                        data={filteredData}
                        columns={columns}
                        defaultSort="idUser"
                    />
                </div>
            )}
        </div>
    );
};

export default DebtDisconnectionPage;
