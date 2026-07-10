import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addData, deleteData, updateData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import { Button, Spinner } from "react-bootstrap";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import ConfirmModal from "../../../shared/components/confirm/ConfirmModal";
import { Unit } from "../../../core/models/dto/Unit";
import AddEditUnitModal from "./AddEditUnitModal";
import useAppData from "../../../hooks/useAppData";
import TableToolbar from "../../../shared/components/table-toolbar/TableToolbar";
import PageHeader from "../../../shared/components/PageHeader";
import { useSearch } from "../../../hooks/useSearch";

const UnitPage = () => {

    //Estados
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { adminUnits, loading, error, refreshAdminUnits } = useAppData();

    // Hook para buscar por columnas
    const { filteredData, handleSearch } = useSearch<Unit>(
        adminUnits,
        ["name", "symbol"]
    );

    // Constantes
    const navigate = useNavigate();

    //Manejar eliminación
    const handleDelete = async () => {
        if (!unitToDelete) return;
        setIsDeleting(true);
        try {
            await deleteData("/admin/delete-unit?idUnit", unitToDelete.idUnit);
            toast.success("Unidad eliminada exitosamente");
            await refreshAdminUnits();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al eliminar la unidad");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setUnitToDelete(null);
        }
    };

    // Manejar añadir/editar
    const handleSave = async (unit: Unit) => {
        try {
            //Actualizar registro
            if (unit.idUnit) {
                await updateData("/admin/update-unit?idUnit", unit.idUnit, unit);
                toast.success("Unidad actualizada exitosamente");
            }
            // Añadir registro
            else {
                await addData("/admin/register-unit", unit);
                toast.success("Unidad creada exitosamente");
            }
            setSelectedUnit(unit);
            setShowModal(false);
            await refreshAdminUnits();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al guardar la unidad");
        }
    };

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<Unit>[] = [
        { key: "idUnit", label: "ID", sortable: true },
        { key: "name", label: "Nombre", sortable: false },
        { key: "symbol", label: "Simbolo", sortable: false },
        {
            key: "actions", label: "Acciones", actions: (row: Unit) => (
                <div className="d-flex gap-2 justify-content-center overflow-auto text-nowrap">
                    <Button variant="warning" onClick={() => { setSelectedUnit(row); setShowModal(true); }}>
                        Editar
                    </Button>
                    <Button variant="danger" onClick={() => { setUnitToDelete(row); setShowDeleteModal(true); }}>
                        Eliminar
                    </Button>
                </div>
            ),
        },
    ];

    // Render
    return (
        <div className="d-flex flex-column" style={{ minHeight: "calc(100vh - var(--navbar-height) - 3rem)" }}>
            <PageHeader title="Unidades" subtitle="Administrá las unidades de medida disponibles." icon="bi bi-rulers" />
            {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center loading-vh">
                    <span className="mb-2 fw-bold">CARGANDO...</span>
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : (
                <div className="my-auto">
                    <TableToolbar onSearch={handleSearch}>
                        <Button variant="secondary" onClick={() => navigate(-1)}>
                            Volver
                        </Button>
                        <Button onClick={() => { setSelectedUnit(null); setShowModal(true); }}>
                            Añadir Unidad
                        </Button>
                    </TableToolbar>

                    {/* Tabla */}
                    <ReusableTable<Unit>
                        data={filteredData}
                        columns={columns}
                        defaultSort="idUnit"
                    />

                    {/* Modal de añadir/edicion */}
                    <AddEditUnitModal
                        key={selectedUnit ? selectedUnit.idUnit : "new"}
                        show={showModal}
                        onHide={() => setShowModal(false)}
                        onSave={handleSave}
                        unit={selectedUnit}
                    />

                    {/* Modal de Confirmación */}
                    <ConfirmModal
                        show={showDeleteModal}
                        onHide={() => setShowDeleteModal(false)}
                        title="Confirmar Eliminación"
                        message={
                            <>
                                ¿Estás seguro que deseas eliminar la unidad:
                                <strong> {unitToDelete?.name}</strong>?
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

export default UnitPage;
