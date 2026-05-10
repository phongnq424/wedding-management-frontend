export type ShiftStatusApi = "ACTIVE" | "INACTIVE";

export type ShiftRequestPayload = {
    name: string;
    startTime: string; // "HH:mm" hoặc "HH:mm:ss"
    endTime: string;   // "HH:mm" hoặc "HH:mm:ss"
    status?: ShiftStatusApi;
};

export type ShiftResponse = {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    status: ShiftStatusApi;
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