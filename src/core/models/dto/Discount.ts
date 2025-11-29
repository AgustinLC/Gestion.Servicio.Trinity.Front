import { ApplyCondition } from "./ApplyCondition";

export interface DiscountDto {
    idDiscount: number;
    amount: number;
    description: string;
    applyCondition: ApplyCondition;
    name: string;
    value: number;
}