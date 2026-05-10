export type HallTypeStatusApi = "ACTIVE" | "INACTIVE";

export interface HallTypeResponse {
    id: string;
    name: string;
    description?: string;
    basePrice: number;
    status: HallTypeStatusApi;
    lastModifiedAt: string;
    lastModifiedBy?: string;
}

export interface HallTypeRequestPayload {
    name: string;
    description?: string;
    basePrice: number;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}