export type PaymentTypeApi =
    | "DEPOSIT"
    | "PARTIAL_PAYMENT"
    | "FINAL_PAYMENT";

export type PaymentStatusApi =
    | "UNPROCESSED"
    | "PROCESSED"
    | "CANCELLED"
    | "REJECTED"
    | "FAILED";

export type PaymentMethodApi =
    | "CASH"
    | "BANK_TRANSFER"
    | "CARD";

export type PaymentCreateRequestPayload = {
    bookingId: string;
    paymentType: PaymentTypeApi;
    amount: number;
};

export type PaymentUpdateRequestPayload = {
    paymentType: PaymentTypeApi;
    amount: number;
};

export type PaymentCancelRequestPayload = {
    reason: string;
};

export type PaymentProcessRequestPayload = {
    paymentMethod: PaymentMethodApi;
    paymentDate: string;
    referenceNumber?: string | null;
    receivedAmount: number;
    note?: string | null;
    inputCode: string;
};

export type PaymentResponse = {
    id: string;

    bookingId: string;
    customerName: string | null;
    customerPhone: string | null;

    bookingAmount: number | null;
    depositAmount: number | null;
    confirmedPaidAmount: number | null;
    pendingPaymentAmount: number | null;
    remainingAmount: number | null;

    paymentType: PaymentTypeApi;
    amount: number;

    paymentMethod: PaymentMethodApi | null;
    paymentDate: string | null;
    receivedAmount: number | null;
    changeAmount: number | null;
    referenceNumber: string | null;

    status: PaymentStatusApi;

    reason: string | null;
    note: string | null;

    createdAt: string | null;
    processedBy: string | null;
    processedAt: string | null;
    cancelledBy: string | null;
    cancelledAt: string | null;

    lastModifiedAt: string | null;
    lastModifiedBy: string | null;
};

export type PaymentSearchParams = {
    paymentId?: string;
    bookingId?: string;
    customerName?: string;
    customerPhone?: string;

    paymentType?: PaymentTypeApi | "";
    paymentMethod?: PaymentMethodApi | "";
    status?: PaymentStatusApi | "";

    paymentDateFrom?: string;
    paymentDateTo?: string;

    amountFrom?: number | string;
    amountTo?: number | string;

    referenceNumber?: string;

    page?: number;
    size?: number;
};

export type PageResponse<T> = {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
};