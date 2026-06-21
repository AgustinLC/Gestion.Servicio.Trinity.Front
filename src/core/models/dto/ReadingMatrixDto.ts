import { ReadingMatrixRowDto } from "./ReadingMatrixRowDto";

export interface ReadingMatrixDto {
    periods: string[];
    rows: ReadingMatrixRowDto[];
}