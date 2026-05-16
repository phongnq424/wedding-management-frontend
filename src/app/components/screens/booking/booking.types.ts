import type { Screen } from "../../../types";
import type { BookingStatusApi } from "../../../dto/booking.dto";

export type BookingPreselect = {
    hallId: string;
    hallName: string;
    hallTypeName?: string | null;
    hallImage?: string | null;
    price: number;
    maxTables: number;
    date: string;
    shiftId: string;
    shiftName: string;
};

export type ManualMenuMode = "COMBO" | "CUSTOM";

export type ManualComboSelection = {
    localId: string;
    comboId: string;
    tableCount: number;
    slotReplacements: Record<string, { dishId: string; dishName: string; price: number }>;
};

export type BookingScreenProps = {
    setScreen: (s: Screen) => void;
    setSelectedBooking?: (id: string | null) => void;
};

export type CheckHallAvailabilityProps = {
    setScreen: (s: Screen) => void;
    setBookingPreselect: (p: BookingPreselect | null) => void;
};

export type BookingFormProps = {
    setScreen: (s: Screen) => void;
    bookingPreselect: BookingPreselect | null;
    selectedBookingId?: string | null;
    setSelectedBookingId?: (id: string | null) => void;
};

export type ToastState = {
    msg: string;
    type: "success" | "error";
} | null;

export const BOOKING_STATUS_TABS: Array<"ALL" | BookingStatusApi> = [
    "ALL",
    "PENDING",
    "CONFIRMED",
    "ONGOING",
    "COMPLETED",
    "CANCELLED",
];

export function displayStatus(status: string | null | undefined) {
    if (!status) return "N/A";
    return status
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export function toIsoDateOnly(value: string | null | undefined) {
    if (!value) return "";
    return value.slice(0, 10);
}
