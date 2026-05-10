import type { HallTypeResponse } from "../../../dto/hallType.dto";
import type { HallTypeViewModel } from "./hallType.types";

function formatDateTimeForUser(value?: string) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Ho_Chi_Minh",
    }).format(date);
}

export function mapHallTypeToViewModel(
    hallType: HallTypeResponse
): HallTypeViewModel {
    return {
        id: hallType.id,
        name: hallType.name,
        description: hallType.description ?? "",
        basePrice: hallType.basePrice,
        status: hallType.status === "ACTIVE" ? "Active" : "Inactive",
        lastModifiedAt: hallType.lastModifiedAt || "",
        lastModifiedDisplay: formatDateTimeForUser(hallType.lastModifiedAt),
    };
}