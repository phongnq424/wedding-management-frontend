export type HallTypeViewModel = {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    status: "Active" | "Inactive";
    lastModifiedAt: string;
    lastModifiedDisplay: string;
};