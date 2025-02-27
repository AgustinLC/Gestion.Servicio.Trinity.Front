import React, { useEffect, useState } from "react";
import { Badge, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { BillDetailsDto } from "../../../core/models/dto/BillDetailsDto";
import { addData, getData } from "../../../core/services/apiService";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import SearchBar from "../../../shared/components/searcher/SearchBar";
import useAuth from "../../../hooks/useAuth";

const UserBills: React.FC = () => {
    const [bills, setBills] = useState<BillDetailsDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filteredData, setFilteredData] = useState<BillDetailsDto[]>([]);
    // Hooks importados
    const { userId } = useAuth();

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const bills = await getData<BillDetailsDto[]>(`/user/bill-active/${userId}`);
            setBills(bills);
            setFilteredData(bills);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al obtener las facturas");
            setError("Error al cargar las facturas");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query: string) => {
        const filtered = bills.filter((bill) =>
            Object.values(bill).some((value) =>
                String(value).toLowerCase().includes(query.toLowerCase())
            )
        );
        setFilteredData(filtered);
    };

    const handlePayBill = async (idBill: number) => {
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
    };

    const columns: TableColumnDefinition<BillDetailsDto>[] = [
        { key: "idBill", label: "Número de Factura", sortable: true },
        {
            key: "consumption",
            label: "Consumo",
            sortable: true,
            render: (row: BillDetailsDto) => row.consumption.toLocaleString(), // Formatea el consumo con separadores de miles
        },
        {
            key: "surplus",
            label: "Excedente",
            sortable: true,
            render: (row: BillDetailsDto) => row.surplus.toLocaleString(), // Formatea el excedente con separadores de miles
        },
        {
            key: "surplusPrice",
            label: "Precio Excedente",
            sortable: true,
            render: (row: BillDetailsDto) => `$${row.surplusPrice.toLocaleString()}`, // Agrega el símbolo de pesos y formatea el número
        },
        {
            key: "total",
            label: "Total",
            sortable: true,
            render: (row: BillDetailsDto) => `$${row.total.toLocaleString()}`, // Agrega el símbolo de pesos y formatea el número
        },
        {
            key: "paidStatus",
            label: "Estado",
            sortable: true,
            render: (row: BillDetailsDto) => (
                <Badge bg={row.paidStatus ? "success" : "warning"}>
                    {row.paidStatus ? "Pagada" : "Impaga"}
                </Badge>
            ), // Usa Badge para mostrar el estado
        },
        {
            key: "actions",
            label: "Acciones",
            actions: (row: BillDetailsDto) => (
                <div className="d-flex gap-2 justify-content-center overflow-auto text-nowrap">
                    {!row.paidStatus && (
                        <Button variant="success" onClick={() => handlePayBill(row.idBill)}>
                            Pagar
                        </Button>
                    )}
                    <Button variant="info" onClick={() => window.print()}>
                        Imprimir
                    </Button>
                </div>
            ),
        },
    ];

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
                    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 mb-1">
                        <SearchBar onSearch={handleSearch} />
                    </div>
                    <ReusableTable
                        data={filteredData}
                        columns={columns}
                    />
                </div>
            )}
        </div>
    );
};

export default UserBills;