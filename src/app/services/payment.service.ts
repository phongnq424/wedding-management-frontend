import { apiRequest } from "../api/client";
import type {
    PageResponse,
    PaymentCancelRequestPayload,
    PaymentCreateRequestPayload,
    PaymentOtpChallengeResponse,
    PaymentProcessRequestPayload,
    PaymentResponse,
    PaymentSearchParams,
    PaymentUpdateRequestPayload,
} from "../dto/payment.dto";

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

export const paymentService = {
    getAll: async (): Promise<PaymentResponse[]> => {
        return await apiRequest<PaymentResponse[]>("/payments");
    },

    getById: async (id: string): Promise<PaymentResponse> => {
        return await apiRequest<PaymentResponse>(`/payments/${id}`);
    },

    create: async (
        payload: PaymentCreateRequestPayload
    ): Promise<PaymentResponse> => {
        return await apiRequest<PaymentResponse>("/payments", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    update: async (
        id: string,
        payload: PaymentUpdateRequestPayload,
        lastModifiedAt: string
    ): Promise<PaymentResponse> => {
        const lastModifiedAtParam = toLastModifiedAtParam(lastModifiedAt);

        return await apiRequest<PaymentResponse>(
            `/payments/${id}?lastModifiedAt=${lastModifiedAtParam}`,
            {
                method: "PUT",
                body: JSON.stringify(payload),
            }
        );
    },

    cancel: async (
        id: string,
        payload: PaymentCancelRequestPayload
    ): Promise<PaymentResponse> => {
        return await apiRequest<PaymentResponse>(`/payments/${id}/cancel`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    createProcessPaymentOtp: async (
        paymentId: string
    ): Promise<PaymentOtpChallengeResponse> => {
        return await apiRequest<PaymentOtpChallengeResponse>(
            `/payments/${paymentId}/otp`,
            {
                method: "POST",
            }
        );
    },

    process: async (
        id: string,
        payload: PaymentProcessRequestPayload
    ): Promise<PaymentResponse> => {
        return await apiRequest<PaymentResponse>(`/payments/${id}/process`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    search: async (
        params: PaymentSearchParams
    ): Promise<PageResponse<PaymentResponse>> => {
        const searchParams = new URLSearchParams();

        setParam(searchParams, "paymentId", params.paymentId);
        setParam(searchParams, "bookingId", params.bookingId);
        setParam(searchParams, "customerName", params.customerName);
        setParam(searchParams, "customerPhone", params.customerPhone);

        setParam(searchParams, "paymentType", params.paymentType);
        setParam(searchParams, "paymentMethod", params.paymentMethod);
        setParam(searchParams, "status", params.status);

        setParam(searchParams, "paymentDateFrom", params.paymentDateFrom);
        setParam(searchParams, "paymentDateTo", params.paymentDateTo);

        setParam(searchParams, "amountFrom", params.amountFrom);
        setParam(searchParams, "amountTo", params.amountTo);

        setParam(searchParams, "referenceNumber", params.referenceNumber);

        setParam(searchParams, "page", params.page);
        setParam(searchParams, "size", params.size);

        const query = searchParams.toString();

        return await apiRequest<PageResponse<PaymentResponse>>(
            query ? `/payments/search?${query}` : "/payments/search"
        );
    },
};