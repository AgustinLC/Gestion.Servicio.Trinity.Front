import { useEffect, useState } from "react";
import { getData, updateData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { Spinner, Card, Button } from "react-bootstrap";
import { Supplier } from "../../../core/models/dto/SupplierDto";

const CruDataMainPage = () => {
    const [mainData, setMainData] = useState<Supplier | any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingField, setEditingField] = useState<keyof Supplier | null>(null);
    const [editedValue, setEditedValue] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getData<Supplier[]>("/admin/supplier");
            if (response.length > 0) {
                setMainData(response[0]);
            } else {
                setError("No hay datos disponibles.");
            }
        } catch (error) {
            console.error("Error fetching feature data:", error);
            setError("Error al cargar la información.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editingField || !mainData) return;
        setIsSaving(true);
        try {
            const updatedSupplier = { ...mainData, [editingField]: editedValue };
            await updateData("/admin/update-supplier?idSupplier", mainData.idSupplier, updatedSupplier);
            toast.success("Datos actualizados exitosamente");
            setEditingField(null);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al guardar los cambios");
        } finally {
            setIsSaving(false);
        }
    };

    // Traducciones de campos
    const fieldTranslations: Record<string, string> = {
        name: "Nombre",
        description: "Descripción",
        slogan: "Eslogan",
        province: "Provincia",
        location: "Localidad",
        district: "Distrito",
        street: "Calle",
        facebookUrl: "Facebook URL",
        whatsappUrl: "Whatsapp URL",
        instagramUrl: "Instagram URL",
        cuit: "CUIT",
    };

    return (
        <div>
            <h1 className="text-center mb-4">Información de la página principal</h1>
            <div className="d-flex flex-column justify-content-center align-items-center">
                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                        <span className="mb-2 fw-bold">CARGANDO...</span>
                        <Spinner animation="border" role="status" />
                    </div>
                ) : error ? (
                    <div className="text-center py-5">{error}</div>
                ) : mainData ? (
                    <div className="w-75">
                        {["name", "description", "slogan","province", "location", "district", "street", "facebookUrl", "whatsappUrl", "instagramUrl", "cuit"].map((field) => (
                            <Card className="mb-3" key={field}>
                                <Card.Body>
                                    <Card.Title className="fw-bold">{fieldTranslations[field]}</Card.Title>
                                    <div className="d-flex flex-column flex-md-row align-items-md-center gap-2">
                                        {editingField === field ? (
                                            <input type="text" className="form-control w-100" value={editedValue} onChange={(e) => setEditedValue(e.target.value)} />
                                        ) : (
                                            <p className="mb-0 w-100 text-break">{mainData[field]}</p>
                                        )}
                                        <div className="d-flex gap-2 flex-wrap">
                                            {editingField === field ? (
                                                <div className="d-flex gap-2">
                                                    <Button variant="success" onClick={handleSave} disabled={isSaving}>
                                                        {isSaving ? "Guardando..." : "Guardar"}
                                                    </Button>
                                                    <Button variant="secondary" onClick={() => setEditingField(null)} disabled={isSaving}>
                                                        Cancelar
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button variant="primary" onClick={() => { setEditingField(field as keyof Supplier); setEditedValue(String(mainData[field])); }} disabled={isSaving}>
                                                    Editar
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default CruDataMainPage;
