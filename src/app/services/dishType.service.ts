import { apiRequest } from "../api/client";
import {
    DishTypeRequestPayload,
    DishTypeResponse,
    DishTypeStatusApi,
    PageResponse,
} from "../dto/dishType.dto";

function toLastModifiedAtParam(lastModifiedAt: string) {
    return new Date(lastModifiedAt).getTime();
}

export const dishTypeService = {
    getAll: async (): Promise<DishTypeResponse[]> => {
        return await apiRequest<DishTypeResponse[]>("/dish-types");
    },

    getActive: async (): Promise<DishTypeResponse[]> => {
        return await apiRequest<DishTypeResponse[]>("/dish-types/active");
    },

    getById: async (id: string): Promise<DishTypeResponse> => {
        return await apiRequest<DishTypeResponse>(`/dish-types/${id}`);
    },

    create: async (
        payload: DishTypeRequestPayload
    ): Promise<DishTypeResponse> => {
        return await apiRequest<DishTypeResponse>("/dish-types", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    update: async (
        id: string,
        payload: DishTypeRequestPayload,
        lastModifiedAt: string
    ): Promise<DishTypeResponse> => {
        const lastModifiedAtParam = toLastModifiedAtParam(lastModifiedAt);

        return await apiRequest<DishTypeResponse>(
            `/dish-types/${id}?lastModifiedAt=${lastModifiedAtParam}`,
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
            `/dish-types/${id}?deactivateIfInUse=${deactivateIfInUse}`,
            {
                method: "DELETE",
            }
        );
    },

    search: async (params: {
        nameKeyword?: string;
        status?: DishTypeStatusApi;
        page?: number;
        size?: number;
    }): Promise<PageResponse<DishTypeResponse>> => {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                searchParams.set(key, String(value));
            }
        });

        return await apiRequest<PageResponse<DishTypeResponse>>(
            `/dish-types/search?${searchParams.toString()}`
        );
    },
};