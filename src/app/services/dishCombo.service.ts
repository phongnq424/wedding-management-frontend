import { apiRequest } from "../api/client";
import {
    DishComboRequestPayload,
    DishComboResponse,
    DishComboStatusApi,
    PageResponse,
} from "../dto/dishCombo.dto";

function toLastModifiedAtParam(lastModifiedAt: string) {
    return new Date(lastModifiedAt).getTime();
}

export const dishComboService = {
    getAll: async (): Promise<DishComboResponse[]> => {
        return await apiRequest<DishComboResponse[]>("/dish-combos");
    },

    getById: async (id: string): Promise<DishComboResponse> => {
        return await apiRequest<DishComboResponse>(`/dish-combos/${id}`);
    },

    create: async (
        payload: DishComboRequestPayload
    ): Promise<DishComboResponse> => {
        return await apiRequest<DishComboResponse>("/dish-combos", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    update: async (
        id: string,
        payload: DishComboRequestPayload,
        lastModifiedAt: string
    ): Promise<DishComboResponse> => {
        const lastModifiedAtParam = toLastModifiedAtParam(lastModifiedAt);

        return await apiRequest<DishComboResponse>(
            `/dish-combos/${id}?lastModifiedAt=${lastModifiedAtParam}`,
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
            `/dish-combos/${id}?deactivateIfInUse=${deactivateIfInUse}`,
            {
                method: "DELETE",
            }
        );
    },

    search: async (params: {
        comboName?: string;
        dishTypeId?: string;
        dishName?: string;
        comboDiscountRateFrom?: number;
        comboDiscountRateTo?: number;
        isReplaceable?: boolean;
        status?: DishComboStatusApi;
        page?: number;
        size?: number;
    }): Promise<PageResponse<DishComboResponse>> => {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                searchParams.set(key, String(value));
            }
        });

        return await apiRequest<PageResponse<DishComboResponse>>(
            `/dish-combos/search?${searchParams.toString()}`
        );
    },
};