export type BookingStatusApi =
    | "PENDING"
    | "CONFIRMED"
    | "ONGOING"
    | "COMPLETED"
    | "CANCELLED"
    | "DELETED";

export type BookingModeApi = "PACKAGE" | "MANUAL";

export type BookingLineItemTypeApi =
    | "HALL"
    | "DISH"
    | "SERVICE"
    | "BEVERAGE"
    | "BENEFIT"
    | "DISCOUNT"
    | "CUSTOM";

export type BookingLineSourceTypeApi =
    | "SYSTEM"
    | "PACKAGE_INCLUDED"
    | "PACKAGE_OPTIONAL"
    | "PACKAGE_BENEFIT"
    | "PACKAGE_DISCOUNT"
    | "MANUAL_EXTRA";

export type BookingLineRequest = {
    itemType: BookingLineItemTypeApi;

    itemId?: string | null;
    itemName?: string | null;

    quantity: number;

    unitPrice?: number | null;
    discountAmount?: number | null;
    taxRate?: number | null;

    sourceType?: BookingLineSourceTypeApi | null;
    sourceId?: string | null;
    sourceName?: string | null;

    editable?: boolean | null;
    removable?: boolean | null;
    displayOrder?: number | null;
};

export type BookingLineResponse = {
    id: string;

    itemType: BookingLineItemTypeApi;
    itemId: string | null;
    itemName: string | null;

    quantity: number | null;

    unitPrice: number | null;
    discountAmount: number | null;
    taxRate: number | null;
    taxAmount: number | null;
    lineAmount: number | null;

    sourceType: BookingLineSourceTypeApi | null;
    sourceId: string | null;
    sourceName: string | null;

    editable: boolean | null;
    removable: boolean | null;
    displayOrder: number | null;
};

export type BookingRequestPayload = {
    bookingDate: string;

    shiftId: string;
    hallId: string;

    customerName: string;
    customerPhone: string;
    customerEmail?: string | null;

    brideName: string;
    groomName: string;

    weddingDate: string;

    numberOfTables: number;
    numberOfReserveTables: number;

    bookingMode: BookingModeApi;

    packageId?: string | null;
    selectedMenuComboId?: string | null;

    bookingDraftLines?: BookingLineRequest[] | null;

    softDrinkQuantity?: number | null;
    beerQuantity?: number | null;

    depositAmount?: number | null;
    note?: string | null;

    status?: BookingStatusApi | null;
};

export type BookingResponse = {
    id: string;

    bookingDate: string;

    shiftId: string;
    shiftName: string | null;

    hallId: string;
    hallName: string | null;
    hallTypeName: string | null;

    customerName: string;
    customerPhone: string;
    customerEmail: string | null;

    brideName: string;
    groomName: string;

    weddingDate: string;

    numberOfTables: number;
    numberOfReserveTables: number;

    bookingMode: BookingModeApi;

    packageId: string | null;
    packageName: string | null;

    selectedMenuComboId: string | null;
    selectedMenuComboName: string | null;

    hallPrice: number | null;
    subtotalAmount: number | null;
    taxAmount: number | null;
    bookingAmount: number | null;
    depositAmount: number | null;
    confirmedPaymentAmount: number | null;
    remainingAmount: number | null;

    note: string | null;

    status: BookingStatusApi;

    cancelReason: string | null;

    bookingLines: BookingLineResponse[];

    lastModifiedAt: string | null;
    lastModifiedBy: string | null;
};

export type BookingSearchParams = {
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;

    brideName?: string;
    groomName?: string;

    bookingDateFrom?: string;
    bookingDateTo?: string;

    weddingDateFrom?: string;
    weddingDateTo?: string;

    hallId?: string;
    shiftId?: string;

    status?: BookingStatusApi;

    page?: number;
    size?: number;
};

export type HallAvailabilitySearchParams = {
    bookingDate: string;
    shiftId: string;
    capacity: number;
    page?: number;
    size?: number;
};

export type HallAvailabilityResponse = {
    hallId: string;
    hallName: string | null;

    hallTypeId: string | null;
    hallTypeName: string | null;

    hallImage: string | null;

    price: number | null;
    maxTables: number | null;

    description: string | null;
    status: string | null;
};

export type CancelBookingRequestPayload = {
    reason: string;
};

export type CancelBookingResponse = {
    bookingId: string;
    customerName: string | null;
    totalPaidAmount: number | null;
    totalRefundAmount: number | null;
    nonRefundableAmount: number | null;
    reason: string | null;
};

export type EditBookingLinesRequestPayload = {
    lines: BookingLineRequest[];
};

export type PageResponse<T> = {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
};