export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (row: T, key: keyof T) => React.ReactNode;
}

export interface ActionColumn<T> {
  key: "actions";
  label: string;
  actions: (row: T) => React.ReactNode;
}

export type TableColumnDefinition<T> = TableColumn<T> | ActionColumn<T>;

export interface ReusableTableProps<T> {
  data: T[];
  columns: TableColumnDefinition<T>[];
  rowKey?: keyof T;
  defaultSort?: keyof T;
  defaultSortDirection?: "asc" | "desc";
  defaultPageSize?: number;
  showPageSizeSelector?: boolean;
  // Clase extra por fila (ej. para remarcar registros con algún problema,
  // como facturas sin usuario asociado en BillGenerateFilteredPage).
  getRowClassName?: (row: T) => string | undefined;
  // Estado vacío (data=[]): por defecto usa un ícono/título/mensaje genéricos
  // ("No hay datos para mostrar"), pero se puede personalizar por tabla en
  // los casos donde vacío es un resultado esperado (ej. "Sin descuentos
  // registrados"), en vez de dejar el genérico en todos lados.
  emptyIcon?: string;
  emptyTitle?: string;
  emptyMessage?: string;
}