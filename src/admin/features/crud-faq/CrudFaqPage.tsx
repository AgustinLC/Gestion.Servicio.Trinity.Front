import { useEffect, useState } from "react";
import { FaqDto } from "../../../core/models/dto/FaqDto";
import { addData, deleteData, getData, updateData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import { Button, Spinner } from "react-bootstrap";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import AddEditFaqModal from "./AddEditFaqModal";
import ConfirmModal from "../../../shared/components/confirm/ConfirmModal";

const CrudFaqPage = () => {

    //Estados
    const [faqData, setFaqData] = useState<FaqDto[]>([])
    const [selectedFaq, setSelectedFaq] = useState<FaqDto | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [faqToDelete, setFaqToDelete] = useState<FaqDto | null>(null);
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
            const response = await getData<FaqDto[]>("/admin/faqs");
            setFaqData(response);
        } catch (error) {
            console.error("Error fetching FAQ data:", error);
            setError("Error al cargar las preguntas frecuentes.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!faqToDelete) return;
        setIsDeleting(true);
        try {
            await deleteData("/admin/faqs?idFaq", faqToDelete.idFaq);
            toast.success("Faq eliminado exitosamente");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al eliminar la faq");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setFaqToDelete(null);
        }
    };

    // Manejar añadir/editar
    const handleSave = async (faq: FaqDto) => {
        try {
            //Actualizar registro
            if (faq.idFaq) {
                await updateData("/admin/faqs?idFaq", faq.idFaq, faq);
                toast.success("Faq actualizado exitosamente");
            }
            // Añadir registro
            else {
                await addData("/admin/faqs", faq);
                toast.success("Faq creado exitosamente");
            }
            setSelectedFaq(faq);
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al guardar la faq");
        }
    };

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<FaqDto>[] = [
        { key: "idFaq", label: "ID", sortable: true },
        { key: "question", label: "Pregunta", sortable: false },
        { key: "answer", label: "Respuesta", sortable: false },
        {
            key: "actions", label: "Acciones", actions: (row: FaqDto) => (
                <div className="d-flex gap-2 justify-content-center overflow-auto text-nowrap">
                    <Button variant="warning" onClick={() => { setSelectedFaq(row); setShowModal(true); }}>
                        Editar
                    </Button>
                    <Button variant="danger" onClick={() => { setFaqToDelete(row); setShowDeleteModal(true); }}>
                        Eliminar
                    </Button>
                </div>
            ),
        },
    ];

    // Render
    return (
        <div>
            <h1 className="text-center">Gestion de FAQ</h1>
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
                        <Button onClick={() => { setSelectedFaq(null); setShowModal(true); }}>
                            Añadir Faq
                        </Button>
                    </div>

                    {/* Tabla */}
                    <ReusableTable<FaqDto>
                        data={faqData}
                        columns={columns}
                        defaultSort="idFaq"
                    />

                    {/* Modal de añadir/edicion */}
                    <AddEditFaqModal
                        key={selectedFaq ? selectedFaq.idFaq : "new"}
                        show={showModal}
                        onHide={() => setShowModal(false)}
                        onSave={handleSave}
                        faq={selectedFaq}
                    />

                    {/* Modal de Confirmación */}
                    <ConfirmModal
                        show={showDeleteModal}
                        onHide={() => setShowDeleteModal(false)}
                        title="Confirmar Eliminación"
                        message={
                            <>
                                ¿Estás seguro que deseas eliminar la pregunta:
                                <strong> {faqToDelete?.question}</strong>?
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

export default CrudFaqPage;