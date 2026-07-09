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
import TableToolbar from "../../../shared/components/table-toolbar/TableToolbar";
import PageHeader from "../../../shared/components/PageHeader";
import { useSearch } from "../../../hooks/useSearch";

const BillingParameterPage = () => {

    //Estados
    const [billingParameterData, setBillingParameterData] = useState<BillingParameter[]>([])
    const [selectedBillingParameter, setSelectedBillingParameter] = useState<BillingParameter | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Hook para buscar por columnas
    const { filteredData, handleSearch } = useSearch<BillingParameter>(
        billingParameterData,
        ["name", "description"]
    );

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
            await fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al guardar el parametro de facturación");
        }
    };

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<BillingParameter>[] = [
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
            <PageHeader title="Gestión de Conceptos" subtitle="Administrá los parámetros de facturación." icon="bi bi-receipt" />
            {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center loading-vh">
                    <span className="mb-2 fw-bold">CARGANDO...</span>
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : (
                <div>
                    <TableToolbar onSearch={handleSearch}>
                        <Button onClick={() => { setSelectedBillingParameter(null); setShowModal(true); }}>
                            Añadir concepto
                        </Button>
                    </TableToolbar>

                    {/* Tabla */}
                    <ReusableTable<BillingParameter>
                        data={filteredData}
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
