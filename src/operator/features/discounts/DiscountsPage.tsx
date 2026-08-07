import { useMemo, useState } from "react"
import { Button } from "react-bootstrap";
import { UserDto } from "../../../core/models/dto/UserDto";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import TableSkeleton from "../../../shared/components/table-skeleton/TableSkeleton";
import ShowDiscountUserModal from "./ShowDiscountUserModal";
import AddDiscountModal from "./AddDiscountModal";
import TableToolbar from "../../../shared/components/table-toolbar/TableToolbar";
import PageHeader from "../../../shared/components/PageHeader";
import { useSearch } from "../../../hooks/useSearch";
import { useTableFilters } from "../../../hooks/useTableFilters";
import useAppData from "../../../hooks/useAppData";
import { withFullName } from "../../../core/utils/userUtils";

type UserRow = UserDto & { fullName: string };

const DiscountsPage = () => {

    // Estados principales
    const { operatorActiveUsers, discounts, loading, error } = useAppData();

    // Estado para el modal
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const [showAddDiscountModal, setShowAddDiscountModal] = useState(false);


    // Se agrega el nombre y apellido concatenados para poder listarlos en una sola columna
    // y para que el buscador encuentre coincidencias sin importar si se busca por
    // nombre, apellido o ambos juntos.
    const usersWithFullName = useMemo(() => withFullName(operatorActiveUsers), [operatorActiveUsers]);

    // Calles únicas para el filtro
    const uniqueStreets = useMemo(
        () => Array.from(new Set(operatorActiveUsers.map(u => u.residenceDto?.street).filter(Boolean))) as string[],
        [operatorActiveUsers]
    );

    // Filtro de calle (siempre visible, Fase 3)
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
    const { filteredData, handleSearch } = useSearch<UserRow>(
        usersWithFullName,
        ["fullName", "idUser"], // columnas filtrables
        { "residenceDto.street": filterState.getActiveValue("street") }
    );

    // Función para ver descuentos de un usuario
    const handleViewDiscounts = (user: UserDto) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    // Columnas de la tabla de usuarios
    const columns: TableColumnDefinition<UserRow>[] = [
        { key: "idUser", label: "N° Conexión", sortable: true },
        { key: "fullName", label: "Nombre y Apellido", sortable: false },
        { key: "street" as keyof UserRow, label: "Calle", sortable: false, render: (row: UserRow) => row.residenceDto?.street || "Sin dirección" },
        {
            key: "actions", label: "Acciones", actions: (row: UserRow) => (
                <div className="d-flex gap-2 justify-content-center overflow-auto text-nowrap">
                    <Button variant="outline-warning" onClick={() => { setSelectedUser(row); setShowAddDiscountModal(true); }}>
                        <i className="bi bi-plus-slash-minus me-1"></i> Añadir Descuento
                    </Button>
                    <Button variant="outline-primary" onClick={() => handleViewDiscounts(row)}>
                        <i className="bi bi-eye me-1"></i> Ver existentes
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <PageHeader title="Gestión de Descuentos" subtitle="Asigná descuentos a los usuarios." icon="bi bi-plus-slash-minus" />
            {loading ? (
                <TableSkeleton />
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : (
                <div className="content-fade-in">
                    <TableToolbar onSearch={handleSearch} filters={filterConfigs} filterState={filterState} />
                    {/* Tabla */}
                    <ReusableTable<UserRow>
                        data={filteredData}
                        columns={columns}
                        defaultSort="idUser"
                    />

                    {/* Modal para añadir descuento */}
                    <AddDiscountModal
                        key={selectedUser ? selectedUser.idUser : "new"}
                        show={showAddDiscountModal}
                        onHide={() => setShowAddDiscountModal(false)}
                        user={selectedUser!}
                        discounts={discounts}
                    />

                    {/* Vista de descuentos del usuario */}
                    {selectedUser && (
                        <ShowDiscountUserModal
                            show={showModal}
                            onHide={() => setShowModal(false)}
                            user={selectedUser}
                            discounts={discounts}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export default DiscountsPage
