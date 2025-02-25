// components/UserSearchInput.tsx
import { useState, useEffect, useMemo } from 'react';
import { Form, Spinner, ListGroup, Button, Alert } from 'react-bootstrap';
import { getData } from '../../../core/services/apiService';
import { UserDto } from '../../../core/models/dto/UserDto';

interface UserSearchInputProps { onUserSelected: (userId: number | null) => void; }

const UserSearchInput = ({ onUserSelected }: UserSearchInputProps) => {

    // Estados
    const [searchTerm, setSearchTerm] = useState('');
    const [allUsers, setAllUsers] = useState<UserDto[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);

    // Obtener datos de la api al montar el componente
    useEffect(() => {
        const fetchData = async () => {
            try {
                const users = await getData<UserDto[]>("/operator/users-actives");
                setAllUsers(users);
                setError('');
            } catch (error) {
                setError(`Error cargando usuarios: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredResults = useMemo(() => {
        if (searchTerm.length < 2) return [];
        const term = searchTerm.toLowerCase();
        return allUsers.filter(user => {
            const dniMatch = user.dni.toString().includes(term);
            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
            const nameMatch = fullName.includes(term);
            
            return dniMatch || nameMatch;
        }).slice(0, 5); // Limitar resultados
    }, [searchTerm, allUsers]);

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
        setSearchTerm(`${user.dni} - ${user.firstName} ${user.lastName}`);
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
            <Form.Label>Buscar usuario por DNI</Form.Label>

            {isLoading && (
                <div className="mb-2">
                    <Spinner animation="border" size="sm" />
                    <span className="ms-2">Cargando usuarios...</span>
                </div>
            )}

            {error && <Alert variant="danger" className="mb-2">{error}</Alert>}

            <Form.Control
                type="search"
                value={searchTerm}
                onChange={(e) => {
                    const value = e.target.value;
                    setSearchTerm(value);
                    if (!value) clearSelection();
                }}
                placeholder="Ingrese DNI o nombre..."
                disabled={isLoading || !!selectedUser}
                aria-label="Buscar usuario por DNI o nombre"
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
                                    <strong>{user.dni}</strong>
                                    <div className="text-muted small">
                                        {user.firstName} {user.lastName}
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
                <div className="mt-2 p-2 bg-light rounded">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>Seleccionado:</strong> {selectedUser.firstName} {selectedUser.lastName}
                            <span className="text-muted ms-2">(DNI: {selectedUser.dni})</span>
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