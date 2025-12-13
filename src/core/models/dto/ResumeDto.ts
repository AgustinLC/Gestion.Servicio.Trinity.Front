export interface ResumeDto {
    fullReadings: number;
    missingMeters: number;
    incompleteReadings: number;
    billsPaid: number
    billsPaidLate: number
    unpaidBills: number;
    activeUsers: number;
    suspendedUsers: number;
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