import { UserDto } from "./UserDto";

export interface DebtItemDto {
    idBill: number;
    periodName: string;
    amount: number;
    expirationDate: string;
}

export interface UserDebtDto extends UserDto {
    periodsOwed: number;
    debts?: DebtItemDto[];
}
