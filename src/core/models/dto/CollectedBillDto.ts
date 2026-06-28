import { PaymentStatus } from "./PaymentStatus";

export interface CollectedBillDto {
    idBill: number;
    idUser: number;
    idMeter: number;

    fullName: string;

    idPeriod: number;
    periodName: string;

    paymentDate: string;
    expirationDate: string;

    total: number;
    maturityAmount: number;
    /** Monto efectivamente cobrado (con o sin recargo según el estado) */
    amountCollected: number;

    paymentStatus: PaymentStatus;
}
