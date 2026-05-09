import { apiRequest } from "../api/client";
import {
    HallResponse,
    CreateHallRequest,
    UpdateHallRequest,
} from "../dto/hall.dto";

export const hallService = {
    getAll: async () => {
        return await apiRequest<HallResponse[]>("/halls");
    },

    getById: async (id: string) => {
        return await apiRequest<HallResponse>(`/halls/${id}`);
    },

    create: async (payload: CreateHallRequest) => {
        return await apiRequest<HallResponse>("/halls", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    update: async (id: string, payload: UpdateHallRequest) => {
        return await apiRequest<HallResponse>(`/halls/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
    },

    remove: async (id: string) => {
        return await apiRequest<null>(`/halls/${id}`, {
            method: "DELETE",
        });
    },
};