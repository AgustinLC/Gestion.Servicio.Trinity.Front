// TableCRUD.tsx
import { useEffect, useState } from 'react';
import { Table, Button, Spinner, Form } from 'react-bootstrap';
import { Row, TableProps } from '../../../core/models/TableProps'

const TableCrud: React.FC<TableProps> = ({
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
  pagination,
  loading = false,
}) => {

  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearch(value);
    const filtered = data.filter((row) => {
      return columns.some((column) => {
        return String(row[column.key]).toLowerCase().includes(value);
      });
    });
    setFilteredData(filtered);
  };

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const handleAdd = () => {
    if (onAdd) {
      onAdd();
    }
  };

  const handleEdit = (row: Row) => {
    if (onEdit) {
      onEdit(row);
    }
  };

  const handleDelete = (row: Row) => {
    if (onDelete) {
      onDelete(row);
    }
  };

  const handleExtraAction = (row: Row) => {
    if (onExtraAction) {
      onExtraAction(row);
    }
  };

  return (
    <div>
      {onAdd && !loading && (
        <div className='d-flex justify-content-between align-items-center mb-2'>
          <div>
            <Form.Control type="search" value={search} onChange={handleSearch} placeholder="Buscar..." />
          </div>
          <div>
            <Button className='d-flex align-items-center' variant="primary" onClick={handleAdd}>
              <i className="bi bi-plus-square fs-5"></i>
              <span className="ms-2">Agregar</span>
            </Button>
          </div>
        </div>
      )}
      {loading ? (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
          <span className="mb-2 fw-bold">CARGANDO...</span>
          <Spinner animation="border" role="status"></Spinner>
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead className='text-center'>
            <tr>
              {columns
                .filter((column) => column.visible !== false)
                .map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
              {(showEditButton || showDeleteButton || showExtraActionButton) && <th>ACCIONES</th>}
            </tr>
          </thead>
          <tbody className='text-center align-middle'>
            {filteredData.map((row, index) => (
              <tr key={index}>
                {columns
                  .filter((column) => column.visible !== false)
                  .map((column) => (
                    <td key={column.key}>{row[column.key]}</td>
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
      )}
      {pagination && (
        <div>
          <Button variant="primary" onClick={() => pagination.onPageChange(pagination.currentPage - 1)}>
            Anterior
          </Button>
          <span>
            Página {pagination.currentPage} de {pagination.totalPages}
          </span>
          <Button variant="primary" onClick={() => pagination.onPageChange(pagination.currentPage + 1)}>
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
};

export default TableCrud;