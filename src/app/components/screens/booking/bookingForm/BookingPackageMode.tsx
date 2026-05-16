import { Check, Plus, Sparkles, Trash2, UtensilsCrossed, Wine } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import type { WeddingPackageResponse } from "../../../../dto/weddingPackage.dto";
import type { DishComboResponse } from "../../../../dto/dishCombo.dto";
import type { DishResponse } from "../../../../dto/dish.dto";
import type { ServiceResponse } from "../../../../dto/service.dto";
import type { BeverageResponse } from "../../../../dto/beverage.dto";
import type { BookingLineRequest } from "../../../../dto/booking.dto";
import { formatVND } from "../../../../utils";
import {
    getBookingLinePriceLabel,
    getPackagePricePerTable,
} from "./../booking.mapper";
import { ComboSlotTable } from "./../ComboSlotTable";
import { ItemImage } from "./BookingItemImage";
import type { SelectedServiceState } from "./BookingForm.types";

type Props = {
    activePackages: WeddingPackageResponse[];
    selectedPackage: WeddingPackageResponse | null;
    selectedPackageId: string | null;
    setSelectedPackageId: Dispatch<SetStateAction<string | null>>;

    selectedComboId: string | null;
    setSelectedComboId: Dispatch<SetStateAction<string | null>>;
    selectedCombo: DishComboResponse | null;
    dishCombos: DishComboResponse[];
    dishes: DishResponse[];
    activeDishes: DishResponse[];


    extraDishes: Array<{ dishId: string; quantity: number }>;
    setExtraDishes: Dispatch<SetStateAction<Array<{ dishId: string; quantity: number }>>>;
    selectedExtraDishes: Array<{ dish: DishResponse; quantity: number }>;

    activeServices: ServiceResponse[];
    activeBeverages: BeverageResponse[];

    packagePreviewLines: BookingLineRequest[];
    packageBenefits: string[];
    packageConditions: string[];

    comboSlotReplacements: Record<string, { dishId: string; dishName: string; price: number }>;
    setComboSlotReplacements: Dispatch<
        SetStateAction<Record<string, { dishId: string; dishName: string; price: number }>>
    >;
    replacingSlotId: string | null;
    setReplacingSlotId: Dispatch<SetStateAction<string | null>>;

    extraServicesState: SelectedServiceState[];
    setExtraServicesState: Dispatch<SetStateAction<SelectedServiceState[]>>;
    extraServices: Array<{ service: ServiceResponse; quantity: number }>;

    extraBeverages: Array<{ beverageId: string; quantity: number }>;
    setExtraBeverages: Dispatch<SetStateAction<Array<{ beverageId: string; quantity: number }>>>;
    selectedExtraBeverages: Array<{ beverage: BeverageResponse; quantity: number }>;

    addService: (
        serviceId: string,
        setter: Dispatch<SetStateAction<SelectedServiceState[]>>
    ) => void;

    updateServiceQuantity: (
        serviceId: string,
        quantity: number,
        setter: Dispatch<SetStateAction<SelectedServiceState[]>>
    ) => void;

    removeService: (
        serviceId: string,
        setter: Dispatch<SetStateAction<SelectedServiceState[]>>
    ) => void;
};

