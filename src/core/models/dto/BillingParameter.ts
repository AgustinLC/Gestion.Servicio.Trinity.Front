import { ApplyCondition } from "./ApplyCondition";
import { Status } from "./Status";

export interface BillingParameter {
    idBillingParameter: number;
    name: string; 
    description: string;
    value: number;
    deleted: boolean;   
    status: Status;
    applyCondition: ApplyCondition;
}