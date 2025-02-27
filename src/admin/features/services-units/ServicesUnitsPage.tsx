import { useEffect, useState } from "react";
import { addData, deleteData, getData, updateData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import { Button, Form, Spinner } from "react-bootstrap";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import { ServiceUnitDto } from "../../../core/models/dto/ServiceUnitDto";
import AddEditServiceUnitModal from "./AddEditServiceUnitModal";
import { Service } from "../../../core/models/dto/Service";
import { Unit } from "../../../core/models/dto/Unit";
import { Link } from "react-router-dom";
import ConfirmModal from "../../../shared/components/confirm/ConfirmModal";

const ServicesUnitsPage = () => {

    //Estados
    const [serviceUnitData, setServiceUnitData] = useState<ServiceUnitDto[]>([])
    const [selectedServiceUnit, setSelectedServiceUnit] = useState<ServiceUnitDto | null>(null);
    const [serviceUnitToDelete, setServiceUnitToDelete] = useState<ServiceUnitDto | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [servicesData, setServicesData] = useState<Service[]>([])
    const [unitiesData, setUnitiesData] = useState<Unit[]>([])
    const [showServiceEditModal, setShowServiceEditModal] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showConfirmActiveModal, setShowConfirmActiveModal] = useState(false);
    const [serviceUnitToUpdate, setServiceUnitToUpdate] = useState<ServiceUnitDto | null>(null);

    // Obtener datos al cargar el componente
    useEffect(() => {
        fetchData();
    }, []);

    //Obtener informacion de la api
    const fetchData = async () => {
        setLoading(true);
        try {
            // Obtener relacion entre servicios y unidades
            const servicesUnities = await getData<ServiceUnitDto[]>("/admin/servicesUnits");
            setServiceUnitData(servicesUnities);
            // Obtener servicios
            const services = await getData<Service[]>("admin/services");
            setServicesData(services);
            // Obtener unidades
            const unities = await getData<Unit[]>("admin/unities");
            setUnitiesData(unities);
        } catch (error) {
            console.error("Error fetching ServiceUnit data:", error);
            setError("Error al cargar los servicios y las unidades.");
        } finally {
            setLoading(false);
        }
    };

    //Manejar eliminación
    const handleDelete = async () => {
        if (!serviceUnitToDelete) return;
        setIsDeleting(true);
        try {
            await deleteData("/admin/delete-serviceUnit?idServiceUnit", serviceUnitToDelete.idServiceUnit);
            toast.success("Relación Servicio/Unidad eliminado exitosamente");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al eliminar relación Servicio/Unidad");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setServiceUnitToDelete(null);
        }
    };

    // Manejar añadir/editar
    const handleSave = async (serviceUnit: ServiceUnitDto) => {
        try {
            //Actualizar registro
            if (serviceUnit.idServiceUnit) {
                await updateData("/admin/update-serviceUnit?idServiceUnit", serviceUnit.idServiceUnit, serviceUnit);
                toast.success("Tarifa actualizada exitosamente");
            }
            // Añadir registro
            else {
                await addData("/admin//register-serviceUnit", serviceUnit);
                toast.success("Tarifa creada exitosamente");
            }
            setSelectedServiceUnit(serviceUnit);
            setShowServiceEditModal(false);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al guardar la tarifa");
        }
    };

    const handleToggleActive = (serviceUnit: ServiceUnitDto) => {
        setServiceUnitToUpdate(serviceUnit);
        setShowConfirmActiveModal(true); 
    };

    const handleConfirmActiveChange = async () => {
        if (!serviceUnitToUpdate) return;

        try {
            const updatedStatus = !serviceUnitToUpdate.active;
            await updateData(`/admin/change-serviceUnit?idServiceUnit`, serviceUnitToUpdate.idServiceUnit, {});
            fetchData(); 
            toast.success(`Estado actualizado a ${updatedStatus ? "Activo" : "Inactivo"}`);
        } catch (error) {
            console.error("Error actualizando el estado:", error);
            toast.error("No se pudo actualizar el estado");
        } finally {
            setShowConfirmActiveModal(false); // Cerrar el modal
            setServiceUnitToUpdate(null); // Limpiar la unidad de servicio almacenada
        }
    };

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<ServiceUnitDto>[] = [
        { key: "idServiceUnit", label: "ID", sortable: true },
        { key: "serviceUnitName", label: "Servicio/Unidad", sortable: false },
        {
            key: "active", label: "Activo", sortable: false, render: (row: ServiceUnitDto) => (
                <Form.Check
                    type="switch"
                    checked={row.active}
                    onChange={() => handleToggleActive(row)}
                    title={row.active ? "Activo" : "Inactivo"}
                    className="custom-switch-container"
                />
            )
        },
        {
            key: "actions", label: "Acciones", actions: (row: ServiceUnitDto) => (
                <div className="d-flex gap-2 justify-content-center overflow-auto text-nowrap">
                    <Button variant="warning" onClick={() => { setSelectedServiceUnit(row); setShowServiceEditModal(true); }}>
                        Editar
                    </Button>
                    <Button variant="danger" onClick={() => { setServiceUnitToDelete(row); setShowDeleteModal(true); }}>
                        Eliminar
                    </Button>
                </div>
            ),
        },
    ];

    // Render
    return (
        <div>
            <h1 className="text-center">Gestion de Servicios y Unidades</h1>
            {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                    <span className="mb-2 fw-bold">CARGANDO...</span>
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : (
                <div>
                    <div>
                        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 mb-1">
                            <Button onClick={() => { setSelectedServiceUnit(null); setShowServiceEditModal(true); }}>
                                Añadir Servicio/Unidad
                            </Button>
                        </div>

                        {/* Tabla */}
                        <ReusableTable<ServiceUnitDto>
                            data={serviceUnitData}
                            columns={columns}
                            defaultSort="idServiceUnit"
                        />

                        {/* Modal para añadir/editar relación Servicio/Unidad */}
                        <AddEditServiceUnitModal
                            key={selectedServiceUnit ? selectedServiceUnit.idServiceUnit : "new"}
                            show={showServiceEditModal}
                            onHide={() => setShowServiceEditModal(false)}
                            onSave={handleSave}
                            serviceUnit={selectedServiceUnit}
                            services={servicesData}
                            unities={unitiesData}
                        />

                        {/* Modal de Confirmación para Cambiar Estado */}
                        <ConfirmModal
                            show={showConfirmActiveModal}
                            onHide={() => setShowConfirmActiveModal(false)}
                            title="Confirmar Cambio de Estado"
                            message={
                                <>
                                    ¿Estás seguro que deseas cambiar el estado de la unidad de servicio{" "}
                                    <strong>{serviceUnitToUpdate?.serviceUnitName}</strong> a{" "}
                                    <strong>{serviceUnitToUpdate?.active ? "Inactivo" : "Activo"}</strong>?
                                </>
                            }
                            confirmText="Confirmar"
                            isLoading={false} // Puedes agregar un estado de carga si lo necesitas
                            onConfirm={handleConfirmActiveChange}
                        />

                        {/* Modal de Confirmación */}
                        <ConfirmModal
                            show={showDeleteModal}
                            onHide={() => setShowDeleteModal(false)}
                            title="Confirmar Eliminación"
                            message={
                                <>
                                    ¿Estás seguro que deseas eliminar el servicio:
                                    <strong> {serviceUnitToDelete?.serviceUnitName}</strong>?
                                </>
                            }
                            confirmText="Confirmar"
                            isLoading={isDeleting}
                            onConfirm={handleDelete}
                        />
                    </div>

                    {/* Paginas para añadir/editar servicios o unidad */}
                    <div>
                        <p className="fst-italic text-danger">Nota.</p>
                        <ul>
                            <li>
                                <p>Si no encuentra la <b>unidad</b> deseada puede crear una haciendo click aqui:
                                    <Link to="/dashboard/admin/units" className="btn btn-warning btn-sm ms-1" title="Unidades">
                                        <i className="bi bi-exclamation"></i>
                                    </Link>
                                </p>
                            </li>
                            <li>
                                <p>Si no encuentra el <b>servicio</b> deseado puede crear una haciendo click aqui:
                                    <Link to="/dashboard/admin/services" className="btn btn-warning btn-sm ms-1" title="Servicios">
                                        <i className="bi bi-exclamation"></i>
                                    </Link>
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServicesUnitsPage;