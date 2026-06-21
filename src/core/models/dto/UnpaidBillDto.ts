import { DebtStatus } from "../types/DebtStatus";

export interface UnpaidBillDto {
    idBill: number;
    idUser: number;
    idMeter: number;

    fullName: string;

    idPeriod: number;
    periodName: string;

    expirationDate: string;

    total: number;
    maturityAmount: number;
    amountToPay: number;

    debtStatus: DebtStatus;
}