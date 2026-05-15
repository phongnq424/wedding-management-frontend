import type { BookingResponse } from "../../../../dto/booking.dto";

export type CustomerFormState = {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    brideName: string;
    groomName: string;
    weddingDate: string;
    numberOfTables: number;
    numberOfReserveTables: number;
    note: string;
};

export type EditBookingLike = BookingResponse & {
    hallPrice?: number | null;
};

export type SelectedServiceState = {
    serviceId: string;
    quantity: number;
};