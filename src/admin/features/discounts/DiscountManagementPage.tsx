import { useEffect, useState } from "react";
import { DiscountDto } from "../../../core/models/dto/Discount";
import { addData, getData, updateData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import { Button, Spinner } from "react-bootstrap";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import SearchBar from "../../../shared/components/searcher/SearchBar";
import AddEditDiscountModal from "./AddEditDiscountModal";
import { useSearch } from "../../../hooks/useSearch";

const DiscountManagementPage = () => {

    // Estados 
    const [discount, setDiscount] = useState<DiscountDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDiscount, setSelectedDiscount] = useState<DiscountDto | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Obtener datos al cargar el componente
    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //Obtener datos de la api 
    const fetchData = async () => {
        setLoading(true);
        try {
            // Obtener descuentos 
            const discounts = await getData<DiscountDto[]>("/operator/discounts");
            setDiscount(discounts);
            setFilteredData(discounts);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al obtener la información");
            setError("Error al cargar la información principal");
        } finally {
            setLoading(false);
        }
    };

    // Hook para buscar por columnas 
    const { filteredData, handleSearch, setFilteredData } = useSearch<DiscountDto>(
        discount,
        ["name", "idDiscount"]
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
            fetchData();

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error al guardar el descuento");
        }
    };

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<DiscountDto>[] = [
        { key: "idDiscount", label: "ID", sortable: true },
        { key: "name", label: "Nombre", sortable: false },
        { key: "description", label: "Descripción", sortable: false },
        { key: "amount", label: "Precio", sortable: false },
        {
            key: "actions", label: "Acciones", actions: (row: DiscountDto) => (
                <Button variant="warning" onClick={() => { setSelectedDiscount(row); setShowModal(true); }}>
                    Editar
                </Button>
            ),
        },
    ];

    return (
        <div>
            <h1 className="text-center">Gestión de Descuentos</h1>
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
                        <Button onClick={() => { setSelectedDiscount(null); setShowModal(true); }}>
                            Añadir Descuento
                        </Button>
                    </div>

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
