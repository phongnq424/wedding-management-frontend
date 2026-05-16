import React from "react";
import { RotateCcw } from "lucide-react";
import { formatVND } from "../../../utils";
import type { DishResponse } from "../../../dto/dish.dto";
import { ItemImage } from "./bookingForm/BookingItemImage";

type ComboSlot = {
    id?: string;
    slotId?: string | number;
    displayOrder?: number;
    dishTypeId?: string;
    dishTypeName?: string;
    defaultDishId?: string;
    defaultDishName?: string;
    unitPrice?: number;
    isReplaceable?: boolean;
};

type DishComboLike = {
    id: string;
    name: string;
    comboDiscountRate?: number | null;
    slots?: ComboSlot[];
};

type Replacement = {
    dishId: string;
    dishName: string;
    price: number;
};

export function ComboSlotTable({
    combo,
    dishes,
    slotReplacements,
    onReplace,
    onResetReplace,
    replacingSlotId,
    setReplacingSlotId,
}: {
    combo: DishComboLike;
    dishes: DishResponse[];
    slotReplacements: Record<string, Replacement>;
    onReplace: (slotId: string, dishId: string, dishName: string, price: number) => void;
    onResetReplace: (slotId: string) => void;
    replacingSlotId: string | null;
    setReplacingSlotId: (id: string | null) => void;
}) {
    const slots = combo.slots ?? [];
    const activeDishes = dishes.filter((dish) => dish.status === "ACTIVE");

    const getSlotId = (slot: ComboSlot, index: number) => {
        return String(slot.slotId ?? slot.id ?? index);
    };

    const getDefaultDish = (slot: ComboSlot) => {
        return activeDishes.find((dish) => dish.id === slot.defaultDishId);
    };

    const getSlotDefaultPrice = (slot: ComboSlot) => {
        const defaultDish = getDefaultDish(slot);
        return slot.unitPrice ?? defaultDish?.unitPrice ?? 0;
    };

    const originalMenuTotal = slots.reduce((sum, slot) => {
        return sum + getSlotDefaultPrice(slot);
    }, 0);

    const currentMenuTotal = slots.reduce((sum, slot, index) => {
        const slotId = getSlotId(slot, index);
        const replacement = slotReplacements[slotId];

        return sum + (replacement?.price ?? getSlotDefaultPrice(slot));
    }, 0);

    const discountRate = combo.comboDiscountRate ?? 0;
    const discountedMenuTotal = currentMenuTotal * (1 - discountRate / 100);
    const menuSavingAmount = Math.max(currentMenuTotal - discountedMenuTotal, 0);

    if (slots.length === 0) {
        return (
            <div className="rounded-2xl border border-border p-4 text-sm text-muted-foreground">
                Combo này chưa có slot món ăn hoặc API combo chưa trả danh sách slot.
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-3 bg-secondary flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{combo.name}</span>

                <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">
                    {discountRate}% discount applied
                </span>
            </div>

            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left text-xs text-muted-foreground border-b border-border bg-secondary/40">
                        <th className="px-4 py-2.5 font-medium">#</th>
                        <th className="px-4 py-2.5 font-medium">Loại món</th>
                        <th className="px-4 py-2.5 font-medium">Món ăn</th>
                        <th className="px-4 py-2.5 font-medium text-right">Đơn giá</th>
                        <th className="px-4 py-2.5 font-medium text-center">Thao tác</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-border">
                    {slots.map((slot, index) => {
                        const slotId = getSlotId(slot, index);
                        const replacement = slotReplacements[slotId];

                        const defaultDish = getDefaultDish(slot);

                        const currentDish = replacement
                            ? activeDishes.find((dish) => dish.id === replacement.dishId)
                            : defaultDish;

                        const currentDishName =
                            replacement?.dishName ??
                            slot.defaultDishName ??
                            defaultDish?.name ??
                            "N/A";

                        const defaultDishName =
                            slot.defaultDishName ??
                            defaultDish?.name ??
                            "Món gốc";

                        const defaultPrice = getSlotDefaultPrice(slot);
                        const currentPrice = replacement?.price ?? defaultPrice;
                        const priceDiff = currentPrice - defaultPrice;

                        const isReplacing = replacingSlotId === slotId;

                        const alternativeDishes = activeDishes.filter((dish) => {
                            const sameType =
                                !slot.dishTypeId || dish.dishTypeId === slot.dishTypeId;

                            return sameType && dish.id !== slot.defaultDishId;
                        });

                        return (
                            <React.Fragment key={slotId}>
                                <tr
                                    className={`hover:bg-secondary/30 transition-colors ${replacement ? "bg-blue-50/30" : ""
                                        }`}
                                >
                                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                                        {slot.displayOrder ?? index + 1}
                                    </td>

                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 rounded-md bg-secondary text-xs font-medium text-muted-foreground">
                                            {slot.dishTypeName ?? "N/A"}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <ItemImage
                                                src={currentDish?.dishImage}
                                                label={currentDishName}
                                                className="h-12 w-16 rounded-lg"
                                            />

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span
                                                        className={`truncate ${replacement
                                                                ? "font-medium text-blue-700"
                                                                : "text-foreground"
                                                            }`}
                                                    >
                                                        {currentDishName}
                                                    </span>

                                                    {replacement && (
                                                        <span className="text-xs text-muted-foreground line-through truncate">
                                                            {defaultDishName}
                                                        </span>
                                                    )}
                                                </div>

                                                {replacement && (
                                                    <p className="text-xs text-blue-600 mt-0.5">
                                                        Đã thay món
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-right font-mono">
                                        <span className="text-foreground">
                                            {formatVND(currentPrice)}
                                        </span>

                                        {priceDiff !== 0 && (
                                            <span
                                                className={`ml-1 text-xs ${priceDiff > 0
                                                        ? "text-red-600"
                                                        : "text-emerald-600"
                                                    }`}
                                            >
                                                ({priceDiff > 0 ? "+" : ""}
                                                {formatVND(priceDiff)})
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-4 py-3 text-center">
                                        {slot.isReplaceable !== false ? (
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setReplacingSlotId(isReplacing ? null : slotId)
                                                    }
                                                    className="px-2.5 py-1 rounded-lg border border-blue-300 text-blue-700 bg-blue-50 text-xs font-medium hover:bg-blue-100 transition-all flex items-center gap-1"
                                                >
                                                    <RotateCcw className="w-3 h-3" />
                                                    Thay thế
                                                </button>

                                                {replacement && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            onResetReplace(slotId);
                                                            setReplacingSlotId(null);
                                                        }}
                                                        className="px-2 py-1 rounded-lg border border-muted text-muted-foreground bg-secondary text-xs hover:bg-secondary/80 transition-all"
                                                        title="Khôi phục món gốc"
                                                    >
                                                        <RotateCcw className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-lg">
                                                Cố định
                                            </span>
                                        )}
                                    </td>
                                </tr>

                                {isReplacing && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-4 py-3 bg-blue-50/50 border-b border-blue-100"
                                        >
                                            {alternativeDishes.length === 0 ? (
                                                <p className="text-xs text-muted-foreground">
                                                    Không có món thay thế cùng loại.
                                                </p>
                                            ) : (
                                                <>
                                                    <p className="text-xs text-blue-700 font-medium mb-3">
                                                        Chọn món thay thế ({slot.dishTypeName ?? "món"}):
                                                    </p>

                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                        {alternativeDishes.map((dish) => {
                                                            const dishPrice = dish.unitPrice ?? 0;
                                                            const diff = dishPrice - defaultPrice;

                                                            return (
                                                                <button
                                                                    key={dish.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        onReplace(
                                                                            slotId,
                                                                            dish.id,
                                                                            dish.name,
                                                                            dishPrice
                                                                        );
                                                                        setReplacingSlotId(null);
                                                                    }}
                                                                    className="text-left rounded-lg border border-blue-200 bg-white hover:bg-blue-100 hover:border-blue-400 transition-all overflow-hidden group"
                                                                >
                                                                    <ItemImage
                                                                        src={dish.dishImage}
                                                                        label={dish.name}
                                                                        className="h-20 w-full"
                                                                    />

                                                                    <div className="p-2">
                                                                        <p className="text-xs font-semibold text-blue-900 line-clamp-1">
                                                                            {dish.name}
                                                                        </p>

                                                                        <p
                                                                            className={`text-xs mt-0.5 ${diff > 0
                                                                                    ? "text-red-600"
                                                                                    : diff < 0
                                                                                        ? "text-emerald-600"
                                                                                        : "text-muted-foreground"
                                                                                }`}
                                                                        >
                                                                            {diff === 0
                                                                                ? "Cùng giá"
                                                                                : `${diff > 0 ? "+" : ""}${formatVND(diff)}`}
                                                                        </p>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>

            <div className="border-t border-border bg-secondary/40 px-4 py-3 space-y-1.5 text-sm">
                <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Tổng món gốc</span>
                    <span className="font-mono text-foreground">
                        {formatVND(originalMenuTotal)}
                    </span>
                </div>

                {currentMenuTotal !== originalMenuTotal && (
                    <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Tổng sau thay đổi món</span>
                        <span className="font-mono text-foreground">
                            {formatVND(currentMenuTotal)}
                        </span>
                    </div>
                )}

                <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                        Giảm giá combo ({discountRate}%)
                    </span>
                    <span className="font-mono text-rose-600">
                        -{formatVND(menuSavingAmount)}
                    </span>
                </div>

                <div className="flex justify-between gap-3 border-t border-border pt-1.5 font-semibold">
                    <span className="text-foreground">Tổng món sau discount</span>
                    <span className="font-mono text-accent">
                        {formatVND(discountedMenuTotal)}
                    </span>
                </div>
            </div>
        </div>
    );
}