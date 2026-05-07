import React, { useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { UserDto } from "../../../../core/models/dto/UserDto";
import { addData } from "../../../../core/services/apiService";
import ReusableTable from "../../../../shared/components/table/ReusableTable";
import { TableColumnDefinition } from "../../../../core/models/types/TableTypes";
import AddReadingModal from "./AddReadingModal";
import SearchBar from "../../../../shared/components/searcher/SearchBar";
import UserReadingsModal from "./UserReadingModal";
import { useSearch } from "../../../../hooks/useSearch";
import useAppData from "../../../../hooks/useAppData";

const ReadingManagementPage: React.FC = () => {
    // Estados
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const [showAddReadingModal, setShowAddReadingModal] = useState(false);
    const [showUserReadings, setShowUserReadings] = useState(false);
    const { operatorActiveUsers, loading, error } = useAppData();


    // Hook para buscar por columnas 
    const { filteredData, handleSearch } = useSearch<UserDto>(
        operatorActiveUsers,
        ["firstName", "lastName", "idUser"] // columnas filtrables
    );


    // Manejar añadir nueva lectura
    const handleAddReading = async (idUser: number, date: string, readingValue: number) => {
        try {
            await addData(`/operator/register-reading-date/${idUser}/${date}/${readingValue}`, {});
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
        setSelectedUser(null); // Limpiar el usuario seleccionado
    };


    // Columnas para la tabla
    const columns: TableColumnDefinition<UserDto>[] = [
        { key: "idUser", label: "N° Conexión", sortable: true },
        { key: "firstName", label: "Nombre", sortable: false },
        { key: "lastName", label: "Apellido", sortable: false },
        { key: "dni", label: "DNI", sortable: false },
        { key: "username", label: "Email", sortable: false },
        { key: "residenceDto", label: "Calle", sortable: false, render: (row: UserDto) => row.residenceDto?.street || "Sin dirección" },
        {
            key: "actions",
            label: "Acciones",
            actions: (row: UserDto) => (
                <div className="d-flex gap-2 justify-content-center overflow-auto text-nowrap">
                    <Button variant="primary" onClick={() => { setSelectedUser(row); setShowAddReadingModal(true); }}>
                        Cargar lectura
                    </Button>
                    <Button variant="warning" onClick={() => { setSelectedUser(row); setShowUserReadings(true); }}>
                        Ver lecturas
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <h1 className="text-center">Gestión de Lecturas</h1>
            {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                    <span className="mb-2 fw-bold">CARGANDO...</span>
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : (
                <div>
                    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 mb-1">
                        <SearchBar onSearch={handleSearch} />
                    </div>
                    {/* Tabla de usuarios */}
                    <ReusableTable<UserDto>
                        data={filteredData}
                        columns={columns}
                        defaultSort="idUser"
                    />

                    {/* Modal para añadir lectura */}
                    {selectedUser && (
                        <AddReadingModal
                            show={showAddReadingModal}
                            onHide={handleCloseAddReadingModal}
                            onSave={(date, readingValue) => handleAddReading(selectedUser.idUser, date, readingValue)}
                        />
                    )}

                    {/* Vista de lecturas del usuario */}
                    {selectedUser && showUserReadings && (
                        <UserReadingsModal
                            show={showUserReadings}
                            onHide={() => setShowUserReadings(false)}
                            userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
                            userId={selectedUser.idUser}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default ReadingManagementPage;
