import { apiRequest } from "../api/client";
import {
    BeverageRequestPayload,
    BeverageResponse,
    BeverageStatusApi,
    PageResponse,
} from "../dto/beverage.dto";

function toLastModifiedAtParam(lastModifiedAt: string) {
    return new Date(lastModifiedAt).getTime();
}

export const beverageService = {
    getAll: async (): Promise<BeverageResponse[]> => {
        return await apiRequest<BeverageResponse[]>("/beverages");
    },

    getActive: async (): Promise<BeverageResponse[]> => {
        return await apiRequest<BeverageResponse[]>("/beverages/active");
    },

    getById: async (id: string): Promise<BeverageResponse> => {
        return await apiRequest<BeverageResponse>(`/beverages/${id}`);
    },

    create: async (
        payload: BeverageRequestPayload
    ): Promise<BeverageResponse> => {
        return await apiRequest<BeverageResponse>("/beverages", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    update: async (
        id: string,
        payload: BeverageRequestPayload,
        lastModifiedAt: string
    ): Promise<BeverageResponse> => {
        const lastModifiedAtParam = toLastModifiedAtParam(lastModifiedAt);

        return await apiRequest<BeverageResponse>(
            `/beverages/${id}?lastModifiedAt=${lastModifiedAtParam}`,
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
            `/beverages/${id}?deactivateIfInUse=${deactivateIfInUse}`,
            {
                method: "DELETE",
            }
        );
    },

    search: async (params: {
        beverageName?: string;
        beverageTypeId?: string;
        priceFrom?: number;
        priceTo?: number;
        status?: BeverageStatusApi;
        page?: number;
        size?: number;
    }): Promise<PageResponse<BeverageResponse>> => {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                searchParams.set(key, String(value));
            }
        });

        return await apiRequest<PageResponse<BeverageResponse>>(
            `/beverages/search?${searchParams.toString()}`
        );
    },
};