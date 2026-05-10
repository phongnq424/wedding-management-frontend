export type ServiceStatusApi = "ACTIVE" | "INACTIVE";

export type ServiceRequestPayload = {
    name: string;
    price: number;
    description?: string;
    status?: ServiceStatusApi;
};

export type ServiceResponse = {
    id: string;
    name: string;
    price: number;
    serviceImage: string | null;
    description: string | null;
    status: ServiceStatusApi;
    lastModifiedAt: string | null;
    lastModifiedBy: string | null;
};

export type PageResponse<T> = {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
};