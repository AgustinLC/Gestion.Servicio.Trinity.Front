export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (row: T ) => React.ReactNode;
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
}