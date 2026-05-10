export type BeverageStatusApi = "ACTIVE" | "INACTIVE";

export type BeverageRequestPayload = {
    name: string;
    beverageTypeId: string;
    unitPrice: number;
    beverageImage?: string;
    description?: string;
    status?: BeverageStatusApi;
};

export type BeverageResponse = {
    id: string;
    name: string;
    beverageTypeId: string;
    beverageTypeName: string;
    unitPrice: number;
    beverageImage: string | null;
    description: string | null;
    status: BeverageStatusApi;
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