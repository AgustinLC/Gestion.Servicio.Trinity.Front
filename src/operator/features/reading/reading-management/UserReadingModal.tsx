import React, { useEffect, useState } from "react";
import { Button, Modal, Spinner, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { getData, updateData } from "../../../../core/services/apiService";
import { ReadReadingDto } from "../../../../core/models/dto/ReadReadingDto";
import FormModalHeader from "../../../../shared/components/form-modal-header/FormModalHeader";
import ConfirmModal from "../../../../shared/components/confirm/ConfirmModal";
import ReusableTable from "../../../../shared/components/table/ReusableTable";
import TableSkeleton from "../../../../shared/components/table-skeleton/TableSkeleton";
import { TableColumnDefinition } from "../../../../core/models/types/TableTypes";
import { formatDate } from "../../../../core/utils/formatters";
import { useModalLayer } from "../../../../context/ModalStackContext";

interface UserReadingsModalProps {
    show: boolean;
    onHide: () => void;
    userName: string;
    userId: number;
}

const UserReadingsModal: React.FC<UserReadingsModalProps> = ({ show, onHide, userName, userId }) => {

    // Estados
    const [readings, setReadings] = useState<ReadReadingDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [tempReading, setTempReading] = useState<number>(0);
    const [saving, setSaving] = useState(false);
    const [showConfirmSave, setShowConfirmSave] = useState(false);
    const [pendingSaveId, setPendingSaveId] = useState<number | null>(null);
    const modalZIndex = useModalLayer(show);

    // Obtener datos de la API
    useEffect(() => {
        const fetchReadings = async () => {
            setLoading(true);
            try {
                const readings = await getData<ReadReadingDto[]>(`/user/readings/${userId}`);
                setReadings(readings);
            } catch (error) {
                console.error(error);
                toast.error("Error al obtener lecturas");
                setError("Error al cargar lecturas");
            } finally {
                setLoading(false);
            }
        };

        if (show) fetchReadings();
    }, [userId, show]);

    // Manejar boton de editar
    const handleEdit = (reading: ReadReadingDto) => {
        setEditingId(reading.idReading);
        setTempReading(reading.reading);
    };

    // Manejar boton de cancelar edición
    const handleCancelEdit = () => {
        setEditingId(null);
    };

    // Manejar boton de guardar: pide confirmación antes de pisar la lectura,
    // ya que puede afectar el cálculo de consumo de facturas relacionadas.
    const handleSaveClick = (idReading: number) => {
        setPendingSaveId(idReading);
        setShowConfirmSave(true);
    };

    const handleConfirmSave = async () => {
        if (pendingSaveId === null) return;
        setSaving(true);
        try {
            await updateData(`/operator/update-reading?idReading=${pendingSaveId}&reading`, tempReading, {});
            toast.success("Lectura actualizada");
            setReadings(readings.map(r => (r.idReading === pendingSaveId ? { ...r, reading: tempReading } : r)));
            setEditingId(null);
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar lectura");
        } finally {
            setSaving(false);
            setShowConfirmSave(false);
            setPendingSaveId(null);
        }
    };

    const columns: TableColumnDefinition<ReadReadingDto>[] = [
        {
            key: "date",
            label: "Fecha",
            sortable: true,
            render: (reading) => (
                <div className="d-flex align-items-center gap-2 text-start">
                    <div className="icon-badge table-inline-edit-date-icon" style={{ width: 32, height: 32, fontSize: "0.85rem" }}>
                        <i className="bi bi-calendar3"></i>
                    </div>
                    {formatDate(reading.date)}
                </div>
            ),
        },
        {
            key: "periodName",
            label: "Período",
            render: (reading) => reading.periodName || "—",
        },
        {
            key: "reading",
            label: "Valor de Lectura",
            sortable: true,
            render: (reading) =>
                editingId === reading.idReading ? (
                    <Form.Control
                        type="number"
                        className="text-center table-inline-edit-field"
                        value={tempReading}
                        onChange={(e) => setTempReading(Number(e.target.value))}
                    />
                ) : (
                    reading.reading
                ),
        },
        {
            key: "actions",
            label: "Acciones",
            actions: (reading) =>
                editingId === reading.idReading ? (
                    <div className="d-flex justify-content-center gap-2 table-row-actions">
                        <Button variant="outline-secondary" size="sm" className="d-inline-flex align-items-center justify-content-center text-nowrap" onClick={handleCancelEdit} disabled={saving}>
                            <i className="bi bi-x-circle me-1"></i> <span className="d-none d-sm-inline">Cancelar</span>
                        </Button>
                        <Button variant="success" size="sm" className="d-inline-flex align-items-center justify-content-center text-nowrap" onClick={() => handleSaveClick(reading.idReading)} disabled={saving}>
                            {saving ? <Spinner as="span" animation="border" size="sm" /> : <><i className="bi bi-check-circle me-1"></i> <span className="d-none d-sm-inline">Guardar</span></>}
                        </Button>
                    </div>
                ) : (
                    <Button variant="outline-warning" size="sm" onClick={() => handleEdit(reading)}>
                        <i className="bi bi-pencil me-1"></i> Editar
                    </Button>
                ),
        },
    ];

    // Render
    return (
        <Modal show={show} onHide={onHide} centered size="lg" backdrop={false} style={{ zIndex: modalZIndex }} contentClassName="form-modal-content" aria-labelledby="user-reading-modal-title">
            <FormModalHeader
                icon="bi bi-speedometer2"
                title={`Lecturas de ${userName}`}
                subtitle="Consultá las lecturas registradas para este usuario."
                onClose={onHide}
                titleId="user-reading-modal-title"
            />

            <Modal.Body>
                {loading ? (
                    <TableSkeleton showToolbar={false} rows={6} />
                ) : error ? (
                    <div className="text-danger text-center">{error}</div>
                ) : readings.length === 0 ? (
                    <p className="text-center">No hay lecturas disponibles</p>
                ) : (
                    <div className="content-fade-in">
                        <ReusableTable<ReadReadingDto>
                            data={readings}
                            columns={columns}
                            defaultSort="date"
                            defaultSortDirection="desc"
                            defaultPageSize={5}
                            showPageSizeSelector={false}
                        />
                    </div>
                )}
            </Modal.Body>

            <ConfirmModal
                show={showConfirmSave}
                onHide={() => setShowConfirmSave(false)}
                variant="warning"
                title="¿Guardar lectura?"
                message="Vas a modificar una lectura ya registrada."
                hint="Esto puede afectar el cálculo de consumo de facturas relacionadas a este período."
                confirmText="Guardar"
                confirmIcon="bi bi-check-circle"
                isLoading={saving}
                loadingText="Guardando..."
                onConfirm={handleConfirmSave}
            />
        </Modal>
    );
};

export default UserReadingsModal;