export function BookingPackageMode({
    activePackages,
    selectedPackage,
    selectedPackageId,
    setSelectedPackageId,

    selectedComboId,
    setSelectedComboId,
    selectedCombo,
    dishCombos,
    dishes,
    activeDishes,

    extraDishes,
    setExtraDishes,
    selectedExtraDishes,

    activeServices,
    activeBeverages,

    packagePreviewLines,
    packageBenefits,
    packageConditions,

    comboSlotReplacements,
    setComboSlotReplacements,
    replacingSlotId,
    setReplacingSlotId,

    extraServicesState,
    setExtraServicesState,
    extraServices,

    extraBeverages,
    setExtraBeverages,
    selectedExtraBeverages,

    addService,
    updateServiceQuantity,
    removeService,
}: Props) {
    const [showDishPicker, setShowDishPicker] = useState(false);
    const [showServicePicker, setShowServicePicker] = useState(false);
    const [showBeveragePicker, setShowBeveragePicker] = useState(false);


    const includedServiceLines = packagePreviewLines.filter(
        (line) => line.sourceType === "PACKAGE_INCLUDED" && line.itemType === "SERVICE"
    );

    const includedBeverageLines = packagePreviewLines.filter(
        (line) => line.sourceType === "PACKAGE_INCLUDED" && line.itemType === "BEVERAGE"
    );

    const benefitLines = packagePreviewLines.filter(
        (line) => line.sourceType === "PACKAGE_BENEFIT"
    );

    const discountLines = packagePreviewLines.filter(
        (line) => line.sourceType === "PACKAGE_DISCOUNT" || line.itemType === "DISCOUNT"
    );

    const availableExtraServices = activeServices.filter(
        (item) => !extraServicesState.some((selected) => selected.serviceId === item.id)
    );

    const availableExtraBeverages = activeBeverages.filter(
        (beverage) => !extraBeverages.some((item) => item.beverageId === beverage.id)
    );
    const availableExtraDishes = activeDishes.filter(
        (dish) => !extraDishes.some((item) => item.dishId === dish.id)
    );

    return (
        <div className="space-y-6">
            <section>
                <label className="block text-sm font-medium text-foreground mb-2">
                    Chọn gói tiệc cưới
                </label>

                <div className="grid grid-cols-1 gap-3">
                    {activePackages.map((pkg) => (
                        <button
                            key={pkg.id}
                            type="button"
                            onClick={() => {
                                setSelectedPackageId(pkg.id);
                                setSelectedComboId(
                                    pkg.defaultMenuComboId ?? pkg.menuComboOptions?.[0] ?? null
                                );
                                setComboSlotReplacements({});
                                setShowDishPicker(false);
                                setShowServicePicker(false);
                                setShowBeveragePicker(false);
                            }}
                            className={`text-left rounded-xl border p-4 transition-all ${selectedPackageId === pkg.id
                                ? "border-accent bg-accent/5 shadow-sm"
                                : "border-border hover:bg-secondary"
                                }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        {selectedPackageId === pkg.id && (
                                            <Check className="w-4 h-4 text-accent flex-shrink-0" />
                                        )}

                                        <p className="text-sm font-semibold text-foreground truncate">
                                            {pkg.packageName}
                                        </p>
                                    </div>

                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                        {pkg.description}
                                    </p>

                                    <p className="text-xs text-muted-foreground mt-2">
                                        {pkg.numberOfIncludedServices ?? pkg.includedServiceList.length} dịch vụ ·{" "}
                                        {pkg.numberOfMenuCombos ?? pkg.menuComboOptions.length} combo menu ·{" "}
                                        {pkg.numberOfBeverageAllowances ?? pkg.beverageAllowanceList.length} thức uống
                                    </p>
                                </div>

                                <div className="text-right flex-shrink-0">
                                    <p className="text-base font-bold text-accent font-mono">
                                        {formatVND(getPackagePricePerTable(pkg))}
                                    </p>
                                    <p className="text-xs text-muted-foreground">menu / bàn</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {selectedPackage && (
                <>
                    <section className="rounded-2xl border border-border overflow-hidden">
                        <div className="px-4 py-3 bg-secondary flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <UtensilsCrossed className="w-4 h-4 text-accent" />
                                    Thực đơn
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Combo menu là phần tính theo bàn; món thêm ngoài combo là doanh thu phát sinh.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowDishPicker((prev) => !prev)}
                                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-accent/30 bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/15 transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                {showDishPicker ? "Ẩn chọn món" : "Thêm món ăn"}
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                    Combo menu chính
                                </label>

                                <select
                                    value={selectedComboId ?? ""}
                                    onChange={(e) => {
                                        setSelectedComboId(e.target.value || null);
                                        setComboSlotReplacements({});
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                                >
                                    <option value="">-- Chọn combo --</option>

                                    {selectedPackage.menuComboOptions.map((comboId) => {
                                        const combo = dishCombos.find((item) => item.id === comboId);

                                        return (
                                            <option key={comboId} value={comboId}>
                                                {combo?.name ?? comboId}
                                            </option>
                                        );
                                    })}
                                </select>

                                {selectedCombo && (
                                    <div className="mt-3">
                                        <ComboSlotTable
                                            combo={selectedCombo as any}
                                            dishes={dishes}
                                            slotReplacements={comboSlotReplacements}
                                            onReplace={(slotId, dishId, dishName, price) =>
                                                setComboSlotReplacements((prev) => ({
                                                    ...prev,
                                                    [slotId]: { dishId, dishName, price },
                                                }))
                                            }
                                            replacingSlotId={replacingSlotId}
                                            setReplacingSlotId={setReplacingSlotId}
                                        />
                                    </div>
                                )}
                            </div>

                            {selectedExtraDishes.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Món ăn thêm ngoài combo
                                    </p>

                                    <div className="space-y-2">
                                        {selectedExtraDishes.map(({ dish, quantity }, index) => (
                                            <div
                                                key={`${dish.id}-${index}`}
                                                className="flex items-center gap-3 px-3 py-2 bg-card rounded-xl border border-border"
                                            >
                                                <ItemImage
                                                    src={dish.dishImage}
                                                    label={dish.name}
                                                    className="h-12 w-16 rounded-lg"
                                                />

                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {dish.name}
                                                    </p>

                                                    <p className="text-xs text-muted-foreground font-mono">
                                                        Phát sinh thêm · {formatVND(dish.unitPrice ?? 0)}
                                                    </p>
                                                </div>

                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={quantity}
                                                    onChange={(e) =>
                                                        setExtraDishes((prev) =>
                                                            prev.map((item, idx) =>
                                                                idx === index
                                                                    ? {
                                                                        ...item,
                                                                        quantity: Math.max(
                                                                            1,
                                                                            Number(e.target.value) || 1
                                                                        ),
                                                                    }
                                                                    : item
                                                            )
                                                        )
                                                    }
                                                    className="w-20 px-2 py-1 rounded-lg border border-border bg-input-background text-sm"
                                                />

                                                <span className="w-28 text-right text-xs font-mono text-accent">
                                                    +{formatVND((dish.unitPrice ?? 0) * quantity)}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setExtraDishes((prev) =>
                                                            prev.filter((_, idx) => idx !== index)
                                                        )
                                                    }
                                                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {showDishPicker && (
                                <div className="space-y-3 rounded-2xl border border-dashed border-accent/30 bg-accent/5 p-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-xs font-semibold text-accent uppercase tracking-wide flex items-center gap-1.5">
                                            <UtensilsCrossed className="w-3.5 h-3.5" />
                                            Chọn món ăn thêm
                                        </p>

                                        {availableExtraDishes.length === 0 && (
                                            <span className="text-xs text-muted-foreground">
                                                Không còn món để thêm
                                            </span>
                                        )}
                                    </div>

                                    {availableExtraDishes.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {availableExtraDishes.map((dish) => (
                                                <button
                                                    key={dish.id}
                                                    type="button"
                                                    onClick={() =>
                                                        setExtraDishes((prev) => [
                                                            ...prev,
                                                            { dishId: dish.id, quantity: 1 },
                                                        ])
                                                    }
                                                    className="group text-left rounded-xl border border-border bg-card overflow-hidden hover:border-accent/60 hover:shadow-sm transition-all"
                                                >
                                                    <ItemImage
                                                        src={dish.dishImage}
                                                        label={dish.name}
                                                        className="h-24 w-full"
                                                    />

                                                    <div className="p-3">
                                                        <p className="text-sm font-semibold text-foreground line-clamp-1">
                                                            {dish.name}
                                                        </p>

                                                        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                                                            {dish.description || dish.dishTypeName || "Món ăn"}
                                                        </p>

                                                        <p className="text-sm font-mono font-semibold text-accent mt-2">
                                                            +{formatVND(dish.unitPrice ?? 0)}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-border overflow-hidden">
                        <div className="px-4 py-3 bg-secondary flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    Dịch vụ tiệc
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Bao gồm dịch vụ có sẵn trong gói và dịch vụ phát sinh thêm.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowServicePicker((prev) => !prev)}
                                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-accent/30 bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/15 transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                {showServicePicker ? "Ẩn chọn thêm" : "Thêm dịch vụ"}
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {includedServiceLines.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Đã bao gồm trong gói
                                    </p>

                                    <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                                        {includedServiceLines.map((line) => (
                                            <div
                                                key={`${line.sourceType}-${line.itemType}-${line.itemId}-${line.displayOrder}`}
                                                className="flex items-center justify-between gap-3 px-4 py-3 text-sm bg-card"
                                            >
                                                <div className="min-w-0">
                                                    <p className="font-medium text-foreground truncate">
                                                        {line.itemName}
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        Số lượng cố định trong gói · x{line.quantity ?? 1}
                                                    </p>
                                                </div>

                                                <span className="font-mono text-xs text-muted-foreground">
                                                    {getBookingLinePriceLabel(line)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {extraServices.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Dịch vụ thêm ngoài gói
                                    </p>

                                    <div className="space-y-2">
                                        {extraServices.map(({ service, quantity }) => (
                                            <div
                                                key={service.id}
                                                className="flex items-center gap-3 px-3 py-2 bg-card rounded-xl border border-border"
                                            >
                                                <ItemImage
                                                    src={service.serviceImage}
                                                    label={service.name}
                                                    className="h-12 w-16 rounded-lg"
                                                />

                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {service.name}
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        Phát sinh thêm · {formatVND(service.price ?? 0)} / lần
                                                    </p>
                                                </div>

                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={quantity}
                                                    onChange={(e) =>
                                                        updateServiceQuantity(
                                                            service.id,
                                                            Number(e.target.value),
                                                            setExtraServicesState
                                                        )
                                                    }
                                                    className="w-20 px-2 py-1 rounded-lg border border-border bg-input-background text-sm"
                                                />

                                                <span className="w-28 text-right text-xs font-mono text-accent">
                                                    +{formatVND((service.price ?? 0) * quantity)}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeService(service.id, setExtraServicesState)
                                                    }
                                                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {includedServiceLines.length === 0 && extraServices.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Gói này chưa có dịch vụ bao gồm. Bấm “Thêm dịch vụ” nếu muốn thêm phát sinh.
                                </p>
                            )}

                            {showServicePicker && (
                                <div className="space-y-3 rounded-2xl border border-dashed border-accent/30 bg-accent/5 p-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-xs font-semibold text-accent uppercase tracking-wide">
                                            Chọn dịch vụ thêm
                                        </p>

                                        {availableExtraServices.length === 0 && (
                                            <span className="text-xs text-muted-foreground">
                                                Không còn dịch vụ để thêm
                                            </span>
                                        )}
                                    </div>

                                    {availableExtraServices.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {availableExtraServices.map((service) => (
                                                <button
                                                    key={service.id}
                                                    type="button"
                                                    onClick={() => addService(service.id, setExtraServicesState)}
                                                    className="group text-left rounded-xl border border-border bg-card overflow-hidden hover:border-accent/60 hover:shadow-sm transition-all"
                                                >
                                                    <div className="relative">
                                                        <ItemImage
                                                            src={service.serviceImage}
                                                            label={service.name}
                                                            className="h-24 w-full"
                                                        />

                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />

                                                        <div className="absolute bottom-2 left-2 right-2">
                                                            <p className="text-xs font-semibold text-white line-clamp-1">
                                                                {service.name}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="p-3">
                                                        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                                                            {service.description || "Dịch vụ bổ sung cho booking"}
                                                        </p>

                                                        <p className="text-sm font-mono font-semibold text-accent mt-2">
                                                            +{formatVND(service.price ?? 0)}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-border overflow-hidden">
                        <div className="px-4 py-3 bg-secondary flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    Thức uống
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Bao gồm hạn mức trong gói, số lượng ước tính và phần phát sinh thêm.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowBeveragePicker((prev) => !prev)}
                                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-accent/30 bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/15 transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                {showBeveragePicker ? "Ẩn chọn thêm" : "Thêm thức uống"}
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {includedBeverageLines.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Hạn mức đã bao gồm trong gói
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {includedBeverageLines.map((line) => {
                                            const beverage = activeBeverages.find(
                                                (item) => item.id === line.itemId
                                            );

                                            return (
                                                <div
                                                    key={`${line.sourceType}-${line.itemId}-${line.displayOrder}`}
                                                    className="rounded-xl border border-border bg-card overflow-hidden"
                                                >
                                                    <ItemImage
                                                        src={beverage?.beverageImage}
                                                        label={line.itemName}
                                                        className="h-24 w-full"
                                                    />

                                                    <div className="p-3">
                                                        <p className="text-sm font-semibold text-foreground line-clamp-1">
                                                            {line.itemName}
                                                        </p>

                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Hạn mức trong gói · x{line.quantity ?? 1}
                                                        </p>

                                                        <p className="text-xs font-mono text-muted-foreground mt-2">
                                                            {getBookingLinePriceLabel(line)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}


                            {selectedExtraBeverages.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Thức uống thêm ngoài gói
                                    </p>

                                    <div className="space-y-2">
                                        {selectedExtraBeverages.map(({ beverage, quantity }, index) => (
                                            <div
                                                key={`${beverage.id}-${index}`}
                                                className="flex items-center gap-3 px-3 py-2 bg-card rounded-xl border border-border"
                                            >
                                                <ItemImage
                                                    src={beverage.beverageImage}
                                                    label={beverage.name}
                                                    className="h-12 w-16 rounded-lg"
                                                />

                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {beverage.name}
                                                    </p>

                                                    <p className="text-xs text-muted-foreground font-mono">
                                                        Phát sinh thêm · {formatVND(beverage.unitPrice ?? 0)}
                                                    </p>
                                                </div>

                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={quantity}
                                                    onChange={(e) =>
                                                        setExtraBeverages((prev) =>
                                                            prev.map((item, idx) =>
                                                                idx === index
                                                                    ? {
                                                                        ...item,
                                                                        quantity: Math.max(
                                                                            1,
                                                                            Number(e.target.value) || 1
                                                                        ),
                                                                    }
                                                                    : item
                                                            )
                                                        )
                                                    }
                                                    className="w-20 px-2 py-1 rounded-lg border border-border bg-input-background text-sm"
                                                />

                                                <span className="w-28 text-right text-xs font-mono text-accent">
                                                    +{formatVND((beverage.unitPrice ?? 0) * quantity)}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setExtraBeverages((prev) =>
                                                            prev.filter((_, idx) => idx !== index)
                                                        )
                                                    }
                                                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {showBeveragePicker && (
                                <div className="space-y-3 rounded-2xl border border-dashed border-accent/30 bg-accent/5 p-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-xs font-semibold text-accent uppercase tracking-wide flex items-center gap-1.5">
                                            <Wine className="w-3.5 h-3.5" />
                                            Chọn thức uống thêm
                                        </p>

                                        {availableExtraBeverages.length === 0 && (
                                            <span className="text-xs text-muted-foreground">
                                                Không còn thức uống để thêm
                                            </span>
                                        )}
                                    </div>

                                    {availableExtraBeverages.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {availableExtraBeverages.map((beverage) => (
                                                <button
                                                    key={beverage.id}
                                                    type="button"
                                                    onClick={() =>
                                                        setExtraBeverages((prev) => [
                                                            ...prev,
                                                            { beverageId: beverage.id, quantity: 1 },
                                                        ])
                                                    }
                                                    className="group text-left rounded-xl border border-border bg-card overflow-hidden hover:border-accent/60 hover:shadow-sm transition-all"
                                                >
                                                    <ItemImage
                                                        src={beverage.beverageImage}
                                                        label={beverage.name}
                                                        className="h-24 w-full"
                                                    />

                                                    <div className="p-3">
                                                        <p className="text-sm font-semibold text-foreground line-clamp-1">
                                                            {beverage.name}
                                                        </p>

                                                        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                                                            {beverage.description ||
                                                                beverage.beverageTypeName ||
                                                                "Thức uống"}
                                                        </p>

                                                        <p className="text-sm font-mono font-semibold text-accent mt-2">
                                                            +{formatVND(beverage.unitPrice ?? 0)}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {packageBenefits.length > 0 && (
                        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
                            <p className="text-sm font-semibold text-emerald-800">
                                Quyền lợi / Benefit trong gói
                            </p>

                            <div className="space-y-2">
                                {packageBenefits.map((benefit, index) => (
                                    <div
                                        key={`${benefit}-${index}`}
                                        className="flex items-start justify-between gap-3 text-sm"
                                    >
                                        <span className="text-emerald-900">{benefit}</span>

                                        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                            Quà tặng
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {benefitLines.length > 0 && packageBenefits.length === 0 && (
                        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
                            <p className="text-sm font-semibold text-emerald-800">
                                Quyền lợi / Benefit trong gói
                            </p>

                            <div className="space-y-2">
                                {benefitLines.map((line) => (
                                    <div
                                        key={`${line.sourceType}-${line.itemId}-${line.displayOrder}`}
                                        className="flex items-start justify-between gap-3 text-sm"
                                    >
                                        <div>
                                            <p className="text-emerald-900 font-medium">
                                                {line.itemName}
                                            </p>
                                            <p className="text-xs text-emerald-800/70">
                                                x{line.quantity ?? 1}
                                            </p>
                                        </div>

                                        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                            {getBookingLinePriceLabel(line)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {packageConditions.length > 0 && (
                        <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
                            <p className="text-sm font-semibold text-amber-800">
                                Điều kiện áp dụng
                            </p>

                            <ul className="list-disc pl-5 space-y-1 text-sm text-amber-900">
                                {packageConditions.map((condition, index) => (
                                    <li key={`${condition}-${index}`}>{condition}</li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {discountLines.length > 0 && (
                        <section className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 space-y-2">
                            <p className="text-sm font-semibold text-rose-800">
                                Ưu đãi gói tiệc
                            </p>

                            <div className="space-y-2">
                                {discountLines.map((line) => (
                                    <div
                                        key={`${line.sourceType}-${line.itemName}-${line.displayOrder}`}
                                        className="flex items-center justify-between gap-3 text-sm"
                                    >
                                        <span className="text-rose-900">
                                            {line.itemName ?? "Ưu đãi gói tiệc"}
                                        </span>

                                        <span className="font-mono text-xs text-rose-700">
                                            {getBookingLinePriceLabel(line)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}