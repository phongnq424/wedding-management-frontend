import { Check, CreditCard, Sparkles, Trash2, UtensilsCrossed } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { DishResponse } from "../../../../dto/dish.dto";
import type { ServiceResponse } from "../../../../dto/service.dto";
import type { BeverageResponse } from "../../../../dto/beverage.dto";
import { formatVND } from "../../../../utils";
import { ItemImage } from "./BookingItemImage";
import type { SelectedServiceState } from "./BookingForm.types";

type Props = {
    activeServices: ServiceResponse[];
    activeDishes: DishResponse[];
    activeBeverages: BeverageResponse[];

    manualServicesState: SelectedServiceState[];
    setManualServicesState: Dispatch<SetStateAction<SelectedServiceState[]>>;
    manualServices: Array<{ service: ServiceResponse; quantity: number }>;

    manualDishes: Array<{ dishId: string; quantity: number }>;
    setManualDishes: Dispatch<SetStateAction<Array<{ dishId: string; quantity: number }>>>;
    selectedManualDishes: Array<{ dish: DishResponse; quantity: number }>;

    manualBeverages: Array<{ beverageId: string; quantity: number }>;
    setManualBeverages: Dispatch<SetStateAction<Array<{ beverageId: string; quantity: number }>>>;
    selectedManualBeverages: Array<{ beverage: BeverageResponse; quantity: number }>;

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

export function BookingManualMode({
    activeServices,
    activeDishes,
    activeBeverages,
    manualServicesState,
    setManualServicesState,
    manualServices,
    manualDishes,
    setManualDishes,
    selectedManualDishes,
    manualBeverages,
    setManualBeverages,
    selectedManualBeverages,
    addService,
    updateServiceQuantity,
    removeService,
}: Props) {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    Chọn dịch vụ
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {activeServices.map((service) => {
                        const selected = manualServicesState.some(
                            (item) => item.serviceId === service.id
                        );

                        return (
                            <button
                                key={service.id}
                                type="button"
                                onClick={() =>
                                    selected
                                        ? removeService(service.id, setManualServicesState)
                                        : addService(service.id, setManualServicesState)
                                }
                                className={`group text-left rounded-xl border overflow-hidden transition-all ${selected
                                    ? "border-accent bg-accent/5 ring-2 ring-accent/20"
                                    : "border-border hover:border-accent/60 hover:shadow-sm"
                                    }`}
                            >
                                <div className="relative">
                                    <ItemImage
                                        src={service.serviceImage}
                                        label={service.name}
                                        className="h-28 w-full"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                                    {selected && (
                                        <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-accent flex items-center justify-center shadow">
                                            <Check className="w-4 h-4 text-accent-foreground" />
                                        </div>
                                    )}

                                    <div className="absolute bottom-2 left-2 right-2">
                                        <p className="text-sm font-semibold text-white line-clamp-1">
                                            {service.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3">
                                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                                        {service.description || "Dịch vụ tiệc cưới"}
                                    </p>
                                    <p className="text-sm font-mono font-bold text-accent mt-2">
                                        {formatVND(service.price ?? 0)}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {manualServices.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {manualServices.map(({ service, quantity }) => (
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
                                    <p className="text-xs text-muted-foreground font-mono">
                                        {formatVND(service.price ?? 0)} / lần
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
                                            setManualServicesState
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
                                        removeService(service.id, setManualServicesState)
                                    }
                                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-accent" />
                    Chọn món riêng
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {activeDishes
                        .filter((dish) => !manualDishes.some((item) => item.dishId === dish.id))
                        .map((dish) => (
                            <button
                                key={dish.id}
                                type="button"
                                onClick={() =>
                                    setManualDishes((prev) => [
                                        ...prev,
                                        { dishId: dish.id, quantity: 1 },
                                    ])
                                }
                                className="group text-left rounded-xl border border-border bg-card overflow-hidden hover:border-accent/60 hover:shadow-sm transition-all"
                            >
                                <div className="relative">
                                    <ItemImage
                                        src={dish.dishImage}
                                        label={dish.name}
                                        className="h-28 w-full"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    <div className="absolute bottom-2 left-2 right-2">
                                        <p className="text-sm font-semibold text-white line-clamp-1">
                                            {dish.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3">
                                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                                        {dish.description || dish.dishTypeName || "Món ăn"}
                                    </p>
                                    <p className="text-sm font-mono font-bold text-accent mt-2">
                                        {formatVND(dish.unitPrice ?? 0)}
                                    </p>
                                </div>
                            </button>
                        ))}
                </div>

                {selectedManualDishes.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {selectedManualDishes.map(({ dish, quantity }, index) => (
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
                                        {formatVND(dish.unitPrice ?? 0)}
                                    </p>
                                </div>

                                <input
                                    type="number"
                                    min={1}
                                    value={quantity}
                                    onChange={(e) =>
                                        setManualDishes((prev) =>
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

                                <button
                                    type="button"
                                    onClick={() =>
                                        setManualDishes((prev) =>
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
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-accent" />
                    Thức uống
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {activeBeverages
                        .filter(
                            (beverage) =>
                                !manualBeverages.some((item) => item.beverageId === beverage.id)
                        )
                        .map((beverage) => (
                            <button
                                key={beverage.id}
                                type="button"
                                onClick={() =>
                                    setManualBeverages((prev) => [
                                        ...prev,
                                        { beverageId: beverage.id, quantity: 1 },
                                    ])
                                }
                                className="group text-left rounded-xl border border-border bg-card overflow-hidden hover:border-accent/60 hover:shadow-sm transition-all"
                            >
                                <div className="relative">
                                    <ItemImage
                                        src={beverage.beverageImage}
                                        label={beverage.name}
                                        className="h-28 w-full"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    <div className="absolute bottom-2 left-2 right-2">
                                        <p className="text-sm font-semibold text-white line-clamp-1">
                                            {beverage.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3">
                                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                                        {beverage.description || beverage.beverageTypeName || "Thức uống"}
                                    </p>
                                    <p className="text-sm font-mono font-bold text-accent mt-2">
                                        {formatVND(beverage.unitPrice ?? 0)}
                                    </p>
                                </div>
                            </button>
                        ))}
                </div>

                {selectedManualBeverages.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {selectedManualBeverages.map(({ beverage, quantity }, index) => (
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
                                        {formatVND(beverage.unitPrice ?? 0)}
                                    </p>
                                </div>

                                <input
                                    type="number"
                                    min={1}
                                    value={quantity}
                                    onChange={(e) =>
                                        setManualBeverages((prev) =>
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

                                <button
                                    type="button"
                                    onClick={() =>
                                        setManualBeverages((prev) =>
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
                )}
            </div>
        </div>
    );
}