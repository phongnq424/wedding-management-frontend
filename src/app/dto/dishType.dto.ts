export type DishTypeStatusApi = "ACTIVE" | "INACTIVE";

export type DishTypeRequestPayload = {
    name: string;
    description?: string;
    status?: DishTypeStatusApi;
};

export type DishTypeResponse = {
    id: string;
    name: string;
    description: string | null;
    status: DishTypeStatusApi;
    lastModifiedAt: string;
    lastModifiedBy: string | null;
};

export type PageResponse<T> = {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
};