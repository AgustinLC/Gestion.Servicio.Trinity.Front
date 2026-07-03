export interface MainInfoDto {
    name: string;
    description:string;
    slogan: string;
    unitActive: string;
    plans: Fee[];
    features: FeatureDto[];
}

interface Fee {
    idFee: number;
    name: string;
    description: string;
    price: string;
    consumptionMax: number;
}

interface FeatureDto {
    idFeature: number;
    name: string;
    description: string;
}