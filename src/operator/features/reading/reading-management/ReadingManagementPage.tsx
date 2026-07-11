import React, { useMemo, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { UserDto } from "../../../../core/models/dto/UserDto";
import { addData } from "../../../../core/services/apiService";
import ReusableTable from "../../../../shared/components/table/ReusableTable";
import { TableColumnDefinition } from "../../../../core/models/types/TableTypes";
import AddReadingModal from "./AddReadingModal";
import TableToolbar from "../../../../shared/components/table-toolbar/TableToolbar";
import PageHeader from "../../../../shared/components/PageHeader";
import UserReadingsModal from "./UserReadingModal";
import { useSearch } from "../../../../hooks/useSearch";
import { useTableFilters } from "../../../../hooks/useTableFilters";
import useAppData from "../../../../hooks/useAppData";

const ReadingManagementPage: React.FC = () => {
    // Estados
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const [showAddReadingModal, setShowAddReadingModal] = useState(false);
    const [showUserReadings, setShowUserReadings] = useState(false);
    const { operatorActiveUsers, loading, error } = useAppData();


    // Calles únicas para el filtro
    const uniqueStreets = useMemo(
        () => Array.from(new Set(operatorActiveUsers.map(u => u.residenceDto?.street).filter(Boolean))) as string[],
        [operatorActiveUsers]
    );

    // Filtros activables con checkbox
    const filterConfigs = useMemo(
        () => [
            {
                id: "street",
                label: "Calle",
                emptyLabel: "Todas las calles",
                options: uniqueStreets.map((street) => ({ value: street, label: street })),
            },
        ],
        [uniqueStreets]
    );
    const filterState = useTableFilters(filterConfigs);

    // Hook para buscar por columnas 
    const { filteredData, handleSearch } = useSearch<UserDto>(
        operatorActiveUsers,
        ["firstName", "lastName", "idUser"],
        { "residenceDto.street": filterState.getActiveValue("street") }
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
                    <Button variant="outline-primary" onClick={() => { setSelectedUser(row); setShowAddReadingModal(true); }}>
                        Cargar lectura
                    </Button>
                    <Button variant="outline-warning" onClick={() => { setSelectedUser(row); setShowUserReadings(true); }}>
                        Ver lecturas
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <PageHeader title="Gestión de Lecturas" subtitle="Registrá y consultá las lecturas de los medidores." icon="bi bi-speedometer2" />
            {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center loading-vh">
                    <span className="mb-2 fw-bold">CARGANDO...</span>
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : (
                <div>
                    <TableToolbar
                        onSearch={handleSearch}
                        filters={filterConfigs}
                        filterState={filterState}
                    />
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
