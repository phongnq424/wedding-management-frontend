import React, { useState } from "react";
import {
  Plus, Search, RefreshCw, Edit, Trash2, ArrowLeft, ChevronRight,
  Package, CheckCircle2, XCircle, AlertCircle, Save, X, UtensilsCrossed,
  Sparkles, Star, ShieldCheck, Gift, Info, ChevronDown, ChevronUp,
  ToggleLeft, ToggleRight, Eye,
} from "lucide-react";
import { Screen, WeddingPackage, PackageServiceItem, PackageBeverageItem } from "../../types";
import { DISH_COMBOS_INIT, SERVICES, BEVERAGES_INIT } from "../../data";
import { formatVND, StatusBadge } from "../../utils";

interface PackageScreenProps {
  setScreen: (s: Screen) => void;
  packages: WeddingPackage[];
  setPackages: React.Dispatch<React.SetStateAction<WeddingPackage[]>>;
  selectedPackage: number | null;
  setSelectedPackage: (id: number | null) => void;
}

const ITEMS_PER_PAGE = 6;

// ── MSG constants ──────────────────────────────────────────────────────────────
const MSG = {
  2: "Vui lòng điền đầy đủ tất cả các trường bắt buộc.",
  13: "Giá trên mỗi bàn phải lớn hơn 0.",
  48: "Gói tiệc đã được lưu thành công!",
  49: "Tên gói tiệc này đã tồn tại trong hệ thống.",
  50: "Có lỗi khi lưu dữ liệu. Vui lòng thử lại.",
};

