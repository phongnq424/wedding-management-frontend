import type {
    BookingLineRequest,
    BookingLineResponse,
    BookingResponse,
} from "../../../dto/booking.dto";
import type { WeddingPackageResponse } from "../../../dto/weddingPackage.dto";
import type { ServiceResponse } from "../../../dto/service.dto";
import type { DishResponse } from "../../../dto/dish.dto";
import type { BeverageResponse } from "../../../dto/beverage.dto";
import { formatVND } from "../../../utils";
import { displayStatus, toIsoDateOnly } from "./booking.types";

export type BookingTableRow = BookingResponse & {
    displayStatus: string;
    bookingDateText: string;
    weddingDateText: string;
    depositStatus: "Unpaid" | "Partial" | "Paid" | "Settled";
};

export type SelectedService =
    | ServiceResponse
    | {
        service: ServiceResponse;
        quantity: number;
    };

export type SelectedDish = {
    dish: DishResponse;
    quantity: number;
};

export type SelectedBeverage = {
    beverage: BeverageResponse;
    quantity: number;
};

type AnyRecord = Record<string, unknown>;

function asRecord(value: unknown): AnyRecord {
    return value && typeof value === "object" ? (value as AnyRecord) : {};
}

function asArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
}

function asString(value: unknown): string | null {
    if (typeof value === "string" && value.trim()) return value.trim();
    return null;
}

function asNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    return null;
}

function normalizeQuantity(value: unknown, fallback = 1) {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) return fallback;
    return Math.max(1, Math.floor(numberValue));
}

function normalizeServiceSelection(item: SelectedService) {
    if ("service" in item) {
        return {
            service: item.service,
            quantity: normalizeQuantity(item.quantity),
        };
    }

    return {
        service: item,
        quantity: 1,
    };
}

function getEntityName(item: AnyRecord, fallback = "N/A") {
    return (
        asString(item.name) ??
        asString(item.serviceName) ??
        asString(item.dishName) ??
        asString(item.beverageName) ??
        asString(item.benefitDescription) ??
        asString(item.description) ??
        fallback
    );
}

function getEntityId(item: AnyRecord): string | null {
    return (
        asString(item.id) ??
        asString(item.serviceId) ??
        asString(item.dishId) ??
        asString(item.beverageId) ??
        asString(item.benefitId)
    );
}

function getEntityPrice(item: AnyRecord) {
    return (
        asNumber(item.price) ??
        asNumber(item.unitPrice) ??
        asNumber(item.amount) ??
        asNumber(item.discountAmount) ??
        0
    );
}

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

    return pkg.estimatedDiscountedMenuComboPrice ?? 0;
}

/**
 * Dòng gửi lên BE ở PACKAGE mode:
 * - Chỉ gửi phần phát sinh/thêm ngoài gói.
 * - Gói, combo, benefit, discount nên để BE build từ packageId + selectedMenuComboId
 *   để tránh FE gửi duplicate snapshot.
 */
