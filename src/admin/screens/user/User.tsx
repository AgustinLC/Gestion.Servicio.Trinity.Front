import { useState, useEffect } from "react";
import TableCrud from "../../../shared/components/table/TableCrud";
import { UserDto } from "../../../core/models/dto/UserDto";
import { getData } from "../../../core/services/apiService";

const User = () => {

    //Estados
    const [data, setData] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(false);

    //Props (columnas) para el componente TableCrud
    const columns = [
        { key: 'idUser', label: 'ID' },
        { key: 'username', label: 'NOMBRE DE USUARIO', visible: true },
        { key: 'lastName', label: 'APELLIDO', visible: true },
        { key: 'firstName', label: 'NOMBRE', visible: true },
        { key: 'dni', label: 'DNI', visible: true },
        { key: 'phone', label: 'TELÉFONO', visible: true },
        { key: 'status', label: 'ESTADO', visible: true },
    ];

    //Funciones de manejo de eventos
    const handleAdd = () => {
        console.log('Agregar nuevo registro');
    };

    const handleEdit = (row: any) => {
        console.log('Editar registro:', row);
    };

    const handleDelete = (row: any) => {
        console.log('Eliminar registro:', row);
    };

    const handleExtraAction = (row: any) => {
        console.log('Acción extra:', row);
    };

    // Función para obtener los usuarios
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const users = await getData<UserDto[]>('/operator/users');
            setData(users);
        } catch (error) {
            alert('Error al obtener los datos');
        } finally {
            setLoading(false);
        }
    };

    // Hook para obtener los usuarios al cargar el componente
    useEffect(() => {
        fetchUsers();
    }, []);

    //Renderizado del componente
    return (
        <div>
            <h1 className='text-center'>Usuarios</h1>
            <TableCrud
                data={data}
                columns={columns}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onExtraAction={handleExtraAction}
                showEditButton={true}
                showDeleteButton={true}
                showExtraActionButton={false}
                editButtonLabel="Editar"
                deleteButtonLabel="Eliminar"
                extraActionButtonLabel="Acción extra"
                loading={loading}
            />
        </div>
    );
};

export default User;