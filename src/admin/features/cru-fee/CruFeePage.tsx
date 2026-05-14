import { useState } from "react";
import { addData, updateData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import { Button, Spinner } from "react-bootstrap";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import { FeeDto } from "../../../core/models/dto/FeeDto";
import AddEditFeeModal from "./AddEditFeeModal";
import useAppData from "../../../hooks/useAppData";

const CrudFeePage = () => {

    //Estados
    const [selectedFee, setSelectedFee] = useState<FeeDto | null>(null);
    const [showModal, setShowModal] = useState(false);
    const { fees, loading, error, refreshFees } = useAppData();

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
            await refreshFees();
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
        { key: "maturityAmount", label: "Costo por Vencimiento", sortable: false },
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
            <h1 className="text-center">Gestión de Tarifas</h1>
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
                        data={fees}
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
