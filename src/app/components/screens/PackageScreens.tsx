import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  ArrowLeft,
  ChevronRight,
  Package,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  X,
  UtensilsCrossed,
  Sparkles,
  ShieldCheck,
  Gift,
  Info,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  ToggleRight,
  Eye,
} from "lucide-react";

import { Screen } from "../../types";
import { formatVND, StatusBadge } from "../../utils";

import { weddingPackageService } from "../../services/weddingPackage.service";

import type {
  WeddingPackageResponse,
  WeddingPackageRequestPayload,
  WeddingPackageServiceItemDTO,
  WeddingPackageBeverageAllowanceDTO,
  WeddingPackageBenefitDTO,
  WeddingPackageBenefitItemTypeApi,
  WeddingPackageConditionDTO,
  PackageConditionTypeApi,
} from "../../dto/weddingPackage.dto";
import type { DishComboResponse } from "../../dto/dishCombo.dto";
import type { DishResponse } from "../../dto/dish.dto";
import type { ServiceResponse } from "../../dto/service.dto";
import type { BeverageResponse } from "../../dto/beverage.dto";
import type { HallTypeResponse } from "../../dto/hallType.dto";
import type { ShiftResponse } from "../../dto/shift.dto";

import { HallListSkeleton } from "./hall/HallListSkeleton";
import {
  invalidateWeddingPackages,
  loadBeverages,
  loadDishCombos,
  loadDishes,
  loadHallTypes,
  loadServices,
  loadShifts,
  loadWeddingPackageDetail,
  loadWeddingPackages,
  packageReferenceCache,
  removeCachedWeddingPackageDetail,
  setCachedWeddingPackages,
} from "../../cache/packageReferenceCache";

type StatusLabel = "Active" | "Inactive";

type WeddingPackageViewModel = WeddingPackageResponse & {
  deleted: boolean;
  statusLabel: StatusLabel;
  lastModified: string;
  lastModifiedDisplay: string;
  descriptionText: string;
};

type PackageScreenProps = {
  setScreen: (s: Screen) => void;
  selectedPackage?: string | null;
  setSelectedPackage?: (id: string | null) => void;
};

const ITEMS_PER_PAGE = 6;

const MSG = {
  2: "Vui lòng điền đầy đủ tất cả các trường bắt buộc.",
  48: "Gói tiệc đã được lưu thành công!",
  50: "Có lỗi khi lưu dữ liệu. Vui lòng thử lại.",
};

function formatDateTime(value: string | null | undefined) {
  return value ? value.slice(0, 16).replace("T", " ") : "N/A";
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "0%";
  return `${value.toFixed(1)}%`;
}

function getSafeMoney(value: number | null | undefined) {
  return value ?? 0;
}

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

function mapPackageToViewModel(
  item: WeddingPackageResponse
): WeddingPackageViewModel {
  return {
    ...item,
    deleted: false,
    statusLabel: item.status === "ACTIVE" ? "Active" : "Inactive",
    lastModified: item.lastModifiedAt ?? "",
    lastModifiedDisplay: formatDateTime(item.lastModifiedAt),
    descriptionText: item.description ?? "",
    menuComboOptions: item.menuComboOptions ?? [],
    menuComboNames: item.menuComboNames ?? [],
    includedServiceList: item.includedServiceList ?? [],
    beverageAllowanceList: item.beverageAllowanceList ?? [],
    packageBenefitList: item.packageBenefitList ?? [],
    conditionList: item.conditionList ?? [],
  };
}

function toLastModifiedSafe(value: string) {
  return value || new Date().toISOString();
}

function getConditionLabel(condition: WeddingPackageConditionDTO) {
  if (condition.conditionType === "HALL_TYPE") {
    return `Hall type: ${condition.hallTypeName ?? condition.hallTypeId ?? "N/A"}`;
  }

  if (condition.conditionType === "SHIFT") {
    return `Shift: ${condition.shiftName ?? condition.shiftId ?? "N/A"}`;
  }

  if (condition.conditionType === "MIN_TABLES") {
    return `Min tables: ${condition.numericValue ?? condition.conditionValue ?? "N/A"}`;
  }

  if (condition.conditionType === "MAX_TABLES") {
    return `Max tables: ${condition.numericValue ?? condition.conditionValue ?? "N/A"}`;
  }

  return condition.conditionValue ?? condition.conditionType;
}

function getBenefitTypeLabel(type: WeddingPackageBenefitItemTypeApi) {
  if (type === "DISH") return "Món tặng";
  if (type === "SERVICE") return "Dịch vụ tặng";
  return "Thức uống tặng";
}

function getBenefitImage(
  benefit: WeddingPackageBenefitDTO,
  dishes: DishResponse[],
  services: ServiceResponse[],
  beverages: BeverageResponse[]
) {
  if (benefit.itemType === "DISH") {
    return dishes.find((item) => item.id === benefit.itemId)?.dishImage ?? "";
  }

  if (benefit.itemType === "SERVICE") {
    return services.find((item) => item.id === benefit.itemId)?.serviceImage ?? "";
  }

  return beverages.find((item) => item.id === benefit.itemId)?.beverageImage ?? "";
}

function getBenefitUnitValue(
  type: WeddingPackageBenefitItemTypeApi,
  itemId: string,
  dishes: DishResponse[],
  services: ServiceResponse[],
  beverages: BeverageResponse[]
) {
  if (type === "DISH") {
    return dishes.find((item) => item.id === itemId)?.unitPrice ?? 0;
  }

  if (type === "SERVICE") {
    return services.find((item) => item.id === itemId)?.price ?? 0;
  }

  return beverages.find((item) => item.id === itemId)?.unitPrice ?? 0;
}

function getBenefitName(
  type: WeddingPackageBenefitItemTypeApi,
  itemId: string,
  dishes: DishResponse[],
  services: ServiceResponse[],
  beverages: BeverageResponse[]
) {
  if (type === "DISH") {
    return dishes.find((item) => item.id === itemId)?.name ?? "";
  }

  if (type === "SERVICE") {
    return services.find((item) => item.id === itemId)?.name ?? "";
  }

  return beverages.find((item) => item.id === itemId)?.name ?? "";
}

function cleanBenefitPayload(
  benefits: WeddingPackageBenefitDTO[]
): WeddingPackageBenefitDTO[] {
  return benefits.map((item, index) => ({
    itemType: item.itemType,
    itemId: item.itemId,
    quantity: item.quantity,
    note: item.note ?? "",
    displayOrder: index + 1,
  }));
}


function fixedTextClass(extra = "") {
  return `min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap ${extra}`;
}

function breakTextClass(extra = "") {
  return `min-w-0 max-w-full break-words overflow-hidden ${extra}`;
}

const FormSection = ({
  title,
  icon: Icon,
  children,
  error,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  error?: string;
}) => (
  <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-border bg-secondary/30 flex items-center gap-2">
      <Icon className="w-4 h-4 text-accent" />
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
    </div>

    <div className="p-6">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {children}
    </div>
  </div>
);

