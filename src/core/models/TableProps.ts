//Propiedades de la columna de la tabla
export interface Column {
    key: string;
    label: string;
    visible?: boolean;
}

//Propiedades de la fila de la tabla
export interface Row {
    [key: string]: any;
}

export interface Pagination {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

//Propiedades de la tabla
export interface TableProps {
    data: Row[];
    columns: Column[];
    onAdd?: () => void;
    onEdit?: (row: Row) => void;
    onDelete?: (row: Row) => void;
    onExtraAction?: (row: Row) => void;
    showEditButton?: boolean;
    showDeleteButton?: boolean;
    showExtraActionButton?: boolean;
    editButtonLabel?: string;
    deleteButtonLabel?: string;
    extraActionButtonLabel?: string;
    loading?: boolean;
    pagination?: Pagination;
}