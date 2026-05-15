import { Check, Sparkles, Trash2, UtensilsCrossed } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { WeddingPackageResponse } from "../../../../dto/weddingPackage.dto";
import type { DishComboResponse } from "../../../../dto/dishCombo.dto";
import type { DishResponse } from "../../../../dto/dish.dto";
import type { ServiceResponse } from "../../../../dto/service.dto";
import { formatVND } from "../../../../utils";
import {
    getBookingLinePriceLabel,
    getPackagePricePerTable,
} from "./../booking.mapper";
import { ComboSlotTable } from "./../ComboSlotTable";
import { ItemImage } from "./BookingItemImage";
import type { SelectedServiceState } from "./BookingForm.types";
import type { BookingLineRequest } from "../../../../dto/booking.dto";

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
    activeServices: ServiceResponse[];

    packagePreviewLines: BookingLineRequest[];
    packageBenefits: string[];
    packageConditions: string[];

    comboSlotReplacements: Record<string, { dishId: string; dishName: string; price: number }>;
    setComboSlotReplacements: Dispatch<
        SetStateAction<Record<string, { dishId: string; dishName: string; price: number }>>
    >;
    replacingSlotId: string | null;
    setReplacingSlotId: Dispatch<SetStateAction<string | null>>;

    estimatedSoftDrinkQuantity: number;
    estimatedBeerQuantity: number;
    softDrinkQuantity: number;
    beerQuantity: number;
    setSoftDrinkQuantity: Dispatch<SetStateAction<number>>;
    setBeerQuantity: Dispatch<SetStateAction<number>>;

    extraServicesState: SelectedServiceState[];
    setExtraServicesState: Dispatch<SetStateAction<SelectedServiceState[]>>;
    extraServices: Array<{ service: ServiceResponse; quantity: number }>;

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
    activeServices,
    packagePreviewLines,
    packageBenefits,
    packageConditions,
    comboSlotReplacements,
    setComboSlotReplacements,
    replacingSlotId,
    setReplacingSlotId,
    estimatedSoftDrinkQuantity,
    estimatedBeerQuantity,
    softDrinkQuantity,
    beerQuantity,
    setSoftDrinkQuantity,
    setBeerQuantity,
    extraServicesState,
    setExtraServicesState,
    extraServices,
    addService,
    updateServiceQuantity,
    removeService,
}: Props) {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">Chọn gói tiệc cưới</label>
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
                                    <p className="text-xs text-muted-foreground">/ bàn</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {selectedPackage && packagePreviewLines.length > 0 && (
                <section className="rounded-2xl border border-border overflow-hidden">
                    <div className="px-4 py-3 bg-secondary">
                        <p className="text-sm font-semibold text-foreground">
                            Các mục đã bao gồm trong gói
                        </p>
                    </div>

                    <div className="divide-y divide-border">
                        {packagePreviewLines.map((line) => (
                            <div
                                key={`${line.sourceType}-${line.itemType}-${line.itemName}-${line.displayOrder}`}
                                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                            >
                                <div className="min-w-0">
                                    <p className="font-medium text-foreground truncate">
                                        {line.itemName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {line.itemType} · {line.sourceType}
                                        {line.itemType !== "BENEFIT" && line.itemType !== "DISCOUNT"
                                            ? ` · x${line.quantity ?? 1}`
                                            : ""}
                                    </p>
                                </div>

                                <span
                                    className={`font-mono text-xs ${line.itemType === "BENEFIT"
                                        ? "text-emerald-600"
                                        : line.itemType === "DISCOUNT"
                                            ? "text-rose-600"
                                            : "text-muted-foreground"
                                        }`}
                                >
                                    {getBookingLinePriceLabel(line)}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {selectedPackage && packageBenefits.length > 0 && (
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

            {selectedPackage && packageConditions.length > 0 && (
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

            {selectedPackage && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                            <UtensilsCrossed className="w-4 h-4 text-accent" /> Menu Combo
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

                    <div className="rounded-2xl border border-border p-4 space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                Thức uống ước tính
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Hệ thống tự tính số lượng tối thiểu theo số bàn. Người dùng chỉ được tăng thêm,
                                không được giảm dưới mức ước tính.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                    Nước ngọt
                                </label>
                                <input
                                    type="number"
                                    min={estimatedSoftDrinkQuantity}
                                    value={softDrinkQuantity}
                                    onChange={(e) =>
                                        setSoftDrinkQuantity(
                                            Math.max(
                                                estimatedSoftDrinkQuantity,
                                                Number(e.target.value) || estimatedSoftDrinkQuantity
                                            )
                                        )
                                    }
                                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Tối thiểu: {estimatedSoftDrinkQuantity}
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                    Bia
                                </label>
                                <input
                                    type="number"
                                    min={estimatedBeerQuantity}
                                    value={beerQuantity}
                                    onChange={(e) =>
                                        setBeerQuantity(
                                            Math.max(
                                                estimatedBeerQuantity,
                                                Number(e.target.value) || estimatedBeerQuantity
                                            )
                                        )
                                    }
                                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Tối thiểu: {estimatedBeerQuantity}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-accent" />
                            Thêm dịch vụ ngoài gói
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {activeServices
                                .filter(
                                    (item) =>
                                        !extraServicesState.some((selected) => selected.serviceId === item.id)
                                )
                                .map((service) => (
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

                        {extraServices.length > 0 && (
                            <div className="mt-3 space-y-2">
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
                                            <p className="text-xs text-accent font-mono">
                                                +{formatVND((service.price ?? 0) * quantity)}
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

                                        <button
                                            type="button"
                                            onClick={() => removeService(service.id, setExtraServicesState)}
                                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}