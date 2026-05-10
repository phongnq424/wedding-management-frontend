import { apiRequest } from "../api/client";
import {
    PageResponse,
    ShiftRequestPayload,
    ShiftResponse,
    ShiftStatusApi,
} from "../dto/shift.dto";

function toLastModifiedAtParam(lastModifiedAt: string) {
    return new Date(lastModifiedAt).getTime();
}

function normalizeTime(value: string) {
    if (!value) return value;

    // input type="time" thường trả "HH:mm"
    // Java LocalTime nhận tốt "HH:mm:ss", nên chuẩn hóa cho chắc
    return value.length === 5 ? `${value}:00` : value;
}

function normalizePayload(payload: ShiftRequestPayload): ShiftRequestPayload {
    return {
        ...payload,
        startTime: normalizeTime(payload.startTime),
        endTime: normalizeTime(payload.endTime),
    };
}

export const shiftService = {
    getAll: async (): Promise<ShiftResponse[]> => {
        return await apiRequest<ShiftResponse[]>("/shifts");
    },

    getActive: async (): Promise<ShiftResponse[]> => {
        return await apiRequest<ShiftResponse[]>("/shifts/active");
    },

    getById: async (id: string): Promise<ShiftResponse> => {
        return await apiRequest<ShiftResponse>(`/shifts/${id}`);
    },

    create: async (
        payload: ShiftRequestPayload
    ): Promise<ShiftResponse> => {
        return await apiRequest<ShiftResponse>("/shifts", {
            method: "POST",
            body: JSON.stringify(normalizePayload(payload)),
        });
    },

    update: async (
        id: string,
        payload: ShiftRequestPayload,
        lastModifiedAt: string
    ): Promise<ShiftResponse> => {
        const lastModifiedAtParam = toLastModifiedAtParam(lastModifiedAt);

        return await apiRequest<ShiftResponse>(
            `/shifts/${id}?lastModifiedAt=${lastModifiedAtParam}`,
            {
                method: "PUT",
                body: JSON.stringify(normalizePayload(payload)),
            }
        );
    },

    remove: async (
        id: string,
        deactivateIfInUse = true
    ): Promise<null> => {
        return await apiRequest<null>(
            `/shifts/${id}?deactivateIfInUse=${deactivateIfInUse}`,
            {
                method: "DELETE",
            }
        );
    },

    search: async (params: {
        shiftName?: string;
        startTimeFrom?: string;
        endTimeTo?: string;
        status?: ShiftStatusApi;
        page?: number;
        size?: number;
    }): Promise<PageResponse<ShiftResponse>> => {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                const finalValue =
                    key === "startTimeFrom" || key === "endTimeTo"
                        ? normalizeTime(String(value))
                        : String(value);

                searchParams.set(key, finalValue);
            }
        });

        return await apiRequest<PageResponse<ShiftResponse>>(
            `/shifts/search?${searchParams.toString()}`
        );
    },
};