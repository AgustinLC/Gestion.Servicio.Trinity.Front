// components/UserSearchInput.tsx
import { useState, useEffect, useMemo } from 'react';
import { Form, Spinner, ListGroup, Button, Alert } from 'react-bootstrap';
import { UserDto } from '../../../core/models/dto/UserDto';
import useAppData from '../../../hooks/useAppData';

interface UserSearchInputProps { onUserSelected: (userId: number | null) => void; }

const UserSearchInput = ({ onUserSelected }: UserSearchInputProps) => {

    // Estados
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState<UserDto[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const { operatorActiveUsers, loading: isLoading, error } = useAppData();

    const filteredResults = useMemo(() => {
        // Con un usuario ya seleccionado, el input pasa a mostrar "idUser -
        // Nombre" (para que se lea el resumen de la selección), pero ese
        // mismo texto se reinterpretaba como una búsqueda nueva: el número
        // de conexión suelto (ej. "1") matcheaba por substring a cualquier
        // usuario cuyo ID lo contuviera (1, 21, 31...), repoblando la lista
        // de sugerencias 300ms después de elegir. Cortarlo acá evita que
        // "vuelva a pedir" seleccionar.
        if (selectedUser || searchTerm.length < 1) return [];

        const term = searchTerm.trim().toLowerCase();
        const numericTerm = searchTerm.replace(/\D/g, ""); // solo números

        return operatorActiveUsers.filter(user => {
            const conexMatch = numericTerm
                ? user.idUser.toString().includes(numericTerm)
                : false;

            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
            const nameMatch = fullName.includes(term);

            return conexMatch || nameMatch;
        }).slice(0, 5);
    }, [searchTerm, operatorActiveUsers, selectedUser]);

    // Filtrar usuarios localmente con debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilteredUsers(filteredResults);
        }, 300);

        return () => clearTimeout(timer);
    }, [filteredResults]);

    // Manejar selección de usuario
    const handleSelectUser = (user: UserDto) => {
        setSelectedUser(user);
        onUserSelected(user.idUser);
        setSearchTerm(`${user.idUser} - ${user.firstName} ${user.lastName}`);
        setFilteredUsers([]);
    };

    // Limpiar selección
    const clearSelection = () => {
        setSelectedUser(null);
        setSearchTerm('');
        onUserSelected(null);
    };

    return (
        <Form.Group className="mb-3 position-relative">
            <Form.Label>Buscar usuario por Nº Conexión</Form.Label>

            {isLoading && (
                <div className="mb-2">
                    <Spinner animation="border" size="sm" />
                    <span className="ms-2">Cargando usuarios...</span>
                </div>
            )}

            {error && <Alert variant="danger" className="mb-2">{`Error cargando usuarios: ${error}`}</Alert>}

            <Form.Control
                type="search"
                value={searchTerm}
                onChange={(e) => {
                    const value = e.target.value;
                    setSearchTerm(value);
                    if (!value) clearSelection();
                }}
                placeholder="Ingrese numero de conexión o nombre..."
                disabled={isLoading || !!selectedUser}
                aria-label="Buscar usuario por numero de conexión o nombre"
            />

            {filteredUsers.length > 0 && (
                <ListGroup className="position-absolute w-100 mt-1" style={{ zIndex: 1000 }}>
                    {filteredUsers.map(user => (
                        <ListGroup.Item
                            key={user.idUser}
                            action
                            onClick={() => handleSelectUser(user)}
                            className="py-2"
                            role="option"
                        >
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <div className="text-muted">
                                        <strong>{user.idUser} - {user.firstName} {user.lastName}</strong>
                                    </div>
                                    <div className="text-muted extra-small">
                                        {user.residenceDto?.street} {user.residenceDto?.number}
                                    </div>
                                </div>
                                <Button variant="outline-primary" size="sm">
                                    Seleccionar
                                </Button>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}

            {selectedUser && (
                <div className="selected-user-box mt-2">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>Seleccionado:</strong> {selectedUser.firstName} {selectedUser.lastName}
                            <span className="text-muted ms-2">(Nº de conexión: {selectedUser.idUser})</span>
                            <div className="text-muted small mt-1">
                                Domicilio: {selectedUser.residenceDto.street} {selectedUser.residenceDto.number}
                            </div>
                        </div>
                        <Button
                            variant="link"
                            size="sm"
                            onClick={clearSelection}
                            aria-label="Cambiar selección"
                        >
                            Cambiar
                        </Button>
                    </div>
                </div>
            )}
        </Form.Group>
    );
};

export default UserSearchInput;