export function buildPackageDraftLines(args: {
    pkg: WeddingPackageResponse | null;
    selectedComboId: string | null;
    extraServices: SelectedService[];
    extraDishes: SelectedDish[];
    extraBeverages?: SelectedBeverage[];
}): BookingLineRequest[] {
    const lines: BookingLineRequest[] = [];
    let order = 1;

    args.extraServices.forEach((item) => {
        const { service, quantity } = normalizeServiceSelection(item);

        lines.push({
            itemType: "SERVICE",
            itemId: service.id,
            itemName: service.name,
            quantity,
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
            quantity: normalizeQuantity(quantity),
            unitPrice: dish.unitPrice ?? 0,
            discountAmount: 0,
            taxRate: 0,
            sourceType: "MANUAL_EXTRA",
            editable: true,
            removable: true,
            displayOrder: order++,
        });
    });
    args.extraBeverages?.forEach(({ beverage, quantity }) => {
        lines.push({
            itemType: "BEVERAGE",
            itemId: beverage.id,
            itemName: beverage.name,
            quantity: normalizeQuantity(quantity),
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

export function buildManualDraftLines(args: {
    services: SelectedService[];
    dishes: SelectedDish[];
    beverages: SelectedBeverage[];
}): BookingLineRequest[] {
    const lines: BookingLineRequest[] = [];
    let order = 1;

    args.services.forEach((item) => {
        const { service, quantity } = normalizeServiceSelection(item);

        lines.push({
            itemType: "SERVICE",
            itemId: service.id,
            itemName: service.name,
            quantity,
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
            quantity: normalizeQuantity(quantity),
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
            quantity: normalizeQuantity(quantity),
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

export function getPackageBenefitTexts(pkg: WeddingPackageResponse | null | undefined): string[] {
    if (!pkg) return [];

    const raw = asRecord(pkg);

    const benefitItems = asArray(raw.packageBenefitList)
        .map((item) => {
            const record = asRecord(item);

            const itemName =
                asString(record.itemName) ??
                asString(record.benefitDescription) ??
                asString(record.description) ??
                asString(record.name);

            if (!itemName) return null;

            const quantity = asNumber(record.quantity);
            const customerPayAmount = asNumber(record.customerPayAmount);
            const totalValue = asNumber(record.totalValue);
            const note = asString(record.note);

            const quantityText = quantity && quantity > 1 ? ` x${quantity}` : "";
            const payText =
                customerPayAmount === 0
                    ? " - khách trả 0đ"
                    : customerPayAmount && customerPayAmount > 0
                        ? ` - khách trả ${formatVND(customerPayAmount)}`
                        : "";

            const valueText =
                totalValue && totalValue > 0
                    ? ` (${formatVND(totalValue)})`
                    : "";

            return `${itemName}${quantityText}${payText}${valueText}${note ? ` - ${note}` : ""}`;
        })
        .filter((item): item is string => Boolean(item));

    if (benefitItems.length > 0) {
        return Array.from(new Set(benefitItems));
    }

    const summary = asString(raw.benefitSummary);
    return summary ? summary.split("\n").filter(Boolean) : [];
}

export function getPackageConditionTexts(pkg: WeddingPackageResponse | null | undefined): string[] {
    if (!pkg) return [];

    const raw = asRecord(pkg);

    const conditionItems = asArray(raw.conditionList)
        .map((item) => {
            const record = asRecord(item);

            const conditionType = asString(record.conditionType);
            const hallTypeName = asString(record.hallTypeName);
            const shiftName = asString(record.shiftName);
            const numericValue = asNumber(record.numericValue);
            const conditionValue = asString(record.conditionValue);

            if (!conditionType) return null;

            switch (conditionType) {
                case "SHIFT":
                    return shiftName ? `Áp dụng cho ca: ${shiftName}` : "Áp dụng theo ca";

                case "HALL_TYPE":
                    return hallTypeName ? `Áp dụng cho loại sảnh: ${hallTypeName}` : "Áp dụng theo loại sảnh";

                case "MIN_TABLES":
                    return numericValue !== null ? `Số bàn tối thiểu: ${numericValue}` : "Có điều kiện số bàn tối thiểu";

                case "MAX_TABLES":
                    return numericValue !== null ? `Số bàn tối đa: ${numericValue}` : "Có điều kiện số bàn tối đa";

                case "CUSTOM":
                    return conditionValue ? `Điều kiện khác: ${conditionValue}` : "Điều kiện khác";

                default:
                    if (conditionValue) return `${conditionType}: ${conditionValue}`;
                    if (numericValue !== null) return `${conditionType}: ${numericValue}`;
                    if (shiftName) return `${conditionType}: ${shiftName}`;
                    if (hallTypeName) return `${conditionType}: ${hallTypeName}`;
                    return conditionType;
            }
        })
        .filter((item): item is string => Boolean(item));

    if (conditionItems.length > 0) {
        return Array.from(new Set(conditionItems));
    }

    const summary = asString(raw.conditionSummary);
    return summary ? summary.split("\n").filter(Boolean) : [];
}

export function buildPackagePreviewLines(pkg: WeddingPackageResponse | null | undefined): BookingLineRequest[] {
    if (!pkg) return [];

    const raw = asRecord(pkg);
    const lines: BookingLineRequest[] = [];
    let order = 1;

    asArray(raw.includedServiceList).forEach((item) => {
        const record = asRecord(item);

        lines.push({
            itemType: "SERVICE",
            itemId: getEntityId(record),
            itemName:
                asString(record.serviceName) ??
                asString(record.itemName) ??
                getEntityName(record, "Dịch vụ trong gói"),
            quantity: normalizeQuantity(record.quantity),
            unitPrice: 0,
            discountAmount: 0,
            taxRate: 0,
            sourceType: "PACKAGE_INCLUDED",
            editable: false,
            removable: false,
            displayOrder: order++,
        });
    });

    asArray(raw.beverageAllowanceList).forEach((item) => {
        const record = asRecord(item);

        lines.push({
            itemType: "BEVERAGE",
            itemId:
                asString(record.beverageId) ??
                asString(record.itemId) ??
                getEntityId(record),
            itemName:
                asString(record.beverageName) ??
                asString(record.itemName) ??
                getEntityName(record, "Thức uống trong gói"),
            quantity: normalizeQuantity(record.allowanceQuantity ?? record.quantity),
            unitPrice: 0,
            discountAmount: 0,
            taxRate: 0,
            sourceType: "PACKAGE_INCLUDED",
            editable: false,
            removable: false,
            displayOrder: order++,
        });
    });

    asArray(raw.packageBenefitList).forEach((item) => {
        const record = asRecord(item);

        lines.push({
            itemType: (asString(record.itemType) as BookingLineRequest["itemType"]) ?? "BENEFIT",
            itemId:
                asString(record.itemId) ??
                getEntityId(record),
            itemName:
                asString(record.itemName) ??
                getEntityName(record, "Quyền lợi trong gói"),
            quantity: normalizeQuantity(record.quantity),
            unitPrice: 0,
            discountAmount: 0,
            taxRate: 0,
            sourceType: "PACKAGE_BENEFIT",
            sourceId: asString(record.id),
            sourceName: "Package benefit",
            editable: false,
            removable: false,
            displayOrder: order++,
        });
    });

    const discountAmount =
        asNumber(raw.estimatedSavingsAmount) ??
        asNumber(raw.menuDiscountSavingsAmount) ??
        asNumber(raw.estimatedDiscountAmount) ??
        asNumber(raw.totalDiscountAmount) ??
        asNumber(raw.discountAmount) ??
        0;

    if (discountAmount > 0) {
        lines.push({
            itemType: "DISCOUNT",
            itemId: null,
            itemName: "Ưu đãi gói tiệc",
            quantity: 1,
            unitPrice: 0,
            discountAmount,
            taxRate: 0,
            sourceType: "PACKAGE_DISCOUNT",
            editable: false,
            removable: false,
            displayOrder: order++,
        });
    }

    return lines;
}

export function getBookingLinePriceLabel(line: BookingLineRequest | BookingLineResponse) {
    const sourceType = line.sourceType;
    const itemType = line.itemType;

    if (sourceType === "PACKAGE_INCLUDED") {
        return "Đã tính trong gói";
    }

    if (sourceType === "PACKAGE_BENEFIT" || itemType === "BENEFIT") {
        return "Quà tặng";
    }

    if (sourceType === "PACKAGE_DISCOUNT" || itemType === "DISCOUNT") {
        const amount = Math.abs(
            Number(line.discountAmount ?? ("lineAmount" in line ? line.lineAmount : 0) ?? 0)
        );

        return amount > 0 ? `-${formatVND(amount)}` : "Đã trừ trong gói";
    }

    const quantity = normalizeQuantity(line.quantity);
    const unitPrice = Number(line.unitPrice ?? 0);
    const lineAmount =
        "lineAmount" in line && typeof line.lineAmount === "number"
            ? line.lineAmount
            : unitPrice * quantity - Number(line.discountAmount ?? 0);

    if (sourceType === "MANUAL_EXTRA" && lineAmount > 0) {
        return `+${formatVND(lineAmount)}`;
    }

    return formatVND(lineAmount);
}

export function getBookingLineUnitPriceLabel(line: BookingLineRequest | BookingLineResponse) {
    if (line.sourceType === "PACKAGE_INCLUDED") return "Đã tính trong gói";
    if (line.sourceType === "PACKAGE_BENEFIT" || line.itemType === "BENEFIT") return "Quà tặng";
    if (line.sourceType === "PACKAGE_DISCOUNT" || line.itemType === "DISCOUNT") return "Ưu đãi";

    return formatVND(Number(line.unitPrice ?? 0));
}