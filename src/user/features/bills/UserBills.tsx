import React, { useEffect, useState, useRef, useCallback } from "react";
import { Badge, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { BillDetailsDto } from "../../../core/models/dto/BillDetailsDto";
import { getData } from "../../../core/services/apiService";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import SearchBar from "../../../shared/components/searcher/SearchBar";
import useAuth from "../../../hooks/useAuth";
import BillPdfGenerator, { BillPdfGeneratorRef } from "../../../shared/components/pdf/BillPdfGenerator";
import { UserDto } from "../../../core/models/dto/UserDto";
import { PaymentStatus } from "../../../core/models/dto/PaymentStatus";

const UserBills: React.FC = () => {
    const [bills, setBills] = useState<BillDetailsDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filteredData, setFilteredData] = useState<BillDetailsDto[]>([]);
    const [selectedBill, setSelectedBill] = useState<BillDetailsDto | null>(null); // Estado para la factura seleccionada
    const [pdfLoading, setPdfLoading] = useState(false); // Estado para la carga del PDF
    const pdfGeneratorRef = useRef<BillPdfGeneratorRef>(null); // Ref para el generador de PDF
    const [user, setUser] = useState<UserDto | null>(null);

    // Hooks importados
    const { userId } = useAuth(); // Obtener el userId y el usuario logueado

    // Obtener datos del usuario 
    const fetchUserData = useCallback(async () => {
        setLoading(true);
        try {
            const user = await getData<UserDto>(`/user/${userId}`);
            setUser(user);
            const bills = await getData<BillDetailsDto[]>(`/user/bill-active/${userId}`);
            setBills(bills);
            setFilteredData(bills);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al obtener los datos del usuario");
            setError("Error al cargar datos de usuario");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const getPaymentStatusBadge = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.UNPAID:
                return <Badge bg="danger">Impaga</Badge>;
            case PaymentStatus.PAID_ON_TIME:
                return <Badge bg="success">Pagada en término</Badge>;
            case PaymentStatus.PAID_LATE:
                return <Badge bg="warning" text="dark">Pagada fuera de término</Badge>;
            default:
                return <Badge bg="secondary">Desconocido</Badge>;
        }
    };

    // Montar el componente 
    useEffect(() => {
        if (userId) {
            fetchUserData();
        }
    }, [userId, fetchUserData]);

    // Manejar busqueda
    const handleSearch = (query: string) => {
        const filtered = bills.filter((bill) =>
            Object.values(bill).some((value) =>
                String(value).toLowerCase().includes(query.toLowerCase())
            )
        );
        setFilteredData(filtered);
    };

    // Manejar pago de factura
    /*const handlePayBill = async (idBill: number) => {
        try {
            // Llama al endpoint para obtener el enlace de pago usando addData
            const response = await addData(`/user/payment/create/${idBill}`, {});

            // Extrae el enlace de la respuesta
            const paymentLink = response.toString();

            // Abre el enlace en una nueva pestaña
            window.open(paymentLink, "_blank");
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al generar el enlace de pago");
        }
    };*/

    // Manejar visualización de factura
    const handleViewInvoice = (bill: BillDetailsDto) => {
        setSelectedBill(bill); // Establece la factura seleccionada
        setTimeout(() => {
            pdfGeneratorRef.current?.generate();
        }, 100);
    };

    // Columnas para la tabla 
    const columns: TableColumnDefinition<BillDetailsDto>[] = [
        { key: "idBill", label: "N° de Factura", sortable: true },
        { key: "periodName", label: "Periodo", sortable: false },
        { key: "consumption", label: "Consumo", sortable: true, render: (row: BillDetailsDto) => row.consumption.toLocaleString(), },
        { key: "surplus", label: "Excedente", sortable: true, render: (row: BillDetailsDto) => row.surplus.toLocaleString(), },
        { key: "surplusPrice", label: "Precio Excedente", sortable: true, render: (row: BillDetailsDto) => `$${row.surplusPrice.toLocaleString()}`, },
        { key: "subTotal", label: "Subtotal", sortable: false, render: (row: BillDetailsDto) => `$${row.subTotal.toLocaleString()}`, },
        { key: "totalDiscounts", label: "Descuentos", sortable: false, render: (row: BillDetailsDto) => `$${row.totalDiscounts.toLocaleString()}`, },
        { key: "total", label: "Total", sortable: true, render: (row: BillDetailsDto) => `$${row.total.toLocaleString()}`, },
        {
            key: "paidStatus",
            label: "Estado",
            sortable: true,
            render: (row: BillDetailsDto) => (
                getPaymentStatusBadge(row.paidStatus)
            ),
        },
        {
            key: "actions",
            label: "Acciones",
            actions: (row: BillDetailsDto) => (
                <div className="d-flex gap-2 justify-content-center overflow-auto text-nowrap">
                    {/*{!row.paidStatus && (
                        <Button variant="success" onClick={() => handlePayBill(row.idBill)}>
                            Pagar
                        </Button>
                    )}*/}
                    <Button variant="primary" onClick={() => handleViewInvoice(row)}>
                        Visualizar
                    </Button>
                </div>
            ),
        },
    ];

    // Render
    return (
        <div>
            <h1 className="text-center">Mis Facturas</h1>
            {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                    <span className="mb-2 fw-bold">CARGANDO...</span>
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : (
                <div>
                    <div className="table-toolbar d-flex flex-column flex-lg-row align-items-center justify-content-between flex-wrap gap-2 mb-3">
                        <SearchBar onSearch={handleSearch} />
                    </div>
                    <ReusableTable
                        data={filteredData}
                        columns={columns}
                    />
                </div>
            )}

            {/* Componente para generar el PDF */}
            {selectedBill && user && (
                <BillPdfGenerator
                    bill={selectedBill}
                    user={user}
                    fileName={`Factura_${selectedBill.idBill}`}
                    onGenerate={(isGenerating) => setPdfLoading(isGenerating)}
                    ref={pdfGeneratorRef}
                />
            )}

            {/* Overlay de carga para el PDF */}
            {pdfLoading && (
                <div className="pdf-loading-overlay">
                    <Spinner animation="border" />
                    <p>Generando PDF...</p>
                </div>
            )}
        </div>
    );
};

export default UserBills;