// ── Package List Screen ────────────────────────────────────────────────────────
export const PackageListScreen = ({
  setScreen, packages, setPackages, setSelectedPackage,
}: PackageScreenProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [page, setPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const visible = packages.filter((p) => {
    if (p.deleted) return false;
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    if (search && !p.packageName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(visible.length / ITEMS_PER_PAGE));
  const paginated = visible.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleToggleStatus = (id: number) => {
    setPackages((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "Active" ? "Inactive" : "Active", lastModified: new Date().toISOString() }
          : p
      )
    );
    showToast("Đã cập nhật trạng thái gói tiệc.");
  };

  const handleDelete = (id: number) => {
    setPackages((prev) => prev.map((p) => p.id === id ? { ...p, deleted: true } : p));
    setDeleteConfirmId(null);
    showToast("Đã xóa gói tiệc.");
  };

  const handleEdit = (id: number) => {
    setSelectedPackage(id);
    setScreen("package-form");
  };

  const activeCombos = DISH_COMBOS_INIT.filter((c) => c.status === "Active" && !c.deleted);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-all ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Delete confirm modal */}
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
              Bạn có chắc muốn xóa gói tiệc <strong>"{packages.find((p) => p.id === deleteConfirmId)?.packageName}"</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-all">Hủy</button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all">Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">Wedding Packages</h1>
          <p className="text-muted-foreground">Quản lý gói tiệc cưới — thực đơn, dịch vụ, thức uống và quyền lợi</p>
        </div>
        <button
          onClick={() => { setSelectedPackage(null); setScreen("package-form"); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" /> Thêm gói mới
        </button>
      </div>

      {/* Search & filters */}
      <div className="bg-card rounded-[20px] p-5 border border-border shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên gói..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <div className="flex gap-2">
          {(["All", "Active", "Inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === s ? "bg-primary text-primary-foreground" : "border border-border hover:bg-secondary"}`}
            >
              {s}
            </button>
          ))}
        </div>
        {(search || statusFilter !== "All") && (
          <button onClick={() => { setSearch(""); setStatusFilter("All"); setPage(1); }} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>

      {/* Package cards */}
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
            const combos = pkg.menuComboOptions.map((id) => activeCombos.find((c) => c.id === id)).filter(Boolean);
            return (
              <div key={pkg.id} className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
                {/* Main row */}
                <div className="p-5 flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <h3 className="text-base font-semibold text-foreground">{pkg.packageName}</h3>
                      <StatusBadge status={pkg.status} />
                      <span className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded">ID #{pkg.id}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{pkg.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-accent" />
                        {pkg.menuComboOptions.length} combo menu
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-accent" />
                        {pkg.includedServiceList.length} dịch vụ bao gồm
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-accent" />
                        {pkg.beverageAllowanceList.length} loại thức uống
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-accent" />
                        {pkg.packageBenefitList.length} quyền lợi
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xl font-bold text-accent font-mono">{formatVND(pkg.pricePerTable)}</p>
                      <p className="text-xs text-muted-foreground">/ bàn</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : pkg.id)}
                        className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-secondary transition-all text-xs flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> {isExpanded ? "Ẩn" : "Xem"}
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => handleEdit(pkg.id)}
                        className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all text-xs flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" /> Sửa
                      </button>
                      <button
                        onClick={() => handleToggleStatus(pkg.id)}
                        className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${pkg.status === "Active" ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
                      >
                        {pkg.status === "Active" ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
                        {pkg.status === "Active" ? "Tắt" : "Kích hoạt"}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(pkg.id)}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border p-5 bg-secondary/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                      {/* Menu Combos */}
                      <div>
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <UtensilsCrossed className="w-3.5 h-3.5 text-accent" /> Menu Combos
                        </p>
                        <ul className="space-y-1.5">
                          {combos.map((c) => c && (
                            <li key={c.id} className="text-xs text-foreground flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.id === pkg.defaultMenuComboId ? "bg-accent" : "bg-muted-foreground"}`} />
                              {c.name}
                              {c.id === pkg.defaultMenuComboId && <span className="text-accent text-[10px] font-medium">(mặc định)</span>}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Services */}
                      <div>
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-accent" /> Dịch vụ bao gồm
                        </p>
                        <ul className="space-y-1.5">
                          {pkg.includedServiceList.map((s) => (
                            <li key={s.serviceId} className="text-xs text-foreground flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                              {s.serviceName}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Beverages */}
                      <div>
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-accent" /> Hạn mức thức uống
                        </p>
                        <ul className="space-y-1.5">
                          {pkg.beverageAllowanceList.map((b) => (
                            <li key={b.beverageId} className="text-xs text-foreground flex items-center justify-between gap-2">
                              <span>{b.beverageName}</span>
                              <span className="text-accent font-semibold">{b.allowancePerTable} chai/bàn</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Benefits */}
                      <div>
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <Gift className="w-3.5 h-3.5 text-accent" /> Quyền lợi
                        </p>
                        <ul className="space-y-1.5">
                          {pkg.packageBenefitList.map((b, i) => (
                            <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                              <Star className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" /> {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Conditions */}
                    {pkg.conditionList.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Điều kiện áp dụng
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {pkg.conditionList.map((c, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-800">{c}</span>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Hiển thị {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, visible.length)} / {visible.length} gói
          </p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              ← Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === p ? "bg-primary text-primary-foreground" : "border border-border hover:bg-secondary"}`}>
                {p}
              </button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              Tiếp →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Package Form Screen ────────────────────────────────────────────────────────
export const PackageFormScreen = ({
  setScreen, packages, setPackages, selectedPackage,
}: PackageScreenProps) => {
  const editingPkg = packages.find((p) => p.id === selectedPackage) || null;
  const isEditing = !!editingPkg;

  const activeCombos = DISH_COMBOS_INIT.filter((c) => c.status === "Active" && !c.deleted);
  const activeServices = SERVICES.filter((s) => s.status === "Active");
  const activeBeverages = BEVERAGES_INIT.filter((b) => b.status === "Active" && !b.deleted);

  // Form state
  const [packageName, setPackageName] = useState(editingPkg?.packageName || "");
  const [description, setDescription] = useState(editingPkg?.description || "");
  const [pricePerTable, setPricePerTable] = useState<number>(editingPkg?.pricePerTable || 0);
  const [menuComboOptions, setMenuComboOptions] = useState<number[]>(editingPkg?.menuComboOptions || []);
  const [defaultMenuComboId, setDefaultMenuComboId] = useState<number | null>(editingPkg?.defaultMenuComboId || null);
  const [includedServiceList, setIncludedServiceList] = useState<PackageServiceItem[]>(editingPkg?.includedServiceList || []);
  const [beverageAllowanceList, setBeverageAllowanceList] = useState<PackageBeverageItem[]>(editingPkg?.beverageAllowanceList || []);
  const [packageBenefitList, setPackageBenefitList] = useState<string[]>(editingPkg?.packageBenefitList || [""]);
  const [conditionList, setConditionList] = useState<string[]>(editingPkg?.conditionList || [""]);
  const [status, setStatus] = useState<"Active" | "Inactive">(editingPkg?.status || "Active");

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [addServiceId, setAddServiceId] = useState<string>("");
  const [addBeverageId, setAddBeverageId] = useState<string>("");
  const [addBeverageQty, setAddBeverageQty] = useState<number>(2);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleComboToggle = (comboId: number) => {
    setMenuComboOptions((prev) => {
      if (prev.includes(comboId)) {
        const next = prev.filter((id) => id !== comboId);
        if (defaultMenuComboId === comboId) setDefaultMenuComboId(next[0] || null);
        return next;
      }
      return [...prev, comboId];
    });
  };

  const handleAddService = () => {
    const svc = activeServices.find((s) => s.id === Number(addServiceId));
    if (!svc || includedServiceList.some((s) => s.serviceId === svc.id)) return;
    setIncludedServiceList((prev) => [...prev, { serviceId: svc.id, serviceName: svc.name, price: svc.price }]);
    setAddServiceId("");
  };

  const handleAddBeverage = () => {
    const bev = activeBeverages.find((b) => b.id === Number(addBeverageId));
    if (!bev || beverageAllowanceList.some((b) => b.beverageId === bev.id)) return;
    setBeverageAllowanceList((prev) => [...prev, { beverageId: bev.id, beverageName: bev.name, allowancePerTable: addBeverageQty, unitPrice: bev.unitPrice }]);
    setAddBeverageId("");
    setAddBeverageQty(2);
  };

  const updateBeverageQty = (beverageId: number, qty: number) => {
    setBeverageAllowanceList((prev) => prev.map((b) => b.beverageId === beverageId ? { ...b, allowancePerTable: qty } : b));
  };

  const updateListItem = (list: string[], setter: (v: string[]) => void, idx: number, val: string) => {
    const next = [...list];
    next[idx] = val;
    setter(next);
  };

  const addListItem = (list: string[], setter: (v: string[]) => void) => setter([...list, ""]);
  const removeListItem = (list: string[], setter: (v: string[]) => void, idx: number) => setter(list.filter((_, i) => i !== idx));

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!packageName.trim()) newErrors.packageName = MSG[2];
    if (pricePerTable <= 0) newErrors.pricePerTable = MSG[13];
    if (menuComboOptions.length === 0) newErrors.menuComboOptions = MSG[2];
    if (!defaultMenuComboId) newErrors.defaultMenuComboId = MSG[2];
    if (includedServiceList.length === 0) newErrors.includedServiceList = MSG[2];
    if (beverageAllowanceList.length === 0) newErrors.beverageAllowanceList = MSG[2];
    const filledBenefits = packageBenefitList.filter((b) => b.trim());
    if (filledBenefits.length === 0) newErrors.packageBenefitList = MSG[2];
    const filledConditions = conditionList.filter((c) => c.trim());
    if (filledConditions.length === 0) newErrors.conditionList = MSG[2];
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkUniqueness = (): boolean => {
    const duplicate = packages.find(
      (p) => !p.deleted && p.packageName.trim().toLowerCase() === packageName.trim().toLowerCase() && p.id !== (editingPkg?.id || -1)
    );
    if (duplicate) {
      setErrors((prev) => ({ ...prev, packageName: MSG[49] }));
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) { showToast(MSG[2], "error"); return; }
    if (!checkUniqueness()) { showToast(MSG[49], "error"); return; }
    try {
      const now = new Date().toISOString();
      const cleanBenefits = packageBenefitList.filter((b) => b.trim());
      const cleanConditions = conditionList.filter((c) => c.trim());
      if (isEditing && editingPkg) {
        setPackages((prev) => prev.map((p) =>
          p.id === editingPkg.id
            ? { ...p, packageName, description, pricePerTable, menuComboOptions, defaultMenuComboId: defaultMenuComboId!, includedServiceList, beverageAllowanceList, packageBenefitList: cleanBenefits, conditionList: cleanConditions, status, lastModified: now }
            : p
        ));
      } else {
        const newId = Math.max(0, ...packages.map((p) => p.id)) + 1;
        setPackages((prev) => [...prev, {
          id: newId, packageName, description, pricePerTable,
          menuComboOptions, defaultMenuComboId: defaultMenuComboId!,
          includedServiceList, beverageAllowanceList,
          packageBenefitList: cleanBenefits, conditionList: cleanConditions,
          status, deleted: false, lastModified: now,
        }]);
      }
      showToast(MSG[48]);
      setTimeout(() => setScreen("package-list"), 1500);
    } catch {
      showToast(MSG[50], "error");
    }
  };

  const serviceOptions = activeServices.filter((s) => !includedServiceList.some((is) => is.serviceId === s.id));
  const beverageOptions = activeBeverages.filter((b) => !beverageAllowanceList.some((ib) => ib.beverageId === b.id));

  const FormSection = ({ title, icon: Icon, children, error }: {
    title: string; icon: React.ElementType; children: React.ReactNode; error?: string;
  }) => (
    <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-secondary/30 flex items-center gap-2">
        <Icon className="w-4 h-4 text-accent" />
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-6">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <button onClick={() => setScreen("package-list")} className="hover:text-foreground flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Wedding Packages</button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">{isEditing ? "Sửa gói" : "Thêm gói mới"}</span>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">{isEditing ? `Sửa: ${editingPkg?.packageName}` : "Thêm gói tiệc cưới mới"}</h1>
          <p className="text-muted-foreground">Thiết lập đầy đủ thông tin gói tiệc — combo menu, dịch vụ, thức uống, quyền lợi và điều kiện.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Trạng thái:</span>
          <button
            onClick={() => setStatus((s) => s === "Active" ? "Inactive" : "Active")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${status === "Active" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-300 bg-gray-50 text-gray-600"}`}
          >
            {status === "Active" ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            {status}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Basic Info */}
        <FormSection title="Thông tin cơ bản" icon={Package}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Tên gói tiệc <span className="text-destructive">*</span></label>
              <input
                type="text"
                value={packageName}
                onChange={(e) => { setPackageName(e.target.value); setErrors((prev) => ({ ...prev, packageName: "" })); }}
                placeholder="VD: Gói Vàng Vĩnh Cửu"
                className={`w-full px-4 py-3 rounded-xl border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent ${errors.packageName ? "border-destructive" : "border-border"}`}
              />
              {errors.packageName && <p className="text-xs text-destructive mt-1">{errors.packageName}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Mô tả</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn về gói tiệc..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Giá / bàn (VND) <span className="text-destructive">*</span></label>
              <input
                type="number"
                value={pricePerTable}
                min={0}
                onChange={(e) => { setPricePerTable(Number(e.target.value) || 0); setErrors((prev) => ({ ...prev, pricePerTable: "" })); }}
                className={`w-full px-4 py-3 rounded-xl border bg-input-background font-mono focus:outline-none focus:ring-2 focus:ring-accent ${errors.pricePerTable ? "border-destructive" : "border-border"}`}
              />
              {errors.pricePerTable && <p className="text-xs text-destructive mt-1">{errors.pricePerTable}</p>}
              {pricePerTable > 0 && <p className="text-xs text-muted-foreground mt-1">{formatVND(pricePerTable)}</p>}
            </div>
          </div>
        </FormSection>

        {/* Section 2: Menu Combo Options */}
        <FormSection title="Combo Menu" icon={UtensilsCrossed} error={errors.menuComboOptions || errors.defaultMenuComboId}>
          <p className="text-sm text-muted-foreground mb-4">Chọn các combo menu có trong gói này (ít nhất 1). Chọn combo mặc định sẽ được áp dụng khi đặt tiệc.</p>
          <div className="space-y-3 mb-4">
            {activeCombos.map((combo) => {
              const isSelected = menuComboOptions.includes(combo.id);
              return (
                <div key={combo.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isSelected ? "border-accent bg-accent/5" : "border-border hover:bg-secondary"}`}>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleComboToggle(combo.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? "border-accent bg-accent" : "border-border"}`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-accent-foreground" />}
                    </button>
                    <div>
                      <p className="text-sm font-medium text-foreground">{combo.name}</p>
                      <p className="text-xs text-muted-foreground">{combo.slots.length} món · {combo.comboDiscountRate}% giảm giá</p>
                    </div>
                  </div>
                  {isSelected && (
                    <button
                      type="button"
                      onClick={() => setDefaultMenuComboId(combo.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${defaultMenuComboId === combo.id ? "border-accent bg-accent text-accent-foreground" : "border-border hover:bg-secondary text-muted-foreground"}`}
                    >
                      {defaultMenuComboId === combo.id ? "✓ Mặc định" : "Đặt làm mặc định"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {menuComboOptions.length > 0 && !defaultMenuComboId && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> Vui lòng chọn một combo làm mặc định.
            </div>
          )}
        </FormSection>

        {/* Section 3: Included Services */}
        <FormSection title="Dịch vụ bao gồm trong gói" icon={Sparkles} error={errors.includedServiceList}>
          <p className="text-sm text-muted-foreground mb-4">Các dịch vụ này được tính trong giá gói (không tính thêm). Khi đặt tiệc, khách có thể bỏ dịch vụ nhưng giá không giảm.</p>
          {includedServiceList.length > 0 && (
            <div className="space-y-2 mb-4">
              {includedServiceList.map((svc) => (
                <div key={svc.serviceId} className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-foreground">{svc.serviceName}</span>
                    <span className="text-xs text-muted-foreground font-mono">({formatVND(svc.price)})</span>
                  </div>
                  <button onClick={() => setIncludedServiceList((prev) => prev.filter((s) => s.serviceId !== svc.serviceId))} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <select value={addServiceId} onChange={(e) => setAddServiceId(e.target.value)} className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
              <option value="">-- Thêm dịch vụ --</option>
              {serviceOptions.map((s) => <option key={s.id} value={s.id}>{s.name} — {formatVND(s.price)}</option>)}
            </select>
            <button onClick={handleAddService} disabled={!addServiceId} className="px-4 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:bg-accent/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1">
              <Plus className="w-4 h-4" /> Thêm
            </button>
          </div>
        </FormSection>

        {/* Section 4: Beverage Allowance */}
        <FormSection title="Hạn mức thức uống" icon={Package} error={errors.beverageAllowanceList}>
          <p className="text-sm text-muted-foreground mb-4">Thiết lập số lượng mỗi loại thức uống được phép sử dụng tính theo từng bàn.</p>
          {beverageAllowanceList.length > 0 && (
            <div className="rounded-xl border border-border overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead><tr className="bg-secondary text-left">
                  <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Thức uống</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground text-right">Đơn giá</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground text-center">Hạn mức / bàn</th>
                  <th className="px-4 py-2.5 w-10"></th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {beverageAllowanceList.map((b) => (
                    <tr key={b.beverageId} className="hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium text-foreground">{b.beverageName}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">{formatVND(b.unitPrice)}</td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number" min={1} max={20}
                          value={b.allowancePerTable}
                          onChange={(e) => updateBeverageQty(b.beverageId, Number(e.target.value) || 1)}
                          className="w-20 px-2 py-1 rounded-lg border border-border bg-input-background text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-accent/40 mx-auto"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => setBeverageAllowanceList((prev) => prev.filter((x) => x.beverageId !== b.beverageId))} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"><X className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex gap-2">
            <select value={addBeverageId} onChange={(e) => setAddBeverageId(e.target.value)} className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
              <option value="">-- Chọn thức uống --</option>
              {beverageOptions.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.beverageTypeName}) — {formatVND(b.unitPrice)}</option>)}
            </select>
            <div className="flex items-center gap-1">
              <input type="number" min={1} max={20} value={addBeverageQty} onChange={(e) => setAddBeverageQty(Number(e.target.value) || 1)} className="w-20 px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-accent/40" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">/bàn</span>
            </div>
            <button onClick={handleAddBeverage} disabled={!addBeverageId} className="px-4 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:bg-accent/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1">
              <Plus className="w-4 h-4" /> Thêm
            </button>
          </div>
        </FormSection>

        {/* Section 5 & 6: Benefits & Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Benefits */}
          <FormSection title="Quyền lợi gói" icon={Gift} error={errors.packageBenefitList}>
            <p className="text-xs text-muted-foreground mb-3">Các quyền lợi nổi bật của gói này dành cho khách hàng.</p>
            <div className="space-y-2">
              {packageBenefitList.map((benefit, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => updateListItem(packageBenefitList, setPackageBenefitList, idx, e.target.value)}
                    placeholder="VD: Miễn phí trang trí bàn tiệc"
                    className="flex-1 px-3 py-2 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                  <button onClick={() => removeListItem(packageBenefitList, setPackageBenefitList, idx)} disabled={packageBenefitList.length === 1} className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button onClick={() => addListItem(packageBenefitList, setPackageBenefitList)} className="w-full py-2 rounded-xl border border-dashed border-accent/50 text-accent text-sm font-medium hover:bg-accent/5 transition-all flex items-center justify-center gap-1">
                <Plus className="w-4 h-4" /> Thêm quyền lợi
              </button>
            </div>
          </FormSection>

          {/* Conditions */}
          <FormSection title="Điều kiện áp dụng" icon={ShieldCheck} error={errors.conditionList}>
            <p className="text-xs text-muted-foreground mb-3">Các điều kiện và ràng buộc khi sử dụng gói này.</p>
            <div className="space-y-2">
              {conditionList.map((condition, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={condition}
                    onChange={(e) => updateListItem(conditionList, setConditionList, idx, e.target.value)}
                    placeholder="VD: Đặt trước ít nhất 2 tháng"
                    className="flex-1 px-3 py-2 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                  <button onClick={() => removeListItem(conditionList, setConditionList, idx)} disabled={conditionList.length === 1} className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button onClick={() => addListItem(conditionList, setConditionList)} className="w-full py-2 rounded-xl border border-dashed border-blue-300 text-blue-700 text-sm font-medium hover:bg-blue-50 transition-all flex items-center justify-center gap-1">
                <Plus className="w-4 h-4" /> Thêm điều kiện
              </button>
            </div>
          </FormSection>
        </div>

        {/* Submit */}
        <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4" />
            <span>Tất cả trường có dấu <span className="text-destructive font-bold">*</span> là bắt buộc.</span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setScreen("package-list")} className="px-6 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-all">
              Hủy
            </button>
            <button onClick={handleSubmit} className="px-8 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2">
              <Save className="w-4 h-4" /> {isEditing ? "Lưu thay đổi" : "Tạo gói tiệc"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
