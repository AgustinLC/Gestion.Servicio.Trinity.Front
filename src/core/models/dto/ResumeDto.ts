export interface ResumeDto {
    fullReadings: number;
    incompleteReadings: number;
    billsPaid: number
    unpaidBills: number;
    activeUsers: number;
    inactiveUsers: number;
    activeModality: string;
    dateActivePeriod: Date;
    activeUnitService: string;
    usersForFee: UsersForFeeDto[];
}

interface UsersForFeeDto {
    fee: string;
    count: number;
}