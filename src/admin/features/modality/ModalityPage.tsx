import { useEffect, useState } from 'react';
import ReusableTable from '../../../shared/components/table/ReusableTable';
import { Modality } from '../../../core/models/dto/Modality';
import { toast } from 'react-toastify';
import { TableColumnDefinition } from '../../../core/models/types/TableTypes';
import { Form, Spinner } from 'react-bootstrap';
import { getData, updateData } from '../../../core/services/apiService';
import ConfirmModal from '../../../shared/components/confirm/ConfirmModal';
import TableToolbar from '../../../shared/components/table-toolbar/TableToolbar';
import PageHeader from '../../../shared/components/PageHeader';
import { useSearch } from '../../../hooks/useSearch';

const ModalityPage = () => {

    // Estados
    const [modalities, setModalities] = useState<Modality[]>([])
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showConfirmActiveModal, setShowConfirmActiveModal] = useState(false);
    const [modalityToUpdate, setModalityToUpdate] = useState<Modality | null>(null);

    // Hook para buscar por columnas
    const { filteredData, handleSearch } = useSearch<Modality>(
        modalities,
        ["name"]
    );

    // Obtener datos al cargar el componente
    useEffect(() => {
        fetchData();
    }, []);

    // Obtener datos de la api
    const fetchData = async () => {
        setLoading(true);
        try {
            // Obtener usuarios
            const users = await getData<Modality[]>("/admin/modalities");
            setModalities(users);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al obtener la información");
            setError("Error al cargar la información principal");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = (modality: Modality) => {
        setModalityToUpdate(modality);
        setShowConfirmActiveModal(true);
    };

    const handleConfirmActiveChange = async () => {
        if (!modalityToUpdate) return;

        try {
            const updatedStatus = !modalityToUpdate.active;
            await updateData(`/admin/change-modality`, modalityToUpdate.idModality, {});
            fetchData();
            toast.success(`Estado actualizado a ${updatedStatus ? "Activo" : "Inactivo"}`);
        } catch (error) {
            console.error("Error actualizando el estado:", error);
            toast.error("No se pudo actualizar el estado");
        } finally {
            setShowConfirmActiveModal(false); // Cerrar el modal
            setModalityToUpdate(null); // Limpiar la unidad de servicio almacenada
        }
    };

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<Modality>[] = [
        { key: "idModality", label: "ID", sortable: true },
        { key: "name", label: "Nombre", sortable: false },
        {
            key: "active", label: "Activo", sortable: false, render: (row: Modality) => (
                <Form.Check
                    type="switch"
                    checked={row.active}
                    onChange={() => handleToggleActive(row)}
                    title={row.active ? "Activo" : "Inactivo"}
                    className="custom-switch-container"
                />
            )
        },
    ];

    return (
        <div className="d-flex flex-column" style={{ minHeight: "calc(100vh - var(--navbar-height) - 3rem)" }}>
            <PageHeader title="Modalidad activa" subtitle="Administrá las modalidades de facturación." icon="bi bi-arrow-down-up" />
            {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center loading-vh">
                    <span className="mb-2 fw-bold">CARGANDO...</span>
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : (
                <div className="my-auto">
                    <TableToolbar onSearch={handleSearch} />

                    {/* Tabla */}
                    <ReusableTable<Modality>
                        data={filteredData}
                        columns={columns}
                        defaultSort="idModality"
                    />

                    {/* Modal de Confirmación para Cambiar Estado */}
                    <ConfirmModal
                        show={showConfirmActiveModal}
                        onHide={() => setShowConfirmActiveModal(false)}
                        title="Confirmar Cambio de Estado"
                        message={
                            <>
                                ¿Estás seguro que deseas cambiar el estado de la modalidad{" "}
                                <strong>{modalityToUpdate?.name}</strong> a{" "}
                                <strong>{modalityToUpdate?.active ? "Inactivo" : "Activo"}</strong>?
                            </>
                        }
                        confirmText="Confirmar"
                        isLoading={false} // Puedes agregar un estado de carga si lo necesitas
                        onConfirm={handleConfirmActiveChange}
                    />
                </div>
            )}
        </div>
    );
}

export default ModalityPage