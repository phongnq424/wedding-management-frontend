import { apiRequest } from "../api/client";
import {
    BeverageTypeRequestPayload,
    BeverageTypeResponse,
    BeverageTypeStatusApi,
    PageResponse,
} from "../dto/beverageType.dto";

function toLastModifiedAtParam(lastModifiedAt: string) {
    return new Date(lastModifiedAt).getTime();
}

export const beverageTypeService = {
    getAll: async (): Promise<BeverageTypeResponse[]> => {
        return await apiRequest<BeverageTypeResponse[]>("/beverage-types");
    },

    getActive: async (): Promise<BeverageTypeResponse[]> => {
        return await apiRequest<BeverageTypeResponse[]>("/beverage-types/active");
    },

    getById: async (id: string): Promise<BeverageTypeResponse> => {
        return await apiRequest<BeverageTypeResponse>(`/beverage-types/${id}`);
    },

    create: async (
        payload: BeverageTypeRequestPayload
    ): Promise<BeverageTypeResponse> => {
        return await apiRequest<BeverageTypeResponse>("/beverage-types", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    update: async (
        id: string,
        payload: BeverageTypeRequestPayload,
        lastModifiedAt: string
    ): Promise<BeverageTypeResponse> => {
        const lastModifiedAtParam = toLastModifiedAtParam(lastModifiedAt);

        return await apiRequest<BeverageTypeResponse>(
            `/beverage-types/${id}?lastModifiedAt=${lastModifiedAtParam}`,
            {
                method: "PUT",
                body: JSON.stringify(payload),
            }
        );
    },

    remove: async (
        id: string,
        deactivateIfInUse = true
    ): Promise<null> => {
        return await apiRequest<null>(
            `/beverage-types/${id}?deactivateIfInUse=${deactivateIfInUse}`,
            {
                method: "DELETE",
            }
        );
    },

    search: async (params: {
        nameKeyword?: string;
        status?: BeverageTypeStatusApi;
        page?: number;
        size?: number;
    }): Promise<PageResponse<BeverageTypeResponse>> => {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                searchParams.set(key, String(value));
            }
        });

        return await apiRequest<PageResponse<BeverageTypeResponse>>(
            `/beverage-types/search?${searchParams.toString()}`
        );
    },
};