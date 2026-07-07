import React, { useMemo, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { UserDto } from "../../../../core/models/dto/UserDto";
import { addData } from "../../../../core/services/apiService";
import ReusableTable from "../../../../shared/components/table/ReusableTable";
import { TableColumnDefinition } from "../../../../core/models/types/TableTypes";
import AddReadingModal from "./AddReadingModal";
import TableToolbar from "../../../../shared/components/table-toolbar/TableToolbar";
import { useSearch } from "../../../../hooks/useSearch";
import { useTableFilters } from "../../../../hooks/useTableFilters";
import useAppData from "../../../../hooks/useAppData";

const ReadingTakePage: React.FC = () => {

    // Estados
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const [showAddReadingModal, setShowAddReadingModal] = useState(false);
    const { operatorReadingUsers, loading, error, refreshOperatorReadingUsers } = useAppData();

    const uniqueStreets = useMemo(
        () => Array.from(new Set(operatorReadingUsers.map(u => u.residenceDto?.street).filter(Boolean))) as string[],
        [operatorReadingUsers]
    );
    const uniqueDistricts = useMemo(
        () => Array.from(new Set(operatorReadingUsers.map(u => u.residenceDto?.district).filter(Boolean))) as string[],
        [operatorReadingUsers]
    );

    // Filtros activables
    const filterConfigs = useMemo(
        () => [
            {
                id: "street",
                label: "Calle",
                emptyLabel: "Todas las calles",
                options: uniqueStreets.map((street) => ({ value: street, label: street })),
            },
        ],
        [uniqueStreets, uniqueDistricts]
    );
    const filterState = useTableFilters(filterConfigs);

    // Hook reutilizable de búsqueda + filtros
    const { filteredData, handleSearch } = useSearch<UserDto>(
        operatorReadingUsers,
        ["firstName", "lastName", "idUser"],
        {
            "residenceDto.street": filterState.getActiveValue("street"),
            "residenceDto.district": filterState.getActiveValue("district"),
        }
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
                    <TableToolbar
                        onSearch={handleSearch}
                        filters={filterConfigs}
                        filterState={filterState}
                    />
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
                            user={selectedUser.idUser}
                            onSave={(readingValue) => handleAddReading(selectedUser.idUser, readingValue)}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default ReadingTakePage;
