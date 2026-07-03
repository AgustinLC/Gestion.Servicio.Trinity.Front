import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { UserDto } from "../../../core/models/dto/UserDto";
import { LocationDto } from "../../../core/models/dto/LocationDto";
import { FeeDto } from "../../../core/models/dto/FeeDto";

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
  } = useForm<FormValues>(); // <-- uso del tipo FormValues

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
    <Modal show={show} onHide={onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title>{user ? "Editar Usuario" : "Añadir Usuario"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          {/* Resto de campos (igual que antes) */}
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Nombre</Form.Label>
                <Form.Control {...register("firstName", { required: "Este campo es obligatorio" })} isInvalid={!!errors.firstName} />
                <Form.Control.Feedback type="invalid">{errors.firstName?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Apellido</Form.Label>
                <Form.Control {...register("lastName", { required: "Este campo es obligatorio" })} isInvalid={!!errors.lastName} />
                <Form.Control.Feedback type="invalid">{errors.lastName?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control {...register("username", { required: "Este campo es obligatorio" })} isInvalid={!!errors.username} />
                <Form.Control.Feedback type="invalid">{errors.username?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            {user && (
              <Col>
                <Form.Group>
                  <Form.Label>Estado</Form.Label>
                  <Form.Select {...register("status", { required: "Este campo es obligatorio" })} isInvalid={!!errors.status}>
                    <option value="ACTIVE">Activo</option>
                    <option value="INACTIVE">Inactivo</option>
                    <option value="SUSPENDED">Suspendido</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.status?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}
          </Row>

          <Row>
            <Col>
              <Form.Group>
                <Form.Label>DNI</Form.Label>
                <Form.Control
                  type="number"
                  {...register("dni", { required: "Este campo es obligatorio", maxLength: { value: 8, message: "El DNI debe tener 8 números" } })}
                  isInvalid={!!errors.dni}
                />
                <Form.Control.Feedback type="invalid">{errors.dni?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  {...register("phone", { required: "Este campo es obligatorio", maxLength: { value: 10, message: "El teléfono no puede tener más de 10 números" } })}
                  isInvalid={!!errors.phone}
                />
                <Form.Control.Feedback type="invalid">{errors.phone?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Localidad</Form.Label>
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

            <Col>
              <Form.Group>
                <Form.Label>Distrito</Form.Label>
                <Form.Control {...register("residenceDto.district", { required: "Este campo es obligatorio" })} isInvalid={!!errors.residenceDto?.district} />
                <Form.Control.Feedback type="invalid">{errors.residenceDto?.district?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Calle</Form.Label>
                <Form.Control {...register("residenceDto.street", { required: "Este campo es obligatorio" })} isInvalid={!!errors.residenceDto?.street} />
                <Form.Control.Feedback type="invalid">{errors.residenceDto?.street?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col>
              <Form.Group>
                <Form.Label>N° de Casa</Form.Label>
                <Form.Control type="number" {...register("residenceDto.number", { required: "Este campo es obligatorio" })} isInvalid={!!errors.residenceDto?.number} />
                <Form.Control.Feedback type="invalid">{errors.residenceDto?.number?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group>
                <Form.Label>N° de Medidor</Form.Label>
                <Form.Control {...register("residenceDto.serialNumber", { required: "Este campo es obligatorio" })} isInvalid={!!errors.residenceDto?.serialNumber} />
                <Form.Control.Feedback type="invalid">{errors.residenceDto?.serialNumber?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            {!user && (
              <Col>
                <Form.Group>
                  <Form.Label>Val. actual del Medidor</Form.Label>
                  <Form.Control {...register("residenceDto.valueMeter", { required: "Este campo es obligatorio" })} isInvalid={!!errors.residenceDto?.valueMeter} />
                  <Form.Control.Feedback type="invalid">{errors.residenceDto?.valueMeter?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}
          </Row>

          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Tarifa</Form.Label>
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
            <Col>
              <Form.Group>
                <Form.Label>Enviar boleta al correo</Form.Label>
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
          </Row>
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Calcular IVA al consumo total</Form.Label>
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
            <Col>
              <Form.Group>
                <Form.Label>Generar PDF de facturas</Form.Label>
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
          </Row>

          <Button className="mt-2" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
          <Button className="mt-2 ms-2" variant="secondary" onClick={onHide} disabled={isSubmitting}>
            Cancelar
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddEditModal;
