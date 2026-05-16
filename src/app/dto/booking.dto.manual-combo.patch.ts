/**
 * Add/merge these fields into src/app/dto/booking.dto.ts.
 * Keep your existing types and only add the missing fields if they are not present yet.
 */

export type ManualMenuModeApi = "COMBO" | "CUSTOM";

export type BookingMenuComboSlotReplacementRequest = {
    slotId: string;
    dishId: string;
};

export type BookingMenuComboRequest = {
    comboId: string;
    tableCount: number;
    slotReplacements?: BookingMenuComboSlotReplacementRequest[];
};

export type BookingMenuComboSlotSnapshotResponse = {
    id: string;
    slotId: string | null;
    slotName: string | null;

    originalDishId: string | null;
    originalDishName: string | null;
    originalDishPrice: number | null;

    selectedDishId: string;
    selectedDishName: string;
    selectedDishPrice: number;

    replaced: boolean;
    displayOrder: number;
};

export type BookingMenuComboSnapshotResponse = {
    id: string;
    comboId: string;
    comboName: string;
    tableCount: number;
    originalComboPrice: number;
    discountRate: number;
    discountedComboPrice: number;
    displayOrder: number;
    slotSnapshots: BookingMenuComboSlotSnapshotResponse[];
};

/**
 * In BookingRequestPayload, add:
 *
 * manualMenuMode?: ManualMenuModeApi | null;
 * manualComboSelections?: BookingMenuComboRequest[];
 *
 * In BookingResponse, add:
 *
 * manualMenuMode?: ManualMenuModeApi | null;
 * menuComboSnapshots?: BookingMenuComboSnapshotResponse[];
 */
