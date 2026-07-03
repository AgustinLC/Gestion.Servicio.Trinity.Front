import { useEffect, useState } from "react";
import { addData, deleteData, getData, updateData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import { Button, Spinner } from "react-bootstrap";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import ConfirmModal from "../../../shared/components/confirm/ConfirmModal";
import { FeatureDto } from "../../../core/models/dto/FeatureDto";
import AddEditFeatureModal from "./AddEditFeatureModal";

const CrudFeaturePage = () => {

    //Estados
    const [featureData, setFeatureData] = useState<FeatureDto[]>([])
    const [selectedFeature, setSelectedFeature] = useState<FeatureDto | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [featureToDelete, setFeatureToDelete] = useState<FeatureDto | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Obtener datos al cargar el componente
    useEffect(() => {
        fetchData();
    }, []);

    //Obtener informacion de la api
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getData<FeatureDto[]>("/admin/features");
            setFeatureData(response);
        } catch (error) {
            console.error("Error fetching feature data:", error);
            setError("Error al cargar las funcionalidades.");
        } finally {
            setLoading(false);
        }
    };

    //Manejar eliminación
    const handleDelete = async () => {
        if (!featureToDelete) return;
        setIsDeleting(true);
        try {
            await deleteData("/admin/delete-feature?idFeature", featureToDelete.idFeature);
            toast.success("Funció eliminada exitosamente");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al eliminar la función");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setFeatureToDelete(null);
        }
    };

    // Manejar añadir/editar
    const handleSave = async (feature: FeatureDto) => {
        try {
            //Actualizar registro
            if (feature.idFeature) {
                await updateData("/admin/update-feature?idFeature", feature.idFeature, feature);
                toast.success("Función actualizada exitosamente");
            }
            // Añadir registro
            else {
                await addData("/admin/register-feature", feature);
                toast.success("Función creada exitosamente");
            }
            setSelectedFeature(feature);
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al guardar la función");
        }
    };

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<FeatureDto>[] = [
        { key: "idFeature", label: "ID", sortable: true },
        { key: "name", label: "Funcionalidad", sortable: false },
        { key: "description", label: "Descripcion", sortable: false },
        {
            key: "actions", label: "Acciones", actions: (row: FeatureDto) => (
                <div className="d-flex gap-2 justify-content-center overflow-auto text-nowrap">
                    <Button variant="warning" onClick={() => { setSelectedFeature(row); setShowModal(true); }}>
                        Editar
                    </Button>
                    <Button variant="danger" onClick={() => { setFeatureToDelete(row); setShowDeleteModal(true); }}>
                        Eliminar
                    </Button>
                </div>
            ),
        },
    ];

    // Render
    return (
        <div>
            <h1 className="text-center">Gestión de Funciones</h1>
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
                        <Button onClick={() => { setSelectedFeature(null); setShowModal(true); }}>
                            Añadir Función
                        </Button>
                    </div>

                    {/* Tabla */}
                    <ReusableTable<FeatureDto>
                        data={featureData}
                        columns={columns}
                        defaultSort="idFeature"
                    />

                    {/* Modal de añadir/edicion */}
                    <AddEditFeatureModal
                        key={selectedFeature ? selectedFeature.idFeature : "new"}
                        show={showModal}
                        onHide={() => setShowModal(false)}
                        onSave={handleSave}
                        feature={selectedFeature}
                    />

                    {/* Modal de Confirmación */}
                    <ConfirmModal
                        show={showDeleteModal}
                        onHide={() => setShowDeleteModal(false)}
                        title="Confirmar Eliminación"
                        message={
                            <>
                                ¿Estás seguro que deseas eliminar la funcion:
                                <strong> {featureToDelete?.name}</strong>?
                            </>
                        }
                        confirmText="Confirmar"
                        isLoading={isDeleting}
                        onConfirm={handleDelete}
                    />
                </div>
            )}
        </div>
    );
};

export default CrudFeaturePage;