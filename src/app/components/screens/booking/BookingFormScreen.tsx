import { useEffect, useState } from "react";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Building2,
    Check,
    CheckCircle2,
    ChevronRight,
    CreditCard,
    Save,
    Sparkles,
    Trash2,
    UtensilsCrossed,
    Wallet,
} from "lucide-react";
import { bookingService } from "../../../services/booking.service";
import { weddingPackageService } from "../../../services/weddingPackage.service";
import { dishComboService } from "../../../services/dishCombo.service";
import { dishService } from "../../../services/dish.service";
import { serviceService } from "../../../services/service.service";
import { beverageService } from "../../../services/beverage.service";
import type { BookingRequestPayload, BookingResponse } from "../../../dto/booking.dto";
import type { WeddingPackageResponse } from "../../../dto/weddingPackage.dto";
import type { DishComboResponse } from "../../../dto/dishCombo.dto";
import type { DishResponse } from "../../../dto/dish.dto";
import type { ServiceResponse } from "../../../dto/service.dto";
import type { BeverageResponse } from "../../../dto/beverage.dto";
import { formatVND } from "../../../utils";
import type { BookingFormProps, ToastState } from "./booking.types";
import {
    buildManualDraftLines,
    buildPackageDraftLines,
    getPackagePricePerTable,
} from "./booking.mapper";
import { ComboSlotTable } from "./ComboSlotTable";

type CustomerFormState = {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    brideName: string;
    groomName: string;
    weddingDate: string;
    numberOfTables: number;
    numberOfReserveTables: number;
    note: string;
};

type EditBookingLike = BookingResponse & {
    hallPrice?: number | null;
};

const EMPTY_CUSTOMER_FORM: CustomerFormState = {
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    brideName: "",
    groomName: "",
    weddingDate: "",
    numberOfTables: 30,
    numberOfReserveTables: 0,
    note: "",
};

