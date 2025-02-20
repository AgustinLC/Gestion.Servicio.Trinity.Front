import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { UserDto } from "../../../core/models/dto/UserDto";
import { LocationDto } from "../../../core/models/dto/LocationDto";
import { FeeDto } from "../../../core/models/dto/FeeDto";

interface AddEditModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (user: UserDto) => Promise<void>;
  user?: UserDto | any;
  locations: LocationDto[];
  fees: FeeDto[];
}

const AddEditModal: React.FC<AddEditModalProps> = ({ show, onHide, onSave, user, locations, fees }) => {

  // Estados
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Props para manejar formulario 
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<UserDto>({
    defaultValues: user || {},
  });

  // Setear la contraseña igual al DNI al crear un nuevo usuario
  useEffect(() => {
    if (!user) {
      setValue("password", user?.dni?.toString());
    }
  }, [user, setValue]);

  // Manejo del botón de "Guardar"
  const onSubmit = async (data: UserDto) => {
    setIsSubmitting(true); // Desactivar el botón
    try {
      if (!user) {
        data.password = data.dni?.toString(); // Asegurar que la contraseña sea igual al DNI al crear
      }
      await onSave(data);
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
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  {...register("firstName", { required: "Este campo es obligatorio" })}
                  isInvalid={!!errors.firstName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.firstName?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Apellido</Form.Label>
                <Form.Control
                  {...register("lastName", { required: "Este campo es obligatorio" })}
                  isInvalid={!!errors.lastName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.lastName?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  {...register("username", { required: "Este campo es obligatorio" })}
                  isInvalid={!!errors.username}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.username?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            {user && ( // Mostrar estado solo en edición
              <Col>
                <Form.Group>
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    {...register("status", { required: "Este campo es obligatorio" })}
                    isInvalid={!!errors.status}
                  >
                    <option value="ACTIVE">Activo</option>
                    <option value="INACTIVE">Inactivo</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.status?.message}
                  </Form.Control.Feedback>
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
                  {...register("dni", { required: "Este campo es obligatorio" })}
                  isInvalid={!!errors.dni}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.dni?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  {...register("phone", { required: "Este campo es obligatorio" })}
                  isInvalid={!!errors.phone}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Localidad</Form.Label>
                <Form.Select
                  {...register("residenceDto.idLocation", { required: "Este campo es obligatorio" })}
                  isInvalid={!!errors.residenceDto?.idLocation}>
                  <option value="">Seleccione una localidad</option>
                  {locations.map((location) => (
                    <option key={location.idLocation} value={location.idLocation}>
                      {location.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.residenceDto?.idLocation?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Distrito</Form.Label>
                <Form.Control
                  {...register("residenceDto.district", { required: "Este campo es obligatorio" })}
                  isInvalid={!!errors.residenceDto?.district}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.residenceDto?.district?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Calle</Form.Label>
                <Form.Control
                  {...register("residenceDto.street", { required: "Este campo es obligatorio" })}
                  isInvalid={!!errors.residenceDto?.street}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.residenceDto?.street?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>N° de Casa</Form.Label>
                <Form.Control
                  type="number"
                  {...register("residenceDto.number", { required: "Este campo es obligatorio" })}
                  isInvalid={!!errors.residenceDto?.number}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.residenceDto?.number?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>N° de Medidor</Form.Label>
                <Form.Control
                  {...register("residenceDto.serialNumber", { required: "Este campo es obligatorio" })}
                  isInvalid={!!errors.residenceDto?.serialNumber}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.residenceDto?.serialNumber?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Tarifa</Form.Label>
                <Form.Select
                  {...register("residenceDto.idFee", { required: "Este campo es obligatorio" })}
                  isInvalid={!!errors.residenceDto?.idFee}
                >
                  <option value="">Seleccione una tarifa</option>
                  {fees.map((fee) => (
                    <option key={fee.idFee} value={fee.idFee}>
                      {fee.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.residenceDto?.idFee?.message}
                </Form.Control.Feedback>
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