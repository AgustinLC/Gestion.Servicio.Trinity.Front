import { useState } from "react";
import { DiscountDto } from "../../../core/models/dto/Discount";
import { addData, updateData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import { Button, Spinner } from "react-bootstrap";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import AddEditDiscountModal from "./AddEditDiscountModal";
import applyConditionLabels from "../../../shared/components/labels-traductor/applyConditionLabels";
import useAppData from "../../../hooks/useAppData";
import TableToolbar from "../../../shared/components/table-toolbar/TableToolbar";
import PageHeader from "../../../shared/components/PageHeader";
import { useSearch } from "../../../hooks/useSearch";

const DiscountManagementPage = () => {

    // Estados 
    const [selectedDiscount, setSelectedDiscount] = useState<DiscountDto | null>(null);
    const [showModal, setShowModal] = useState(false);
    const { discounts, loading, error, refreshDiscounts } = useAppData();

    // Hook para buscar por columnas
    const { filteredData, handleSearch } = useSearch<DiscountDto>(
        discounts,
        ["name", "description"]
    );

    // Manejar añadir/editar
    const handleSave = async (discount: DiscountDto) => {
        try {
            if (discount.idDiscount) {
                await updateData("/admin/update-discount?idDiscount", discount.idDiscount, discount);
                toast.success("Descuento actualizado exitosamente");

            } else {
                await addData("/admin/register-discount", discount);
                toast.success("Descuento creado exitosamente");
                console.log("Entro aca")
            }

            // Solo se ejecuta si no hubo error
            setSelectedDiscount(discount);
            setShowModal(false);
            await refreshDiscounts();

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error al guardar el descuento");
        }
    };

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<DiscountDto>[] = [
        { key: "name", label: "Nombre", sortable: false },
        { key: "description", label: "Descripción", sortable: false },
        { key: "amount", label: "Importe $", sortable: false },
        { key: "applyCondition", label: "Condición", sortable: false, render: (row) => applyConditionLabels[row.applyCondition] || row.applyCondition },
        {
            key: "actions", label: "Acciones", actions: (row: DiscountDto) => (
                <Button variant="outline-warning" onClick={() => { setSelectedDiscount(row); setShowModal(true); }}>
                    Editar
                </Button>
            ),
        },
    ];

    return (
        <div>
            <PageHeader title="Gestión de Descuentos" subtitle="Administrá los descuentos disponibles para los usuarios." icon="bi bi-plus-slash-minus" />
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
                        <Button onClick={() => { setSelectedDiscount(null); setShowModal(true); }}>
                            Añadir Descuento
                        </Button>
                    </TableToolbar>

                    {/* Tabla */}
                    <ReusableTable<DiscountDto>
                        data={filteredData}
                        columns={columns}
                        defaultSort="idDiscount"
                    />

                    {/* Modal de añadir/edicion */}
                    <AddEditDiscountModal
                        key={selectedDiscount ? selectedDiscount.idDiscount : "new"}
                        show={showModal}
                        onHide={() => setShowModal(false)}
                        onSave={handleSave}
                        discount={selectedDiscount}
                    />
                </div>
            )}
        </div>
    )
}

export default DiscountManagementPage
