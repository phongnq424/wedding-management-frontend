import { apiRequest } from "../api/client";
import {
    HallTypeRequestPayload,
    HallTypeResponse,
    HallTypeStatusApi,
    PageResponse,
} from "../dto/hallType.dto";

function toLastModifiedAtParam(lastModifiedAt: string) {
    return new Date(lastModifiedAt).getTime();
}

export const hallTypeService = {
    getAll: async (): Promise<HallTypeResponse[]> => {
        return await apiRequest<HallTypeResponse[]>("/hall-types");
    },

    getById: async (id: string): Promise<HallTypeResponse> => {
        return await apiRequest<HallTypeResponse>(`/hall-types/${id}`);
    },

    create: async (
        payload: HallTypeRequestPayload
    ): Promise<HallTypeResponse> => {
        return await apiRequest<HallTypeResponse>("/hall-types", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    update: async (
        id: string,
        payload: HallTypeRequestPayload,
        lastModifiedAt: string
    ): Promise<HallTypeResponse> => {
        const lastModifiedAtParam = toLastModifiedAtParam(lastModifiedAt);

        return await apiRequest<HallTypeResponse>(
            `/hall-types/${id}?lastModifiedAt=${lastModifiedAtParam}`,
            {
                method: "PUT",
                body: JSON.stringify(payload),
            }
        );
    },

    remove: async (id: string): Promise<null> => {
        return await apiRequest<null>(`/hall-types/${id}`, {
            method: "DELETE",
        });
    },

    search: async (params: {
        nameKeyword?: string;
        minBasePrice?: number;
        status?: HallTypeStatusApi;
        page?: number;
        size?: number;
    }): Promise<PageResponse<HallTypeResponse>> => {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                searchParams.set(key, String(value));
            }
        });

        return await apiRequest<PageResponse<HallTypeResponse>>(
            `/hall-types/search?${searchParams.toString()}`
        );
    },
};