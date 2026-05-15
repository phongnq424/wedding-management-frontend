import type { BookingLineRequest, BookingResponse } from "../../../dto/booking.dto";
import type { WeddingPackageResponse } from "../../../dto/weddingPackage.dto";
import type { ServiceResponse } from "../../../dto/service.dto";
import type { DishResponse } from "../../../dto/dish.dto";
import type { BeverageResponse } from "../../../dto/beverage.dto";
import { displayStatus, toIsoDateOnly } from "./booking.types";

export type BookingTableRow = BookingResponse & {
    displayStatus: string;
    bookingDateText: string;
    weddingDateText: string;
    depositStatus: "Unpaid" | "Partial" | "Paid" | "Settled";
};

export function mapBookingToRow(item: BookingResponse): BookingTableRow {
    const deposit = item.depositAmount ?? 0;
    const total = item.bookingAmount ?? 0;
    const remaining = item.remainingAmount ?? Math.max(total - deposit, 0);

    return {
        ...item,
        displayStatus: displayStatus(item.status),
        bookingDateText: toIsoDateOnly(item.bookingDate),
        weddingDateText: toIsoDateOnly(item.weddingDate),
        depositStatus: remaining <= 0 ? "Settled" : deposit > 0 ? "Partial" : "Unpaid",
    };
}

export function getPackagePricePerTable(pkg: WeddingPackageResponse | null | undefined) {
    if (!pkg) return 0;
    return pkg.estimatedPackageTotal ?? pkg.estimatedDiscountedMenuComboPrice ?? 0;
}

export function buildPackageDraftLines(args: {
    pkg: WeddingPackageResponse | null;
    selectedComboId: string | null;
    extraServices: ServiceResponse[];
    extraDishes: Array<{ dish: DishResponse; quantity: number }>;
}): BookingLineRequest[] {
    const lines: BookingLineRequest[] = [];
    let order = 1;

    args.extraServices.forEach((service) => {
        lines.push({
            itemType: "SERVICE",
            itemId: service.id,
            itemName: service.name,
            quantity: 1,
            unitPrice: service.price ?? 0,
            discountAmount: 0,
            taxRate: 0,
            sourceType: "MANUAL_EXTRA",
            editable: true,
            removable: true,
            displayOrder: order++,
        });
    });

    args.extraDishes.forEach(({ dish, quantity }) => {
        lines.push({
            itemType: "DISH",
            itemId: dish.id,
            itemName: dish.name,
            quantity,
            unitPrice: dish.unitPrice ?? 0,
            discountAmount: 0,
            taxRate: 0,
            sourceType: "MANUAL_EXTRA",
            editable: true,
            removable: true,
            displayOrder: order++,
        });
    });

    return lines;
}

export function buildManualDraftLines(args: {
    services: ServiceResponse[];
    dishes: Array<{ dish: DishResponse; quantity: number }>;
    beverages: Array<{ beverage: BeverageResponse; quantity: number }>;
}): BookingLineRequest[] {
    const lines: BookingLineRequest[] = [];
    let order = 1;

    args.services.forEach((service) => {
        lines.push({
            itemType: "SERVICE",
            itemId: service.id,
            itemName: service.name,
            quantity: 1,
            unitPrice: service.price ?? 0,
            discountAmount: 0,
            taxRate: 0,
            sourceType: "MANUAL_EXTRA",
            editable: true,
            removable: true,
            displayOrder: order++,
        });
    });

    args.dishes.forEach(({ dish, quantity }) => {
        lines.push({
            itemType: "DISH",
            itemId: dish.id,
            itemName: dish.name,
            quantity,
            unitPrice: dish.unitPrice ?? 0,
            discountAmount: 0,
            taxRate: 0,
            sourceType: "MANUAL_EXTRA",
            editable: true,
            removable: true,
            displayOrder: order++,
        });
    });

    args.beverages.forEach(({ beverage, quantity }) => {
        lines.push({
            itemType: "BEVERAGE",
            itemId: beverage.id,
            itemName: beverage.name,
            quantity,
            unitPrice: beverage.unitPrice ?? 0,
            discountAmount: 0,
            taxRate: 0,
            sourceType: "MANUAL_EXTRA",
            editable: true,
            removable: true,
            displayOrder: order++,
        });
    });

    return lines;
}