function getImageFallback(label: string | null | undefined) {
    if (!label) return "NA";

    return label
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function ItemImage({
    src,
    label,
    className = "h-20 w-full",
}: {
    src?: string | null;
    label?: string | null;
    className?: string;
}) {
    return (
        <div className={`${className} overflow-hidden bg-muted flex-shrink-0`}>
            {src ? (
                <img
                    src={src}
                    alt={label ?? "Item"}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            ) : (
                <div className="h-full w-full flex items-center justify-center text-xs font-semibold text-muted-foreground bg-secondary">
                    {getImageFallback(label)}
                </div>
            )}
        </div>
    );
}

export const BookingFormScreen = ({
    setScreen,
    bookingPreselect,
    selectedBookingId,
    setSelectedBookingId,
}: BookingFormProps) => {
    const isEditing = !!selectedBookingId;

    const [bookingStep, setBookingStep] = useState(
        selectedBookingId ? 2 : bookingPreselect ? 2 : 1
    );
    const [bookingMode, setBookingMode] = useState<"PACKAGE" | "MANUAL">("MANUAL");
    const [customerForm, setCustomerForm] = useState<CustomerFormState>({
        ...EMPTY_CUSTOMER_FORM,
        weddingDate: bookingPreselect?.date ?? "",
        numberOfTables: Math.min(30, bookingPreselect?.maxTables ?? 30),
    });
    const [depositAmount, setDepositAmount] = useState(0);
    const [saving, setSaving] = useState(false);
    const [loadingRefs, setLoadingRefs] = useState(true);
    const [loadingBookingDetail, setLoadingBookingDetail] = useState(false);
    const [toast, setToast] = useState<ToastState>(null);

    const [packages, setPackages] = useState<WeddingPackageResponse[]>([]);
    const [dishCombos, setDishCombos] = useState<DishComboResponse[]>([]);
    const [dishes, setDishes] = useState<DishResponse[]>([]);
    const [services, setServices] = useState<ServiceResponse[]>([]);
    const [beverages, setBeverages] = useState<BeverageResponse[]>([]);

    const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
    const [selectedComboId, setSelectedComboId] = useState<string | null>(null);
    const [extraServiceIds, setExtraServiceIds] = useState<string[]>([]);
    const [extraDishes, setExtraDishes] = useState<Array<{ dishId: string; quantity: number }>>([]);
    const [manualServiceIds, setManualServiceIds] = useState<string[]>([]);
    const [manualDishes, setManualDishes] = useState<Array<{ dishId: string; quantity: number }>>([]);
    const [manualBeverages, setManualBeverages] = useState<Array<{ beverageId: string; quantity: number }>>([]);
    const [comboSlotReplacements, setComboSlotReplacements] = useState<
        Record<string, { dishId: string; dishName: string; price: number }>
    >({});
    const [replacingSlotId, setReplacingSlotId] = useState<string | null>(null);
    const [editingLastModifiedAt, setEditingLastModifiedAt] = useState<string | null>(null);
    const [editingBooking, setEditingBooking] = useState<EditBookingLike | null>(null);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        window.setTimeout(() => setToast(null), 3000);
    };

    function buildInitialCustomerForm(): CustomerFormState {
        return {
            ...EMPTY_CUSTOMER_FORM,
            weddingDate: bookingPreselect?.date ?? "",
            numberOfTables: Math.min(30, bookingPreselect?.maxTables ?? 30),
        };
    }

    function resetEditableSelections() {
        setDepositAmount(0);
        setExtraServiceIds([]);
        setExtraDishes([]);
        setManualServiceIds([]);
        setManualDishes([]);
        setManualBeverages([]);
        setComboSlotReplacements({});
        setReplacingSlotId(null);
        setEditingBooking(null);
        setEditingLastModifiedAt(null);
    }

    function resetCreateFormState() {
        setBookingStep(bookingPreselect ? 2 : 1);
        setBookingMode("MANUAL");
        setCustomerForm(buildInitialCustomerForm());
        setSelectedPackageId(null);
        setSelectedComboId(null);
        resetEditableSelections();
    }

    function goBackToBookingList() {
        setSelectedBookingId?.(null);
        setScreen("booking");
    }

    function goBackToAvailability() {
        setSelectedBookingId?.(null);
        setScreen("booking-availability");
    }

    function fillFormFromBooking(booking: EditBookingLike) {
        setEditingBooking(booking);
        setEditingLastModifiedAt(booking.lastModifiedAt ?? null);

        setBookingMode(booking.bookingMode ?? "PACKAGE");
        setBookingStep(2);

        setCustomerForm({
            customerName: booking.customerName ?? "",
            customerPhone: booking.customerPhone ?? "",
            customerEmail: booking.customerEmail ?? "",
            brideName: booking.brideName ?? "",
            groomName: booking.groomName ?? "",
            weddingDate: booking.weddingDate ?? "",
            numberOfTables: booking.numberOfTables ?? 30,
            numberOfReserveTables: booking.numberOfReserveTables ?? 0,
            note: booking.note ?? "",
        });

        setDepositAmount(booking.depositAmount ?? 0);
        setSelectedPackageId(booking.packageId ?? null);
        setSelectedComboId(booking.selectedMenuComboId ?? null);

        setExtraServiceIds([]);
        setExtraDishes([]);
        setManualServiceIds([]);
        setManualDishes([]);
        setManualBeverages([]);
        setComboSlotReplacements({});
        setReplacingSlotId(null);

        if (booking.bookingMode === "MANUAL") {
            const lines = booking.bookingLines ?? [];

            setManualServiceIds(
                lines
                    .filter((line) => line.itemType === "SERVICE")
                    .map((line) => line.itemId)
                    .filter((itemId): itemId is string => !!itemId)
            );

            setManualDishes(
                lines
                    .filter((line) => line.itemType === "DISH")
                    .map((line) => ({
                        dishId: line.itemId,
                        quantity: line.quantity ?? 1,
                    }))
                    .filter((item): item is { dishId: string; quantity: number } => !!item.dishId)
            );

            setManualBeverages(
                lines
                    .filter((line) => line.itemType === "BEVERAGE")
                    .map((line) => ({
                        beverageId: line.itemId,
                        quantity: line.quantity ?? 1,
                    }))
                    .filter((item): item is { beverageId: string; quantity: number } => !!item.beverageId)
            );
        }
    }

    useEffect(() => {
        let cancelled = false;

        async function loadFormData() {
            try {
                setLoadingRefs(true);
                setLoadingBookingDetail(!!selectedBookingId);

                const [pkgData, comboData, dishData, serviceData, beverageData] = await Promise.all([
                    weddingPackageService.getAll(),
                    dishComboService.getAll(),
                    dishService.getAll(),
                    serviceService.getAll(),
                    beverageService.getAll(),
                ]);

                if (cancelled) return;

                setPackages(pkgData);
                setDishCombos(comboData);
                setDishes(dishData);
                setServices(serviceData);
                setBeverages(beverageData);

                if (selectedBookingId) {
                    const booking = await bookingService.getById(selectedBookingId);
                    if (cancelled) return;

                    fillFormFromBooking(booking as EditBookingLike);
                    return;
                }

                resetCreateFormState();

                const firstActivePackage =
                    pkgData.find((item) => item.status === "ACTIVE") ?? pkgData[0] ?? null;

                setSelectedPackageId(firstActivePackage?.id ?? null);
                setSelectedComboId(
                    firstActivePackage?.defaultMenuComboId ??
                    firstActivePackage?.menuComboOptions?.[0] ??
                    null
                );
            } catch (error) {
                if (!cancelled) {
                    showToast(
                        error instanceof Error ? error.message : "Cannot load booking form data.",
                        "error"
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingRefs(false);
                    setLoadingBookingDetail(false);
                }
            }
        }

        loadFormData();

        return () => {
            cancelled = true;
        };
    }, [selectedBookingId, bookingPreselect?.hallId, bookingPreselect?.shiftId, bookingPreselect?.date]);

    const selectedPackage = packages.find((item) => item.id === selectedPackageId) ?? null;
    const selectedCombo = dishCombos.find((item) => item.id === selectedComboId) ?? null;

    const activePackages = packages.filter((item) => item.status === "ACTIVE");
    const activeServices = services.filter((item) => item.status === "ACTIVE");
    const activeDishes = dishes.filter((item) => item.status === "ACTIVE");
    const activeBeverages = beverages.filter((item) => item.status === "ACTIVE");

    const extraServices = extraServiceIds
        .map((id) => services.find((item) => item.id === id))
        .filter((item): item is ServiceResponse => !!item);

    const manualServices = manualServiceIds
        .map((id) => services.find((item) => item.id === id))
        .filter((item): item is ServiceResponse => !!item);

    const selectedExtraDishes = extraDishes
        .map((item) => ({
            dish: dishes.find((dish) => dish.id === item.dishId),
            quantity: item.quantity,
        }))
        .filter((item): item is { dish: DishResponse; quantity: number } => !!item.dish);

    const selectedManualDishes = manualDishes
        .map((item) => ({
            dish: dishes.find((dish) => dish.id === item.dishId),
            quantity: item.quantity,
        }))
        .filter((item): item is { dish: DishResponse; quantity: number } => !!item.dish);

    const selectedManualBeverages = manualBeverages
        .map((item) => ({
            beverage: beverages.find((beverage) => beverage.id === item.beverageId),
            quantity: item.quantity,
        }))
        .filter((item): item is { beverage: BeverageResponse; quantity: number } => !!item.beverage);

    const formTitle = isEditing ? "Sửa booking" : "Thêm booking mới";

    const summaryHallName =
        bookingPreselect?.hallName ?? editingBooking?.hallName ?? "Đang tải...";
    const summaryDate =
        bookingPreselect?.date ?? editingBooking?.bookingDate ?? "Đang tải...";
    const summaryShiftName =
        bookingPreselect?.shiftName ?? editingBooking?.shiftName ?? "Đang tải...";
    const summaryHallFee =
        bookingPreselect?.price ?? editingBooking?.hallPrice ?? editingBooking?.hallPrice ?? 0;

    const hallFee = summaryHallFee;
    const packageBase = selectedPackage
        ? getPackagePricePerTable(selectedPackage) * customerForm.numberOfTables
        : 0;
    const packageExtraServiceCost = extraServices.reduce(
        (sum, item) => sum + (item.price ?? 0),
        0
    );
    const packageExtraDishCost = selectedExtraDishes.reduce(
        (sum, item) => sum + (item.dish.unitPrice ?? 0) * item.quantity,
        0
    );
    const packageTotal = hallFee + packageBase + packageExtraServiceCost + packageExtraDishCost;

    const manualServiceCost = manualServices.reduce((sum, item) => sum + (item.price ?? 0), 0);
    const manualDishCost = selectedManualDishes.reduce(
        (sum, item) => sum + (item.dish.unitPrice ?? 0) * item.quantity * customerForm.numberOfTables,
        0
    );
    const manualBeverageCost = selectedManualBeverages.reduce(
        (sum, item) => sum + (item.beverage.unitPrice ?? 0) * item.quantity,
        0
    );
    const manualTotal = hallFee + manualServiceCost + manualDishCost + manualBeverageCost;

    const bookingAmount = bookingMode === "PACKAGE" ? packageTotal : manualTotal;
    const recommendedDeposit = Math.ceil(bookingAmount * 0.3);
    const effectiveDepositAmount = Math.max(depositAmount, recommendedDeposit);
    const remainingAmount = Math.max(bookingAmount - effectiveDepositAmount, 0);

    const foodAmount = bookingMode === "PACKAGE" ? packageBase + packageExtraDishCost : manualDishCost;
    const serviceAmount = bookingMode === "PACKAGE" ? packageExtraServiceCost : manualServiceCost;
    const beverageAmount =
        bookingMode === "PACKAGE" ? selectedPackage?.beverageAllowanceTotal ?? 0 : manualBeverageCost;
    const packageIncludedServiceAmount =
        bookingMode === "PACKAGE" ? selectedPackage?.includedServiceTotal ?? 0 : 0;
    const packageIncludedBeverageAmount =
        bookingMode === "PACKAGE" ? selectedPackage?.beverageAllowanceTotal ?? 0 : 0;

    const isInitialLoading = loadingRefs || (isEditing && loadingBookingDetail);

    useEffect(() => {
        if (bookingAmount > 0) {
            setDepositAmount((prev) => {
                if (!prev || prev < recommendedDeposit) {
                    return recommendedDeposit;
                }

                return prev;
            });
        }
    }, [bookingAmount, recommendedDeposit]);

    function updateCustomerForm<K extends keyof CustomerFormState>(key: K, value: CustomerFormState[K]) {
        setCustomerForm((prev) => ({ ...prev, [key]: value }));
    }

    function validateStep(step: number) {
        if (step === 1 && !isEditing && !bookingPreselect) {
            showToast("Vui lòng chọn sảnh và ca trước.", "error");
            return false;
        }

        if (step === 2) {
            if (
                !customerForm.customerName.trim() ||
                !customerForm.customerPhone.trim() ||
                !customerForm.brideName.trim() ||
                !customerForm.groomName.trim() ||
                !customerForm.weddingDate
            ) {
                showToast("Vui lòng nhập đủ thông tin khách hàng, cô dâu, chú rể và ngày cưới.", "error");
                return false;
            }

            if (customerForm.numberOfTables <= 0) {
                showToast("Số bàn phải lớn hơn 0.", "error");
                return false;
            }
        }

        if (step === 3) {
            if (bookingMode === "PACKAGE" && !selectedPackageId) {
                showToast("Vui lòng chọn gói tiệc.", "error");
                return false;
            }
        }

        return true;
    }

    function goNext() {
        if (!validateStep(bookingStep)) return;
        setBookingStep((prev) => Math.min(4, prev + 1));
    }

    function addUnique(id: string, setter: React.Dispatch<React.SetStateAction<string[]>>) {
        if (!id) return;
        setter((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }

    async function handleSubmit() {
        if (!isEditing && !bookingPreselect) {
            showToast("Vui lòng chọn sảnh và ca trước khi lưu booking.", "error");
            return;
        }

        if (!validateStep(2) || !validateStep(3)) return;

        try {
            setSaving(true);

            const packageDraftLines = buildPackageDraftLines({
                pkg: selectedPackage,
                selectedComboId,
                extraServices,
                extraDishes: selectedExtraDishes,
            });

            const manualDraftLines = buildManualDraftLines({
                services: manualServices,
                dishes: selectedManualDishes,
                beverages: selectedManualBeverages,
            });

            const bookingDateValue = bookingPreselect?.date ?? editingBooking?.bookingDate;
            const shiftIdValue = bookingPreselect?.shiftId ?? editingBooking?.shiftId;
            const hallIdValue = bookingPreselect?.hallId ?? editingBooking?.hallId;

            if (!bookingDateValue || !shiftIdValue || !hallIdValue) {
                showToast("Thiếu thông tin sảnh, ca hoặc ngày đặt tiệc.", "error");
                return;
            }

            const payload: BookingRequestPayload = {
                bookingDate: bookingDateValue,
                shiftId: shiftIdValue,
                hallId: hallIdValue,
                customerName: customerForm.customerName.trim(),
                customerPhone: customerForm.customerPhone.trim(),
                customerEmail: customerForm.customerEmail.trim() || null,
                brideName: customerForm.brideName.trim(),
                groomName: customerForm.groomName.trim(),
                weddingDate: customerForm.weddingDate,
                numberOfTables: customerForm.numberOfTables,
                numberOfReserveTables: customerForm.numberOfReserveTables,
                bookingMode,
                packageId: bookingMode === "PACKAGE" ? selectedPackageId : null,
                selectedMenuComboId: bookingMode === "PACKAGE" ? selectedComboId : null,
                bookingDraftLines: bookingMode === "PACKAGE" ? packageDraftLines : manualDraftLines,
                depositAmount: effectiveDepositAmount,
                note: customerForm.note.trim() || null,
                status: isEditing ? editingBooking?.status ?? "PENDING" : "PENDING",
            };

            if (isEditing && selectedBookingId) {
                if (!editingLastModifiedAt) {
                    showToast("Không thể cập nhật vì thiếu lastModifiedAt. Vui lòng tải lại.", "error");
                    return;
                }

                await bookingService.update(selectedBookingId, payload, editingLastModifiedAt);
                showToast("Booking được cập nhật thành công.");
            } else {
                await bookingService.create(payload);
                showToast("Booking được tạo thành công.");
            }

            window.setTimeout(() => {
                setSelectedBookingId?.(null);
                setScreen("booking");
            }, 500);
        } catch (error) {
            showToast(
                error instanceof Error
                    ? error.message
                    : isEditing
                        ? "Cannot update booking."
                        : "Cannot create booking.",
                "error"
            );
        } finally {
            setSaving(false);
        }
    }

    const stepLabels = [
        { label: "Sảnh & Ca", icon: Building2 },
        { label: "Thông tin KH", icon: CreditCard },
        { label: "Thực đơn / Gói", icon: UtensilsCrossed },
        { label: "Đặt cọc", icon: Wallet },
    ];

    const renderStep2 = () => (
        <div className="space-y-5">
            <h3 className="text-lg font-semibold text-primary">Bước 2 · Thông tin khách hàng</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Tên khách hàng *</label>
                    <input
                        value={customerForm.customerName}
                        onChange={(e) => updateCustomerForm("customerName", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Số điện thoại *</label>
                    <input
                        value={customerForm.customerPhone}
                        onChange={(e) => updateCustomerForm("customerPhone", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <input
                        value={customerForm.customerEmail}
                        onChange={(e) => updateCustomerForm("customerEmail", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div className="hidden md:block" />

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Tên cô dâu *</label>
                    <input
                        value={customerForm.brideName}
                        onChange={(e) => updateCustomerForm("brideName", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Tên chú rể *</label>
                    <input
                        value={customerForm.groomName}
                        onChange={(e) => updateCustomerForm("groomName", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Ngày cưới *</label>
                    <input
                        type="date"
                        value={customerForm.weddingDate}
                        onChange={(e) => updateCustomerForm("weddingDate", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Số bàn *</label>
                    <input
                        type="number"
                        min={1}
                        value={customerForm.numberOfTables}
                        onChange={(e) =>
                            updateCustomerForm("numberOfTables", Number(e.target.value) || 0)
                        }
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Bàn dự phòng</label>
                    <input
                        type="number"
                        min={0}
                        value={customerForm.numberOfReserveTables}
                        onChange={(e) =>
                            updateCustomerForm("numberOfReserveTables", Number(e.target.value) || 0)
                        }
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Ghi chú</label>
                    <textarea
                        rows={3}
                        value={customerForm.note}
                        onChange={(e) => updateCustomerForm("note", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>
            </div>
        </div>
    );

    const renderPackageMode = () => (
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

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-accent" />
                            Thêm dịch vụ ngoài gói
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {activeServices
                                .filter((item) => !extraServiceIds.includes(item.id))
                                .map((service) => (
                                    <button
                                        key={service.id}
                                        type="button"
                                        onClick={() => addUnique(service.id, setExtraServiceIds)}
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
                                {extraServices.map((service) => (
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
                                                +{formatVND(service.price ?? 0)}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExtraServiceIds((prev) =>
                                                    prev.filter((id) => id !== service.id)
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
                </>
            )}
        </div>
    );

    const renderManualMode = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    Chọn dịch vụ
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {activeServices.map((service) => {
                        const selected = manualServiceIds.includes(service.id);

                        return (
                            <button
                                key={service.id}
                                type="button"
                                onClick={() =>
                                    setManualServiceIds((prev) =>
                                        selected
                                            ? prev.filter((id) => id !== service.id)
                                            : [...prev, service.id]
                                    )
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

    const renderStep3 = () => (
        <div className="space-y-5">
            <h3 className="text-lg font-semibold text-primary">Bước 3 · Chọn Thực đơn / Gói tiệc</h3>

            <div>
                <label className="block text-sm font-medium text-foreground mb-2">Hình thức đặt tiệc</label>
                <div className="grid grid-cols-2 gap-3">
                    {(["PACKAGE", "MANUAL"] as const).map((mode) => (
                        <button
                            key={mode}
                            type="button"
                            onClick={() => setBookingMode(mode)}
                            className={`px-4 py-4 rounded-xl border text-left transition-all ${bookingMode === mode
                                ? "border-accent bg-accent/5 shadow-sm"
                                : "border-border hover:bg-secondary"
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {bookingMode === mode && <Check className="w-4 h-4 text-accent" />}
                                <p className="text-sm font-semibold text-foreground">
                                    {mode === "PACKAGE" ? "Gói tiệc cưới" : "Tự chọn (Manual)"}
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {mode === "PACKAGE"
                                    ? "Chọn gói đã thiết kế sẵn với menu + dịch vụ bundled."
                                    : "Tự chọn dịch vụ, món ăn và thức uống riêng lẻ."}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {bookingMode === "PACKAGE" ? renderPackageMode() : renderManualMode()}
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-5">
            <h3 className="text-lg font-semibold text-primary">Bước 4 · Xác nhận Đặt cọc</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Tổng giá trị booking
                    </label>
                    <input
                        readOnly
                        value={formatVND(bookingAmount)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-secondary font-mono text-foreground"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Số tiền đặt cọc *
                    </label>
                    <input
                        type="number"
                        min={recommendedDeposit}
                        value={depositAmount}
                        onChange={(e) => {
                            const value = Number(e.target.value) || 0;
                            setDepositAmount(Math.max(value, recommendedDeposit));
                        }}
                        onBlur={() => {
                            setDepositAmount((prev) => Math.max(prev || 0, recommendedDeposit));
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Bắt buộc đặt cọc tối thiểu 30% ={" "}
                        <span className="font-mono font-semibold text-accent">
                            {formatVND(recommendedDeposit)}
                        </span>
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Số tiền còn lại
                    </label>
                    <input
                        readOnly
                        value={formatVND(remainingAmount)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-secondary font-mono text-foreground"
                    />
                </div>
            </div>
        </div>
    );

    const renderSummary = () => (
        <div className="bg-card rounded-[20px] p-5 border border-border shadow-sm sticky top-24">
            <h3 className="text-sm font-semibold text-primary mb-4">Tóm tắt booking</h3>

            <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Sảnh</span>
                    <span className="text-foreground font-medium text-right">{summaryHallName}</span>
                </div>

                <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Ngày</span>
                    <span className="text-foreground font-mono">{summaryDate}</span>
                </div>

                <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Ca</span>
                    <span className="text-foreground">{summaryShiftName}</span>
                </div>

                <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Số bàn</span>
                    <span className="text-foreground">{customerForm.numberOfTables}</span>
                </div>

                <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Hình thức</span>
                    <span className="text-foreground">
                        {bookingMode === "PACKAGE" ? "Gói tiệc" : "Tự chọn"}
                    </span>
                </div>

                <div className="border-t border-border pt-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Chi tiết chi phí
                    </p>

                    <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Tiền sảnh</span>
                        <span className="font-mono text-foreground">{formatVND(summaryHallFee)}</span>
                    </div>

                    <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Đồ ăn / thực đơn</span>
                        <span className="font-mono text-foreground">{formatVND(foodAmount)}</span>
                    </div>

                    <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Dịch vụ</span>
                        <span className="font-mono text-foreground">{formatVND(serviceAmount)}</span>
                    </div>

                    {bookingMode === "PACKAGE" && packageIncludedServiceAmount > 0 && (
                        <div className="flex justify-between gap-3 pl-3 text-xs">
                            <span className="text-muted-foreground">Dịch vụ đã bao gồm trong gói</span>
                            <span className="font-mono text-muted-foreground">
                                {formatVND(packageIncludedServiceAmount)}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Thức uống ước tính</span>
                        <span className="font-mono text-foreground">{formatVND(beverageAmount)}</span>
                    </div>

                    {bookingMode === "PACKAGE" && packageIncludedBeverageAmount > 0 && (
                        <div className="flex justify-between gap-3 pl-3 text-xs">
                            <span className="text-muted-foreground">Hạn mức thức uống trong gói</span>
                            <span className="font-mono text-muted-foreground">
                                {formatVND(packageIncludedBeverageAmount)}
                            </span>
                        </div>
                    )}
                </div>

                <div className="border-t border-border pt-3 flex justify-between gap-3 font-semibold">
                    <span className="text-foreground">Tổng</span>
                    <span className="font-mono text-accent">{formatVND(bookingAmount)}</span>
                </div>

                <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Cọc</span>
                    <span className="font-mono text-emerald-600">
                        {formatVND(effectiveDepositAmount)}
                    </span>
                </div>

                <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Còn lại</span>
                    <span className="font-mono text-rose-600">{formatVND(remainingAmount)}</span>
                </div>
            </div>
        </div>
    );

    if (isInitialLoading) {
        return (
            <div className="space-y-6">
                {toast && (
                    <div
                        className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
                            }`}
                    >
                        {toast.msg}
                    </div>
                )}

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <button
                        onClick={goBackToBookingList}
                        className="hover:text-foreground flex items-center gap-1"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Booking
                    </button>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-foreground">
                        {isEditing ? "Đang tải thông tin booking..." : "Đang tải dữ liệu tạo booking..."}
                    </span>
                </div>

                <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
                    <div className="animate-pulse space-y-5">
                        <div className="h-6 w-64 rounded bg-secondary" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="h-12 rounded-xl bg-secondary" />
                            <div className="h-12 rounded-xl bg-secondary" />
                            <div className="h-12 rounded-xl bg-secondary" />
                            <div className="h-12 rounded-xl bg-secondary" />
                        </div>
                        <div className="h-32 rounded-xl bg-secondary" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {toast && (
                <div
                    className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
                        }`}
                >
                    {toast.msg}
                </div>
            )}

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <button
                    onClick={goBackToBookingList}
                    className="hover:text-foreground flex items-center gap-1"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Booking
                </button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground">{formTitle}</span>
            </div>

            <div className="bg-card rounded-[20px] p-5 border border-border shadow-sm">
                <div className="grid grid-cols-4 gap-4">
                    {stepLabels.map((step, index) => {
                        const Icon = step.icon;
                        const active = bookingStep === index + 1;
                        const done = bookingStep > index + 1;

                        return (
                            <div key={step.label} className="relative">
                                <div className="flex flex-col items-center gap-1.5">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${active
                                            ? "bg-accent text-accent-foreground shadow-md"
                                            : done
                                                ? "bg-emerald-100 text-emerald-700"
                                                : "bg-secondary text-muted-foreground"
                                            }`}
                                    >
                                        {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                    </div>
                                    <span
                                        className={`text-xs font-medium text-center ${active ? "text-primary" : "text-muted-foreground"
                                            }`}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                                {index < 3 && (
                                    <div className="absolute top-5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5 bg-border" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {!isEditing && !bookingPreselect && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Bạn nên chọn sảnh ở bước kiểm tra availability trước khi tạo booking.
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6">
                <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
                    {bookingStep === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-primary">Bước 1 · Sảnh & Ca</h3>
                            <p className="text-sm text-muted-foreground">
                                {isEditing
                                    ? "Thông tin sảnh và ca được lấy từ booking hiện tại."
                                    : "Sảnh và ca được lấy từ màn kiểm tra availability."}
                            </p>
                            <div className="rounded-xl bg-secondary p-4 text-sm space-y-2">
                                <p>
                                    <strong>Sảnh:</strong> {summaryHallName}
                                </p>
                                <p>
                                    <strong>Ca:</strong> {summaryShiftName}
                                </p>
                                <p>
                                    <strong>Ngày:</strong> {summaryDate}
                                </p>
                                <p>
                                    <strong>Giá sảnh:</strong> {formatVND(summaryHallFee)}
                                </p>
                            </div>
                        </div>
                    )}

                    {bookingStep === 2 && renderStep2()}
                    {bookingStep === 3 && renderStep3()}
                    {bookingStep === 4 && renderStep4()}

                    <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                        {isEditing && bookingStep === 2 ? (
                            <button
                                type="button"
                                onClick={goBackToBookingList}
                                className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-all flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Hủy chỉnh sửa
                            </button>
                        ) : !isEditing && bookingPreselect && bookingStep === 2 ? (
                            <button
                                type="button"
                                onClick={goBackToAvailability}
                                className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-all flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Chọn lại sảnh
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled={bookingStep === 1}
                                onClick={() => setBookingStep((prev) => Math.max(1, prev - 1))}
                                className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Quay lại
                            </button>
                        )}

                        {bookingStep < 4 ? (
                            <button
                                type="button"
                                onClick={goNext}
                                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm"
                            >
                                Tiếp theo <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={saving}
                                className="px-6 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:bg-accent/90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {saving
                                    ? "Đang lưu..."
                                    : isEditing
                                        ? "Cập nhật Booking"
                                        : "Lưu Booking — Chờ xác nhận cọc"}
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-4">{renderSummary()}</div>
            </div>
        </div>
    );
};
