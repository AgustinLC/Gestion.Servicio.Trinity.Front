import { useState, useEffect } from "react";
import { useForm } from 'react-hook-form';
import TableCrud from "../../../shared/components/table/TableCrud";
import { UserDto, RegisterRequestDto } from "../../../core/models/dto/UserDto";
import { getData, addData, updateData } from "../../../core/services/apiService";
import { Button, Form, Modal } from "react-bootstrap";

const User = () => {
    // Estados
    const [data, setData] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<UserDto>({
        idUser: 0,
        username: '',
        lastName: '',
        firstName: '',
        dni: 0,
        phone: 0,
        status: '',
    });

    // Hooks
    const { register, handleSubmit, formState: { errors }, reset } = useForm<UserDto>({
        defaultValues: formData,
    });

    // Props (columnas) para el componente TableCrud
    const columns = [
        { key: 'idUser', label: 'ID' },
        { key: 'username', label: 'EMAIL', visible: true },
        { key: 'lastName', label: 'APELLIDO', visible: true },
        { key: 'firstName', label: 'NOMBRE', visible: true },
        { key: 'dni', label: 'DNI', visible: true },
        { key: 'phone', label: 'TELÉFONO', visible: true },
        { key: 'status', label: 'ESTADO', visible: true },
    ];

    // Función para obtener los usuarios
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const users = await getData<UserDto[]>('/operator/users');
            setData(users);
        } catch (error) {
            alert('Error al obtener los datos' + error);
        } finally {
            setLoading(false);
        }
    };

    // Hook para obtener los usuarios al cargar el componente
    useEffect(() => {
        fetchUsers();
    }, []);

    // Funciones para abrir el formulario de añadir usuario
    const handleAdd = async () => {
        const newFormData = { idUser: 0, username: '', lastName: '', firstName: '', dni: 0, phone: 0, status: '' };
        setFormData(newFormData);
        reset(newFormData);
        setShowForm(true);
    };

    // Funciones para abrir el formulario de editar usuario
    const handleEdit = async (row: UserDto) => {
        if (row && row.idUser) {
            setFormData(row); // Actualiza el estado con los valores de la fila
            reset(row); // Resetea el formulario con los nuevos valores
            setShowForm(true);
        } else {
            console.error("El usuario no es válido");
        }
    };

    // Función para el botón de submit del formulario (añadir o editar usuario)
    const onSubmit = async (data: UserDto) => {
        setIsSubmitting(true);
        try {
            if (data.idUser) {
                // Editar usuario
                await updateData<UserDto>('/operator/update-user?idUser', data.idUser, data);
                fetchUsers();
            } else {
                // Registrar usuario
                const registerData: RegisterRequestDto = {
                    username: data.username,
                    lastname: data.lastName,
                    firstname: data.firstName,
                    dni: data.dni,
                    phone: data.phone,
                    password: data.dni.toString(),
                };
                await addData<RegisterRequestDto>('/operator/register-user', registerData);
                fetchUsers();
            }
            setShowForm(false);
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert('Se produjo un error desconocido');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Función para el botón de cerrar el formulario
    const handleClose = () => {
        setShowForm(false);
    };

    // Renderizado del componente
    return (
        <div>
            <h1 className='text-center'>Usuarios</h1>
            <TableCrud<UserDto>
                data={data}
                columns={columns}
                onAdd={handleAdd}
                onEdit={handleEdit}
                showEditButton={true}
                showDeleteButton={false}
                showExtraActionButton={false}
                editButtonLabel="Editar"
                deleteButtonLabel="Eliminar"
                extraActionButtonLabel="Acción extra"
                loading={loading}
            />
            {/* Modal del Formulario */}
            <Modal show={showForm} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{formData.idUser ? 'Editar Usuario' : 'Añadir Usuario'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Form.Group className="mb-3" controlId="username">
                            <Form.Label>EMAIL</Form.Label>
                            <Form.Control type="text" {...register('username', { required: true })} />
                            {errors.username && <Form.Text className="text-danger">El email de usuario es requerido</Form.Text>}
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="lastName">
                            <Form.Label>APELLIDO</Form.Label>
                            <Form.Control type="text" {...register('lastName', { required: true })} />
                            {errors.lastName && <Form.Text className="text-danger">El apellido es requerido</Form.Text>}
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="firstName">
                            <Form.Label>NOMBRE</Form.Label>
                            <Form.Control type="text" {...register('firstName', { required: true })} />
                            {errors.firstName && <Form.Text className="text-danger">El nombre es requerido</Form.Text>}
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="dni">
                            <Form.Label>DNI</Form.Label>
                            <Form.Control type="number" {...register('dni', { required: true })} />
                            {errors.dni && <Form.Text className="text-danger">El DNI es requerido</Form.Text>}
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="phone">
                            <Form.Label>TELÉFONO</Form.Label>
                            <Form.Control type="number" {...register('phone', { required: true })} />
                            {errors.phone && <Form.Text className="text-danger">El teléfono es requerido</Form.Text>}
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="status">
                            <Form.Label>ESTADO</Form.Label>
                            <Form.Control as="select" {...register('status', { required: true })}>
                                <option value="">Seleccione un estado</option>
                                <option value="ACTIVE">Activo</option>
                                <option value="INACTIVE">Inactivo</option>
                            </Form.Control>
                            {errors.status && <Form.Text className="text-danger">El estado es requerido</Form.Text>}
                        </Form.Group>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {formData.idUser ? 'Actualizar' : 'Añadir'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default User;