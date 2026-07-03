import { UnpaidBillDto } from "./UnpaidBillDto";
import { CollectedBillDto } from "./CollectedBillDto";

export interface BalanceControlDto {
    // Sección de deudas
    usersWithDebt: number;
    unpaidBillCount: number;
    totalDebt: number;
    unpaidBills: UnpaidBillDto[];

    // Sección de recaudado
    usersWithPayment: number;
    paidBillCount: number;
    totalCollected: number;
    collectedBills: CollectedBillDto[];
}
