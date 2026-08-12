import React, { useState } from "react";
import { Modal, Form, Button, Row, Col, Spinner } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { UserDto } from "../../../core/models/dto/UserDto";
import { LocationDto } from "../../../core/models/dto/LocationDto";
import { FeeDto } from "../../../core/models/dto/FeeDto";
import { Status } from "../../../core/models/dto/Status";
import statusLabels from "../../../shared/components/labels-traductor/statusLabels";
import { STATUS_BADGE_CLASS, STATUS_DESCRIPTIONS, STATUS_DOT_COLORS } from "../../../shared/components/labels-traductor/statusStyles";
import StatusSegmentedControl from "../../../shared/components/status-segmented/StatusSegmentedControl";
import { getAvatarColor } from "../../../core/utils/avatarColors";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";
import FormSectionHeader from "../../../shared/components/form-section-header/FormSectionHeader";
import HintBox from "../../../shared/components/hint-box/HintBox";
import FloatingFieldset from "../../../shared/components/floating-fieldset/FloatingFieldset";
import { combineRules, requiredRule, emailRule, exactLengthRule, maxLengthRule, onlyDigitsRule, noSpecialCharsRule, minValueRule } from "../../../core/utils/formValidationRules";
import CustomSelect from "../../../shared/components/custom-select/CustomSelect";
import "./AddEditUserModal.css";
import { formatDate } from "../../../core/utils/formatters";
import { useModalLayer } from "../../../context/ModalStackContext";

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
  onResetPasswordClick?: () => void;
  user?: UserDto | any;
  locations: LocationDto[];
  fees: FeeDto[];
}

interface UserFormProps {
  onHide: () => void;
  onSave: (user: UserDto) => Promise<void>;
  user?: UserDto | any;
  locations: LocationDto[];
  fees: FeeDto[];
}

// Construye los valores del formulario a partir del usuario (o vacío, para
// alta), forzando los 3 campos booleanos a string para que los CustomSelect
// muestren la opción correcta.
const buildFormValues = (source?: UserDto | null): Partial<FormValues> => {
  if (!source) return {};
  return {
    ...source,
    digitalInvoiceAdhered:
      source.digitalInvoiceAdhered === true ? "true" : source.digitalInvoiceAdhered === false ? "false" : "",
    ivaInvoiceAdhered:
      source.ivaInvoiceAdhered === true ? "true" : source.ivaInvoiceAdhered === false ? "false" : "",
    pdfInvoiceAdhered:
      source.pdfInvoiceAdhered === true ? "true" : source.pdfInvoiceAdhered === false ? "false" : "",
    residenceDto: {
      ...(source.residenceDto || {}),
    },
  };
};

