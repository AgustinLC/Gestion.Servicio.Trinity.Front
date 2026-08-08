import { useEffect, useState } from "react";
import { addData, deleteData, getData, updateData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import { Button, Form } from "react-bootstrap";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import TableSkeleton from "../../../shared/components/table-skeleton/TableSkeleton";
import { ServiceUnitDto } from "../../../core/models/dto/ServiceUnitDto";
import AddEditServiceUnitModal from "./AddEditServiceUnitModal";
import { Link } from "react-router-dom";
import ConfirmModal from "../../../shared/components/confirm/ConfirmModal";
import useAppData from "../../../hooks/useAppData";
import TableToolbar from "../../../shared/components/table-toolbar/TableToolbar";
import PageHeader from "../../../shared/components/PageHeader";
import { useSearch } from "../../../hooks/useSearch";

const ServicesUnitsPage = () => {

    //Estados
    const [serviceUnitData, setServiceUnitData] = useState<ServiceUnitDto[]>([])
    const [selectedServiceUnit, setSelectedServiceUnit] = useState<ServiceUnitDto | null>(null);
    const [serviceUnitToDelete, setServiceUnitToDelete] = useState<ServiceUnitDto | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showServiceEditModal, setShowServiceEditModal] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showConfirmActiveModal, setShowConfirmActiveModal] = useState(false);
    const [serviceUnitToUpdate, setServiceUnitToUpdate] = useState<ServiceUnitDto | null>(null);
    const { adminServices, adminUnits } = useAppData();

    // Hook para buscar por columnas
    const { filteredData, handleSearch } = useSearch<ServiceUnitDto>(
        serviceUnitData,
        ["serviceUnitName"]
    );

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
                    <Button variant="outline-warning" onClick={() => { setSelectedServiceUnit(row); setShowServiceEditModal(true); }}>
                        <i className="bi bi-pencil me-1"></i> Editar
                    </Button>
                    <Button variant="outline-danger" onClick={() => { setServiceUnitToDelete(row); setShowDeleteModal(true); }}>
                        <i className="bi bi-trash me-1"></i> Eliminar
                    </Button>
                </div>
            ),
        },
    ];

    // Render
    return (
        <div>
            <PageHeader title="Gestión de Servicios y Unidades" subtitle="Administrá la relación entre servicios y unidades." icon="bi bi-calculator" />
            {loading ? (
                <TableSkeleton />
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : (
                <div className="content-fade-in">
                    <div>
                        <TableToolbar onSearch={handleSearch}>
                            <Button onClick={() => { setSelectedServiceUnit(null); setShowServiceEditModal(true); }}>
                                Añadir Servicio/Unidad
                            </Button>
                        </TableToolbar>

                        {/* Tabla */}
                        <ReusableTable<ServiceUnitDto>
                            data={filteredData}
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
                            services={adminServices}
                            unities={adminUnits}
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
                            loadingText="Eliminando..."
                            onConfirm={handleDelete}
                        />
                    </div>

                    {/* Accesos rápidos para crear servicios/unidades desde cero */}
                    <div className="card mt-3" style={{ backgroundColor: "#f8fafc" }}>
                        <div className="card-body p-4">
                            <h6 className="fw-bold mb-1">¿No encontrás lo que buscás?</h6>
                            <p className="text-muted small mb-3">Podés crear nuevos servicios o unidades desde los formularios correspondientes.</p>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center justify-content-between gap-3 p-3 rounded-3 h-100 flex-wrap" style={{ backgroundColor: "#eff6ff" }}>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="icon-badge flex-shrink-0" style={{ backgroundColor: "#dbeafe", color: "#2563eb" }}>
                                                <i className="bi bi-droplet-fill"></i>
                                            </div>
                                            <div>
                                                <div className="fw-semibold">
                                                    Si no encontrás la <span style={{ color: "#2563eb" }}>unidad</span> deseada
                                                </div>
                                                <div className="text-muted small">Creá una nueva unidad haciendo click en el botón.</div>
                                            </div>
                                        </div>
                                        <Link to="/dashboard/admin/units" className="btn btn-outline-primary text-nowrap">
                                            <i className="bi bi-plus-lg me-1"></i> Crear unidad
                                        </Link>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center justify-content-between gap-3 p-3 rounded-3 h-100 flex-wrap" style={{ backgroundColor: "#fff7ed" }}>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="icon-badge flex-shrink-0" style={{ backgroundColor: "#ffedd5", color: "#c2410c" }}>
                                                <i className="bi bi-box-seam-fill"></i>
                                            </div>
                                            <div>
                                                <div className="fw-semibold">
                                                    Si no encontrás el <span style={{ color: "#c2410c" }}>servicio</span> deseado
                                                </div>
                                                <div className="text-muted small">Creá un nuevo servicio haciendo click en el botón.</div>
                                            </div>
                                        </div>
                                        <Link to="/dashboard/admin/services" className="btn btn-outline-warning text-nowrap">
                                            <i className="bi bi-plus-lg me-1"></i> Crear servicio
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServicesUnitsPage;
