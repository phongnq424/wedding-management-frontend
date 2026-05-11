import { apiRequest } from "../api/client";
import type {
    BookingRequestPayload,
    BookingResponse,
    BookingSearchParams,
    CancelBookingRequestPayload,
    CancelBookingResponse,
    EditBookingLinesRequestPayload,
    HallAvailabilityResponse,
    HallAvailabilitySearchParams,
    PageResponse,
} from "../dto/booking.dto";

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

export const bookingService = {
    getAll: async (): Promise<BookingResponse[]> => {
        return await apiRequest<BookingResponse[]>("/bookings");
    },

    getById: async (id: string): Promise<BookingResponse> => {
        return await apiRequest<BookingResponse>(`/bookings/${id}`);
    },

    create: async (
        payload: BookingRequestPayload
    ): Promise<BookingResponse> => {
        return await apiRequest<BookingResponse>("/bookings", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    update: async (
        id: string,
        payload: BookingRequestPayload,
        lastModifiedAt: string
    ): Promise<BookingResponse> => {
        const lastModifiedAtParam = toLastModifiedAtParam(lastModifiedAt);

        return await apiRequest<BookingResponse>(
            `/bookings/${id}?lastModifiedAt=${lastModifiedAtParam}`,
            {
                method: "PUT",
                body: JSON.stringify(payload),
            }
        );
    },

    search: async (
        params: BookingSearchParams
    ): Promise<PageResponse<BookingResponse>> => {
        const searchParams = new URLSearchParams();

        setParam(searchParams, "customerName", params.customerName);
        setParam(searchParams, "customerPhone", params.customerPhone);
        setParam(searchParams, "customerEmail", params.customerEmail);

        setParam(searchParams, "brideName", params.brideName);
        setParam(searchParams, "groomName", params.groomName);

        setParam(searchParams, "bookingDateFrom", params.bookingDateFrom);
        setParam(searchParams, "bookingDateTo", params.bookingDateTo);

        setParam(searchParams, "weddingDateFrom", params.weddingDateFrom);
        setParam(searchParams, "weddingDateTo", params.weddingDateTo);

        setParam(searchParams, "hallId", params.hallId);
        setParam(searchParams, "shiftId", params.shiftId);

        setParam(searchParams, "status", params.status);

        setParam(searchParams, "page", params.page);
        setParam(searchParams, "size", params.size);

        const query = searchParams.toString();

        return await apiRequest<PageResponse<BookingResponse>>(
            query ? `/bookings/search?${query}` : "/bookings/search"
        );
    },

    checkHallAvailability: async (
        params: HallAvailabilitySearchParams
    ): Promise<PageResponse<HallAvailabilityResponse>> => {
        const searchParams = new URLSearchParams();

        setParam(searchParams, "bookingDate", params.bookingDate);
        setParam(searchParams, "shiftId", params.shiftId);
        setParam(searchParams, "capacity", params.capacity);
        setParam(searchParams, "page", params.page);
        setParam(searchParams, "size", params.size);

        return await apiRequest<PageResponse<HallAvailabilityResponse>>(
            `/bookings/hall-availability?${searchParams.toString()}`
        );
    },

    cancel: async (
        id: string,
        payload: CancelBookingRequestPayload
    ): Promise<CancelBookingResponse> => {
        return await apiRequest<CancelBookingResponse>(
            `/bookings/${id}/cancel`,
            {
                method: "POST",
                body: JSON.stringify(payload),
            }
        );
    },

    updateDishLines: async (
        id: string,
        payload: EditBookingLinesRequestPayload
    ): Promise<BookingResponse> => {
        return await apiRequest<BookingResponse>(
            `/bookings/${id}/dish-lines`,
            {
                method: "PUT",
                body: JSON.stringify(payload),
            }
        );
    },

    updateServiceLines: async (
        id: string,
        payload: EditBookingLinesRequestPayload
    ): Promise<BookingResponse> => {
        return await apiRequest<BookingResponse>(
            `/bookings/${id}/service-lines`,
            {
                method: "PUT",
                body: JSON.stringify(payload),
            }
        );
    },

    updateBeverageLines: async (
        id: string,
        payload: EditBookingLinesRequestPayload
    ): Promise<BookingResponse> => {
        return await apiRequest<BookingResponse>(
            `/bookings/${id}/beverage-lines`,
            {
                method: "PUT",
                body: JSON.stringify(payload),
            }
        );
    },
};