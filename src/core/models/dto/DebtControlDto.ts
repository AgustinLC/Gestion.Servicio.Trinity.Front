import { UnpaidBillDto } from "./UnpaidBillDto";

export interface DebtControlDto {
    usersWithDebt: number;
    unpaidBillCount: number;
    totalDebt: number;
    bills: UnpaidBillDto[];
}