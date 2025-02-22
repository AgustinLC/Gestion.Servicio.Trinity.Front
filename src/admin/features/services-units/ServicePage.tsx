import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addData, deleteData, getData, updateData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import { Button, Spinner } from "react-bootstrap";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import ConfirmModal from "../../../shared/components/confirm/ConfirmModal";
import { Service } from "../../../core/models/dto/Service";
import AddEditServiceModal from "./AddEditServiceModal";

const ServicePage = () => {

    //Estados
    const [serviceData, setServiceData] = useState<Service[]>([])
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Constantes
    const navigate = useNavigate();

    // Obtener datos al cargar el componente
    useEffect(() => {
        fetchData();
    }, []);

    //Obtener informacion de la api
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getData<Service[]>("/admin/services");
            setServiceData(response);
        } catch (error) {
            console.error("Error fetching feature data:", error);
            setError("Error al cargar los servicios.");
        } finally {
            setLoading(false);
        }
    };

    //Manejar eliminación
    const handleDelete = async () => {
        if (!serviceToDelete) return;
        setIsDeleting(true);
        try {
            await deleteData("/admin/delete-service?idService", serviceToDelete.idService);
            toast.success("Servicio eliminado exitosamente");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al eliminar el servicio");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setServiceToDelete(null);
        }
    };

    // Manejar añadir/editar
    const handleSave = async (service: Service) => {
        try {
            //Actualizar registro
            if (service.idService) {
                await updateData("/admin/update-service?idService", service.idService, service);
                toast.success("Servicio actualizado exitosamente");
            }
            // Añadir registro
            else {
                await addData("/admin/register-service", service);
                toast.success("Servicio creada exitosamente");
            }
            setSelectedService(service);
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al guardar el servicio");
        }
    };

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<Service>[] = [
        { key: "idService", label: "ID", sortable: true },
        { key: "name", label: "Nombre", sortable: false },
        {
            key: "actions", label: "Acciones", actions: (row: Service) => (
                <div className="d-flex gap-2 justify-content-center overflow-auto text-nowrap">
                    <Button variant="warning" onClick={() => { setSelectedService(row); setShowModal(true); }}>
                        Editar
                    </Button>
                    <Button variant="danger" onClick={() => { setServiceToDelete(row); setShowDeleteModal(true); }}>
                        Eliminar
                    </Button>
                </div>
            ),
        },
    ];

    // Render
    return (
        <div>
            <h1 className="text-center">Servicios</h1>
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
                        <Button variant="secondary" onClick={() => navigate(-1)}>
                            Volver
                        </Button>
                        <Button onClick={() => { setSelectedService(null); setShowModal(true); }}>
                            Añadir Servicio
                        </Button>
                    </div>

                    {/* Tabla */}
                    <ReusableTable<Service>
                        data={serviceData}
                        columns={columns}
                        defaultSort="idService"
                    />

                    {/* Modal de añadir/edicion */}
                    <AddEditServiceModal
                        key={selectedService ? selectedService.idService : "new"}
                        show={showModal}
                        onHide={() => setShowModal(false)}
                        onSave={handleSave}
                        service={selectedService}
                    />

                    {/* Modal de Confirmación */}
                    <ConfirmModal
                        show={showDeleteModal}
                        onHide={() => setShowDeleteModal(false)}
                        title="Confirmar Eliminación"
                        message={
                            <>
                                ¿Estás seguro que deseas eliminar el servicio:
                                <strong> {serviceToDelete?.name}</strong>?
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

export default ServicePage;