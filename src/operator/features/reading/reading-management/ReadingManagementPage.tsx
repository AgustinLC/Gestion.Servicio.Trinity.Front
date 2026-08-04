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
import { getFullName, withFullName } from "../../../../core/utils/userUtils";

type UserRow = UserDto & { fullName: string };

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

    // Se agrega el nombre y apellido concatenados para poder listarlos en una sola columna
    // y para que el buscador encuentre coincidencias sin importar si se busca por
    // nombre, apellido o ambos juntos.
    const usersWithFullName = useMemo(() => withFullName(operatorActiveUsers), [operatorActiveUsers]);

    // Hook para buscar por columnas
    const { filteredData, handleSearch } = useSearch<UserRow>(
        usersWithFullName,
        ["fullName", "idUser"],
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
    const columns: TableColumnDefinition<UserRow>[] = [
        { key: "idUser", label: "N° Conexión", sortable: true },
        { key: "fullName", label: "Nombre y Apellido", sortable: false },
        { key: "residenceDto", label: "Calle", sortable: false, render: (row: UserRow) => row.residenceDto?.street || "Sin dirección" },
        { key: "houseNumber" as keyof UserRow, label: "N° Casa", sortable: false, render: (row: UserRow) => row.residenceDto?.number || "Sin número" },
        { key: "meterNumber" as keyof UserRow, label: "N° Medidor", sortable: false, render: (row: UserRow) => row.residenceDto?.serialNumber || "Sin número" },
        {
            key: "actions",
            label: "Acciones",
            actions: (row: UserRow) => (
                <div className="d-flex gap-2 justify-content-center overflow-auto text-nowrap">
                    <Button variant="outline-primary" onClick={() => { setSelectedUser(row); setShowAddReadingModal(true); }}>
                        <i className="bi bi-speedometer2 me-1"></i> Cargar lectura
                    </Button>
                    <Button variant="outline-warning" onClick={() => { setSelectedUser(row); setShowUserReadings(true); }}>
                        <i className="bi bi-eye me-1"></i> Ver lecturas
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
                    <ReusableTable<UserRow>
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
                            userName={getFullName(selectedUser)}
                            userId={selectedUser.idUser}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default ReadingManagementPage;
