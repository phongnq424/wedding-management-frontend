export type DishComboStatusApi = "ACTIVE" | "INACTIVE";

export type DishComboSlotRequestPayload = {
    dishTypeId: string;
    defaultDishId: string;
    isReplaceable?: boolean;
    displayOrder?: number;
};

export type DishComboRequestPayload = {
    name: string;
    comboDiscountRate: number;
    comboSlotList: DishComboSlotRequestPayload[];
    description?: string;
    status?: DishComboStatusApi;
};

export type DishComboSlotResponse = {
    id: string;
    dishTypeId: string;
    dishTypeName: string;
    defaultDishId: string;
    defaultDishName: string;
    isReplaceable: boolean;
    displayOrder: number;
};

export type DishComboResponse = {
    id: string;
    name: string;
    comboDiscountRate: number;
    estimatedOriginalPricePerTable: number;
    estimatedComboPricePerTable: number;
    description: string | null;
    status: DishComboStatusApi;
    slots: DishComboSlotResponse[];
    slotSummary: string | null;
    numberOfSlots: number;
    replaceableSlotCount: number;
    lastModifiedAt: string | null;
    lastModifiedBy: string | null;
};

export type PageResponse<T> = {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
};