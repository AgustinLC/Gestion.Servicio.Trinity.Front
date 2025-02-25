import { useEffect, useState } from "react";
import { addData, getData, updateData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import { Button, Spinner } from "react-bootstrap";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import { FeeDto } from "../../../core/models/dto/FeeDto";
import AddEditFeeModal from "./AddEditFeeModal";

const CrudFeePage = () => {

    //Estados
    const [feeData, setFeeData] = useState<FeeDto[]>([])
    const [selectedFee, setSelectedFee] = useState<FeeDto | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Obtener datos al cargar el componente
    useEffect(() => {
        fetchData();
    }, []);

    //Obtener informacion de la api
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getData<FeeDto[]>("/operator/fee");
            setFeeData(response);
        } catch (error) {
            console.error("Error fetching FEE data:", error);
            setError("Error al cargar las tarifas.");
        } finally {
            setLoading(false);
        }
    };

    // Manejar añadir/editar
    const handleSave = async (fee: FeeDto) => {
        try {
            //Actualizar registro
            if (fee.idFee) {
                await updateData("/admin/update-fee?idFee", fee.idFee, fee);
                toast.success("Tarifa actualizada exitosamente");
            }
            // Añadir registro
            else {
                await addData("/admin/register-fee", fee);
                toast.success("Tarifa creada exitosamente");
            }
            setSelectedFee(fee);
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al guardar la tarifa");
        }
    };

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<FeeDto>[] = [
        { key: "name", label: "Tarifa", sortable: false },
        { key: "description", label: "Descripción", sortable: false },
        { key: "price", label: "Precio", sortable: true },
        { key: "consumptionMax", label: "Consumo Max.", sortable: false },
        { key: "surplusChargePerUnit", label: "Costo por Exceso", sortable: false },
        {
            key: "actions", label: "Acciones", actions: (row: FeeDto) => (
                <Button variant="warning" onClick={() => { setSelectedFee(row); setShowModal(true); }}>
                    Editar
                </Button>
            ),
        },
    ];

    // Render
    return (
        <div>
            <h1 className="text-center">Gestion de Tarifas</h1>
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
                        <Button onClick={() => { setSelectedFee(null); setShowModal(true); }}>
                            Añadir Tarifa
                        </Button>
                    </div>

                    {/* Tabla */}
                    <ReusableTable<FeeDto>
                        data={feeData}
                        columns={columns}
                        defaultSort="price"
                    />

                    {/* Modal de añadir/edicion */}
                    <AddEditFeeModal
                        key={selectedFee ? selectedFee.idFee : "new"}
                        show={showModal}
                        onHide={() => setShowModal(false)}
                        onSave={handleSave}
                        fee={selectedFee}
                    />
                </div>
            )}
        </div>
    );
};

export default CrudFeePage;