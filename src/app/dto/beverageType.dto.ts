export type BeverageTypeStatusApi = "ACTIVE" | "INACTIVE";

export type BeverageTypeRequestPayload = {
    name: string;
    description?: string;
    status?: BeverageTypeStatusApi;
};

export type BeverageTypeResponse = {
    id: string;
    name: string;
    description: string | null;
    status: BeverageTypeStatusApi;
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