export const PackageListScreen = ({
  setScreen,
  setSelectedPackage,
}: PackageScreenProps) => {
  const [packages, setPackages] = useState<WeddingPackageViewModel[]>(
    (packageReferenceCache.getPackages() ?? []).map(mapPackageToViewModel)
  );
  const [dishCombos, setDishCombos] = useState<DishComboResponse[]>(
    packageReferenceCache.getDishCombos() ?? []
  );
  const [dishes, setDishes] = useState<DishResponse[]>(
    packageReferenceCache.getDishes() ?? []
  );
  const [services, setServices] = useState<ServiceResponse[]>(
    packageReferenceCache.getServices() ?? []
  );
  const [beverages, setBeverages] = useState<BeverageResponse[]>(
    packageReferenceCache.getBeverages() ?? []
  );
  const [hallTypes, setHallTypes] = useState<HallTypeResponse[]>(
    packageReferenceCache.getHallTypes() ?? []
  );
  const [shifts, setShifts] = useState<ShiftResponse[]>(
    packageReferenceCache.getShifts() ?? []
  );

  const [loading, setLoading] = useState(packageReferenceCache.getPackages() === undefined);
  const [comboLoading, setComboLoading] = useState(false);
  const [dishLoading, setDishLoading] = useState(false);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [beverageLoading, setBeverageLoading] = useState(false);
  const [hallTypeLoading, setHallTypeLoading] = useState(false);
  const [shiftLoading, setShiftLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [packageName, setPackageName] = useState("");
  const [dishComboSearchDropdown, setDishComboSearchDropdown] = useState("");
  const [selectedDishComboList, setSelectedDishComboList] = useState<string[]>([]);
  const [serviceSearchDropdown, setServiceSearchDropdown] = useState("");
  const [selectedServiceList, setSelectedServiceList] = useState<string[]>([]);
  const [beverageSearchDropdown, setBeverageSearchDropdown] = useState("");
  const [selectedBeverageList, setSelectedBeverageList] = useState<string[]>([]);
  const [hallTypeId, setHallTypeId] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");

  const [page, setPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  async function ensurePackagesLoaded(force = false) {
    const packageData = await loadWeddingPackages({ force });
    const mapped = packageData.map(mapPackageToViewModel);

    setPackages(mapped);
    return mapped;
  }

  async function ensureDishCombosLoaded(force = false) {
    const data = await loadDishCombos({ force });

    setDishCombos(data);
    return data;
  }

  async function ensureDishesLoaded(force = false) {
    if (dishLoading) return dishes;

    try {
      setDishLoading(true);
      const data = await loadDishes({ force });

      setDishes(data);
      return data;
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Cannot load dishes.", "error");
      return [];
    } finally {
      setDishLoading(false);
    }
  }

  async function ensureServicesLoaded(force = false) {
    const data = await loadServices({ force });

    setServices(data);
    return data;
  }

  async function ensureBeveragesLoaded(force = false) {
    const data = await loadBeverages({ force });

    setBeverages(data);
    return data;
  }

  async function ensureHallTypesLoaded(force = false) {
    const data = await loadHallTypes({ force });

    setHallTypes(data);
    return data;
  }

  async function ensureShiftsLoaded(force = false) {
    const data = await loadShifts({ force });

    setShifts(data);
    return data;
  }

  async function loadData(force = false) {
    try {
      setLoading(packages.length === 0 && packageReferenceCache.getPackages() === undefined);
      await ensurePackagesLoaded(force);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Cannot load wedding packages.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearchPackages() {
    try {
      setSearching(true);
      setPage(1);

      const status =
        statusFilter === "All"
          ? undefined
          : statusFilter === "Active"
            ? "ACTIVE"
            : "INACTIVE";

      const result = await weddingPackageService.search({
        packageName: packageName.trim() || undefined,
        selectedDishComboIds: selectedDishComboList.length > 0 ? selectedDishComboList : undefined,
        selectedServiceIds: selectedServiceList.length > 0 ? selectedServiceList : undefined,
        selectedBeverageIds: selectedBeverageList.length > 0 ? selectedBeverageList : undefined,
        hallTypeId: hallTypeId || undefined,
        shiftId: shiftId || undefined,
        status,
        page: 0,
        size: 20,
      });

      setCachedWeddingPackages(result.content);
      const mapped = result.content.map(mapPackageToViewModel);
      setPackages(mapped);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Cannot search wedding packages.", "error");
    } finally {
      setSearching(false);
    }
  }

  function addUniqueValue(value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) {
    if (!value) return;
    setter((prev) => (prev.includes(value) ? prev : [...prev, value]));
  }

  function removeValue(value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter((prev) => prev.filter((item) => item !== value));
  }

  function resetSearchFilters() {
    setPackageName("");
    setDishComboSearchDropdown("");
    setSelectedDishComboList([]);
    setServiceSearchDropdown("");
    setSelectedServiceList([]);
    setBeverageSearchDropdown("");
    setSelectedBeverageList([]);
    setHallTypeId("");
    setShiftId("");
    setStatusFilter("All");
    setPage(1);
    loadData(true);
  }

  useEffect(() => {
    loadData(true);
  }, []);

  const visible = useMemo(() => {
    return packages
      .filter((pkg) => !pkg.deleted)
      .sort((a, b) => b.lastModified.localeCompare(a.lastModified));
  }, [packages]);

  const totalPages = Math.max(1, Math.ceil(visible.length / ITEMS_PER_PAGE));
  const paginated = visible.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  async function handleToggleStatus(pkg: WeddingPackageViewModel) {
    if (!pkg.lastModified) {
      showToast("Không thể cập nhật vì thiếu lastModifiedAt. Vui lòng tải lại.", "error");
      return;
    }

    try {
      setTogglingId(pkg.id);

      const payload: WeddingPackageRequestPayload = {
        packageName: pkg.packageName,
        description: pkg.description ?? "",
        menuComboOptions: pkg.menuComboOptions ?? [],
        defaultMenuComboId: pkg.defaultMenuComboId,
        includedServiceList: pkg.includedServiceList ?? [],
        beverageAllowanceList: pkg.beverageAllowanceList ?? [],
        packageBenefitList: cleanBenefitPayload(pkg.packageBenefitList ?? []),
        conditionList: pkg.conditionList ?? [],
        status: pkg.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      };

      await weddingPackageService.update(pkg.id, payload, pkg.lastModified);
      invalidateWeddingPackages(pkg.id);
      await loadData(true);

      showToast("Đã cập nhật trạng thái gói tiệc.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Cannot update package status.", "error");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    try {
      setDeletingId(id);

      await weddingPackageService.remove(id, true);
      removeCachedWeddingPackageDetail(id);
      await loadData(true);

      setDeleteConfirmId(null);
      showToast("Đã xóa gói tiệc.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Cannot delete wedding package.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(id: string) {
    setSelectedPackage?.(id);
    setScreen("package-form");
  }

  if (loading) return <HallListSkeleton />;

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-all ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
            }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-6">
          <div className="bg-card rounded-[24px] p-8 max-w-sm w-full border border-border shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Xác nhận xóa</h3>
                <p className="text-sm text-muted-foreground">Hành động này không thể hoàn tác.</p>
              </div>
            </div>

            <p className="text-sm text-foreground mb-6">
              Bạn có chắc muốn xóa gói tiệc{" "}
              <strong>"{packages.find((p) => p.id === deleteConfirmId)?.packageName}"</strong>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-all"
              >
                Hủy
              </button>

              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deletingId === deleteConfirmId}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {deletingId === deleteConfirmId ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">Wedding Packages</h1>
          <p className="text-muted-foreground">
            Quản lý gói tiệc cưới — thực đơn, dịch vụ, thức uống và quà tặng kèm
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedPackage?.(null);
            setScreen("package-form");
          }}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Thêm gói mới
        </button>
      </div>

      <div className="bg-card rounded-[20px] p-5 border border-border shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Package Name
            </label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search package name..."
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Dish Combo
            </label>

            <div className="flex gap-2">
              <select
                value={dishComboSearchDropdown}
                onFocus={async () => {
                  try {
                    setComboLoading(true);
                    await ensureDishCombosLoaded(true);
                  } catch (error) {
                    showToast(error instanceof Error ? error.message : "Cannot load dish combos.", "error");
                  } finally {
                    setComboLoading(false);
                  }
                }}
                onChange={(e) => setDishComboSearchDropdown(e.target.value)}
                className="min-w-0 flex-1 px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                <option value="">{comboLoading ? "Loading combos..." : "Select combo"}</option>
                {dishCombos.map((combo) => (
                  <option key={combo.id} value={combo.id}>
                    {combo.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  addUniqueValue(dishComboSearchDropdown, setSelectedDishComboList);
                  setDishComboSearchDropdown("");
                }}
                className="px-3 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm hover:bg-accent/90 transition-all"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Service
            </label>

            <div className="flex gap-2">
              <select
                value={serviceSearchDropdown}
                onFocus={async () => {
                  try {
                    setServiceLoading(true);
                    await ensureServicesLoaded(true);
                  } catch (error) {
                    showToast(error instanceof Error ? error.message : "Cannot load services.", "error");
                  } finally {
                    setServiceLoading(false);
                  }
                }}
                onChange={(e) => setServiceSearchDropdown(e.target.value)}
                className="min-w-0 flex-1 px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                <option value="">{serviceLoading ? "Loading services..." : "Select service"}</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  addUniqueValue(serviceSearchDropdown, setSelectedServiceList);
                  setServiceSearchDropdown("");
                }}
                className="px-3 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm hover:bg-accent/90 transition-all"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Beverage
            </label>

            <div className="flex gap-2">
              <select
                value={beverageSearchDropdown}
                onFocus={async () => {
                  try {
                    setBeverageLoading(true);
                    await ensureBeveragesLoaded(true);
                  } catch (error) {
                    showToast(error instanceof Error ? error.message : "Cannot load beverages.", "error");
                  } finally {
                    setBeverageLoading(false);
                  }
                }}
                onChange={(e) => setBeverageSearchDropdown(e.target.value)}
                className="min-w-0 flex-1 px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                <option value="">{beverageLoading ? "Loading beverages..." : "Select beverage"}</option>
                {beverages.map((beverage) => (
                  <option key={beverage.id} value={beverage.id}>
                    {beverage.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  addUniqueValue(beverageSearchDropdown, setSelectedBeverageList);
                  setBeverageSearchDropdown("");
                }}
                className="px-3 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm hover:bg-accent/90 transition-all"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Hall Type
            </label>

            <select
              value={hallTypeId}
              onFocus={async () => {
                try {
                  setHallTypeLoading(true);
                  await ensureHallTypesLoaded(true);
                } catch (error) {
                  showToast(error instanceof Error ? error.message : "Cannot load hall types.", "error");
                } finally {
                  setHallTypeLoading(false);
                }
              }}
              onChange={(e) => setHallTypeId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="">{hallTypeLoading ? "Loading hall types..." : "All Hall Types"}</option>
              {hallTypes.map((hallType) => (
                <option key={hallType.id} value={hallType.id}>
                  {hallType.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Shift
            </label>

            <select
              value={shiftId}
              onFocus={async () => {
                try {
                  setShiftLoading(true);
                  await ensureShiftsLoaded(true);
                } catch (error) {
                  showToast(error instanceof Error ? error.message : "Cannot load shifts.", "error");
                } finally {
                  setShiftLoading(false);
                }
              }}
              onChange={(e) => setShiftId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="">{shiftLoading ? "Loading shifts..." : "All Shifts"}</option>
              {shifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "All" | "Active" | "Inactive")}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleSearchPackages}
              disabled={searching}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {searching ? "Searching..." : "Search"}
            </button>

            <button
              onClick={resetSearchFilters}
              className="px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-secondary transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {(selectedDishComboList.length > 0 || selectedServiceList.length > 0 || selectedBeverageList.length > 0) && (
          <div className="space-y-2 pt-2 border-t border-border">
            {selectedDishComboList.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium text-muted-foreground self-center">Dish Combos:</span>
                {selectedDishComboList.map((id) => {
                  const combo = dishCombos.find((item) => item.id === id);
                  return (
                    <button
                      key={id}
                      onClick={() => removeValue(id, setSelectedDishComboList)}
                      className="px-2.5 py-1 rounded-lg bg-accent/10 text-accent text-xs hover:bg-accent/20 transition-all"
                    >
                      {combo?.name ?? id} ×
                    </button>
                  );
                })}
              </div>
            )}

            {selectedServiceList.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium text-muted-foreground self-center">Services:</span>
                {selectedServiceList.map((id) => {
                  const service = services.find((item) => item.id === id);
                  return (
                    <button
                      key={id}
                      onClick={() => removeValue(id, setSelectedServiceList)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs hover:bg-emerald-100 transition-all"
                    >
                      {service?.name ?? id} ×
                    </button>
                  );
                })}
              </div>
            )}

            {selectedBeverageList.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium text-muted-foreground self-center">Beverages:</span>
                {selectedBeverageList.map((id) => {
                  const beverage = beverages.find((item) => item.id === id);
                  return (
                    <button
                      key={id}
                      onClick={() => removeValue(id, setSelectedBeverageList)}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs hover:bg-blue-100 transition-all"
                    >
                      {beverage?.name ?? id} ×
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground">{visible.length} result(s) found</p>
      </div>

      {paginated.length === 0 ? (
        <div className="bg-card rounded-[20px] border border-border p-16 flex flex-col items-center gap-3 text-center">
          <Package className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-base font-semibold text-foreground">Không tìm thấy gói tiệc</p>
          <p className="text-sm text-muted-foreground">Thử thay đổi bộ lọc hoặc thêm gói mới.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginated.map((pkg) => {
            const isExpanded = expandedId === pkg.id;
            const originalTotal = getSafeMoney(pkg.originalPackageTotal);
            const packageTotal = getSafeMoney(pkg.estimatedPackageTotal);
            const savingsAmount = getSafeMoney(pkg.estimatedSavingsAmount);
            const savingsRate = getSafeMoney(pkg.estimatedSavingsRate);
            const combos = pkg.menuComboOptions
              .map((id) => dishCombos.find((combo) => combo.id === id))
              .filter(Boolean) as DishComboResponse[];

            return (
              <div key={pkg.id} className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden min-w-0">
                <div className="p-5 flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <h3 className={fixedTextClass("text-base font-semibold text-foreground max-w-[520px]")}>{pkg.packageName}</h3>
                      <StatusBadge status={pkg.statusLabel} />
                    </div>

                    <p className={breakTextClass("text-sm text-muted-foreground line-clamp-2 mb-3")}>
                      {pkg.descriptionText || "No description"}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-accent" />
                        {pkg.numberOfMenuCombos ?? pkg.menuComboOptions.length} combo menu
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-accent" />
                        {pkg.numberOfIncludedServices ?? pkg.includedServiceList.length} dịch vụ
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-accent" />
                        {pkg.numberOfBeverageAllowances ?? pkg.beverageAllowanceList.length} thức uống
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-accent" />
                        {pkg.numberOfBenefits ?? pkg.packageBenefitList.length} quà tặng
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 flex-shrink-0 min-w-0 w-full sm:w-auto">
                    <p className="text-xs text-muted-foreground font-mono">
                      Updated: {pkg.lastModifiedDisplay}
                    </p>

                    <div className="text-right rounded-xl border border-border bg-secondary/40 px-4 py-3 w-full sm:w-[260px] max-w-full overflow-hidden">
                      <p className="text-xs text-muted-foreground mb-1">Package Total</p>

                      <p className="text-lg font-semibold text-primary font-mono">
                        {formatVND(packageTotal)}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center justify-end gap-2 text-xs min-w-0">
                        <span className="text-muted-foreground line-through font-mono">
                          {formatVND(originalTotal)}
                        </span>

                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                          Save {formatVND(savingsAmount)} · {formatPercent(savingsRate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <button
                        onClick={async () => {
                          const nextId = isExpanded ? null : pkg.id;
                          setExpandedId(nextId);

                          if (!nextId) return;

                          const tasks: Promise<unknown>[] = [];

                          if (pkg.menuComboOptions.length > 0 && dishCombos.length === 0) {
                            tasks.push(ensureDishCombosLoaded());
                          }

                          if (
                            (pkg.includedServiceList.length > 0 ||
                              pkg.packageBenefitList.some((item) => item.itemType === "SERVICE")) &&
                            services.length === 0
                          ) {
                            tasks.push(ensureServicesLoaded());
                          }

                          if (
                            (pkg.beverageAllowanceList.length > 0 ||
                              pkg.packageBenefitList.some((item) => item.itemType === "BEVERAGE")) &&
                            beverages.length === 0
                          ) {
                            tasks.push(ensureBeveragesLoaded());
                          }

                          if (
                            pkg.packageBenefitList.some((item) => item.itemType === "DISH") &&
                            dishes.length === 0
                          ) {
                            tasks.push(ensureDishesLoaded());
                          }

                          await Promise.all(tasks);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-secondary transition-all text-xs flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {isExpanded ? "Ẩn" : "Xem"}
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      <button
                        onClick={() => handleEdit(pkg.id)}
                        className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all text-xs flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Sửa
                      </button>

                      <button
                        onClick={() => handleToggleStatus(pkg)}
                        disabled={togglingId === pkg.id}
                        className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all disabled:opacity-50 ${pkg.status === "ACTIVE"
                          ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                      >
                        {pkg.status === "ACTIVE" ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
                        {pkg.status === "ACTIVE" ? "Tắt" : "Kích hoạt"}
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(pkg.id)}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border p-5 bg-secondary/20">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-5">
                      <div className="rounded-xl border border-border bg-card p-4 min-w-0 overflow-hidden">
                        <p className="text-xs text-muted-foreground mb-1">Original Combo</p>
                        <p className="text-sm font-semibold text-foreground font-mono">
                          {formatVND(getSafeMoney(pkg.estimatedOriginalMenuComboPrice))}
                        </p>
                      </div>

                      <div className="rounded-xl border border-border bg-card p-4 min-w-0 overflow-hidden">
                        <p className="text-xs text-muted-foreground mb-1">Discounted Combo</p>
                        <p className="text-sm font-semibold text-accent font-mono">
                          {formatVND(getSafeMoney(pkg.estimatedDiscountedMenuComboPrice))}
                        </p>
                      </div>

                      <div className="rounded-xl border border-border bg-card p-4 min-w-0 overflow-hidden">
                        <p className="text-xs text-muted-foreground mb-1">Services + Beverages</p>
                        <p className="text-sm font-semibold text-foreground font-mono">
                          {formatVND(getSafeMoney(pkg.includedServiceTotal) + getSafeMoney(pkg.beverageAllowanceTotal))}
                        </p>
                      </div>

                      <div className="rounded-xl border border-border bg-card p-4 min-w-0 overflow-hidden">
                        <p className="text-xs text-muted-foreground mb-1">Combo Discount Save</p>
                        <p className="text-sm font-semibold text-amber-700 font-mono">
                          {formatVND(getSafeMoney(pkg.menuDiscountSavingsAmount))}
                        </p>
                      </div>

                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 min-w-0 overflow-hidden">
                        <p className="text-xs text-emerald-700 mb-1">Total Customer Benefit</p>
                        <p className="text-sm font-semibold text-emerald-800 font-mono">
                          {formatVND(getSafeMoney(pkg.estimatedSavingsAmount))}
                        </p>
                        <p className="text-[11px] text-emerald-700">
                          {formatPercent(pkg.estimatedSavingsRate)} cheaper / gifted value
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                      <div>
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <UtensilsCrossed className="w-3.5 h-3.5 text-accent" />
                          Menu Combos
                        </p>

                        <ul className="space-y-1.5">
                          {combos.map((combo) => (
                            <li key={combo.id} className="text-xs text-foreground flex items-center gap-1.5">
                              <span
                                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${combo.id === pkg.defaultMenuComboId ? "bg-accent" : "bg-muted-foreground"
                                  }`}
                              />
                              {combo.name}
                              {combo.id === pkg.defaultMenuComboId && (
                                <span className="text-accent text-[10px] font-medium">(mặc định)</span>
                              )}
                            </li>
                          ))}

                          {combos.length === 0 && (
                            <li className="text-xs text-muted-foreground">No menu combo</li>
                          )}
                        </ul>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-accent" />
                          Dịch vụ tính trong gói
                        </p>

                        <ul className="space-y-1.5">
                          {pkg.includedServiceList.map((service) => {
                            const fullService = services.find((item) => item.id === service.serviceId);

                            return (
                              <li
                                key={service.serviceId}
                                className="rounded-xl border border-border bg-card p-2 flex items-center gap-2"
                              >
                                <div className="h-10 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                  {fullService?.serviceImage ? (
                                    <img
                                      src={fullService.serviceImage}
                                      alt={service.serviceName ?? fullService.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">
                                      {getImageFallback(service.serviceName ?? fullService?.name)}
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium text-foreground truncate min-w-0">
                                    {service.serviceName ?? fullService?.name}
                                  </p>

                                  <p className="text-[11px] text-muted-foreground font-mono">
                                    {formatVND(fullService?.price ?? 0)} × {service.quantity ?? 1}
                                  </p>
                                </div>
                              </li>
                            );
                          })}

                          {pkg.includedServiceList.length === 0 && (
                            <li className="text-xs text-muted-foreground">No service</li>
                          )}
                        </ul>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-accent" />
                          Hạn mức thức uống
                        </p>

                        <ul className="space-y-1.5">
                          {pkg.beverageAllowanceList.map((beverage) => {
                            const fullBeverage = beverages.find((item) => item.id === beverage.beverageId);

                            return (
                              <li
                                key={beverage.beverageId}
                                className="rounded-xl border border-border bg-card p-2 flex items-center gap-2"
                              >
                                <div className="h-10 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                  {fullBeverage?.beverageImage ? (
                                    <img
                                      src={fullBeverage.beverageImage}
                                      alt={beverage.beverageName ?? fullBeverage.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">
                                      {getImageFallback(beverage.beverageName ?? fullBeverage?.name)}
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium text-foreground truncate min-w-0">
                                    {beverage.beverageName ?? fullBeverage?.name}
                                  </p>

                                  <p className="text-[11px] text-muted-foreground font-mono">
                                    {formatVND(fullBeverage?.unitPrice ?? 0)} × {beverage.allowanceQuantity ?? 1}
                                  </p>
                                </div>

                                <span className="text-accent font-semibold text-xs">
                                  {beverage.allowanceQuantity}
                                </span>
                              </li>
                            );
                          })}

                          {pkg.beverageAllowanceList.length === 0 && (
                            <li className="text-xs text-muted-foreground">No beverage allowance</li>
                          )}
                        </ul>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <Gift className="w-3.5 h-3.5 text-accent" />
                          Quà tặng kèm
                        </p>

                        <ul className="space-y-2">
                          {pkg.packageBenefitList.map((benefit) => {
                            const image = getBenefitImage(benefit, dishes, services, beverages);

                            return (
                              <li
                                key={`${benefit.itemType}-${benefit.itemId}-${benefit.displayOrder}`}
                                className="rounded-xl border border-emerald-200 bg-emerald-50 p-2 flex items-center gap-2"
                              >
                                <div className="h-10 w-12 rounded-lg overflow-hidden bg-white/70 flex-shrink-0">
                                  {image ? (
                                    <img
                                      src={image}
                                      alt={benefit.itemName ?? "Gift"}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-[10px] text-emerald-700">
                                      {getImageFallback(benefit.itemName)}
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium text-emerald-900 truncate min-w-0">
                                    {benefit.itemName}
                                  </p>

                                  <p className="text-[11px] text-emerald-700">
                                    {getBenefitTypeLabel(benefit.itemType)} · x{benefit.quantity ?? 1}
                                  </p>

                                  <p className="text-[11px] text-emerald-700 font-mono">
                                    Trị giá {formatVND(benefit.totalValue ?? 0)} · khách trả 0đ
                                  </p>
                                </div>
                              </li>
                            );
                          })}

                          {dishLoading && (
                            <li className="text-xs text-muted-foreground">Đang tải ảnh món tặng...</li>
                          )}

                          {pkg.packageBenefitList.length === 0 && (
                            <li className="text-xs text-muted-foreground">Chưa có quà tặng kèm.</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {pkg.conditionList.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                          Điều kiện áp dụng
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {pkg.conditionList.map((condition) => (
                            <span
                              key={condition.id ?? `${condition.conditionType}-${condition.displayOrder}`}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-800"
                            >
                              {getConditionLabel(condition)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Hiển thị {(page - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(page * ITEMS_PER_PAGE, visible.length)} / {visible.length} gói
          </p>

          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === p ? "bg-primary text-primary-foreground" : "border border-border hover:bg-secondary"
                  }`}
              >
                {p}
              </button>
            ))}

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Tiếp →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const PackageFormScreen = ({
  setScreen,
  selectedPackage,
}: PackageScreenProps) => {
  const isEditing = !!selectedPackage;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const [editingPkg, setEditingPkg] = useState<WeddingPackageViewModel | null>(null);

  const [dishCombos, setDishCombos] = useState<DishComboResponse[]>(
    packageReferenceCache.getDishCombos() ?? []
  );
  const [dishes, setDishes] = useState<DishResponse[]>(
    packageReferenceCache.getDishes() ?? []
  );
  const [services, setServices] = useState<ServiceResponse[]>(
    packageReferenceCache.getServices() ?? []
  );
  const [beverages, setBeverages] = useState<BeverageResponse[]>(
    packageReferenceCache.getBeverages() ?? []
  );
  const [hallTypes, setHallTypes] = useState<HallTypeResponse[]>(
    packageReferenceCache.getHallTypes() ?? []
  );
  const [shifts, setShifts] = useState<ShiftResponse[]>(
    packageReferenceCache.getShifts() ?? []
  );

  const [dishLoading, setDishLoading] = useState(false);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [beverageLoading, setBeverageLoading] = useState(false);
  const [hallTypeLoading, setHallTypeLoading] = useState(false);
  const [shiftLoading, setShiftLoading] = useState(false);

  const [packageName, setPackageName] = useState("");
  const [description, setDescription] = useState("");
  const [menuComboOptions, setMenuComboOptions] = useState<string[]>([]);
  const [defaultMenuComboId, setDefaultMenuComboId] = useState<string | null>(null);
  const [includedServiceList, setIncludedServiceList] = useState<WeddingPackageServiceItemDTO[]>([]);
  const [beverageAllowanceList, setBeverageAllowanceList] = useState<WeddingPackageBeverageAllowanceDTO[]>([]);
  const [packageBenefitList, setPackageBenefitList] = useState<WeddingPackageBenefitDTO[]>([]);
  const [conditionList, setConditionList] = useState<WeddingPackageConditionDTO[]>([]);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [addServiceId, setAddServiceId] = useState("");
  const [addServiceQty, setAddServiceQty] = useState(1);
  const [addServiceNote, setAddServiceNote] = useState("");

  const [addBeverageId, setAddBeverageId] = useState("");
  const [addBeverageQty, setAddBeverageQty] = useState(1);
  const [addBeverageNote, setAddBeverageNote] = useState("");

  const [benefitType, setBenefitType] = useState<WeddingPackageBenefitItemTypeApi>("SERVICE");
  const [benefitItemId, setBenefitItemId] = useState("");
  const [benefitQty, setBenefitQty] = useState(1);
  const [benefitNote, setBenefitNote] = useState("");

  const [conditionType, setConditionType] = useState<PackageConditionTypeApi>("HALL_TYPE");
  const [conditionHallTypeId, setConditionHallTypeId] = useState("");
  const [conditionShiftId, setConditionShiftId] = useState("");
  const [conditionNumericValue, setConditionNumericValue] = useState("");
  const [conditionValue, setConditionValue] = useState("");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  async function ensureDishCombosLoaded(force = false) {
    const data = await loadDishCombos({ force });

    setDishCombos(data);
    return data;
  }

  async function ensureDishesLoaded(force = false) {
    if (dishLoading) return dishes;

    try {
      setDishLoading(true);
      const data = await loadDishes({ force });

      setDishes(data);
      return data;
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Cannot load dishes.", "error");
      return [];
    } finally {
      setDishLoading(false);
    }
  }

  async function ensureServicesLoaded(force = false) {
    const data = await loadServices({ force });

    setServices(data);
    return data;
  }

  async function ensureBeveragesLoaded(force = false) {
    const data = await loadBeverages({ force });

    setBeverages(data);
    return data;
  }

  async function ensureHallTypesLoaded(force = false) {
    const data = await loadHallTypes({ force });

    setHallTypes(data);
    return data;
  }

  async function ensureShiftsLoaded(force = false) {
    const data = await loadShifts({ force });

    setShifts(data);
    return data;
  }

  async function ensurePackageDetailLoaded(packageId: string, force = false) {
    const data = await loadWeddingPackageDetail(packageId, { force });
    return mapPackageToViewModel(data);
  }

  useEffect(() => {
    if (benefitType === "DISH") {
      ensureDishesLoaded(true);
    }
  }, [benefitType]);

  async function loadFormData() {
    try {
      setLoading(isEditing);

      const packageDetail = selectedPackage
        ? await ensurePackageDetailLoaded(selectedPackage, true)
        : null;

      if (packageDetail) {
        const mapped = packageDetail;
        setEditingPkg(mapped);

        setPackageName(mapped.packageName);
        setDescription(mapped.description ?? "");
        setMenuComboOptions(mapped.menuComboOptions ?? []);
        setDefaultMenuComboId(mapped.defaultMenuComboId ?? null);
        setIncludedServiceList(mapped.includedServiceList ?? []);
        setBeverageAllowanceList(mapped.beverageAllowanceList ?? []);
        setPackageBenefitList(mapped.packageBenefitList ?? []);
        setConditionList(mapped.conditionList ?? []);
        setStatus(mapped.status);
      }

      const tasks: Promise<unknown>[] = [ensureDishCombosLoaded()];

      if (!selectedPackage || packageDetail?.includedServiceList.length || packageDetail?.packageBenefitList.some((item) => item.itemType === "SERVICE")) {
        tasks.push(ensureServicesLoaded());
      }

      if (!selectedPackage || packageDetail?.beverageAllowanceList.length || packageDetail?.packageBenefitList.some((item) => item.itemType === "BEVERAGE")) {
        tasks.push(ensureBeveragesLoaded());
      }

      if (!selectedPackage || packageDetail?.conditionList.some((item) => item.conditionType === "HALL_TYPE")) {
        tasks.push(ensureHallTypesLoaded());
      }

      if (!selectedPackage || packageDetail?.conditionList.some((item) => item.conditionType === "SHIFT")) {
        tasks.push(ensureShiftsLoaded());
      }

      if (packageDetail?.packageBenefitList.some((item) => item.itemType === "DISH")) {
        tasks.push(ensureDishesLoaded());
      }

      await Promise.all(tasks);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Cannot load package form data.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFormData();
  }, [selectedPackage]);

  const activeCombos = useMemo(
    () => dishCombos.filter((combo) => combo.status === "ACTIVE"),
    [dishCombos]
  );

  const activeDishes = useMemo(
    () => dishes.filter((dish) => dish.status === "ACTIVE"),
    [dishes]
  );

  const activeServices = useMemo(
    () => services.filter((service) => service.status === "ACTIVE"),
    [services]
  );

  const activeBeverages = useMemo(
    () => beverages.filter((beverage) => beverage.status === "ACTIVE"),
    [beverages]
  );

  const serviceOptions = activeServices.filter(
    (service) => !includedServiceList.some((item) => item.serviceId === service.id)
  );

  const beverageOptions = activeBeverages.filter(
    (beverage) => !beverageAllowanceList.some((item) => item.beverageId === beverage.id)
  );

  const benefitOptions = useMemo(() => {
    if (benefitType === "DISH") {
      return activeDishes
        .filter((item) => !packageBenefitList.some((benefit) => benefit.itemType === "DISH" && benefit.itemId === item.id))
        .map((item) => ({
          id: item.id,
          name: item.name,
          price: item.unitPrice ?? 0,
          image: item.dishImage,
        }));
    }

    if (benefitType === "SERVICE") {
      return activeServices
        .filter((item) => !packageBenefitList.some((benefit) => benefit.itemType === "SERVICE" && benefit.itemId === item.id))
        .map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price ?? 0,
          image: item.serviceImage,
        }));
    }

    return activeBeverages
      .filter((item) => !packageBenefitList.some((benefit) => benefit.itemType === "BEVERAGE" && benefit.itemId === item.id))
      .map((item) => ({
        id: item.id,
        name: item.name,
        price: item.unitPrice ?? 0,
        image: item.beverageImage,
      }));
  }, [benefitType, activeDishes, activeServices, activeBeverages, packageBenefitList]);

  const liveBenefitGiftValue = useMemo(() => {
    return packageBenefitList.reduce((sum, item) => {
      const unitValue =
        item.unitValue ??
        getBenefitUnitValue(item.itemType, item.itemId, dishes, services, beverages);

      return sum + unitValue * (item.quantity ?? 1);
    }, 0);
  }, [packageBenefitList, dishes, services, beverages]);

  function handleComboToggle(comboId: string) {
    setMenuComboOptions((prev) => {
      if (prev.includes(comboId)) {
        const next = prev.filter((id) => id !== comboId);
        if (defaultMenuComboId === comboId) {
          setDefaultMenuComboId(next[0] ?? null);
        }
        return next;
      }

      if (!defaultMenuComboId) {
        setDefaultMenuComboId(comboId);
      }

      return [...prev, comboId];
    });

    setErrors((prev) => ({
      ...prev,
      menuComboOptions: "",
      defaultMenuComboId: "",
    }));
  }

  function handleAddService() {
    const service = activeServices.find((item) => item.id === addServiceId);
    if (!service) return;

    setIncludedServiceList((prev) => [
      ...prev,
      {
        serviceId: service.id,
        serviceName: service.name,
        quantity: Math.max(1, addServiceQty),
        note: addServiceNote.trim(),
      },
    ]);

    setAddServiceId("");
    setAddServiceQty(1);
    setAddServiceNote("");
    setErrors((prev) => ({ ...prev, includedServiceList: "" }));
  }

  function handleAddBeverage() {
    const beverage = activeBeverages.find((item) => item.id === addBeverageId);
    if (!beverage) return;

    setBeverageAllowanceList((prev) => [
      ...prev,
      {
        beverageId: beverage.id,
        beverageName: beverage.name,
        allowanceQuantity: Math.max(1, addBeverageQty),
        note: addBeverageNote.trim(),
      },
    ]);

    setAddBeverageId("");
    setAddBeverageQty(1);
    setAddBeverageNote("");
    setErrors((prev) => ({ ...prev, beverageAllowanceList: "" }));
  }

  function handleAddBenefit() {
    const option = benefitOptions.find((item) => item.id === benefitItemId);
    if (!option) return;

    const quantity = Math.max(1, benefitQty);

    setPackageBenefitList((prev) => [
      ...prev,
      {
        itemType: benefitType,
        itemId: option.id,
        itemName: option.name,
        quantity,
        unitValue: option.price,
        totalValue: option.price * quantity,
        customerPayAmount: 0,
        note: benefitNote.trim(),
        displayOrder: prev.length + 1,
      },
    ]);

    setBenefitItemId("");
    setBenefitQty(1);
    setBenefitNote("");
    setErrors((prev) => ({ ...prev, packageBenefitList: "" }));
  }

  function updateBeverageQty(beverageId: string, qty: number) {
    setBeverageAllowanceList((prev) =>
      prev.map((item) =>
        item.beverageId === beverageId
          ? { ...item, allowanceQuantity: Math.max(1, qty) }
          : item
      )
    );
  }

  function updateServiceQty(serviceId: string, qty: number) {
    setIncludedServiceList((prev) =>
      prev.map((item) =>
        item.serviceId === serviceId
          ? { ...item, quantity: Math.max(1, qty) }
          : item
      )
    );
  }

  function updateBenefitQty(index: number, qty: number) {
    setPackageBenefitList((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;

        const quantity = Math.max(1, qty);
        const unitValue =
          item.unitValue ??
          getBenefitUnitValue(item.itemType, item.itemId, dishes, services, beverages);

        return {
          ...item,
          quantity,
          totalValue: unitValue * quantity,
        };
      })
    );
  }

  function removeBenefit(index: number) {
    setPackageBenefitList((prev) =>
      prev
        .filter((_, idx) => idx !== index)
        .map((item, idx) => ({ ...item, displayOrder: idx + 1 }))
    );
  }

  function addCondition() {
    const displayOrder = conditionList.length + 1;

    const newCondition: WeddingPackageConditionDTO = {
      conditionType,
      hallTypeId: conditionType === "HALL_TYPE" ? conditionHallTypeId || null : null,
      hallTypeName:
        conditionType === "HALL_TYPE"
          ? hallTypes.find((item) => item.id === conditionHallTypeId)?.name ?? null
          : null,
      shiftId: conditionType === "SHIFT" ? conditionShiftId || null : null,
      shiftName:
        conditionType === "SHIFT"
          ? shifts.find((item) => item.id === conditionShiftId)?.name ?? null
          : null,
      numericValue:
        conditionType === "MIN_TABLES" || conditionType === "MAX_TABLES"
          ? Number(conditionNumericValue) || null
          : null,
      conditionValue: conditionType === "CUSTOM" ? conditionValue.trim() : null,
      displayOrder,
    };

    if (conditionType === "HALL_TYPE" && !newCondition.hallTypeId) {
      showToast("Vui lòng chọn loại sảnh.", "error");
      return;
    }

    if (conditionType === "SHIFT" && !newCondition.shiftId) {
      showToast("Vui lòng chọn ca.", "error");
      return;
    }

    if (
      (conditionType === "MIN_TABLES" || conditionType === "MAX_TABLES") &&
      !newCondition.numericValue
    ) {
      showToast("Vui lòng nhập giá trị số.", "error");
      return;
    }

    if (conditionType === "CUSTOM" && !newCondition.conditionValue) {
      showToast("Vui lòng nhập điều kiện.", "error");
      return;
    }

    setConditionList((prev) => [...prev, newCondition]);

    setConditionHallTypeId("");
    setConditionShiftId("");
    setConditionNumericValue("");
    setConditionValue("");
  }

  function removeCondition(index: number) {
    setConditionList((prev) =>
      prev
        .filter((_, idx) => idx !== index)
        .map((item, idx) => ({ ...item, displayOrder: idx + 1 }))
    );
  }

  function validate() {
    const newErrors: Record<string, string> = {};

    if (!packageName.trim()) {
      newErrors.packageName = MSG[2];
    }

    if (menuComboOptions.length === 0) {
      newErrors.menuComboOptions = MSG[2];
    }

    if (!defaultMenuComboId) {
      newErrors.defaultMenuComboId = MSG[2];
    }

    if (includedServiceList.length === 0) {
      newErrors.includedServiceList = MSG[2];
    }

    if (beverageAllowanceList.length === 0) {
      newErrors.beverageAllowanceList = MSG[2];
    }

    if (
      packageBenefitList.some(
        (item) => !item.itemType || !item.itemId || !item.quantity || item.quantity <= 0
      )
    ) {
      newErrors.packageBenefitList = MSG[2];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) {
      showToast(MSG[2], "error");
      return;
    }

    if (isEditing && !editingPkg?.lastModified) {
      showToast("Không thể cập nhật vì thiếu lastModifiedAt. Vui lòng tải lại.", "error");
      return;
    }

    try {
      setSaving(true);

      const cleanConditions = conditionList.map((item, index) => ({
        ...item,
        displayOrder: index + 1,
      }));

      const payload: WeddingPackageRequestPayload = {
        packageName: packageName.trim(),
        description: description.trim(),
        menuComboOptions,
        defaultMenuComboId,
        includedServiceList: includedServiceList.map((item) => ({
          serviceId: item.serviceId,
          serviceName: item.serviceName,
          quantity: item.quantity,
          note: item.note ?? "",
        })),
        beverageAllowanceList: beverageAllowanceList.map((item) => ({
          beverageId: item.beverageId,
          beverageName: item.beverageName,
          allowanceQuantity: item.allowanceQuantity,
          note: item.note ?? "",
        })),
        packageBenefitList: cleanBenefitPayload(packageBenefitList),
        conditionList: cleanConditions,
        status,
      };

      if (isEditing && selectedPackage && editingPkg) {
        await weddingPackageService.update(
          selectedPackage,
          payload,
          toLastModifiedSafe(editingPkg.lastModified)
        );
        invalidateWeddingPackages(selectedPackage);
      } else {
        await weddingPackageService.create(payload);
        invalidateWeddingPackages();
      }

      showToast(MSG[48]);
      window.setTimeout(() => setScreen("package-list"), 500);
    } catch (error) {
      showToast(error instanceof Error ? error.message : MSG[50], "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <HallListSkeleton />;

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
            }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <button
          onClick={() => setScreen("package-list")}
          className="hover:text-foreground flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Wedding Packages
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">{isEditing ? "Sửa gói" : "Thêm gói mới"}</span>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">
            {isEditing ? `Sửa: ${editingPkg?.packageName}` : "Thêm gói tiệc cưới mới"}
          </h1>

          <p className="text-muted-foreground">
            Thiết lập combo menu, dịch vụ tính tiền, thức uống, quà tặng kèm và điều kiện áp dụng.
          </p>
        </div>

        <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={status === "ACTIVE"}
              onChange={(e) => setStatus(e.target.checked ? "ACTIVE" : "INACTIVE")}
              className="sr-only peer"
            />

            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
          </label>

          <span className="text-sm font-medium">
            {status === "ACTIVE" ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {isEditing && editingPkg && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-[18px] border border-border p-4 shadow-sm">
            <p className="text-xs text-muted-foreground mb-1">Original Value</p>
            <p className="text-lg font-semibold text-foreground font-mono">
              {formatVND(getSafeMoney(editingPkg.originalPackageTotal))}
            </p>
          </div>

          <div className="bg-card rounded-[18px] border border-border p-4 shadow-sm">
            <p className="text-xs text-muted-foreground mb-1">Customer Pays</p>
            <p className="text-lg font-semibold text-primary font-mono">
              {formatVND(getSafeMoney(editingPkg.estimatedPackageTotal))}
            </p>
          </div>

          <div className="bg-card rounded-[18px] border border-border p-4 shadow-sm">
            <p className="text-xs text-muted-foreground mb-1">Customer Saves</p>
            <p className="text-lg font-semibold text-emerald-700 font-mono">
              {formatVND(getSafeMoney(editingPkg.estimatedSavingsAmount))}
            </p>
          </div>

          <div className="bg-emerald-600 rounded-[18px] border border-emerald-600 p-4 shadow-sm text-white">
            <p className="text-xs opacity-80 mb-1">Saving Rate</p>
            <p className="text-xl font-semibold">
              {formatPercent(editingPkg.estimatedSavingsRate)}
            </p>
          </div>
        </div>
      )}


      <div className="space-y-6">
        <FormSection title="Thông tin cơ bản" icon={Package}>
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tên gói tiệc <span className="text-destructive">*</span>
              </label>

              <input
                type="text"
                value={packageName}
                onChange={(e) => {
                  setPackageName(e.target.value);
                  setErrors((prev) => ({ ...prev, packageName: "" }));
                }}
                placeholder="VD: Gói Vàng Vĩnh Cửu"
                className={`w-full px-4 py-3 rounded-xl border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent ${errors.packageName ? "border-destructive" : "border-border"
                  }`}
              />

              {errors.packageName && (
                <p className="text-xs text-destructive mt-1">{errors.packageName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mô tả
              </label>

              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn về gói tiệc..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Combo Menu"
          icon={UtensilsCrossed}
          error={errors.menuComboOptions || errors.defaultMenuComboId}
        >
          <p className="text-sm text-muted-foreground mb-4">
            Chọn các combo menu có trong gói này. Chọn một combo mặc định.
          </p>

          <div className="space-y-3 mb-4">
            {activeCombos.map((combo) => {
              const isSelected = menuComboOptions.includes(combo.id);

              return (
                <div
                  key={combo.id}
                  className={`flex items-center justify-between gap-3 p-4 rounded-xl border transition-all min-w-0 ${isSelected ? "border-accent bg-accent/5" : "border-border hover:bg-secondary"
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleComboToggle(combo.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? "border-accent bg-accent" : "border-border"
                        }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-accent-foreground" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className={fixedTextClass("text-sm font-medium text-foreground")}>{combo.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {combo.numberOfSlots ?? combo.slots?.length ?? 0} món · {combo.comboDiscountRate}% giảm giá
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <button
                      type="button"
                      onClick={() => setDefaultMenuComboId(combo.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${defaultMenuComboId === combo.id
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border hover:bg-secondary text-muted-foreground"
                        }`}
                    >
                      {defaultMenuComboId === combo.id ? "✓ Mặc định" : "Đặt làm mặc định"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </FormSection>

        <FormSection title="Dịch vụ tính trong gói" icon={Sparkles} error={errors.includedServiceList}>
          {includedServiceList.length > 0 && (
            <div className="space-y-2 mb-4">
              {includedServiceList.map((service) => {
                const fullService = services.find((item) => item.id === service.serviceId);

                return (
                  <div
                    key={service.serviceId}
                    className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 gap-3"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-12 w-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {fullService?.serviceImage ? (
                          <img
                            src={fullService.serviceImage}
                            alt={service.serviceName ?? fullService.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">
                            {getImageFallback(service.serviceName ?? fullService?.name)}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {service.serviceName ?? fullService?.name}
                        </p>

                        <p className="text-xs text-muted-foreground font-mono">
                          {formatVND(fullService?.price ?? 0)}
                        </p>
                      </div>
                    </div>

                    <input
                      type="number"
                      min={1}
                      value={service.quantity}
                      onChange={(e) => updateServiceQty(service.serviceId, Number(e.target.value) || 1)}
                      className="w-20 px-2 py-1 rounded-lg border border-border bg-input-background text-sm text-center"
                    />

                    <button
                      onClick={() =>
                        setIncludedServiceList((prev) =>
                          prev.filter((item) => item.serviceId !== service.serviceId)
                        )
                      }
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-[1fr_90px_1fr_auto] gap-2">
            <select
              value={addServiceId}
              onFocus={async () => {
                try {
                  setServiceLoading(true);
                  await ensureServicesLoaded(true);
                } catch (error) {
                  showToast(error instanceof Error ? error.message : "Cannot load services.", "error");
                } finally {
                  setServiceLoading(false);
                }
              }}
              onChange={(e) => setAddServiceId(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="">{serviceLoading ? "Đang tải dịch vụ..." : "-- Thêm dịch vụ --"}</option>
              {serviceOptions.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} — {formatVND(service.price)}
                </option>
              ))}
            </select>

            <input
              type="number"
              min={1}
              value={addServiceQty}
              onChange={(e) => setAddServiceQty(Number(e.target.value) || 1)}
              className="px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm text-center"
            />

            <input
              type="text"
              value={addServiceNote}
              onChange={(e) => setAddServiceNote(e.target.value)}
              placeholder="Note"
              className="min-w-0 px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm"
            />

            <button
              onClick={handleAddService}
              disabled={!addServiceId}
              className="px-4 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:bg-accent/90 transition-all disabled:opacity-40 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Thêm
            </button>
          </div>
        </FormSection>

        <FormSection title="Hạn mức thức uống" icon={Package} error={errors.beverageAllowanceList}>
          {beverageAllowanceList.length > 0 && (
            <div className="rounded-xl border border-border overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary text-left">
                    <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Thức uống</th>
                    <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground text-center">Hạn mức</th>
                    <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Note</th>
                    <th className="px-4 py-2.5 w-10" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {beverageAllowanceList.map((beverage) => {
                    const fullBeverage = beverages.find((item) => item.id === beverage.beverageId);

                    return (
                      <tr key={beverage.beverageId} className="hover:bg-secondary/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-12 w-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              {fullBeverage?.beverageImage ? (
                                <img
                                  src={fullBeverage.beverageImage}
                                  alt={beverage.beverageName ?? fullBeverage.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">
                                  {getImageFallback(beverage.beverageName ?? fullBeverage?.name)}
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {beverage.beverageName ?? fullBeverage?.name}
                              </p>

                              <p className="text-xs text-muted-foreground font-mono">
                                {formatVND(fullBeverage?.unitPrice ?? 0)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min={1}
                            value={beverage.allowanceQuantity}
                            onChange={(e) =>
                              updateBeverageQty(beverage.beverageId, Number(e.target.value) || 1)
                            }
                            className="w-20 px-2 py-1 rounded-lg border border-border bg-input-background text-sm font-mono text-center"
                          />
                        </td>

                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {beverage.note}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() =>
                              setBeverageAllowanceList((prev) =>
                                prev.filter((item) => item.beverageId !== beverage.beverageId)
                              )
                            }
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-[1fr_90px_1fr_auto] gap-2">
            <select
              value={addBeverageId}
              onFocus={async () => {
                try {
                  setBeverageLoading(true);
                  await ensureBeveragesLoaded(true);
                } catch (error) {
                  showToast(error instanceof Error ? error.message : "Cannot load beverages.", "error");
                } finally {
                  setBeverageLoading(false);
                }
              }}
              onChange={(e) => setAddBeverageId(e.target.value)}
              className="min-w-0 px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm"
            >
              <option value="">{beverageLoading ? "Đang tải thức uống..." : "-- Chọn thức uống --"}</option>
              {beverageOptions.map((beverage) => (
                <option key={beverage.id} value={beverage.id}>
                  {beverage.name} ({beverage.beverageTypeName}) — {formatVND(beverage.unitPrice)}
                </option>
              ))}
            </select>

            <input
              type="number"
              min={1}
              value={addBeverageQty}
              onChange={(e) => setAddBeverageQty(Number(e.target.value) || 1)}
              className="px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm text-center"
            />

            <input
              type="text"
              value={addBeverageNote}
              onChange={(e) => setAddBeverageNote(e.target.value)}
              placeholder="Note"
              className="min-w-0 px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm"
            />

            <button
              onClick={handleAddBeverage}
              disabled={!addBeverageId}
              className="px-4 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:bg-accent/90 transition-all disabled:opacity-40 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Thêm
            </button>
          </div>
        </FormSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSection title="Quà tặng kèm" icon={Gift} error={errors.packageBenefitList}>
            <div className="space-y-3">
              {packageBenefitList.map((benefit, index) => {
                const image = getBenefitImage(benefit, dishes, services, beverages);
                const unitValue =
                  benefit.unitValue ??
                  getBenefitUnitValue(benefit.itemType, benefit.itemId, dishes, services, beverages);

                return (
                  <div
                    key={`${benefit.itemType}-${benefit.itemId}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3"
                  >
                    <div className="h-12 w-14 rounded-lg overflow-hidden bg-white flex-shrink-0">
                      {image ? (
                        <img
                          src={image}
                          alt={benefit.itemName ?? "Gift"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] text-emerald-700">
                          {getImageFallback(benefit.itemName)}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-emerald-950 truncate">
                        {benefit.itemName ??
                          getBenefitName(benefit.itemType, benefit.itemId, dishes, services, beverages)}
                      </p>

                      <p className="text-xs text-emerald-700">
                        {getBenefitTypeLabel(benefit.itemType)}
                      </p>

                      <p className="text-xs text-emerald-700 font-mono">
                        Trị giá {formatVND(unitValue)} × {benefit.quantity ?? 1} · khách trả 0đ
                      </p>
                    </div>

                    <input
                      type="number"
                      min={1}
                      value={benefit.quantity}
                      onChange={(e) => updateBenefitQty(index, Number(e.target.value) || 1)}
                      className="w-20 px-2 py-1 rounded-lg border border-border bg-input-background text-sm text-center"
                    />

                    <button
                      onClick={() => removeBenefit(index)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {packageBenefitList.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Chưa có quà tặng kèm. Các item ở đây sẽ có giá khách trả là 0đ.
                </p>
              )}

              <div className="rounded-xl border border-border p-3 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-[140px_1fr_90px] gap-2">
                  <select
                    value={benefitType}
                    onChange={async (e) => {
                      const nextType = e.target.value as WeddingPackageBenefitItemTypeApi;
                      setBenefitType(nextType);
                      setBenefitItemId("");

                      if (nextType === "DISH") await ensureDishesLoaded();
                      if (nextType === "SERVICE") await ensureServicesLoaded(true);
                      if (nextType === "BEVERAGE") await ensureBeveragesLoaded(true);
                    }}
                    className="min-w-0 px-3 py-2 rounded-xl border border-border bg-input-background text-sm"
                  >
                    <option value="DISH">Món ăn</option>
                    <option value="SERVICE">Dịch vụ</option>
                    <option value="BEVERAGE">Thức uống</option>
                  </select>

                  <select
                    value={benefitItemId}
                    onFocus={async () => {
                      if (benefitType === "DISH") await ensureDishesLoaded();
                      if (benefitType === "SERVICE") await ensureServicesLoaded(true);
                      if (benefitType === "BEVERAGE") await ensureBeveragesLoaded(true);
                    }}
                    onChange={(e) => setBenefitItemId(e.target.value)}
                    className="min-w-0 px-3 py-2 rounded-xl border border-border bg-input-background text-sm"
                  >
                    <option value="">
                      {benefitType === "DISH" && dishLoading
                        ? "Đang tải món..."
                        : serviceLoading && benefitType === "SERVICE"
                          ? "Đang tải dịch vụ..."
                          : beverageLoading && benefitType === "BEVERAGE"
                            ? "Đang tải thức uống..."
                            : "-- Chọn item quà tặng --"}
                    </option>

                    {benefitOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} — {formatVND(item.price)}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min={1}
                    value={benefitQty}
                    onChange={(e) => setBenefitQty(Number(e.target.value) || 1)}
                    className="px-3 py-2 rounded-xl border border-border bg-input-background text-sm text-center"
                  />
                </div>

                <input
                  type="text"
                  value={benefitNote}
                  onChange={(e) => setBenefitNote(e.target.value)}
                  placeholder="Ghi chú quà tặng, ví dụ: Tặng kèm gói Premium"
                  className="w-full min-w-0 px-3 py-2 rounded-xl border border-border bg-input-background text-sm"
                />

                <button
                  onClick={handleAddBenefit}
                  disabled={!benefitItemId}
                  className="w-full py-2 rounded-xl border border-dashed border-emerald-300 text-emerald-700 text-sm font-medium hover:bg-emerald-50 transition-all flex items-center justify-center gap-1 disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                  Thêm quà tặng kèm
                </button>
              </div>
            </div>
          </FormSection>

          <FormSection title="Điều kiện áp dụng" icon={ShieldCheck}>
            <div className="space-y-3">
              {conditionList.map((condition, index) => (
                <div
                  key={`${condition.conditionType}-${index}`}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-border bg-secondary/40"
                >
                  <span className="text-xs text-foreground">{getConditionLabel(condition)}</span>

                  <button
                    onClick={() => removeCondition(index)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="rounded-xl border border-border p-3 space-y-2">
                <select
                  value={conditionType}
                  onChange={(e) => setConditionType(e.target.value as PackageConditionTypeApi)}
                  className="w-full min-w-0 px-3 py-2 rounded-xl border border-border bg-input-background text-sm"
                >
                  <option value="HALL_TYPE">Hall Type</option>
                  <option value="SHIFT">Shift</option>
                  <option value="MIN_TABLES">Min Tables</option>
                  <option value="MAX_TABLES">Max Tables</option>
                  <option value="CUSTOM">Custom</option>
                </select>

                {conditionType === "HALL_TYPE" && (
                  <select
                    value={conditionHallTypeId}
                    onFocus={async () => {
                      try {
                        setHallTypeLoading(true);
                        await ensureHallTypesLoaded(true);
                      } catch (error) {
                        showToast(error instanceof Error ? error.message : "Cannot load hall types.", "error");
                      } finally {
                        setHallTypeLoading(false);
                      }
                    }}
                    onChange={(e) => setConditionHallTypeId(e.target.value)}
                    className="w-full min-w-0 px-3 py-2 rounded-xl border border-border bg-input-background text-sm"
                  >
                    <option value="">{hallTypeLoading ? "Đang tải loại sảnh..." : "-- Chọn loại sảnh --"}</option>
                    {hallTypes.map((hallType) => (
                      <option key={hallType.id} value={hallType.id}>
                        {hallType.name}
                      </option>
                    ))}
                  </select>
                )}

                {conditionType === "SHIFT" && (
                  <select
                    value={conditionShiftId}
                    onFocus={async () => {
                      try {
                        setShiftLoading(true);
                        await ensureShiftsLoaded(true);
                      } catch (error) {
                        showToast(error instanceof Error ? error.message : "Cannot load shifts.", "error");
                      } finally {
                        setShiftLoading(false);
                      }
                    }}
                    onChange={(e) => setConditionShiftId(e.target.value)}
                    className="w-full min-w-0 px-3 py-2 rounded-xl border border-border bg-input-background text-sm"
                  >
                    <option value="">{shiftLoading ? "Đang tải ca..." : "-- Chọn ca --"}</option>
                    {shifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {shift.name}
                      </option>
                    ))}
                  </select>
                )}

                {(conditionType === "MIN_TABLES" || conditionType === "MAX_TABLES") && (
                  <input
                    type="number"
                    min={1}
                    value={conditionNumericValue}
                    onChange={(e) => setConditionNumericValue(e.target.value)}
                    placeholder="Nhập số bàn"
                    className="w-full min-w-0 px-3 py-2 rounded-xl border border-border bg-input-background text-sm"
                  />
                )}

                {conditionType === "CUSTOM" && (
                  <input
                    type="text"
                    value={conditionValue}
                    onChange={(e) => setConditionValue(e.target.value)}
                    placeholder="VD: Đặt trước ít nhất 2 tháng"
                    className="w-full min-w-0 px-3 py-2 rounded-xl border border-border bg-input-background text-sm"
                  />
                )}

                <button
                  onClick={addCondition}
                  className="w-full py-2 rounded-xl border border-dashed border-blue-300 text-blue-700 text-sm font-medium hover:bg-blue-50 transition-all flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Thêm điều kiện
                </button>
              </div>
            </div>
          </FormSection>
        </div>

        <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4" />
            <span>
              Quà tặng kèm là item hệ thống có giá trị gốc nhưng khách trả 0đ.
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setScreen("package-list")}
              className="px-6 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-all"
            >
              Hủy
            </button>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-8 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo gói tiệc"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};