import type { DayTypeApi, TimeSlotApi } from "../../../dto/hall.dto";
import type { HallPricingViewModel } from "./hall.types";

export function getPrice(
    pricings: HallPricingViewModel[],
    timeSlot: TimeSlotApi,
    dayType: DayTypeApi
) {
    return (
        pricings.find(
            (p) => p.timeSlot === timeSlot && p.dayType === dayType
        )?.price ?? 0
    );
}

export function buildPricingRows(pricings: HallPricingViewModel[]) {
    return [
        {
            shift: "Morning",
            weekday: getPrice(pricings, "MORNING", "WEEKDAY"),
            weekend: getPrice(pricings, "MORNING", "WEEKEND"),
        },
        {
            shift: "Afternoon",
            weekday: getPrice(pricings, "AFTERNOON", "WEEKDAY"),
            weekend: getPrice(pricings, "AFTERNOON", "WEEKEND"),
        },
        {
            shift: "Evening",
            weekday: getPrice(pricings, "EVENING", "WEEKDAY"),
            weekend: getPrice(pricings, "EVENING", "WEEKEND"),
        },
    ];
}

export const DEFAULT_PRICING_ROWS = [
    { timeSlot: "MORNING" as const, dayType: "WEEKDAY" as const, price: 0 },
    { timeSlot: "MORNING" as const, dayType: "WEEKEND" as const, price: 0 },
    { timeSlot: "AFTERNOON" as const, dayType: "WEEKDAY" as const, price: 0 },
    { timeSlot: "AFTERNOON" as const, dayType: "WEEKEND" as const, price: 0 },
    { timeSlot: "EVENING" as const, dayType: "WEEKDAY" as const, price: 0 },
    { timeSlot: "EVENING" as const, dayType: "WEEKEND" as const, price: 0 },
];

export function formatDateTimeForUser(value?: string) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Ho_Chi_Minh",
    }).format(date);
}