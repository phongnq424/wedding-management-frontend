import { apiRequest } from "../api/client";
import { HallRequestPayload, HallResponse } from "../dto/hall.dto";

function buildHallFormData(payload: HallRequestPayload, hallImage?: File | null) {
    const formData = new FormData();

    formData.append("data", JSON.stringify(payload));

    if (hallImage) {
        formData.append("hallImage", hallImage);
    }

    return formData;
}

function toLastModifiedAtParam(lastModifiedAt: string) {
    return new Date(lastModifiedAt).getTime();
}

export const hallService = {
    getAll: async (): Promise<HallResponse[]> => {
        return await apiRequest<HallResponse[]>("/halls");
    },

    getById: async (id: string): Promise<HallResponse> => {
        return await apiRequest<HallResponse>(`/halls/${id}`);
    },

    search: async (params: {
        hallName?: string;
        hallTypeId?: string;
        minTablesFrom?: number;
        maxTablesTo?: number;
        status?: "ACTIVE" | "INACTIVE";
        page?: number;
        size?: number;
    }) => {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                searchParams.set(key, String(value));
            }
        });

        return await apiRequest<{
            content: HallResponse[];
            totalElements: number;
            totalPages: number;
            number: number;
            size: number;
        }>(`/halls/search?${searchParams.toString()}`);
    },

    create: async (
        payload: HallRequestPayload,
        hallImage?: File | null
    ): Promise<HallResponse> => {
        return await apiRequest<HallResponse>("/halls", {
            method: "POST",
            body: buildHallFormData(payload, hallImage),
        });
    },

    update: async (
        id: string,
        payload: HallRequestPayload,
        lastModifiedAt: string,
        hallImage?: File | null
    ): Promise<HallResponse> => {
        const lastModifiedAtParam = toLastModifiedAtParam(lastModifiedAt);
        console.log("Hall:", payload);
        return await apiRequest<HallResponse>(
            `/halls/${id}?lastModifiedAt=${lastModifiedAtParam}`,
            {
                method: "PUT",
                body: buildHallFormData(payload, hallImage),
            }
        );
    },

    remove: async (id: string): Promise<null> => {
        return await apiRequest<null>(`/halls/${id}`, {
            method: "DELETE",
        });
    },
};