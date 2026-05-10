export type DishStatusApi = "ACTIVE" | "INACTIVE";

export type DishRequestPayload = {
    name: string;
    dishTypeId: string;
    unitPrice: number;
    description?: string;
    status?: DishStatusApi;
};

export type DishResponse = {
    id: string;
    name: string;
    dishTypeId: string;
    dishTypeName: string;
    unitPrice: number;
    dishImage: string | null;
    description: string | null;
    status: DishStatusApi;
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