import { apiRequest } from "../api/client";
import {
    PageResponse,
    ServiceRequestPayload,
    ServiceResponse,
    ServiceStatusApi,
} from "../dto/service.dto";

function toLastModifiedAtParam(lastModifiedAt: string) {
    return new Date(lastModifiedAt).getTime();
}

function buildServiceFormData(
    payload: ServiceRequestPayload,
    serviceImage?: File | null
) {
    const formData = new FormData();

    formData.append("name", payload.name);
    formData.append("price", String(payload.price));

    if (payload.description !== undefined) {
        formData.append("description", payload.description);
    }

    if (payload.status !== undefined) {
        formData.append("status", payload.status);
    }

    if (serviceImage) {
        formData.append("serviceImage", serviceImage);
    }

    return formData;
}

export const serviceService = {
    getAll: async (): Promise<ServiceResponse[]> => {
        return await apiRequest<ServiceResponse[]>("/services");
    },

    getActive: async (): Promise<ServiceResponse[]> => {
        return await apiRequest<ServiceResponse[]>("/services/active");
    },

    getById: async (id: string): Promise<ServiceResponse> => {
        return await apiRequest<ServiceResponse>(`/services/${id}`);
    },

    create: async (
        payload: ServiceRequestPayload,
        serviceImage?: File | null
    ): Promise<ServiceResponse> => {
        return await apiRequest<ServiceResponse>("/services", {
            method: "POST",
            body: buildServiceFormData(payload, serviceImage),
        });
    },

    update: async (
        id: string,
        payload: ServiceRequestPayload,
        lastModifiedAt: string,
        serviceImage?: File | null
    ): Promise<ServiceResponse> => {
        const lastModifiedAtParam = toLastModifiedAtParam(lastModifiedAt);

        return await apiRequest<ServiceResponse>(
            `/services/${id}?lastModifiedAt=${lastModifiedAtParam}`,
            {
                method: "PUT",
                body: buildServiceFormData(payload, serviceImage),
            }
        );
    },

    remove: async (
        id: string,
        deactivateIfInUse = true
    ): Promise<null> => {
        return await apiRequest<null>(
            `/services/${id}?deactivateIfInUse=${deactivateIfInUse}`,
            {
                method: "DELETE",
            }
        );
    },

    search: async (params: {
        nameKeyword?: string;
        minPrice?: number;
        status?: ServiceStatusApi;
        page?: number;
        size?: number;
    }): Promise<PageResponse<ServiceResponse>> => {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                searchParams.set(key, String(value));
            }
        });

        return await apiRequest<PageResponse<ServiceResponse>>(
            `/services/search?${searchParams.toString()}`
        );
    },
};