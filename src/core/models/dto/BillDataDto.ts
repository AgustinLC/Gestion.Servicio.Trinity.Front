export interface BillDataDto {
    user: UserBillDto,
    concept: ConceptBillDto,
    details: DetailsBillDto
}

interface UserBillDto {
    userFirstName: string,
    userLastName: string,
    address: string,
    email: string,
    location: string
    
}

interface ConceptBillDto {
    normalConsumption: number,
    socialQuota: number,
    surplus: number,
    interests: number,
    fines: number,
    reconnection: number,
    connection: number,
    materials: number,
    others: number,
    discount: number
    
}

interface DetailsBillDto {
    idBill: number,
    dateBill: string,
    fee: string,
    consumptionMax: number,
    priceFee: number,
    consumed: number,
    surplus: number,
    total: number
}