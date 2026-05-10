import type { DayTypeApi, TimeSlotApi } from "../../../dto/hall.dto";

export type HallPricingViewModel = {
    id?: string;
    timeSlot: TimeSlotApi;
    dayType: DayTypeApi;
    price: number;
};

export type HallViewModel = {
    id: string;
    name: string;
    type: string;
    minTables: number;

    hallTypeId: string
    maxTables: number;
    status: "Active" | "Inactive";
    image?: string;
    lastModified: string;
    lastModifiedDisplay: string;
    basePrice: number;
    pricings: HallPricingViewModel[];
};

export type HallPricingFormRow = {
    timeSlot: TimeSlotApi;
    dayType: DayTypeApi;
    price: number;
};