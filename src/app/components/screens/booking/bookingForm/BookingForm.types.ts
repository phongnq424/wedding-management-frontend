import type { BookingResponse } from "../../../../dto/booking.dto";

export type CustomerFormState = {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    brideName: string;
    groomName: string;
    weddingDate: string;
    numberOfTables: number;
    numberOfReserveTables: number;
    note: string;
};

export type ManualMenuMode = "COMBO" | "CUSTOM";

export type ManualComboReplacement = {
    dishId: string;
    dishName: string;
    price: number;
};

export type ManualComboSelection = {
    localId: string;
    comboId: string;
    tableCount: number;
    slotReplacements: Record<string, ManualComboReplacement>;
};

export type BookingMenuComboSlotSnapshotLike = {
    id?: string | null;
    slotId?: string | number | null;
    slotName?: string | null;

    originalDishId?: string | null;
    originalDishName?: string | null;
    originalDishPrice?: number | null;

    selectedDishId?: string | null;
    selectedDishName?: string | null;
    selectedDishPrice?: number | null;

    replaced?: boolean | null;
    displayOrder?: number | null;
};

export type BookingMenuComboSnapshotLike = {
    id?: string | null;
    comboId?: string | null;
    comboName?: string | null;
    tableCount?: number | null;

    originalComboPrice?: number | null;
    discountRate?: number | null;
    discountedComboPrice?: number | null;

    displayOrder?: number | null;
    slotSnapshots?: BookingMenuComboSlotSnapshotLike[] | null;
};

export type EditBookingLike = BookingResponse & {
    hallPrice?: number | null;

    manualMenuMode?: ManualMenuMode | null;
    menuComboSnapshots?: BookingMenuComboSnapshotLike[] | null;
};

export type SelectedServiceState = {
    serviceId: string;
    quantity: number;
};