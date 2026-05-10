export type HallStatusApi = "ACTIVE" | "INACTIVE";
export type TimeSlotApi = "MORNING" | "AFTERNOON" | "EVENING";
export type DayTypeApi = "WEEKDAY" | "WEEKEND";

export interface HallPricingResponse {
    id?: string;
    timeSlot: TimeSlotApi;
    dayType: DayTypeApi;
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
    hallImage?: string;
    description?: string;
    status: HallStatusApi;
    pricings: HallPricingResponse[];
    lastModifiedAt: string;
    lastModifiedBy?: string;
}

export interface HallPricingRequest {
    timeSlot: TimeSlotApi;
    dayType: DayTypeApi;
    price: number;
}

export interface HallRequestPayload {
    name: string;
    hallTypeId: string;
    minTables: number;
    maxTables: number;
    status: HallStatusApi;
    description?: string;
    pricings: HallPricingRequest[];
}