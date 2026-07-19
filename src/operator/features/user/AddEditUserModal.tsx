import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Row, Col, Spinner } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { UserDto } from "../../../core/models/dto/UserDto";
import { LocationDto } from "../../../core/models/dto/LocationDto";
import { FeeDto } from "../../../core/models/dto/FeeDto";
import { Status } from "../../../core/models/dto/Status";
import statusLabels from "../../../shared/components/labels-traductor/statusLabels";
import { STATUS_BADGE_CLASS, STATUS_DOT_COLORS, STATUS_OPTIONS } from "../../../shared/components/labels-traductor/statusStyles";
import DotDropdown from "../../../shared/components/dot-dropdown/DotDropdown";
import { getAvatarColor } from "../../../core/utils/avatarColors";
import "./AddEditUserModal.css";
import { formatDate } from "../../../core/utils/formatters";

// Sobrescribimos los 3 campos para que en el formulario sean strings
type FormValues = Omit<UserDto, "digitalInvoiceAdhered" | "ivaInvoiceAdhered" | "pdfInvoiceAdhered"> & {
  digitalInvoiceAdhered?: string;
  ivaInvoiceAdhered?: string;
  pdfInvoiceAdhered?: string;
};

interface AddEditModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (user: UserDto) => Promise<void>;
  user?: UserDto | any;
  locations: LocationDto[];
  fees: FeeDto[];
}

