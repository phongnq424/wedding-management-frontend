export interface HallPricingResponse {
    id: string;
    timeSlot: "MORNING" | "AFTERNOON" | "EVENING";
    dayType: "WEEKDAY" | "WEEKEND";
    price: number;
}

export interface HallResponse {
    id: string;
    name: string;
    hallTypeId: string;
    hallTypeName: string;
    basePrice: number;
    minTables: number;
    maxTables: number;
    hallImage: string;
    description: string;
    status: "ACTIVE" | "INACTIVE";
    pricings: HallPricingResponse[];
    lastModifiedAt: string;
    lastModifiedBy?: string;
}

export interface CreateHallRequest {
    hallName: string;
    hallTypeId: number;
    minTables: number;
    maxTables: number;
    hallImage?: string;
    status?: "ACTIVE" | "INACTIVE";
}

export interface UpdateHallRequest extends CreateHallRequest {
    lastModifiedAt?: string;
}