export type InvoiceStatusApi =
    | "DRAFT"
    | "ISSUED"
    | "REJECTED"
    | "CANCELLED";

export type InvoicePaymentStatusApi =
    | "UNPAID"
    | "PARTIALLY_PAID"
    | "PAID";

export type InvoiceBuyerRequestPayload = {
    buyerName: string;
    buyerLegalName?: string | null;
    buyerTaxCode?: string | null;
    buyerAddress: string;
    buyerEmail?: string | null;
    buyerPhone: string;
    buyerBankAccount?: string | null;
    buyerBankName?: string | null;
};

export type InvoiceCreateDraftRequestPayload = InvoiceBuyerRequestPayload & {
    bookingId: string;
};

export type InvoiceUpdateRequestPayload = InvoiceBuyerRequestPayload;

export type InvoiceGenerateRequestPayload = {
    inputCode: string;
};

export type InvoiceCancelRequestPayload = {
    reason: string;
};

export type InvoiceLineSnapshotResponse = {
    id: string;

    itemType: string;
    itemId: string | null;
    itemName: string;

    quantity: number;
    unitPrice: number;
    discountAmount: number;
    taxRate: number;
    taxAmount: number;
    lineAmount: number;

    displayOrder: number | null;
};

export type InvoiceResponse = {
    id: string;

    bookingId: string;
    customerName: string | null;
    customerPhone: string | null;
    customerEmail: string | null;

    bookingDate: string | null;
    weddingDate: string | null;

    buyerName: string | null;
    buyerLegalName: string | null;
    buyerTaxCode: string | null;
    buyerAddress: string | null;
    buyerEmail: string | null;
    buyerPhone: string | null;
    buyerBankAccount: string | null;
    buyerBankName: string | null;

    invoiceNumber: string | null;
    invoiceSymbol: string | null;
    taxAuthorityCode: string | null;
    providerInvoiceId: string | null;
    providerErrorMessage: string | null;
    pdfUrl: string | null;

    subtotalAmount: number | null;
    taxAmount: number | null;
    totalAmount: number | null;

    paymentStatus: InvoicePaymentStatusApi;
    status: InvoiceStatusApi;

    reason: string | null;

    createdAt: string | null;
    issuedBy: string | null;
    issuedAt: string | null;
    cancelledBy: string | null;
    cancelledAt: string | null;

    lastModifiedAt: string | null;
    lastModifiedBy: string | null;

    lines: InvoiceLineSnapshotResponse[];
};

export type InvoiceSearchParams = {
    invoiceId?: string;
    bookingId?: string;

    customerName?: string;
    customerPhone?: string;

    buyerName?: string;
    buyerLegalName?: string;
    buyerTaxCode?: string;

    invoiceNumber?: string;
    invoiceSymbol?: string;
    taxAuthorityCode?: string;

    issuedDateFrom?: string;
    issuedDateTo?: string;

    totalAmountFrom?: number | string;
    totalAmountTo?: number | string;

    paymentStatus?: InvoicePaymentStatusApi | "";
    status?: InvoiceStatusApi | "";

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