const AddEditModal: React.FC<AddEditModalProps> = ({ show, onHide, onSave, user, locations, fees }) => {
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
    setValue,
  } = useForm<FormValues>();
  const summaryFeeName = fees.find((fee) => String(fee.idFee) === String(user?.residenceDto?.idFee))?.name;
  const summaryInitials = `${(user?.firstName?.[0] || "").toUpperCase()}${(user?.lastName?.[0] || "").toUpperCase()}`;
  const summaryAvatarColor = getAvatarColor(`${user?.firstName ?? ""}${user?.lastName ?? ""}${user?.idUser ?? ""}`);

  useEffect(() => {
    if (user) {
      reset({
        ...user,
        // forzamos strings para que los selects muestren la opción correcta
        digitalInvoiceAdhered:
          user.digitalInvoiceAdhered === true ? "true" : user.digitalInvoiceAdhered === false ? "false" : "",
        ivaInvoiceAdhered:
          user.ivaInvoiceAdhered === true ? "true" : user.ivaInvoiceAdhered === false ? "false" : "",
        pdfInvoiceAdhered:
          user.pdfInvoiceAdhered === true ? "true" : user.pdfInvoiceAdhered === false ? "false" : "",
        residenceDto: {
          ...(user.residenceDto || {}),
        },
      });

      // opcional: asegurar estado interno
      setValue(
        "digitalInvoiceAdhered",
        user.digitalInvoiceAdhered === true ? "true" : user.digitalInvoiceAdhered === false ? "false" : ""
      );
      setValue(
        "ivaInvoiceAdhered",
        user.ivaInvoiceAdhered === true ? "true" : user.ivaInvoiceAdhered === false ? "false" : ""
      );
      setValue(
        "pdfInvoiceAdhered",
        user.pdfInvoiceAdhered === true ? "true" : user.pdfInvoiceAdhered === false ? "false" : ""
      );
    } else {
      reset({});
    }
  }, [user, reset, setValue]);

  useEffect(() => {
    if (!user) {
      setValue("password", user?.dni?.toString());
    }
  }, [user, setValue]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Convertimos strings a booleanos antes de enviar al backend
      const payload: any = { ...data } as any;
      if (payload.digitalInvoiceAdhered !== undefined) {
        payload.digitalInvoiceAdhered = payload.digitalInvoiceAdhered === "true";
      }
      if (payload.ivaInvoiceAdhered !== undefined) {
        payload.ivaInvoiceAdhered = payload.ivaInvoiceAdhered === "true";
      }
      if (payload.pdfInvoiceAdhered !== undefined) {
        payload.pdfInvoiceAdhered = payload.pdfInvoiceAdhered === "true";
      }

      if (!user) {
        payload.password = payload.dni?.toString();
      }

      await onSave(payload as UserDto);
      reset();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable contentClassName="user-modal-content" backdropClassName="user-modal-backdrop" aria-labelledby="user-modal-title">
      <div className="user-modal-header d-flex align-items-start justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <div className="user-modal-icon">
            {user ? <i className="bi bi-person-gear"></i> : <i className="bi bi-person-add"></i>}
          </div>
          <div>
            <h4 id="user-modal-title" className="user-modal-title mb-1">{user ? "Editar Usuario" : "Añadir Usuario"}</h4>
            <div className="text-muted small">
              {user
                ? "Modificá la información del usuario y la configuración del servicio."
                : "Completá los datos para registrar un nuevo usuario."}
            </div>
          </div>
        </div>
        <button type="button" className="user-modal-close" onClick={onHide} aria-label="Cerrar">
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      <Modal.Body>
        {user && (
          <div className="user-summary-card mb-3">
            <div className="d-flex align-items-center flex-wrap gap-3">
              <div
                className="row-avatar user-summary-avatar"
                style={{ backgroundColor: summaryAvatarColor.bg, color: summaryAvatarColor.color }}
              >
                {summaryInitials || "US"}
              </div>
              <div className="flex-grow-1">
                <div className="fw-bold">{user.firstName} {user.lastName}</div>
                <div className="text-muted small">Conexión N° {user.idUser}</div>
              </div>

              <div className="user-summary-stat">
                <div className="user-summary-stat-label text-muted small">Fecha de registro</div>
                <span className="badge-soft badge-soft-neutral">{formatDate(user.dateRegister)}</span>
              </div>

              {user.status && (
                <div className="user-summary-stat">
                  <div className="user-summary-stat-label text-muted small">Estado actual</div>
                  <span className={`badge-soft ${STATUS_BADGE_CLASS[user.status as Status]}`}>
                    <span className="status-dot" style={{ backgroundColor: STATUS_DOT_COLORS[user.status as Status] }}></span>
                    {statusLabels[user.status as Status]}
                  </span>
                </div>
              )}

              <div className="user-summary-stat">
                <div className="user-summary-stat-label text-muted small">Tarifa</div>
                <span className="badge-soft badge-soft-info">{summaryFeeName || "-"}</span>
              </div>

              <div className="user-summary-stat">
                <div className="user-summary-stat-label text-muted small">Medidor</div>
                <span className="badge-soft badge-soft-success">{user.residenceDto?.serialNumber ? `Medidor ${user.residenceDto.serialNumber}` : "-"}</span>
              </div>
            </div>
          </div>
        )}

        <Form onSubmit={handleSubmit(onSubmit)}>
          {/* --- Información personal | Domicilio (lado a lado para evitar scroll vertical) --- */}
          <Row>
            <Col md={6}>
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="user-modal-section-icon">
                  <i className="bi bi-person"></i>
                </div>
                <h6 className="user-modal-section-title mb-0">Información personal</h6>
              </div>

              <Row>
                <Col sm={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                    <Form.Control {...register("firstName", { required: "Este campo es obligatorio" })} isInvalid={!!errors.firstName} />
                    <Form.Control.Feedback type="invalid">{errors.firstName?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Apellido <span className="text-danger">*</span></Form.Label>
                    <Form.Control {...register("lastName", { required: "Este campo es obligatorio" })} isInvalid={!!errors.lastName} />
                    <Form.Control.Feedback type="invalid">{errors.lastName?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col sm={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>DNI <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="number"
                      {...register("dni", { required: "Este campo es obligatorio", maxLength: { value: 8, message: "El DNI debe tener 8 números" } })}
                      isInvalid={!!errors.dni}
                    />
                    <Form.Control.Feedback type="invalid">{errors.dni?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Teléfono <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      {...register("phone", { required: "Este campo es obligatorio", maxLength: { value: 10, message: "El teléfono no puede tener más de 10 números" } })}
                      isInvalid={!!errors.phone}
                    />
                    <Form.Control.Feedback type="invalid">{errors.phone?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col sm={12}>
                  <Form.Group className="mb-2">
                    <Form.Label>Email</Form.Label>
                    <Form.Control {...register("username", { required: "Este campo es obligatorio" })} isInvalid={!!errors.username} />
                    <Form.Control.Feedback type="invalid">{errors.username?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Col>

            <Col md={6}>
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="user-modal-section-icon">
                  <i className="bi bi-geo-alt"></i>
                </div>
                <h6 className="user-modal-section-title mb-0">Domicilio</h6>
              </div>

              <Row>
                <Col sm={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Localidad <span className="text-danger">*</span></Form.Label>
                    <Form.Select {...register("residenceDto.idLocation", { required: "Este campo es obligatorio" })} isInvalid={!!errors.residenceDto?.idLocation}>
                      <option value="">Seleccione una localidad</option>
                      {locations.map((location) => (
                        <option key={location.idLocation} value={location.idLocation}>
                          {location.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.residenceDto?.idLocation?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col sm={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Distrito <span className="text-danger">*</span></Form.Label>
                    <Form.Control {...register("residenceDto.district", { required: "Este campo es obligatorio" })} isInvalid={!!errors.residenceDto?.district} />
                    <Form.Control.Feedback type="invalid">{errors.residenceDto?.district?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col sm={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Calle <span className="text-danger">*</span></Form.Label>
                    <Form.Control {...register("residenceDto.street", { required: "Este campo es obligatorio" })} isInvalid={!!errors.residenceDto?.street} />
                    <Form.Control.Feedback type="invalid">{errors.residenceDto?.street?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col sm={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>N° de Casa <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="number" {...register("residenceDto.number", { required: "Este campo es obligatorio" })} isInvalid={!!errors.residenceDto?.number} />
                    <Form.Control.Feedback type="invalid">{errors.residenceDto?.number?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col sm={user ? 12 : 6}>
                  <Form.Group className="mb-2">
                    <Form.Label>N° de Medidor</Form.Label>
                    <Form.Control {...register("residenceDto.serialNumber", { required: "Este campo es obligatorio" })} isInvalid={!!errors.residenceDto?.serialNumber} />
                    <Form.Control.Feedback type="invalid">{errors.residenceDto?.serialNumber?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                {!user && (
                  <Col sm={6}>
                    <Form.Group className="mb-2">
                      <Form.Label>Val. actual del Medidor</Form.Label>
                      <Form.Control {...register("residenceDto.valueMeter", { required: "Este campo es obligatorio" })} isInvalid={!!errors.residenceDto?.valueMeter} />
                      <Form.Control.Feedback type="invalid">{errors.residenceDto?.valueMeter?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                )}
              </Row>
            </Col>
          </Row>

          {/* --- Estado y configuración: fila ancha de a 4 campos, para aprovechar el modal xl --- */}
          <div className="d-flex align-items-center gap-3 mb-2 mt-1">
            <div className="user-modal-section-icon">
              <i className="bi bi-gear"></i>
            </div>
            <h6 className="user-modal-section-title mb-0">Estado y configuración</h6>
          </div>

          <Row>
            {user && (
              <Col md={3} sm={6}>
                <Form.Group className="mb-2">
                  <Form.Label>Estado del usuario <span className="text-danger">*</span></Form.Label>
                  <Controller
                    control={control}
                    name="status"
                    rules={{ required: "Este campo es obligatorio" }}
                    render={({ field }) => (
                      <DotDropdown
                        options={STATUS_OPTIONS}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.status && <div className="text-danger small mt-1">{errors.status.message}</div>}
                </Form.Group>
              </Col>
            )}

            <Col md={3} sm={6}>
              <Form.Group className="mb-2">
                <Form.Label>Tarifa <span className="text-danger">*</span></Form.Label>
                <Form.Select {...register("residenceDto.idFee", { required: "Este campo es obligatorio" })} isInvalid={!!errors.residenceDto?.idFee}>
                  <option value="">Seleccione una tarifa</option>
                  {fees.map((fee) => (
                    <option key={fee.idFee} value={fee.idFee}>
                      {fee.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.residenceDto?.idFee?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={3} sm={6}>
              <Form.Group className="mb-2">
                <Form.Label>Enviar boleta al correo <span className="text-danger">*</span></Form.Label>
                <Controller
                  control={control}
                  name="digitalInvoiceAdhered"
                  rules={{ required: "Este campo es obligatorio" }}
                  defaultValue={""} // ahora es string y coincide con FormValues
                  render={({ field }) => (
                    <Form.Select {...field} isInvalid={!!errors.digitalInvoiceAdhered}>
                      <option value="">Seleccione una opción</option>
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </Form.Select>
                  )}
                />
                <Form.Control.Feedback type="invalid">{errors.digitalInvoiceAdhered?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={3} sm={6}>
              <Form.Group className="mb-2">
                <Form.Label>Generar PDF de facturas <span className="text-danger">*</span></Form.Label>
                <Controller
                  control={control}
                  name="pdfInvoiceAdhered"
                  rules={{ required: "Este campo es obligatorio" }}
                  defaultValue={""} // string
                  render={({ field }) => (
                    <Form.Select {...field} isInvalid={!!errors.pdfInvoiceAdhered}>
                      <option value="">Seleccione una opción</option>
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </Form.Select>
                  )}
                />
                <Form.Control.Feedback type="invalid">{errors.pdfInvoiceAdhered?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={3} sm={6}>
              <Form.Group className="mb-2">
                <Form.Label>Calcular IVA al consumo total <span className="text-danger">*</span></Form.Label>
                <Controller
                  control={control}
                  name="ivaInvoiceAdhered"
                  rules={{ required: "Este campo es obligatorio" }}
                  defaultValue={""} // string
                  render={({ field }) => (
                    <Form.Select {...field} isInvalid={!!errors.ivaInvoiceAdhered}>
                      <option value="">Seleccione una opción</option>
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </Form.Select>
                  )}
                />
                <Form.Control.Feedback type="invalid">{errors.ivaInvoiceAdhered?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <div className="user-modal-footer d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="user-modal-hint">
              <i className="bi bi-info-circle-fill"></i>
              <span><strong>Importante: </strong>
              {user ? "Los cambios realizados afectarán a todas las futuras facturas y operaciones del usuario."
              : "El usuario recién creado podrá iniciar sesión con su DNI como contraseña."}
              </span>
            </div>
            <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-auto">
              <Button variant="outline-secondary" onClick={onHide} disabled={isSubmitting}>
                <i className="bi bi-x-circle me-1"></i> Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
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
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddEditModal;
