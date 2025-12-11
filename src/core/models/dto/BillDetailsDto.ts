export interface BillDetailsDto {
    idBill: number;
    idUser: number; 
    idMeter: number;
    idReading: number;
    consumption: number;
    surplus: number;
    surplusPrice: number;
    iva: number;
    discountCounter: number;
    totalDiscounts: number;
    subTotal: number;
    total: number;
    paidStatus: boolean;
    paymentLink: string;
    deleted: boolean;
    dateRegister: Date; 
    expirationDate: Date;
    maturityAmount: number;
    feeName: string; 
    feeSurplusChargePerUnit: number;
    feePrice: number; 
    feeConsumptionMax: number; 
    periodName: string;
    amountUnpaidInvoices: number;
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