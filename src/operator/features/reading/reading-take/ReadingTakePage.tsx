import React, { useMemo, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { UserDto } from "../../../../core/models/dto/UserDto";
import { addData } from "../../../../core/services/apiService";
import ReusableTable from "../../../../shared/components/table/ReusableTable";
import { TableColumnDefinition } from "../../../../core/models/types/TableTypes";
import AddReadingModal from "./AddReadingModal";
import SearchBar from "../../../../shared/components/searcher/SearchBar";
import { useSearch } from "../../../../hooks/useSearch";
import useAppData from "../../../../hooks/useAppData";

const ReadingTakePage: React.FC = () => {

    // Estados
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const [showAddReadingModal, setShowAddReadingModal] = useState(false);
    // Filtros
    const [selectedStreet, setSelectedStreet] = useState<string>("");
    const [selectedDistrict, setSelectedDistrict] = useState<string>("");
    const { operatorReadingUsers, loading, error, refreshOperatorReadingUsers } = useAppData();

    const uniqueStreets = useMemo(
        () => Array.from(new Set(operatorReadingUsers.map(u => u.residenceDto?.street).filter(Boolean))) as string[],
        [operatorReadingUsers]
    );
    const uniqueDistricts = useMemo(
        () => Array.from(new Set(operatorReadingUsers.map(u => u.residenceDto?.district).filter(Boolean))) as string[],
        [operatorReadingUsers]
    );

    // Hook reutilizable de búsqueda + filtros
  const { filteredData, handleSearch } = useSearch<UserDto>(
    operatorReadingUsers,
    [ "firstName", "lastName", "idUser" ],
    { "residenceDto.street": selectedStreet || null, "residenceDto.district": selectedDistrict || null, }
  );

    // Manejar añadir nueva lectura
    const handleAddReading = async (idUser: number, readingValue: number) => {
        try {
            await addData(`/operator/register-reading-active/${idUser}/${readingValue}`, {});
            toast.success("Lectura creada exitosamente");
            setShowAddReadingModal(false);
            await refreshOperatorReadingUsers();
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
        { key: "idUser", label: "N° Conexión", sortable: false },
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
                            user= {selectedUser.idUser}
                            onSave={(readingValue) => handleAddReading(selectedUser.idUser, readingValue)}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default ReadingTakePage;
