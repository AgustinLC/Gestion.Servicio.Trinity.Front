import React, { useEffect, useState } from "react";
import { Form, Button, Card, Row, Col, Spinner, InputGroup } from "react-bootstrap";
import { toast } from "react-toastify";
import axiosInstance from "../../../config/axiosConfig";
import { PdfParameters, DEFAULT_PARAMS } from "../../../shared/components/debt-disconnection/pdf/DebtPdfDocument";
import PageHeader from "../../../shared/components/PageHeader";
import "./PdfParametersPage.css";

const PdfParametersPage: React.FC = () => {
  const [params, setParams] = useState<PdfParameters>(DEFAULT_PARAMS);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Cargar parámetros desde el backend al montar
  useEffect(() => {
    const fetchParams = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/admin/pdf-parameters");
        if (response.data && response.data.success) {
          setParams(response.data.data);
        } else {
          toast.error("Error al cargar los parámetros del servidor");
        }
      } catch (error) {
        console.error("Error fetching PDF parameters:", error);
        toast.error("Error de conexión al cargar los parámetros");
      } finally {
        setLoading(false);
      }
    };

    fetchParams();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]: name === "administrativeExpenses" || name === "reconnectionCost"
        ? parseFloat(value) || 0
        : name === "daysToPay" || name === "daysToDisconnection"
          ? parseInt(value, 10) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (params.administrativeExpenses < 0 || params.reconnectionCost < 0) {
      toast.warning("Los valores monetarios no pueden ser negativos");
      return;
    }
    if (params.daysToPay <= 0 || params.daysToDisconnection <= 0) {
      toast.warning("La cantidad de días debe ser mayor a cero");
      return;
    }
    if (!params.claimsPhone.trim()) {
      toast.warning("El teléfono de reclamos es requerido");
      return;
    }
    if (!params.cbu.trim() || params.cbu.length !== 22) {
      toast.warning("El CBU debe contener exactamente 22 dígitos numéricos");
      return;
    }
    if (!params.alias.trim()) {
      toast.warning("El Alias bancario es requerido");
      return;
    }

    setSaving(true);
    try {
      const response = await axiosInstance.put("/admin/pdf-parameters", params);
      if (response.data && response.data.success) {
        toast.success("Parámetros del PDF actualizados correctamente");
      } else {
        toast.error(response.data.message || "Error al actualizar los parámetros");
      }
    } catch (error) {
      console.error("Error updating PDF parameters:", error);
      toast.error("Error de conexión al guardar los parámetros");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column" style={{ minHeight: "calc(100vh - var(--navbar-height) - 3rem)" }}>
        <PageHeader title="Parámetros de Avisos PDF" subtitle="Configurá los valores, plazos y datos de contacto mostrados en los PDFs de deuda y corte." icon="bi bi-file-pdf" />
        <div className="pdf-params-container my-auto">
          <Card className="shadow-lg border-0 rounded-4 overflow-hidden mb-4">
            <Card.Body className="p-4 bg-white">
              {/* Sección 1 */}
              <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                <div className="skeleton" style={{ width: 20, height: 20, borderRadius: 4 }}></div>
                <div className="skeleton skeleton-line" style={{ width: 180, height: 16 }}></div>
              </div>
              <Row className="mb-4">
                {[1, 2].map((field) => (
                  <Col md={6} key={field}>
                    <div className="skeleton skeleton-line mb-2" style={{ width: 220, height: 12 }}></div>
                    <div className="skeleton skeleton-line" style={{ width: "100%", height: 40, borderRadius: 10 }}></div>
                  </Col>
                ))}
              </Row>
              <hr className="my-4 text-muted opacity-25" />

              {/* Sección 2 */}
              <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                <div className="skeleton" style={{ width: 20, height: 20, borderRadius: 4 }}></div>
                <div className="skeleton skeleton-line" style={{ width: 160, height: 16 }}></div>
              </div>
              <Row className="mb-4">
                {[1, 2, 3].map((field) => (
                  <Col md={4} key={field}>
                    <div className="skeleton skeleton-line mb-2" style={{ width: 180, height: 12 }}></div>
                    <div className="skeleton skeleton-line" style={{ width: "100%", height: 40, borderRadius: 10 }}></div>
                  </Col>
                ))}
              </Row>
              <hr className="my-4 text-muted opacity-25" />

              {/* Sección 3 */}
              <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                <div className="skeleton" style={{ width: 20, height: 20, borderRadius: 4 }}></div>
                <div className="skeleton skeleton-line" style={{ width: 220, height: 16 }}></div>
              </div>
              <Row className="mb-4">
                {[1, 2, 3, 4].map((field) => (
                  <Col md={6} className="mb-3" key={field}>
                    <div className="skeleton skeleton-line mb-2" style={{ width: 200, height: 12 }}></div>
                    <div className="skeleton skeleton-line" style={{ width: "100%", height: 40, borderRadius: 10 }}></div>
                  </Col>
                ))}
              </Row>

              <div className="d-flex justify-content-end">
                <div className="skeleton skeleton-line" style={{ width: 190, height: 42, borderRadius: 10 }}></div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column" style={{ minHeight: "calc(100vh - var(--navbar-height) - 3rem)" }}>
      <PageHeader title="Parámetros de Avisos PDF" subtitle="Configurá los valores, plazos y datos de contacto mostrados en los PDFs de deuda y corte." icon="bi bi-file-pdf" />
      <div className="pdf-params-container my-auto">
        <Card className="shadow-lg border-0 rounded-4 overflow-hidden mb-4 glass-card content-fade-in-slide">
          <Card.Body className="p-4 bg-white">
            <Form onSubmit={handleSubmit}>

            {/* Sección 1: Valores Económicos */}
            <h5 className="filter-section-title">
              <i className="bi bi-cash-coin text-primary"></i> Valores Económicos
            </h5>
            <Row className="mb-4">
              <Col md={6} className="mb-3 mb-md-0">
                <Form.Group controlId="administrativeExpenses">
                  <Form.Label className="fw-semibold text-secondary small">Intereses y Gastos Administrativos (Aviso Deuda)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>$</InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="administrativeExpenses"
                      value={params.administrativeExpenses}
                      onChange={handleChange}
                      placeholder="1000"
                      min="0"
                      step="any"
                      required
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Valor por defecto cobrado por gestión de mora.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="reconnectionCost">
                  <Form.Label className="fw-semibold text-secondary small">Costo de Restablecimiento de Servicio</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>$</InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="reconnectionCost"
                      value={params.reconnectionCost}
                      onChange={handleChange}
                      placeholder="3000"
                      min="0"
                      step="any"
                      required
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Tasa cobrada para reconectar la cuenta suspendida.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <hr className="my-4 text-muted opacity-25" />

            {/* Sección 2: Tiempos y Plazos */}
            <h5 className="filter-section-title">
              <i className="bi bi-clock-history text-primary"></i> Tiempos y Plazos
            </h5>
            <Row className="mb-4">
              <Col md={4} className="mb-3 mb-md-0">
                <Form.Group controlId="daysToPay">
                  <Form.Label className="fw-semibold text-secondary small">Días para pagar (Post-Aviso)</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      name="daysToPay"
                      value={params.daysToPay}
                      onChange={handleChange}
                      placeholder="5"
                      min="1"
                      required
                    />
                    <InputGroup.Text>días</InputGroup.Text>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Días corridos dados al usuario para regularizar antes del corte.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3 mb-md-0">
                <Form.Group controlId="daysToDisconnection">
                  <Form.Label className="fw-semibold text-secondary small">Días para suspensión (Mora legal)</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      name="daysToDisconnection"
                      value={params.daysToDisconnection}
                      onChange={handleChange}
                      placeholder="10"
                      min="1"
                      required
                    />
                    <InputGroup.Text>días</InputGroup.Text>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Días transcurridos desde vencimiento de factura para habilitar corte (Ley 6044).
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="reconnectionTime">
                  <Form.Label className="fw-semibold text-secondary small">Plazo de Restablecimiento</Form.Label>
                  <Form.Control
                    type="text"
                    name="reconnectionTime"
                    value={params.reconnectionTime}
                    onChange={handleChange}
                    placeholder="48hs"
                    required
                  />
                  <Form.Text className="text-muted">
                    Lapso de tiempo máximo para reconexión una vez abonado el saldo.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <hr className="my-4 text-muted opacity-25" />

            {/* Sección 3: Contacto y Pago */}
            <h5 className="filter-section-title">
              <i className="bi bi-credit-card-2-front text-primary"></i> Contacto y Datos Bancarios
            </h5>
            <Row className="mb-4">
              <Col md={6} className="mb-3">
                <Form.Group controlId="claimsPhone">
                  <Form.Label className="fw-semibold text-secondary small">Teléfono de Reclamos y WhatsApp</Form.Label>
                  <Form.Control
                    type="text"
                    name="claimsPhone"
                    value={params.claimsPhone}
                    onChange={handleChange}
                    placeholder="2635036918"
                    required
                  />
                  <Form.Text className="text-muted">
                    Número de atención general. Aparecerá en ambos documentos PDF.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group controlId="attentionHours">
                  <Form.Label className="fw-semibold text-secondary small">Días y Horarios de Atención</Form.Label>
                  <Form.Control
                    type="text"
                    name="attentionHours"
                    value={params.attentionHours}
                    onChange={handleChange}
                    placeholder="de lunes a viernes de 8hs a 11:30hs"
                    required
                  />
                  <Form.Text className="text-muted">
                    Rango y horarios disponibles para atención al cliente.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3 mb-md-0">
                <Form.Group controlId="cbu">
                  <Form.Label className="fw-semibold text-secondary small">CBU del Consorcio</Form.Label>
                  <Form.Control
                    type="text"
                    name="cbu"
                    value={params.cbu}
                    onChange={handleChange}
                    placeholder="0110438120043811503456"
                    maxLength={22}
                    required
                  />
                  <Form.Text className="text-muted">
                    CBU bancario de 22 dígitos para la transferencia de deudas.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="alias">
                  <Form.Label className="fw-semibold text-secondary small">Alias Bancario</Form.Label>
                  <Form.Control
                    type="text"
                    name="alias"
                    value={params.alias}
                    onChange={handleChange}
                    placeholder="BOMBO.PRIMO.NUDO"
                    required
                  />
                  <Form.Text className="text-muted">
                    Alias bancario único para pagos digitales directos.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-3 mt-4">
              <Button
                variant="primary"
                type="submit"
                disabled={saving}
                className="px-4 py-2 fw-semibold rounded-3 btn-submit shadow-sm"
              >
                {saving ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i>Guardar Parámetros
                  </>
                )}
              </Button>
            </div>

            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default PdfParametersPage;
