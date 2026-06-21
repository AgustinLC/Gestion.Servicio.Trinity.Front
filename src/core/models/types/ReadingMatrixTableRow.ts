export interface ReadingMatrixTableRow {
    idUser: number;
    fullName: string;
    [key: string]: string | number | null;
}