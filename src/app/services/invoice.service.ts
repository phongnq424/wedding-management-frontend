import { apiRequest } from "../api/client";
import type {
    InvoiceCancelRequestPayload,
    InvoiceCreateDraftRequestPayload,
    InvoiceGenerateRequestPayload,
    InvoiceResponse,
    InvoiceSearchParams,
    InvoiceUpdateRequestPayload,
    PageResponse,
} from "../dto/invoice.dto";

function toLastModifiedAtParam(lastModifiedAt: string) {
    return new Date(lastModifiedAt).getTime();
}

function setParam(
    searchParams: URLSearchParams,
    key: string,
    value?: string | number | null
) {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
}

export const invoiceService = {
    getAll: async (): Promise<InvoiceResponse[]> => {
        return await apiRequest<InvoiceResponse[]>("/invoices");
    },

    getById: async (id: string): Promise<InvoiceResponse> => {
        return await apiRequest<InvoiceResponse>(`/invoices/${id}`);
    },

    createDraft: async (
        payload: InvoiceCreateDraftRequestPayload
    ): Promise<InvoiceResponse> => {
        return await apiRequest<InvoiceResponse>("/invoices", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    update: async (
        id: string,
        payload: InvoiceUpdateRequestPayload,
        lastModifiedAt: string
    ): Promise<InvoiceResponse> => {
        const lastModifiedAtParam = toLastModifiedAtParam(lastModifiedAt);

        return await apiRequest<InvoiceResponse>(
            `/invoices/${id}?lastModifiedAt=${lastModifiedAtParam}`,
            {
                method: "PUT",
                body: JSON.stringify(payload),
            }
        );
    },

    generate: async (
        id: string,
        payload: InvoiceGenerateRequestPayload
    ): Promise<InvoiceResponse> => {
        return await apiRequest<InvoiceResponse>(`/invoices/${id}/generate`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    cancel: async (
        id: string,
        payload: InvoiceCancelRequestPayload
    ): Promise<InvoiceResponse> => {
        return await apiRequest<InvoiceResponse>(`/invoices/${id}/cancel`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    search: async (
        params: InvoiceSearchParams
    ): Promise<PageResponse<InvoiceResponse>> => {
        const searchParams = new URLSearchParams();

        setParam(searchParams, "invoiceId", params.invoiceId);
        setParam(searchParams, "bookingId", params.bookingId);

        setParam(searchParams, "customerName", params.customerName);
        setParam(searchParams, "customerPhone", params.customerPhone);

        setParam(searchParams, "buyerName", params.buyerName);
        setParam(searchParams, "buyerLegalName", params.buyerLegalName);
        setParam(searchParams, "buyerTaxCode", params.buyerTaxCode);

        setParam(searchParams, "invoiceNumber", params.invoiceNumber);
        setParam(searchParams, "invoiceSymbol", params.invoiceSymbol);
        setParam(searchParams, "taxAuthorityCode", params.taxAuthorityCode);

        setParam(searchParams, "issuedDateFrom", params.issuedDateFrom);
        setParam(searchParams, "issuedDateTo", params.issuedDateTo);

        setParam(searchParams, "totalAmountFrom", params.totalAmountFrom);
        setParam(searchParams, "totalAmountTo", params.totalAmountTo);

        setParam(searchParams, "paymentStatus", params.paymentStatus);
        setParam(searchParams, "status", params.status);

        setParam(searchParams, "page", params.page);
        setParam(searchParams, "size", params.size);

        const query = searchParams.toString();

        return await apiRequest<PageResponse<InvoiceResponse>>(
            query ? `/invoices/search?${query}` : "/invoices/search"
        );
    },
};