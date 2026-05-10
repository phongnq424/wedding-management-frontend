import { apiRequest } from "../api/client";
import {
    DishRequestPayload,
    DishResponse,
    DishStatusApi,
    PageResponse,
} from "../dto/dish.dto";

function buildDishFormData(
    payload: DishRequestPayload,
    dishImage?: File | null
) {
    const formData = new FormData();

    formData.append("name", payload.name);
    formData.append("dishTypeId", payload.dishTypeId);
    formData.append("unitPrice", String(payload.unitPrice));

    if (payload.description !== undefined) {
        formData.append("description", payload.description);
    }

    if (payload.status !== undefined) {
        formData.append("status", payload.status);
    }

    if (dishImage) {
        formData.append("dishImage", dishImage);
    }

    return formData;
}

function toLastModifiedAtParam(lastModifiedAt: string) {
    return new Date(lastModifiedAt).getTime();
}

export const dishService = {
    getAll: async (): Promise<DishResponse[]> => {
        return await apiRequest<DishResponse[]>("/dishes");
    },

    getActive: async (): Promise<DishResponse[]> => {
        return await apiRequest<DishResponse[]>("/dishes/active");
    },

    getActiveByType: async (dishTypeId: string): Promise<DishResponse[]> => {
        return await apiRequest<DishResponse[]>(
            `/dishes/active/by-type/${dishTypeId}`
        );
    },

    getById: async (id: string): Promise<DishResponse> => {
        return await apiRequest<DishResponse>(`/dishes/${id}`);
    },

    create: async (
        payload: DishRequestPayload,
        dishImage?: File | null
    ): Promise<DishResponse> => {
        return await apiRequest<DishResponse>("/dishes", {
            method: "POST",
            body: buildDishFormData(payload, dishImage),
        });
    },

    update: async (
        id: string,
        payload: DishRequestPayload,
        lastModifiedAt: string,
        dishImage?: File | null
    ): Promise<DishResponse> => {
        const lastModifiedAtParam = toLastModifiedAtParam(lastModifiedAt);

        return await apiRequest<DishResponse>(
            `/dishes/${id}?lastModifiedAt=${lastModifiedAtParam}`,
            {
                method: "PUT",
                body: buildDishFormData(payload, dishImage),
            }
        );
    },

    remove: async (
        id: string,
        deactivateIfInUse = true
    ): Promise<null> => {
        return await apiRequest<null>(
            `/dishes/${id}?deactivateIfInUse=${deactivateIfInUse}`,
            {
                method: "DELETE",
            }
        );
    },

    search: async (params: {
        dishName?: string;
        dishTypeId?: string;
        priceFrom?: number;
        priceTo?: number;
        status?: DishStatusApi;
        page?: number;
        size?: number;
    }): Promise<PageResponse<DishResponse>> => {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                searchParams.set(key, String(value));
            }
        });

        return await apiRequest<PageResponse<DishResponse>>(
            `/dishes/search?${searchParams.toString()}`
        );
    },
};