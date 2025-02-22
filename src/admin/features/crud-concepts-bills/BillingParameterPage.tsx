import { useEffect, useState } from "react";
import { addData, getData, updateData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import { Button, Spinner } from "react-bootstrap";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import { BillingParameter } from "../../../core/models/dto/BillingParameter";
import AddEditBillingParameterModal from "./AddEditBillingParameterModal";
import applyConditionLabels from "../../../shared/components/labels-traductor/applyConditionLabels";
import statusLabels from "../../../shared/components/labels-traductor/statusLabels";

const BillingParameterPage = () => {

    //Estados
    const [billingParameterData, setBillingParameterData] = useState<BillingParameter[]>([])
    const [selectedBillingParameter, setSelectedBillingParameter] = useState<BillingParameter | null>(null);
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
            const response = await getData<BillingParameter[]>("/admin/billing-parameter");
            setBillingParameterData(response);
        } catch (error) {
            console.error("Error fetching BILLINGPARAMETER data:", error);
            setError("Error al cargar los parametros de la factura.");
        } finally {
            setLoading(false);
        }
    };

    // Manejar añadir/editar
    const handleSave = async (billingParameter: BillingParameter) => {
        try {
            //Actualizar registro
            if (billingParameter.idBillingParameter) {
                await updateData("/admin/billing-parameter/update?idBillingParameter", billingParameter.idBillingParameter, billingParameter);
                toast.success("Parametro de facturación actualizado exitosamente");
            }
            // Añadir registro
            else {
                await addData("/admin/billing-parameter/create", billingParameter);
                toast.success("Parametro de facturación creado exitosamente");
            }
            setSelectedBillingParameter(billingParameter);
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al guardar el parametro de facturación");
        }
    };

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<BillingParameter>[] = [
        { key: "idBillingParameter", label: "ID", sortable: true },
        { key: "name", label: "Nombre", sortable: false },
        { key: "description", label: "Descripción", sortable: false },
        { key: "value", label: "Importe $", sortable: false },
        { key: "applyCondition", label: "Condición", sortable: false, render: (row) => applyConditionLabels[row.applyCondition] || row.applyCondition },
        { key: "status", label: "Estado", sortable: false, render: (row) => statusLabels[row.status] || row.status },
        {
            key: "actions", label: "Acciones", actions: (row: BillingParameter) => (
                <div className="d-flex gap-2 justify-content-center overflow-auto text-nowrap">
                    <Button variant="warning" onClick={() => { setSelectedBillingParameter(row); setShowModal(true); }}>
                        Editar
                    </Button>
                </div>
            ),
        },
    ];

    // Render
    return (
        <div>
            <h1 className="text-center">Parametros de Facturación</h1>
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
                        <Button onClick={() => { setSelectedBillingParameter(null); setShowModal(true); }}>
                            Añadir Param. Facturación
                        </Button>
                    </div>

                    {/* Tabla */}
                    <ReusableTable<BillingParameter>
                        data={billingParameterData}
                        columns={columns}
                        defaultSort="idBillingParameter"
                    />

                    {/* Modal de añadir/edicion */}
                    <AddEditBillingParameterModal
                        key={selectedBillingParameter ? selectedBillingParameter.idBillingParameter : "new"}
                        show={showModal}
                        onHide={() => setShowModal(false)}
                        onSave={handleSave}
                        billingParameter={selectedBillingParameter}
                    />
                </div>
            )}
        </div>
    );
};

export default BillingParameterPage;