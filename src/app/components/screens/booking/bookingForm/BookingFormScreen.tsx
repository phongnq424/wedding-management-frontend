import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
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
    UtensilsCrossed,
    Wallet,
} from "lucide-react";

import { bookingService } from "../../../../services/booking.service";
import { weddingPackageService } from "../../../../services/weddingPackage.service";
import { dishComboService } from "../../../../services/dishCombo.service";
import { dishService } from "../../../../services/dish.service";
import { serviceService } from "../../../../services/service.service";
import { beverageService } from "../../../../services/beverage.service";

import type { BookingRequestPayload } from "../../../../dto/booking.dto";
import type { WeddingPackageResponse } from "../../../../dto/weddingPackage.dto";
import type { DishComboResponse } from "../../../../dto/dishCombo.dto";
import type { DishResponse } from "../../../../dto/dish.dto";
import type { ServiceResponse } from "../../../../dto/service.dto";
import type { BeverageResponse } from "../../../../dto/beverage.dto";

import { formatVND } from "../../../../utils";
import type { BookingFormProps, ToastState } from "../booking.types";
import {
    buildManualDraftLines,
    buildPackageDraftLines,
    buildPackagePreviewLines,
    getPackageBenefitTexts,
    getPackageConditionTexts,
    getPackagePricePerTable,
} from "../booking.mapper";

import type {
    CustomerFormState,
    EditBookingLike,
    ManualComboSelection,
    ManualMenuMode,
    SelectedServiceState,
} from "./BookingForm.types";
import { BookingCustomerStep } from "./BookingCustomerStep";
import { BookingPackageMode } from "./BookingPackageMode";
import { BookingManualMode } from "./BookingManualMode";
import { BookingDepositStep } from "./BookingDepositStep";
import { BookingSummaryPanel } from "./BookingSummaryPanel";

type ManualComboPayload = {
    comboId: string;
    tableCount: number;
    slotReplacements: Array<{
        slotId: string;
        dishId: string;
    }>;
};

