export interface BillDetailsDto {
    idBill: number;
    idMeter: number;
    idReading: number;
    consumption: number;
    surplus: number;
    surplusPrice: number;
    total: number;
    paidStatus: boolean;
    paymentLink: string;
    deleted: boolean;
    dateRegister: Date; 
    expirationDate: Date;
    feeName: string; 
    surplusChargePerUnit: number;
    feePrice: number; 
    consumptionMax: number; 
    periodName: string;
    readingsBillDto: ReadingBillDto 
    details: BillDetailDto[];
}

interface BillDetailDto {
    idBillDetail: number;
    idBillingParameter: number;
    billingParameterName: string;
    value: number;
}

interface ReadingBillDto {
    currentReading: number;
    currentReadingDate: Date;
    previousReading: number;
    previousReadingDate: Date;
    idBill: number;
}