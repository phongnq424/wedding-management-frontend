import { Check, Plus, Sparkles, Trash2, UtensilsCrossed, Wine } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import type { DishComboResponse } from "../../../../dto/dishCombo.dto";
import type { DishResponse } from "../../../../dto/dish.dto";
import type { ServiceResponse } from "../../../../dto/service.dto";
import type { BeverageResponse } from "../../../../dto/beverage.dto";
import { formatVND } from "../../../../utils";
import type { ManualComboSelection, ManualMenuMode } from "../booking.types";
import { ComboSlotTable } from "../ComboSlotTable";
import { ItemImage } from "./BookingItemImage";
import type { SelectedServiceState } from "./BookingForm.types";

type Props = {
    manualMenuMode: ManualMenuMode;
    setManualMenuMode: Dispatch<SetStateAction<ManualMenuMode>>;

    dishCombos: DishComboResponse[];
    manualComboSelections: ManualComboSelection[];
    setManualComboSelections: Dispatch<SetStateAction<ManualComboSelection[]>>;
    numberOfTables: number;

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

function makeLocalId() {
    return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function getSlotId(slot: { slotId?: string | number; id?: string }, index: number) {
    return String(slot.slotId ?? slot.id ?? index);
}

function getDefaultDishPrice(
    slot: { defaultDishId?: string | null; unitPrice?: number | null },
    activeDishes: DishResponse[]
) {
    const defaultDish = activeDishes.find((dish) => dish.id === slot.defaultDishId);
    return slot.unitPrice ?? defaultDish?.unitPrice ?? 0;
}

function calculateComboSubtotal(
    combo: DishComboResponse | undefined,
    selection: ManualComboSelection,
    activeDishes: DishResponse[]
) {
    if (!combo) return 0;

    const slots = combo.slots ?? [];
    const perTableBeforeDiscount = slots.reduce((sum, slot, index) => {
        const slotId = getSlotId(slot, index);
        const replacement = selection.slotReplacements[slotId];

        return sum + (replacement?.price ?? getDefaultDishPrice(slot, activeDishes));
    }, 0);

    const discountRate = combo.comboDiscountRate ?? 0;
    const perTableAfterDiscount = perTableBeforeDiscount * (1 - discountRate / 100);

    return perTableAfterDiscount * Math.max(1, selection.tableCount || 1);
}

export function BookingManualMode({
    manualMenuMode,
    setManualMenuMode,
    dishCombos,
    manualComboSelections,
    setManualComboSelections,
    numberOfTables,
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
    const [showServicePicker, setShowServicePicker] = useState(false);
    const [showDishPicker, setShowDishPicker] = useState(false);
    const [showBeveragePicker, setShowBeveragePicker] = useState(false);
    const [comboIdToAdd, setComboIdToAdd] = useState("");
    const [replacingSlotKey, setReplacingSlotKey] = useState<string | null>(null);

    const activeCombos = dishCombos.filter((combo) => combo.status === "ACTIVE");
    const totalComboTables = manualComboSelections.reduce(
        (sum, item) => sum + Math.max(1, item.tableCount || 1),
        0
    );
    const remainingComboTables = Math.max(numberOfTables - totalComboTables, 0);

    const availableManualDishes = activeDishes.filter(
        (dish) => !manualDishes.some((item) => item.dishId === dish.id)
    );

    const availableManualBeverages = activeBeverages.filter(
        (beverage) => !manualBeverages.some((item) => item.beverageId === beverage.id)
    );

    function addManualCombo() {
        if (!comboIdToAdd) return;

        setManualComboSelections((prev) => [
            ...prev,
            {
                localId: makeLocalId(),
                comboId: comboIdToAdd,
                tableCount: Math.max(1, remainingComboTables || numberOfTables || 1),
                slotReplacements: {},
            },
        ]);

        setComboIdToAdd("");
    }

    function updateManualCombo(localId: string, updater: (item: ManualComboSelection) => ManualComboSelection) {
        setManualComboSelections((prev) =>
            prev.map((item) => (item.localId === localId ? updater(item) : item))
        );
    }

    function removeManualCombo(localId: string) {
        setManualComboSelections((prev) => prev.filter((item) => item.localId !== localId));
        setReplacingSlotKey(null);
    }

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-border overflow-hidden">
                <div className="px-4 py-3 bg-secondary">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4 text-accent" />
                        Kiểu chọn món manual
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Bạn mong muốn dùng combo hay tự chọn món ăn cho booking này? Chọn combo sẽ giúp bạn tiết kiệm thời gian hơn khi đã có sẵn các combo phù hợp, trong khi tự chọn sẽ linh hoạt hơn khi bạn muốn mix & match món ăn theo ý thích.
                    </p>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(["COMBO", "CUSTOM"] as const).map((mode) => (
                        <button
                            key={mode}
                            type="button"
                            onClick={() => {
                                setManualMenuMode(mode);
                                setReplacingSlotKey(null);
                            }}
                            className={`rounded-xl border p-4 text-left transition-all ${manualMenuMode === mode
                                ? "border-accent bg-accent/5 ring-2 ring-accent/20"
                                : "border-border hover:bg-secondary"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                {manualMenuMode === mode && <Check className="w-4 h-4 text-accent" />}
                                <p className="text-sm font-semibold text-foreground">
                                    {mode === "COMBO" ? "Dùng combo món ăn" : "Tự chọn từng món"}
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {mode === "COMBO"
                                    ? "Có thể chọn nhiều combo, mỗi combo áp dụng cho một số bàn riêng."
                                    : "Tự chọn món ăn và số lượng món cho bạn!"}
                            </p>
                        </button>
                    ))}
                </div>
            </section>

            {manualMenuMode === "COMBO" ? (
                <section className="rounded-2xl border border-border overflow-hidden">
                    <div className="px-4 py-3 bg-secondary flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-foreground">Combo món ăn manual</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Tổng số bàn combo:{" "}
                                <span className={totalComboTables === numberOfTables ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
                                    {totalComboTables}/{numberOfTables}
                                </span>
                            </p>
                        </div>

                        {remainingComboTables > 0 && (
                            <span className="text-xs rounded-full bg-accent/10 text-accent px-2 py-1 font-medium">
                                Còn {remainingComboTables} bàn
                            </span>
                        )}
                    </div>

                    <div className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3">
                            <select
                                value={comboIdToAdd}
                                onChange={(e) => setComboIdToAdd(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                                <option value="">-- Chọn combo để thêm --</option>
                                {activeCombos.map((combo) => (
                                    <option key={combo.id} value={combo.id}>
                                        {combo.name}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                disabled={!comboIdToAdd}
                                onClick={addManualCombo}
                                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm combo
                            </button>
                        </div>

                        {manualComboSelections.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground text-center">
                                Chưa chọn combo món ăn.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {manualComboSelections.map((selection, comboIndex) => {
                                    const combo = dishCombos.find((item) => item.id === selection.comboId);
                                    const comboSubtotal = calculateComboSubtotal(combo, selection, activeDishes);

                                    if (!combo) {
                                        return (
                                            <div
                                                key={selection.localId}
                                                className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
                                            >
                                                Combo không còn tồn tại hoặc chưa load được dữ liệu.
                                                <button
                                                    type="button"
                                                    onClick={() => removeManualCombo(selection.localId)}
                                                    className="ml-3 underline"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div
                                            key={selection.localId}
                                            className="rounded-2xl border border-border overflow-hidden"
                                        >
                                            <div className="px-4 py-3 bg-card border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">
                                                        Combo {comboIndex + 1}: {combo.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                                        Tạm tính: {formatVND(comboSubtotal)}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs text-muted-foreground">Số bàn</label>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={selection.tableCount}
                                                        onChange={(e) =>
                                                            updateManualCombo(selection.localId, (item) => ({
                                                                ...item,
                                                                tableCount: Math.max(1, Number(e.target.value) || 1),
                                                            }))
                                                        }
                                                        className="w-24 px-3 py-2 rounded-lg border border-border bg-input-background text-sm"
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() => removeManualCombo(selection.localId)}
                                                        className="p-2 rounded-lg text-rose-600 hover:bg-rose-50"
                                                        title="Xóa combo"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <ComboSlotTable
                                                    combo={combo as any}
                                                    dishes={activeDishes}
                                                    slotReplacements={selection.slotReplacements}
                                                    onReplace={(slotId, dishId, dishName, price) =>
                                                        updateManualCombo(selection.localId, (item) => ({
                                                            ...item,
                                                            slotReplacements: {
                                                                ...item.slotReplacements,
                                                                [slotId]: { dishId, dishName, price },
                                                            },
                                                        }))
                                                    }
                                                    onResetReplace={(slotId) =>
                                                        updateManualCombo(selection.localId, (item) => {
                                                            const nextReplacements = { ...item.slotReplacements };
                                                            delete nextReplacements[slotId];

                                                            return {
                                                                ...item,
                                                                slotReplacements: nextReplacements,
                                                            };
                                                        })
                                                    }
                                                    replacingSlotId={
                                                        replacingSlotKey?.startsWith(`${selection.localId}:`)
                                                            ? replacingSlotKey.slice(selection.localId.length + 1)
                                                            : null
                                                    }
                                                    setReplacingSlotId={(slotId) =>
                                                        setReplacingSlotKey(slotId ? `${selection.localId}:${slotId}` : null)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>
            ) : (
                <section className="rounded-2xl border border-border overflow-hidden">
                    <div className="px-4 py-3 bg-secondary flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <UtensilsCrossed className="w-4 h-4 text-accent" />
                                Món ăn tự chọn
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Mỗi món được tính theo số bàn booking.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowDishPicker((prev) => !prev)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-accent/30 bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/15 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            {showDishPicker ? "Ẩn chọn món" : "Thêm món ăn"}
                        </button>
                    </div>

                    <div className="p-4 space-y-4">
                        {showDishPicker && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {availableManualDishes.map((dish) => (
                                    <button
                                        key={dish.id}
                                        type="button"
                                        onClick={() =>
                                            setManualDishes((prev) => [
                                                ...prev,
                                                { dishId: dish.id, quantity: 1 },
                                            ])
                                        }
                                        className="group text-left rounded-xl border border-border overflow-hidden hover:border-accent/60 hover:shadow-sm transition-all"
                                    >
                                        <ItemImage
                                            src={dish.dishImage}
                                            label={dish.name}
                                            className="h-28 w-full"
                                        />
                                        <div className="p-3">
                                            <p className="text-sm font-semibold text-foreground line-clamp-1">
                                                {dish.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-mono mt-1">
                                                {formatVND(dish.unitPrice ?? 0)} / bàn
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {selectedManualDishes.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground text-center">
                                Chưa chọn món ăn.
                            </div>
                        ) : (
                            <div className="space-y-2">
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
                                                {formatVND(dish.unitPrice ?? 0)} / bàn
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
                </section>
            )}

            <section className="rounded-2xl border border-border overflow-hidden">
                <div className="px-4 py-3 bg-secondary flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-accent" />
                            Dịch vụ
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Dịch vụ manual luôn gửi trong bookingDraftLines.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowServicePicker((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-accent/30 bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/15 transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        {showServicePicker ? "Ẩn chọn dịch vụ" : "Thêm dịch vụ"}
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {showServicePicker && (
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
                                        <ItemImage
                                            src={service.serviceImage}
                                            label={service.name}
                                            className="h-28 w-full"
                                        />
                                        <div className="p-3">
                                            <p className="text-sm font-semibold text-foreground line-clamp-1">
                                                {service.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-mono mt-1">
                                                {formatVND(service.price ?? 0)}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {manualServices.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground text-center">
                            Chưa chọn dịch vụ.
                        </div>
                    ) : (
                        <div className="space-y-2">
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
                                            {formatVND(service.price ?? 0)}
                                        </p>
                                    </div>

                                    <input
                                        type="number"
                                        min={1}
                                        value={quantity}
                                        onChange={(e) =>
                                            updateServiceQuantity(
                                                service.id,
                                                Number(e.target.value) || 1,
                                                setManualServicesState
                                            )
                                        }
                                        className="w-20 px-2 py-1 rounded-lg border border-border bg-input-background text-sm"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => removeService(service.id, setManualServicesState)}
                                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="rounded-2xl border border-border overflow-hidden">
                <div className="px-4 py-3 bg-secondary flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Wine className="w-4 h-4 text-accent" />
                            Thức uống
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Thức uống manual luôn gửi trong bookingDraftLines.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowBeveragePicker((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-accent/30 bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/15 transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        {showBeveragePicker ? "Ẩn chọn thức uống" : "Thêm thức uống"}
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {showBeveragePicker && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {availableManualBeverages.map((beverage) => (
                                <button
                                    key={beverage.id}
                                    type="button"
                                    onClick={() =>
                                        setManualBeverages((prev) => [
                                            ...prev,
                                            { beverageId: beverage.id, quantity: 1 },
                                        ])
                                    }
                                    className="group text-left rounded-xl border border-border overflow-hidden hover:border-accent/60 hover:shadow-sm transition-all"
                                >
                                    <ItemImage
                                        src={beverage.beverageImage}
                                        label={beverage.name}
                                        className="h-28 w-full"
                                    />
                                    <div className="p-3">
                                        <p className="text-sm font-semibold text-foreground line-clamp-1">
                                            {beverage.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground font-mono mt-1">
                                            {formatVND(beverage.unitPrice ?? 0)}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedManualBeverages.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground text-center">
                            Chưa chọn thức uống.
                        </div>
                    ) : (
                        <div className="space-y-2">
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
            </section>
        </div>
    );
}
