export interface BillDetailsDto {
    idBill: number;
    idMeter: number;
    idReading: number;
    consumption: number;
    surplus: number;
    surplusPrice: number;
    total: number;
    paidStatus: boolean;
    deleted: boolean;
    details: BillDetailDto[];
}

interface BillDetailDto {
    idBillDetail: number;
    idBillingParameter: number;
    billingParameterName: string;
    value: number;
}