// Contenido real del formulario, separado en su propio componente para que
// solo se monte mientras el modal está abierto (ver más abajo, "{show &&
// <UserForm .../>}"). Así useForm() arranca de cero cada vez que se abre: ni
// los valores tipeados ni los errores de la sesión anterior pueden quedar
// pisados, porque el componente entero (y su estado) es nuevo.
const UserForm: React.FC<UserFormProps> = ({ onHide, onSave, user, locations, fees }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: buildFormValues(user),
    // Valida al salir por primera vez del campo y, desde entonces, vuelve a
    // validar cada cambio. Así un CustomSelect limpia su error al seleccionar
    // una opción, sin requerir otro click fuera del control.
    mode: "onTouched",
  });
  const summaryFeeName = fees.find((fee) => String(fee.idFee) === String(user?.residenceDto?.idFee))?.name;
  const summaryInitials = `${(user?.firstName?.[0] || "").toUpperCase()}${(user?.lastName?.[0] || "").toUpperCase()}`;
  const summaryAvatarColor = getAvatarColor(`${user?.firstName ?? ""}${user?.lastName ?? ""}${user?.idUser ?? ""}`);

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

      // El alta de usuario sí acepta password en el mismo payload (endpoint
      // /operator/register-user). La edición no lo toca: el blanqueo de
      // contraseña es una acción aparte, disponible desde el menú de
      // opciones del header (onResetPasswordClick), no desde este submit.
      if (!user) {
        payload.password = payload.dni?.toString();
      } else {
        delete payload.password;
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
    <>
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
            <FormSectionHeader icon="bi bi-person" title="Información personal" subtitle="Datos de contacto e identificación del usuario." />

            <Row>
              <Col sm={6}>
                <Form.Group className="mb-2">
                  <FloatingFieldset label="Nombre">
                    <Form.Control {...register("firstName", combineRules(requiredRule(), noSpecialCharsRule(), maxLengthRule(40)))} isInvalid={!!errors.firstName} />
                  </FloatingFieldset>
                  <Form.Control.Feedback type="invalid">{errors.firstName?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group className="mb-2">
                  <FloatingFieldset label="Apellido">
                    <Form.Control {...register("lastName", combineRules(requiredRule(), noSpecialCharsRule(), maxLengthRule(40)))} isInvalid={!!errors.lastName} />
                  </FloatingFieldset>
                  <Form.Control.Feedback type="invalid">{errors.lastName?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col sm={6}>
                <Form.Group className="mb-2">
                  <FloatingFieldset label="DNI">
                    <Form.Control
                      type="number"
                      {...register("dni", combineRules(requiredRule(), exactLengthRule(8, "El DNI debe tener 8 números")))}
                      isInvalid={!!errors.dni}
                    />
                  </FloatingFieldset>
                  <Form.Control.Feedback type="invalid">{errors.dni?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group className="mb-2">
                  <FloatingFieldset label="Teléfono">
                    <Form.Control
                      {...register("phone", combineRules(requiredRule(), onlyDigitsRule("El teléfono solo puede contener números"), maxLengthRule(10, "El teléfono no puede tener más de 10 números")))}
                      isInvalid={!!errors.phone}
                    />
                  </FloatingFieldset>
                  <Form.Control.Feedback type="invalid">{errors.phone?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col sm={12}>
                <Form.Group className="mb-2">
                  <FloatingFieldset label="Email">
                    <Form.Control {...register("username", combineRules(requiredRule(), emailRule()))} isInvalid={!!errors.username} />
                  </FloatingFieldset>
                  <Form.Control.Feedback type="invalid">{errors.username?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Col>

          <Col md={6}>
            <FormSectionHeader icon="bi bi-geo-alt" title="Domicilio" subtitle="Dirección donde se presta el servicio." />

            <Row>
              <Col sm={6}>
                <Form.Group className="mb-2">
                  <Controller
                    control={control}
                    name="residenceDto.idLocation"
                    rules={{ required: "Este campo es obligatorio" }}
                    render={({ field }) => (
                      <FloatingFieldset label="Localidad">
                        <CustomSelect
                          value={field.value ? String(field.value) : ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          isInvalid={!!errors.residenceDto?.idLocation}
                          options={locations.map((location) => ({ value: String(location.idLocation), label: location.name }))}
                        />
                      </FloatingFieldset>
                    )}
                  />
                  <Form.Control.Feedback type="invalid">{errors.residenceDto?.idLocation?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col sm={6}>
                <Form.Group className="mb-2">
                  <FloatingFieldset label="Distrito">
                    <Form.Control {...register("residenceDto.district", { required: "Este campo es obligatorio" })} isInvalid={!!errors.residenceDto?.district} />
                  </FloatingFieldset>
                  <Form.Control.Feedback type="invalid">{errors.residenceDto?.district?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col sm={6}>
                <Form.Group className="mb-2">
                  <FloatingFieldset label="Calle">
                    <Form.Control {...register("residenceDto.street", { required: "Este campo es obligatorio" })} isInvalid={!!errors.residenceDto?.street} />
                  </FloatingFieldset>
                  <Form.Control.Feedback type="invalid">{errors.residenceDto?.street?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col sm={6}>
                <Form.Group className="mb-2">
                  <FloatingFieldset label="N° de Casa">
                    <Form.Control type="number" {...register("residenceDto.number", combineRules(requiredRule(), minValueRule(0)))} isInvalid={!!errors.residenceDto?.number} />
                  </FloatingFieldset>
                  <Form.Control.Feedback type="invalid">{errors.residenceDto?.number?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col sm={user ? 12 : 6}>
                <Form.Group className="mb-2">
                  <FloatingFieldset label="N° de Medidor">
                    <Form.Control 
                      type="number"
                      {...register("residenceDto.serialNumber", { 
                          required: "Este campo es obligatorio",
                          min: { value: 0, message: "El valor debe ser mayor o igual a 0" },
                      })} 
                      isInvalid={!!errors.residenceDto?.serialNumber} 
                    />
                  </FloatingFieldset>
                  <Form.Control.Feedback type="invalid">{errors.residenceDto?.serialNumber?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              {!user && (
                <Col sm={6}>
                  <Form.Group className="mb-2">
                    <FloatingFieldset label="Val. actual del Medidor">
                      <Form.Control 
                        type="number"
                        {...register("residenceDto.valueMeter", { 
                            required: "Este campo es obligatorio",
                            min: { value: 0, message: "El valor debe ser mayor o igual a 0" },
                        })} 
                        isInvalid={!!errors.residenceDto?.valueMeter} 
                        />
                    </FloatingFieldset>
                    <Form.Control.Feedback type="invalid">{errors.residenceDto?.valueMeter?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}
            </Row>
          </Col>
        </Row>

        {/* --- Configuración | Estado y contraseña (lado a lado). Al crear
            un usuario nuevo el estado no se puede elegir (arranca ACTIVO
            por defecto), así que esa columna ni se muestra: Configuración
            pasa a ocupar el ancho completo en vez de dejar un hueco vacío. --- */}
        <Row>
          <Col md={user ? 6 : 12}>
            <div className="form-section-panel mt-1">
              <FormSectionHeader icon="bi bi-gear" title="Configuración" subtitle="Tarifa y preferencias de facturación del servicio." />

              <Row>
                <Col sm={6}>
                  <Form.Group className="mb-2">
                    <Controller
                      control={control}
                      name="residenceDto.idFee"
                      rules={{ required: "Este campo es obligatorio" }}
                      render={({ field }) => (
                        <FloatingFieldset label="Tarifa">
                          <CustomSelect
                            value={field.value ? String(field.value) : ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            isInvalid={!!errors.residenceDto?.idFee}
                            options={fees.map((fee) => ({ value: String(fee.idFee), label: fee.name }))}
                          />
                        </FloatingFieldset>
                      )}
                    />
                    <Form.Control.Feedback type="invalid">{errors.residenceDto?.idFee?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col sm={6}>
                  <Form.Group className="mb-2">
                    <Controller
                      control={control}
                      name="digitalInvoiceAdhered"
                      rules={{ required: "Este campo es obligatorio" }}
                      defaultValue={""}
                      render={({ field }) => (
                        <FloatingFieldset label="Enviar boleta al correo">
                          <CustomSelect
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            isInvalid={!!errors.digitalInvoiceAdhered}
                            options={[{ value: "true", label: "Sí" }, { value: "false", label: "No" }]}
                          />
                        </FloatingFieldset>
                      )}
                    />
                    <Form.Control.Feedback type="invalid">{errors.digitalInvoiceAdhered?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col sm={6}>
                  <Form.Group className="mb-2">
                    <Controller
                      control={control}
                      name="pdfInvoiceAdhered"
                      rules={{ required: "Este campo es obligatorio" }}
                      defaultValue={""}
                      render={({ field }) => (
                        <FloatingFieldset label="Generar PDF de facturas">
                          <CustomSelect
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            isInvalid={!!errors.pdfInvoiceAdhered}
                            options={[{ value: "true", label: "Sí" }, { value: "false", label: "No" }]}
                          />
                        </FloatingFieldset>
                      )}
                    />
                    <Form.Control.Feedback type="invalid">{errors.pdfInvoiceAdhered?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col sm={6}>
                  <Form.Group className="mb-2">
                    <Controller
                      control={control}
                      name="ivaInvoiceAdhered"
                      rules={{ required: "Este campo es obligatorio" }}
                      defaultValue={""}
                      render={({ field }) => (
                        <FloatingFieldset label="Calcular IVA al consumo total">
                          <CustomSelect
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            isInvalid={!!errors.ivaInvoiceAdhered}
                            options={[{ value: "true", label: "Sí" }, { value: "false", label: "No" }]}
                          />
                        </FloatingFieldset>
                      )}
                    />
                    <Form.Control.Feedback type="invalid">{errors.ivaInvoiceAdhered?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Col>

          {user && (
            <Col md={6}>
              <div className="form-section-panel mt-1">
                <FormSectionHeader
                  icon="bi bi-toggle2-on"
                  title="Estado del usuario"
                  subtitle="Definí el estado actual del usuario en el sistema."
                />

                <div className="form-section-panel-content">
                  <Form.Group className="mb-0">
                    <Controller
                      control={control}
                      name="status"
                      rules={{ required: "Este campo es obligatorio" }}
                      render={({ field }) => (
                        <>
                          <StatusSegmentedControl value={field.value as Status} onChange={field.onChange} />
                          {field.value && (
                            <HintBox className="mt-3">{STATUS_DESCRIPTIONS[field.value as Status]}</HintBox>
                          )}
                        </>
                      )}
                    />
                    {errors.status && <div className="text-danger small mt-1">{errors.status.message}</div>}
                  </Form.Group>
                </div>
              </div>
            </Col>
          )}
        </Row>

        <div className="form-modal-footer d-flex justify-content-between align-items-center flex-wrap gap-3">
          <HintBox>
            <strong>Importante: </strong>
            {user ? "Los cambios realizados afectarán a todas las futuras facturas y operaciones del usuario."
            : "El usuario recién creado podrá iniciar sesión con su DNI como contraseña."}
          </HintBox>
          <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-auto">
            <Button variant="outline-secondary" onClick={onHide} disabled={isSubmitting}>
              <i className="bi bi-x-circle me-1"></i> Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
            >
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
    </>
  );
};

const AddEditModal: React.FC<AddEditModalProps> = ({ show, onHide, onSave, onResetPasswordClick, user, locations, fees }) => {
  const modalZIndex = useModalLayer(show);

  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable backdrop={false} style={{ zIndex: modalZIndex }} contentClassName="user-modal-content" aria-labelledby="user-modal-title">
      <FormModalHeader
        icon={user ? "bi bi-person-gear" : "bi bi-person-add"}
        title={user ? "Editar Usuario" : "Añadir Usuario"}
        subtitle={user
          ? "Modificá la información del usuario y la configuración del servicio."
          : "Completá los datos para registrar un nuevo usuario."}
        onClose={onHide}
        titleId="user-modal-title"
        actions={
          user && onResetPasswordClick
            ? [{ label: "Restablecer contraseña", icon: "bi bi-key", onClick: onResetPasswordClick }]
            : undefined
        }
      />

      <Modal.Body>
        {show && (
          <UserForm
            onHide={onHide}
            onSave={onSave}
            user={user}
            locations={locations}
            fees={fees}
          />
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AddEditModal;
