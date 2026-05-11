import { apiRequest } from "../api/client";
import {
    PageResponse,
    WeddingPackageRequestPayload,
    WeddingPackageResponse,
    WeddingPackageStatusApi,
} from "../dto/weddingPackage.dto";

function toLastModifiedAtParam(lastModifiedAt: string) {
    return new Date(lastModifiedAt).getTime();
}

function appendArrayParams(
    searchParams: URLSearchParams,
    key: string,
    values?: string[]
) {
    if (!values || values.length === 0) return;

    values.forEach((value) => {
        if (value) {
            searchParams.append(key, value);
        }
    });
}

export const weddingPackageService = {
    getAll: async (): Promise<WeddingPackageResponse[]> => {
        return await apiRequest<WeddingPackageResponse[]>("/wedding-packages");
    },

    getById: async (id: string): Promise<WeddingPackageResponse> => {
        return await apiRequest<WeddingPackageResponse>(
            `/wedding-packages/${id}`
        );
    },

    create: async (
        payload: WeddingPackageRequestPayload
    ): Promise<WeddingPackageResponse> => {
        return await apiRequest<WeddingPackageResponse>("/wedding-packages", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    update: async (
        id: string,
        payload: WeddingPackageRequestPayload,
        lastModifiedAt: string
    ): Promise<WeddingPackageResponse> => {
        const lastModifiedAtParam = toLastModifiedAtParam(lastModifiedAt);

        return await apiRequest<WeddingPackageResponse>(
            `/wedding-packages/${id}?lastModifiedAt=${lastModifiedAtParam}`,
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
            `/wedding-packages/${id}?deactivateIfInUse=${deactivateIfInUse}`,
            {
                method: "DELETE",
            }
        );
    },

    search: async (params: {
        packageName?: string;
        selectedDishComboIds?: string[];
        selectedServiceIds?: string[];
        selectedBeverageIds?: string[];
        hallTypeId?: string;
        shiftId?: string;
        status?: WeddingPackageStatusApi;
        page?: number;
        size?: number;
    }): Promise<PageResponse<WeddingPackageResponse>> => {
        const searchParams = new URLSearchParams();

        if (params.packageName) {
            searchParams.set("packageName", params.packageName);
        }

        appendArrayParams(
            searchParams,
            "selectedDishComboIds",
            params.selectedDishComboIds
        );

        appendArrayParams(
            searchParams,
            "selectedServiceIds",
            params.selectedServiceIds
        );

        appendArrayParams(
            searchParams,
            "selectedBeverageIds",
            params.selectedBeverageIds
        );

        if (params.hallTypeId) {
            searchParams.set("hallTypeId", params.hallTypeId);
        }

        if (params.shiftId) {
            searchParams.set("shiftId", params.shiftId);
        }

        if (params.status) {
            searchParams.set("status", params.status);
        }

        if (params.page !== undefined) {
            searchParams.set("page", String(params.page));
        }

        if (params.size !== undefined) {
            searchParams.set("size", String(params.size));
        }

        return await apiRequest<PageResponse<WeddingPackageResponse>>(
            `/wedding-packages/search?${searchParams.toString()}`
        );
    },
};