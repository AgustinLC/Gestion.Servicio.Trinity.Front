export interface PendigBillDetail {
    idPendingBillDetail: number;
    idMeter?: number;
    idBillingParameter: number;
    value: number;
    deleted?: boolean;
}