type BookingRequestPayloadWithManual = BookingRequestPayload & {
    manualMenuMode?: ManualMenuMode | null;
    manualComboSelections?: ManualComboPayload[];
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

    const [extraServicesState, setExtraServicesState] = useState<SelectedServiceState[]>([]);
    const [extraDishes, setExtraDishes] = useState<Array<{ dishId: string; quantity: number }>>([]);
    const [extraBeverages, setExtraBeverages] = useState<
        Array<{ beverageId: string; quantity: number }>
    >([]);

    const [manualMenuMode, setManualMenuMode] = useState<ManualMenuMode>("CUSTOM");
    const [manualComboSelections, setManualComboSelections] = useState<ManualComboSelection[]>([]);

    const [manualServicesState, setManualServicesState] = useState<SelectedServiceState[]>([]);
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
        setExtraServicesState([]);
        setExtraDishes([]);
        setExtraBeverages([]);

        setManualMenuMode("CUSTOM");
        setManualComboSelections([]);
        setManualServicesState([]);
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

    function fillManualComboSelectionsFromBooking(booking: EditBookingLike) {
        const snapshots = booking.menuComboSnapshots ?? [];

        const selections = snapshots
            .map((snapshot, index) => {
                const comboId = snapshot.comboId ?? "";

                return {
                    localId: snapshot.id ?? `${comboId}-${index}`,
                    comboId,
                    tableCount: snapshot.tableCount ?? 1,
                    slotReplacements: Object.fromEntries(
                        (snapshot.slotSnapshots ?? [])
                            .filter((slot) => Boolean(slot.selectedDishId))
                            .map((slot) => [
                                String(slot.slotId ?? slot.id ?? ""),
                                {
                                    dishId: slot.selectedDishId ?? "",
                                    dishName: slot.selectedDishName ?? "",
                                    price: slot.selectedDishPrice ?? 0,
                                },
                            ])
                            .filter(([slotId]) => Boolean(slotId))
                    ),
                };
            })
            .filter((item): item is ManualComboSelection => Boolean(item.comboId));

        setManualComboSelections(selections);
    }

    function fillFormFromBooking(booking: EditBookingLike) {
        setEditingBooking(booking);
        setEditingLastModifiedAt(booking.lastModifiedAt ?? null);

        setBookingMode(booking.bookingMode ?? "PACKAGE");
        setManualMenuMode(booking.manualMenuMode ?? "CUSTOM");
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

        setExtraServicesState([]);
        setExtraDishes([]);
        setExtraBeverages([]);

        setManualComboSelections([]);
        setManualServicesState([]);
        setManualDishes([]);
        setManualBeverages([]);

        setComboSlotReplacements({});
        setReplacingSlotId(null);

        const lines = booking.bookingLines ?? [];

        if (booking.bookingMode === "MANUAL" && booking.manualMenuMode === "COMBO") {
            fillManualComboSelectionsFromBooking(booking);
        }

        if (booking.bookingMode === "MANUAL") {
            setManualServicesState(
                lines
                    .filter((line) => line.itemType === "SERVICE")
                    .map((line) => ({
                        serviceId: line.itemId,
                        quantity: line.quantity ?? 1,
                    }))
                    .filter((item): item is SelectedServiceState => !!item.serviceId)
            );

            setManualDishes(
                lines
                    .filter(
                        (line) =>
                            line.itemType === "DISH" &&
                            booking.manualMenuMode !== "COMBO"
                    )
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

        if (booking.bookingMode === "PACKAGE") {
            setExtraServicesState(
                lines
                    .filter(
                        (line) =>
                            line.itemType === "SERVICE" &&
                            line.sourceType === "MANUAL_EXTRA"
                    )
                    .map((line) => ({
                        serviceId: line.itemId,
                        quantity: line.quantity ?? 1,
                    }))
                    .filter((item): item is SelectedServiceState => !!item.serviceId)
            );

            setExtraDishes(
                lines
                    .filter(
                        (line) =>
                            line.itemType === "DISH" &&
                            line.sourceType === "MANUAL_EXTRA"
                    )
                    .map((line) => ({
                        dishId: line.itemId,
                        quantity: line.quantity ?? 1,
                    }))
                    .filter((item): item is { dishId: string; quantity: number } => !!item.dishId)
            );

            setExtraBeverages(
                lines
                    .filter(
                        (line) =>
                            line.itemType === "BEVERAGE" &&
                            line.sourceType === "MANUAL_EXTRA"
                    )
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

    const packagePreviewLines = buildPackagePreviewLines(selectedPackage);
    const packageBenefits = getPackageBenefitTexts(selectedPackage);
    const packageConditions = getPackageConditionTexts(selectedPackage);

    const activePackages = packages.filter((item) => item.status === "ACTIVE");
    const activeServices = services.filter((item) => item.status === "ACTIVE");
    const activeDishes = dishes.filter((item) => item.status === "ACTIVE");
    const activeBeverages = beverages.filter((item) => item.status === "ACTIVE");

    const extraServices = extraServicesState
        .map((item) => ({
            service: services.find((service) => service.id === item.serviceId),
            quantity: item.quantity,
        }))
        .filter(
            (item): item is { service: ServiceResponse; quantity: number } =>
                !!item.service
        );

    const manualServices = manualServicesState
        .map((item) => ({
            service: services.find((service) => service.id === item.serviceId),
            quantity: item.quantity,
        }))
        .filter(
            (item): item is { service: ServiceResponse; quantity: number } =>
                !!item.service
        );

    const selectedExtraDishes = extraDishes
        .map((item) => ({
            dish: dishes.find((dish) => dish.id === item.dishId),
            quantity: item.quantity,
        }))
        .filter((item): item is { dish: DishResponse; quantity: number } => !!item.dish);

    const selectedExtraBeverages = extraBeverages
        .map((item) => ({
            beverage: beverages.find((beverage) => beverage.id === item.beverageId),
            quantity: item.quantity,
        }))
        .filter(
            (item): item is { beverage: BeverageResponse; quantity: number } =>
                !!item.beverage
        );

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
        bookingPreselect?.price ?? editingBooking?.hallPrice ?? 0;

    const hallFee = summaryHallFee;

    const packageMenuComboCost = selectedPackage
        ? getPackagePricePerTable(selectedPackage) * customerForm.numberOfTables
        : 0;

    const packageIncludedServiceCost =
        bookingMode === "PACKAGE" ? selectedPackage?.includedServiceTotal ?? 0 : 0;

    const packageIncludedBeverageCost =
        bookingMode === "PACKAGE" ? selectedPackage?.beverageAllowanceTotal ?? 0 : 0;

    const packageFixedIncludedCost =
        packageIncludedServiceCost + packageIncludedBeverageCost;

    const packageExtraServiceCost = extraServices.reduce(
        (sum, item) => sum + (item.service.price ?? 0) * item.quantity,
        0
    );

    const packageExtraDishCost = selectedExtraDishes.reduce(
        (sum, item) => sum + (item.dish.unitPrice ?? 0) * item.quantity,
        0
    );

    const packageExtraBeverageCost = selectedExtraBeverages.reduce(
        (sum, item) => sum + (item.beverage.unitPrice ?? 0) * item.quantity,
        0
    );

    const packageTotal =
        hallFee +
        packageMenuComboCost +
        packageFixedIncludedCost +
        packageExtraServiceCost +
        packageExtraDishCost +
        packageExtraBeverageCost;

    function getSlotId(slot: { slotId?: string | number; id?: string }, index: number) {
        return String(slot.slotId ?? slot.id ?? index);
    }

    function getSlotDefaultPrice(slot: {
        defaultDishId?: string | null;
        unitPrice?: number | null;
    }) {
        const defaultDish = dishes.find((dish) => dish.id === slot.defaultDishId);
        return slot.unitPrice ?? defaultDish?.unitPrice ?? 0;
    }

    function calculateManualComboDishCost() {
        return manualComboSelections.reduce((sum, selection) => {
            const combo = dishCombos.find((item) => item.id === selection.comboId);
            if (!combo) return sum;

            const slots = combo.slots ?? [];

            const menuTotalPerTable = slots.reduce((slotSum, slot, index) => {
                const slotId = getSlotId(slot, index);
                const replacement = selection.slotReplacements[slotId];

                return slotSum + (replacement?.price ?? getSlotDefaultPrice(slot));
            }, 0);

            const discountRate = combo.comboDiscountRate ?? 0;
            const discountedMenuPerTable = menuTotalPerTable * (1 - discountRate / 100);

            return sum + discountedMenuPerTable * Math.max(1, selection.tableCount || 1);
        }, 0);
    }

    const manualServiceCost = manualServices.reduce(
        (sum, item) => sum + (item.service.price ?? 0) * item.quantity,
        0
    );

    const manualCustomDishCost = selectedManualDishes.reduce(
        (sum, item) => sum + (item.dish.unitPrice ?? 0) * item.quantity * customerForm.numberOfTables,
        0
    );

    const manualComboDishCost = calculateManualComboDishCost();

    const manualDishCost =
        manualMenuMode === "COMBO" ? manualComboDishCost : manualCustomDishCost;

    const manualBeverageCost = selectedManualBeverages.reduce(
        (sum, item) => sum + (item.beverage.unitPrice ?? 0) * item.quantity,
        0
    );

    const manualTotal = hallFee + manualServiceCost + manualDishCost + manualBeverageCost;

    const bookingAmount = bookingMode === "PACKAGE" ? packageTotal : manualTotal;
    const recommendedDeposit = Math.ceil(bookingAmount * 0.3);
    const effectiveDepositAmount = Math.max(depositAmount, recommendedDeposit);
    const remainingAmount = Math.max(bookingAmount - effectiveDepositAmount, 0);

    const foodAmount =
        bookingMode === "PACKAGE"
            ? packageMenuComboCost + packageExtraDishCost
            : manualDishCost;

    const serviceAmount =
        bookingMode === "PACKAGE"
            ? packageIncludedServiceCost + packageExtraServiceCost
            : manualServiceCost;

    const beverageAmount =
        bookingMode === "PACKAGE"
            ? packageIncludedBeverageCost + packageExtraBeverageCost
            : manualBeverageCost;

    const packageIncludedServiceAmount =
        bookingMode === "PACKAGE" ? packageIncludedServiceCost : 0;

    const packageIncludedBeverageAmount =
        bookingMode === "PACKAGE" ? packageIncludedBeverageCost : 0;

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

    function updateCustomerForm<K extends keyof CustomerFormState>(
        key: K,
        value: CustomerFormState[K]
    ) {
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

            if (bookingMode === "MANUAL" && manualMenuMode === "COMBO") {
                if (manualComboSelections.length === 0) {
                    showToast("Vui lòng chọn ít nhất một combo món ăn.", "error");
                    return false;
                }

                const totalComboTables = manualComboSelections.reduce(
                    (sum, item) => sum + Math.max(1, item.tableCount || 1),
                    0
                );

                if (totalComboTables !== customerForm.numberOfTables) {
                    showToast("Tổng số bàn của các combo phải bằng số bàn booking.", "error");
                    return false;
                }
            }

            if (
                bookingMode === "MANUAL" &&
                manualMenuMode === "CUSTOM" &&
                selectedManualDishes.length === 0
            ) {
                showToast("Vui lòng chọn ít nhất một món ăn.", "error");
                return false;
            }
        }

        return true;
    }

    function goNext() {
        if (!validateStep(bookingStep)) return;
        setBookingStep((prev) => Math.min(4, prev + 1));
    }

    function addService(
        serviceId: string,
        setter: Dispatch<SetStateAction<SelectedServiceState[]>>
    ) {
        if (!serviceId) return;

        setter((prev) => {
            const existing = prev.find((item) => item.serviceId === serviceId);

            if (existing) {
                return prev.map((item) =>
                    item.serviceId === serviceId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...prev, { serviceId, quantity: 1 }];
        });
    }

    function updateServiceQuantity(
        serviceId: string,
        quantity: number,
        setter: Dispatch<SetStateAction<SelectedServiceState[]>>
    ) {
        setter((prev) =>
            prev.map((item) =>
                item.serviceId === serviceId
                    ? { ...item, quantity: Math.max(1, Math.floor(quantity || 1)) }
                    : item
            )
        );
    }

    function removeService(
        serviceId: string,
        setter: Dispatch<SetStateAction<SelectedServiceState[]>>
    ) {
        setter((prev) => prev.filter((item) => item.serviceId !== serviceId));
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
                extraBeverages: selectedExtraBeverages,
            });

            const manualDraftLines = buildManualDraftLines({
                services: manualServices,
                dishes: manualMenuMode === "CUSTOM" ? selectedManualDishes : [],
                beverages: selectedManualBeverages,
            });

            const manualComboPayload: ManualComboPayload[] =
                bookingMode === "MANUAL" && manualMenuMode === "COMBO"
                    ? manualComboSelections.map((selection) => ({
                        comboId: selection.comboId,
                        tableCount: Math.max(1, selection.tableCount || 1),
                        slotReplacements: Object.entries(selection.slotReplacements)
                            .filter(([, replacement]) => Boolean(replacement.dishId))
                            .map(([slotId, replacement]) => ({
                                slotId,
                                dishId: replacement.dishId,
                            })),
                    }))
                    : [];

            const bookingDateValue = bookingPreselect?.date ?? editingBooking?.bookingDate;
            const shiftIdValue = bookingPreselect?.shiftId ?? editingBooking?.shiftId;
            const hallIdValue = bookingPreselect?.hallId ?? editingBooking?.hallId;

            if (!bookingDateValue || !shiftIdValue || !hallIdValue) {
                showToast("Thiếu thông tin sảnh, ca hoặc ngày đặt tiệc.", "error");
                return;
            }

            const payload: BookingRequestPayloadWithManual = {
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
                manualMenuMode: bookingMode === "MANUAL" ? manualMenuMode : null,
                manualComboSelections:
                    bookingMode === "MANUAL" && manualMenuMode === "COMBO"
                        ? manualComboPayload
                        : [],
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

            {bookingMode === "PACKAGE" ? (
                <BookingPackageMode
                    activePackages={activePackages}
                    selectedPackage={selectedPackage}
                    selectedPackageId={selectedPackageId}
                    setSelectedPackageId={setSelectedPackageId}
                    selectedComboId={selectedComboId}
                    setSelectedComboId={setSelectedComboId}
                    selectedCombo={selectedCombo}
                    dishCombos={dishCombos}
                    dishes={dishes}
                    activeDishes={activeDishes}
                    extraDishes={extraDishes}
                    setExtraDishes={setExtraDishes}
                    selectedExtraDishes={selectedExtraDishes}
                    activeServices={activeServices}
                    activeBeverages={activeBeverages}
                    packagePreviewLines={packagePreviewLines}
                    packageBenefits={packageBenefits}
                    packageConditions={packageConditions}
                    comboSlotReplacements={comboSlotReplacements}
                    setComboSlotReplacements={setComboSlotReplacements}
                    replacingSlotId={replacingSlotId}
                    setReplacingSlotId={setReplacingSlotId}
                    extraServicesState={extraServicesState}
                    setExtraServicesState={setExtraServicesState}
                    extraServices={extraServices}
                    extraBeverages={extraBeverages}
                    setExtraBeverages={setExtraBeverages}
                    selectedExtraBeverages={selectedExtraBeverages}
                    addService={addService}
                    updateServiceQuantity={updateServiceQuantity}
                    removeService={removeService}
                />
            ) : (
                <BookingManualMode
                    manualMenuMode={manualMenuMode}
                    setManualMenuMode={setManualMenuMode}
                    dishCombos={dishCombos}
                    manualComboSelections={manualComboSelections}
                    setManualComboSelections={setManualComboSelections}
                    numberOfTables={customerForm.numberOfTables}
                    activeServices={activeServices}
                    activeDishes={activeDishes}
                    activeBeverages={activeBeverages}
                    manualServicesState={manualServicesState}
                    setManualServicesState={setManualServicesState}
                    manualServices={manualServices}
                    manualDishes={manualDishes}
                    setManualDishes={setManualDishes}
                    selectedManualDishes={selectedManualDishes}
                    manualBeverages={manualBeverages}
                    setManualBeverages={setManualBeverages}
                    selectedManualBeverages={selectedManualBeverages}
                    addService={addService}
                    updateServiceQuantity={updateServiceQuantity}
                    removeService={removeService}
                />
            )}
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

                    {bookingStep === 2 && (
                        <BookingCustomerStep
                            customerForm={customerForm}
                            updateCustomerForm={updateCustomerForm}
                        />
                    )}

                    {bookingStep === 3 && renderStep3()}

                    {bookingStep === 4 && (
                        <BookingDepositStep
                            bookingAmount={bookingAmount}
                            recommendedDeposit={recommendedDeposit}
                            depositAmount={depositAmount}
                            setDepositAmount={setDepositAmount}
                            remainingAmount={remainingAmount}
                        />
                    )}

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

                <div className="space-y-4">
                    <BookingSummaryPanel
                        summaryHallName={summaryHallName}
                        summaryDate={summaryDate}
                        summaryShiftName={summaryShiftName}
                        summaryHallFee={summaryHallFee}
                        numberOfTables={customerForm.numberOfTables}
                        bookingMode={bookingMode}
                        foodAmount={foodAmount}
                        serviceAmount={serviceAmount}
                        beverageAmount={beverageAmount}
                        packageIncludedServiceAmount={packageIncludedServiceAmount}
                        packageIncludedBeverageAmount={packageIncludedBeverageAmount}
                        bookingAmount={bookingAmount}
                        effectiveDepositAmount={effectiveDepositAmount}
                        remainingAmount={remainingAmount}
                    />
                </div>
            </div>
        </div>
    );
};