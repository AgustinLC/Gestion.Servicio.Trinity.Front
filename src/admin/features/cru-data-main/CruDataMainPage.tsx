import React, { useEffect, useState } from "react";
import { getData, updateData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { Spinner, Button, Modal, Form, Row, Col } from "react-bootstrap";
import { Supplier } from "../../../core/models/dto/SupplierDto";
import PageHeader from "../../../shared/components/PageHeader";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";
import FloatingFieldset from "../../../shared/components/floating-fieldset/FloatingFieldset";
import HintBox from "../../../shared/components/hint-box/HintBox";
import { useModalLayer } from "../../../context/ModalStackContext";

interface FieldConfig {
    key: keyof Supplier;
    label: string;
    type?: "text" | "textarea";
}

interface SectionConfig {
    icon: string;
    title: string;
    fields: FieldConfig[];
}

// Secciones en las que se agrupan los campos del proveedor para mostrarlos
// y editarlos (antes era un campo == una card == un guardado independiente;
// ahora se edita cada sección completa de una vez, todas contra el mismo
// endpoint /admin/update-supplier).
const SECTIONS: Record<string, SectionConfig> = {
    general: {
        icon: "bi bi-building",
        title: "Información General",
        fields: [
            { key: "name", label: "Nombre" },
            { key: "description", label: "Descripción", type: "textarea" },
            { key: "slogan", label: "Eslogan" },
        ],
    },
    location: {
        icon: "bi bi-geo-alt",
        title: "Ubicación",
        fields: [
            { key: "province", label: "Provincia" },
            { key: "location", label: "Localidad" },
            { key: "district", label: "Distrito" },
            { key: "street", label: "Calle" },
        ],
    },
    social: {
        icon: "bi bi-share",
        title: "Redes Sociales",
        fields: [
            { key: "facebookUrl", label: "Facebook" },
            { key: "whatsappUrl", label: "Whatsapp" },
            { key: "instagramUrl", label: "Instagram" },
            { key: "mapsUrl", label: "Google Maps" },
        ],
    },
    fiscal: {
        icon: "bi bi-file-earmark-text",
        title: "Información Fiscal",
        fields: [
            { key: "cuit", label: "CUIT" },
        ],
    },
};

// Ícono + color por red social, para la lista de "Redes Sociales".
const SOCIAL_ICON: Partial<Record<keyof Supplier, { icon: string; color: string }>> = {
    facebookUrl: { icon: "bi bi-facebook", color: "#1877f2" },
    whatsappUrl: { icon: "bi bi-whatsapp", color: "#25d366" },
    instagramUrl: { icon: "bi bi-instagram", color: "#e1306c" },
    mapsUrl: { icon: "bi bi-geo-alt-fill", color: "#ea4335" },
};

const CruDataMainPage = () => {
    const [mainData, setMainData] = useState<Supplier | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const modalZIndex = useModalLayer(!!editingSection);

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

    const handleOpenSection = (sectionKey: string) => {
        if (!mainData) return;
        const section = SECTIONS[sectionKey];
        const initialValues: Record<string, string> = {};
        section.fields.forEach((field) => {
            initialValues[field.key] = String(mainData[field.key] ?? "");
        });
        setFormValues(initialValues);
        setEditingSection(sectionKey);
    };

    const handleSaveSection = async () => {
        if (!editingSection || !mainData) return;
        setIsSaving(true);
        try {
            const updatedSupplier = { ...mainData, ...formValues };
            await updateData("/admin/update-supplier?idSupplier", mainData.idSupplier, updatedSupplier);
            toast.success("Datos actualizados exitosamente");
            setEditingSection(null);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al guardar los cambios");
        } finally {
            setIsSaving(false);
        }
    };

    const renderValueRow = (label: string, value: React.ReactNode, key: string) => (
        <div key={key} className="d-flex gap-3 py-2 border-bottom align-items-start">
            <div className="text-muted small" style={{ minWidth: 100, flexShrink: 0 }}>{label}</div>
            <div className="flex-grow-1">{value}</div>
        </div>
    );

    const renderSectionCard = (sectionKey: string) => {
        const section = SECTIONS[sectionKey];
        if (!mainData) return null;

        return (
            <div className="card h-100" key={sectionKey}>
                <div className="card-body p-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="icon-badge">
                                <i className={section.icon}></i>
                            </div>
                            <h6 className="form-section-title mb-0">{section.title}</h6>
                        </div>
                        <Button variant="outline-primary" size="sm" onClick={() => handleOpenSection(sectionKey)}>
                            <i className="bi bi-pencil me-1"></i> Editar
                        </Button>
                    </div>

                    {sectionKey === "social"
                        ? section.fields.map((field) => {
                            const value = mainData[field.key] as string;
                            const iconInfo = SOCIAL_ICON[field.key];
                            return (
                                <div key={field.key} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                                    <div className="d-flex align-items-center gap-2">
                                        {iconInfo && <i className={iconInfo.icon} style={{ color: iconInfo.color }}></i>}
                                        {field.label}
                                    </div>
                                    {value ? (
                                        <a href={value} target="_blank" rel="noopener noreferrer" className="text-truncate ms-3" style={{ maxWidth: 260 }}>
                                            {value}
                                        </a>
                                    ) : (
                                        <span className="text-muted">—</span>
                                    )}
                                </div>
                            );
                        })
                        : section.fields.map((field) => {
                            const value = mainData[field.key];
                            return renderValueRow(field.label, value || value === 0 ? String(value) : <span className="text-muted">—</span>, field.key);
                        })}

                    {sectionKey === "fiscal" && (
                        <>
                            {renderValueRow("Condición IVA", <span className="text-muted">—</span>, "condicionIva")}
                            {renderValueRow("Razón Social", <span className="text-muted">—</span>, "razonSocial")}
                        </>
                    )}
                </div>
            </div>
        );
    };

    const activeSection = editingSection ? SECTIONS[editingSection] : null;

    return (
        <div>
            <PageHeader title="Información de la página principal" subtitle="Editá los datos que se muestran en el sitio público." icon="bi bi-display" />

            {loading ? (
                <div>
                    <div className="skeleton skeleton-line mb-3" style={{ width: "100%", height: 54, borderRadius: 10 }}></div>
                    <Row className="g-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Col md={6} key={index}>
                                <div className="card h-100">
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "50%" }}></div>
                                                <div className="skeleton skeleton-line" style={{ width: 150, height: 16 }}></div>
                                            </div>
                                            <div className="skeleton skeleton-line" style={{ width: 90, height: 32, borderRadius: 8 }}></div>
                                        </div>
                                        {Array.from({ length: 5 }).map((_, rowIndex) => (
                                            <div key={rowIndex} className="d-flex gap-3 py-2 border-bottom align-items-center">
                                                <div className="skeleton skeleton-line" style={{ width: 100, height: 12, flexShrink: 0 }}></div>
                                                <div className="skeleton skeleton-line flex-grow-1" style={{ height: 12 }}></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                    <div className="skeleton skeleton-line mt-3" style={{ width: "100%", height: 74, borderRadius: 10 }}></div>
                </div>
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : mainData ? (
                <div className="content-fade-in">
                    <HintBox className="mb-3">
                        <strong>Información pública: </strong>
                        Estos datos se muestran en el sitio público del consorcio. Asegurate de que la información esté siempre actualizada.
                    </HintBox>

                    <Row className="g-3">
                        <Col md={6}>{renderSectionCard("general")}</Col>
                        <Col md={6}>{renderSectionCard("location")}</Col>
                        <Col md={6}>{renderSectionCard("social")}</Col>
                        <Col md={6}>{renderSectionCard("fiscal")}</Col>
                    </Row>

                    <div className="card mt-3">
                        <div className="footer-note-banner p-3 d-flex align-items-center gap-3">
                            <div className="icon-badge">
                                <i className="bi bi-shield-check"></i>
                            </div>
                            <div>
                                <div className="footer-note-title">Importante</div>
                                <div className="footer-note-subtitle text-muted">Los cambios se reflejan en el sitio público de manera inmediata una vez guardados.</div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Modal de edición por sección */}
            <Modal
                show={!!editingSection}
                onHide={() => setEditingSection(null)}
                centered
                backdrop={false}
                style={{ zIndex: modalZIndex }}
                contentClassName="form-modal-content"
                aria-labelledby="edit-section-modal-title"
            >
                {activeSection && (
                    <>
                        <FormModalHeader
                            icon={activeSection.icon}
                            title={`Editar ${activeSection.title}`}
                            onClose={() => setEditingSection(null)}
                            titleId="edit-section-modal-title"
                        />
                        <Modal.Body>
                            <Form>
                                {activeSection.fields.map((field) => (
                                    <Form.Group className="mb-3" key={field.key}>
                                        <FloatingFieldset label={field.label}>
                                            {field.type === "textarea" ? (
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    value={formValues[field.key] ?? ""}
                                                    onChange={(e) => setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                                />
                                            ) : (
                                                <Form.Control
                                                    value={formValues[field.key] ?? ""}
                                                    onChange={(e) => setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                                />
                                            )}
                                        </FloatingFieldset>
                                    </Form.Group>
                                ))}
                            </Form>

                            <div className="form-modal-footer d-flex justify-content-end gap-2 mt-3">
                                <Button variant="outline-secondary" onClick={() => setEditingSection(null)} disabled={isSaving}>
                                    <i className="bi bi-x-circle me-1"></i> Cancelar
                                </Button>
                                <Button variant="primary" onClick={handleSaveSection} disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-save me-1"></i> Guardar cambios
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Modal.Body>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default CruDataMainPage;
