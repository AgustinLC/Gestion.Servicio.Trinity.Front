export interface SummaryDto {
  userName: string;
  userLastName: string;
  statusUser: number;
  billsPaid: number;
  billsPaidLate: number;
  unpaidBills: number;
  activeModality: string;
  activePeriod: Date;
  activeUnitService: string;
}