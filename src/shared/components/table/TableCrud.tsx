import { useEffect, useState } from 'react';
import { Table, Button, Spinner, Form } from 'react-bootstrap';
import { TableProps } from '../../../core/models/TableProps';

// Hacemos que TableCrud sea genérico sin requerir una firma de índice
const TableCrud = <T extends object>({
    data,
    columns,
    onAdd,
    onEdit,
    onDelete,
    onExtraAction,
    showEditButton = true,
    showDeleteButton = true,
    showExtraActionButton = true,
    editButtonLabel,
    deleteButtonLabel,
    extraActionButtonLabel,
    loading = false,
}: TableProps<T>) => {
    const [search, setSearch] = useState('');
    const [filteredData, setFilteredData] = useState(data);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filtrar datos según búsqueda
    useEffect(() => {
        const filtered = data.filter((row) =>
            columns.some((column) =>
                String(row[column.key as keyof T]).toLowerCase().includes(search.toLowerCase())
            )
        );
        setFilteredData(filtered);
        // Reiniciar a la primera página cuando cambia la búsqueda
        setCurrentPage(1);
    }, [search, data, columns]);

    // Paginación: obtener elementos de la página actual
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Calcular total de páginas
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Manejadores de eventos
    const handleAdd = () => {
        if (onAdd) {
            onAdd();
        }
    };

    const handleEdit = (row: T) => {
        if (onEdit && row) {
            onEdit(row);
        } else {
            console.error("El objeto row es null o undefined");
        }
    };

    const handleDelete = (row: T) => {
        if (onDelete && row) {
            onDelete(row);
        } else {
            console.error("El objeto row es null o undefined");
        }
    };

    const handleExtraAction = (row: T) => {
        if (onExtraAction && row) {
            onExtraAction(row);
        } else {
            console.error("El objeto row es null o undefined");
        }
    };

    return (
        <div>
            {onAdd && !loading && (
                <div className='d-flex justify-content-between align-items-center mb-2'>
                    <Form.Control className='w-50' type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." />
                    <Button className='d-flex align-items-center' variant="primary" onClick={handleAdd}>
                        <i className="bi bi-plus-square fs-5"></i>
                        <span className="ms-2">Agregar</span>
                    </Button>
                </div>
            )}

            {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                    <span className="mb-2 fw-bold">CARGANDO...</span>
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            ) : (
                <>
                    <Table striped bordered hover responsive>
                        <thead className='text-center'>
                            <tr>
                                {columns.map((column) => column.visible !== false && (
                                    <th key={column.key}>{column.label}</th>
                                ))}
                                {(showEditButton || showDeleteButton || showExtraActionButton) && <th>ACCIONES</th>}
                            </tr>
                        </thead>
                        <tbody className='text-center align-middle'>
                            {paginatedData.map((row, index) => (
                                <tr key={index}>
                                    {columns.map((column) => column.visible !== false && (
                                        <td key={column.key}>{String(row[column.key as keyof T])}</td>
                                    ))}
                                    {(showEditButton || showDeleteButton || showExtraActionButton) && (
                                        <td className="d-flex flex-row justify-content-center">
                                            {showEditButton && onEdit && (
                                                <Button className='me-1' variant="secondary" onClick={() => handleEdit(row)}>
                                                    <i className="d-block d-sm-none bi bi-pencil-square fs-5"></i>
                                                    <span className="d-none d-sm-block">{editButtonLabel || 'Editar'}</span>
                                                </Button>
                                            )}
                                            {showDeleteButton && onDelete && (
                                                <Button className='me-1' variant="danger" onClick={() => handleDelete(row)}>
                                                    <i className="d-block d-sm-none bi bi-trash fs-5"></i>
                                                    <span className="d-none d-sm-block">{deleteButtonLabel || 'Eliminar'}</span>
                                                </Button>
                                            )}
                                            {showExtraActionButton && onExtraAction && (
                                                <Button variant="info" onClick={() => handleExtraAction(row)}>
                                                    <i className="d-block d-sm-none bi bi-info-circle fs-5"></i>
                                                    <span className="d-none d-sm-block">{extraActionButtonLabel || 'Acción extra'}</span>
                                                </Button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    {/* Paginación */}
                    <div className="d-flex justify-content-between align-items-center mt-2">
                        <Button variant="primary" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>
                            Anterior
                        </Button>
                        <span>Página {currentPage} de {totalPages}</span>
                        <Button variant="primary" disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)}>
                            Siguiente
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default TableCrud;