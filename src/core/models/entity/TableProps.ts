//Propiedades de la columna de la tabla
export interface Column {
    key: string;
    label: string;
    visible?: boolean;
}

//Propiedades de la fila de la tabla
export interface Row {
    [key: string]: unknown;
}


//Propiedades de la tabla
export interface TableProps<T = Row> {
    data: T[];
    columns: Column[];
    onAdd?: () => void;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    onExtraAction?: (row: T) => void;
    showEditButton?: boolean;
    showDeleteButton?: boolean;
    showExtraActionButton?: boolean;
    editButtonLabel?: string;
    deleteButtonLabel?: string;
    extraActionButtonLabel?: string;
    loading?: boolean;
}