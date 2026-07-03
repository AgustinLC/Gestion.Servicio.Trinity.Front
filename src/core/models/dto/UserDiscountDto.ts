import { ApplyCondition } from "./ApplyCondition";

export interface UserDiscountDto {
    idUserDiscount: number;
    idUser: number;
    idDiscount: number;
    name: string;
    description: string;
    amount: number;
    applyCondition: ApplyCondition;
    value: number;
    dateRegister: string;
}