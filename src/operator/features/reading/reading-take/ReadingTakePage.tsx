import React, { useEffect, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { UserDto } from "../../../../core/models/dto/UserDto";
import { addData, getData } from "../../../../core/services/apiService";
import ReusableTable from "../../../../shared/components/table/ReusableTable";
import { TableColumnDefinition } from "../../../../core/models/types/TableTypes";
import AddReadingModal from "./AddReadingModal";
import SearchBar from "../../../../shared/components/searcher/SearchBar";

const ReadingTakePage: React.FC = () => {

    // Estados
    const [users, setUsers] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filteredData, setFilteredData] = useState<UserDto[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const [showAddReadingModal, setShowAddReadingModal] = useState(false);
    const [selectedStreet, setSelectedStreet] = useState<string>("");
    const [selectedDistrict, setSelectedDistrict] = useState<string>("");
    const [uniqueStreets, setUniqueStreets] = useState<string[]>([]);
    const [uniqueDistricts, setUniqueDistricts] = useState<string[]>([]);

    // Obtener datos al cargar el componente
    useEffect(() => {
        fetchData();
    }, []);

    // Manejar todos los filtros
    useEffect(() => {
        let filtered = users;
        // Filtro por búsqueda
        if (selectedStreet) {
            filtered = filtered.filter(user =>
                user.residenceDto.street === selectedStreet
            );
        }
        // Filtro por distrito
        if (selectedDistrict) {
            filtered = filtered.filter(user =>
                user.residenceDto.district === selectedDistrict
            );
        }
        setFilteredData(filtered);
    }, [users, selectedStreet, selectedDistrict]);

    // Obtener usuarios de la API
    const fetchData = async () => {
        setLoading(true);
        try {
            const users = await getData<UserDto[]>("/operator/users-reading");
            setUsers(users);
            setFilteredData(users);
            // Extraer calles y distritos únicos
            const streets = Array.from(new Set(users.map(u => u.residenceDto.street).filter(s => s)));
            const districts = Array.from(new Set(users.map(u => u.residenceDto.district).filter(d => d)));
            setUniqueStreets(streets as string[]);
            setUniqueDistricts(districts as string[]);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al obtener la información");
            setError("Error al cargar la información principal");
        } finally {
            setLoading(false);
        }
    };

    // Manejar búsqueda
    const handleSearch = (query: string) => {
        const searchTerm = query.toLowerCase();
        const filtered = users.filter(user => {
            // Buscar en propiedades directas
            const directMatch = Object.values(user).some(value =>
                String(value).toLowerCase().includes(searchTerm)
            );
            // Buscar en propiedades anidadas de residenceDto
            const residenceMatch = Object.values(user.residenceDto).some(value =>
                String(value).toLowerCase().includes(searchTerm)
            );
            return directMatch || residenceMatch;
        });
        setFilteredData(filtered);
    };


    // Manejar añadir nueva lectura
    const handleAddReading = async (idUser: number, readingValue: number) => {
        try {
            await addData(`/operator/register-reading-active/${idUser}/${readingValue}`, {});
            toast.success("Lectura creada exitosamente");
            setShowAddReadingModal(false);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al guardar la lectura");
        }
    };

    // Manejar el cierre del formulario
    const handleCloseAddReadingModal = () => {
        setShowAddReadingModal(false);
        setSelectedUser(null);
    };


    // Columnas para la tabla
    const columns: TableColumnDefinition<UserDto>[] = [
        { key: "firstName", label: "Nombre", sortable: false },
        { key: "lastName", label: "Apellido", sortable: false },
        { key: "dni", label: "DNI", sortable: false },
        { key: "street" as keyof UserDto, label: "Calle", sortable: false, render: (row: UserDto) => row.residenceDto?.street || "Sin dirección" },
        { key: "houseNumber" as keyof UserDto, label: "N° Casa", sortable: false, render: (row: UserDto) => row.residenceDto?.number || "Sin número" },
        { key: "meterNumber" as keyof UserDto, label: "N° Medidor", sortable: false, render: (row: UserDto) => row.residenceDto?.serialNumber || "Sin número" },
        {
            key: "actions", label: "Acciones", actions: (row: UserDto) => (
                <Button className="text-nowrap" variant="primary" onClick={() => { setSelectedUser(row); setShowAddReadingModal(true); }}>
                    Cargar lectura
                </Button>
            ),
        },
    ];

    return (
        <div>
            <h1 className="text-center">Toma de Lecturas</h1>
            {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                    <span className="mb-2 fw-bold">CARGANDO...</span>
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : (
                <div>
                    {/* Barra de busqueda y filtros */}
                    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 mb-1">
                        <SearchBar onSearch={handleSearch} />
                        {/* Añadir filtros */}
                        <div className="d-flex gap-2">
                            <Form.Select value={selectedStreet} onChange={(e) => setSelectedStreet(e.target.value)}>
                                <option value="">Todas las calles</option>
                                {uniqueStreets.map(street => (<option key={street} value={street}>{street}</option>))}
                            </Form.Select>

                            <Form.Select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
                                <option value="">Todos los distritos</option>
                                {uniqueDistricts.map(district => (<option key={district} value={district}>{district}</option>))}
                            </Form.Select>
                        </div>
                    </div>
                    {/* Tabla de usuarios */}
                    <ReusableTable
                        data={filteredData}
                        columns={columns}
                    />

                    {/* Modal para añadir lectura */}
                    {selectedUser && (
                        <AddReadingModal
                            show={showAddReadingModal}
                            onHide={handleCloseAddReadingModal}
                            onSave={(readingValue) => handleAddReading(selectedUser.idUser, readingValue)}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default ReadingTakePage;