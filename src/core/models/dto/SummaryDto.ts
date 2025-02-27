export interface SummaryDto {
  userName: string;
  userLastName: string;
  statusUser: number;
  billsPaid: number;
  unpaidBills: number;
  activeModality: string;
  activePeriod: Date;
  activeUnitService: string;
}