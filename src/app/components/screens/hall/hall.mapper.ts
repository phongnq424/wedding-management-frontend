import type { HallResponse } from "../../../dto/hall.dto";
import type { HallViewModel } from "./hall.types";
import { formatDateTimeForUser } from "./hall.utils";

export function mapHallToViewModel(hall: HallResponse): HallViewModel {
    return {
        id: hall.id,
        name: hall.name,
        type: hall.hallTypeName,
        minTables: hall.minTables,
        maxTables: hall.maxTables,
        status: hall.status === "ACTIVE" ? "Active" : "Inactive",
        image: hall.hallImage,
        hallTypeId: hall.hallTypeId,
        lastModified: hall.lastModifiedAt || "",
        lastModifiedDisplay: formatDateTimeForUser(hall.lastModifiedAt),
        basePrice: hall.basePrice,
        pricings: hall.pricings ?? [],
    };
}