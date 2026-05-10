import { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    AlertCircle,
    CheckCircle2,
    X,
    Save,
} from "lucide-react";
import { formatVND, StatusBadge } from "../../utils";
import { beverageService } from "../../services/beverage.service";
import { beverageTypeService } from "../../services/beverageType.service";
import { BeverageResponse } from "../../dto/beverage.dto";
import { BeverageTypeResponse } from "../../dto/beverageType.dto";
import { HallListSkeleton } from "./hall/HallListSkeleton";

type BeverageType = {
    id: string;
    name: string;
    description: string;
    status: string;
    deleted: boolean;
    lastModified: string;
    lastModifiedDisplay: string;
};

type Beverage = {
    id: string;
    name: string;
    beverageTypeId: string;
    beverageTypeName: string;
    unitPrice: number;
    image: string;
    description: string;
    status: string;
    deleted: boolean;
    lastModified: string;
    lastModifiedDisplay: string;
};

function formatDateTime(value: string | null | undefined) {
    return value ? value.slice(0, 16).replace("T", " ") : "N/A";
}

function formatNumberWithDots(value: string | number) {
    const raw = String(value).replace(/\D/g, "");

    if (!raw) return "";

    return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseDotMoney(value: string) {
    const raw = value.replace(/\./g, "").replace(/\D/g, "");

    return raw ? Number(raw) : 0;
}

function mapBeverageTypeToViewModel(item: BeverageTypeResponse): BeverageType {
    return {
        id: item.id,
        name: item.name,
        description: item.description ?? "",
        status: item.status === "ACTIVE" ? "Active" : "Inactive",
        deleted: false,
        lastModified: item.lastModifiedAt ?? "",
        lastModifiedDisplay: formatDateTime(item.lastModifiedAt),
    };
}

function mapBeverageToViewModel(item: BeverageResponse): Beverage {
    return {
        id: item.id,
        name: item.name,
        beverageTypeId: item.beverageTypeId,
        beverageTypeName: item.beverageTypeName,
        unitPrice: item.unitPrice,
        image: item.beverageImage ?? "",
        description: item.description ?? "",
        status: item.status === "ACTIVE" ? "Active" : "Inactive",
        deleted: false,
        lastModified: item.lastModifiedAt ?? "",
        lastModifiedDisplay: formatDateTime(item.lastModifiedAt),
    };
}

export const BeverageListScreen = () => {
    const [beverages, setBeverages] = useState<Beverage[]>([]);
    const [beverageTypes, setBeverageTypes] = useState<BeverageType[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [bSearch, setBSearch] = useState("");
    const [bTypeFilter, setBTypeFilter] = useState("All");
    const [bStatus, setBStatus] = useState("All");
    const [bPriceFrom, setBPriceFrom] = useState("");
    const [bPriceTo, setBPriceTo] = useState("");

    const [showBeverageForm, setShowBeverageForm] = useState(false);
    const [editingBeverage, setEditingBeverage] = useState<Beverage | null>(null);
    const [beverageFormName, setBeverageFormName] = useState("");
    const [beverageFormTypeId, setBeverageFormTypeId] = useState("");
    const [beverageFormPrice, setBeverageFormPrice] = useState("");
    const [beverageFormImage, setBeverageFormImage] = useState("");
    const [beverageFormDesc, setBeverageFormDesc] = useState("");
    const [beverageFormStatus, setBeverageFormStatus] = useState(true);

    const [beverageMsg, setBeverageMsg] = useState<{
        type: "success" | "error" | "warn";
        text: string;
    } | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setBeverageMsg(null);

            const [beverageData, beverageTypeData] = await Promise.all([
                beverageService.getAll(),
                beverageTypeService.getAll(),
            ]);

            setBeverages(beverageData.map(mapBeverageToViewModel));
            setBeverageTypes(beverageTypeData.map(mapBeverageTypeToViewModel));
        } catch (error) {
            setBeverageMsg({
                type: "error",
                text:
                    error instanceof Error
                        ? error.message
                        : "Cannot load beverages.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const activeBeverageTypes = useMemo(() => {
        return beverageTypes.filter(
            (type) => !type.deleted && type.status === "Active"
        );
    }, [beverageTypes]);

    const filtered = useMemo(() => {
        const priceFrom = parseDotMoney(bPriceFrom);
        const priceTo = parseDotMoney(bPriceTo);

        return beverages
            .filter((beverage) => !beverage.deleted)
            .filter(
                (beverage) =>
                    bSearch === "" ||
                    beverage.name.toLowerCase().includes(bSearch.toLowerCase())
            )
            .filter(
                (beverage) =>
                    bTypeFilter === "All" ||
                    beverage.beverageTypeId === bTypeFilter
            )
            .filter((beverage) => bStatus === "All" || beverage.status === bStatus)
            .filter(
                (beverage) =>
                    bPriceFrom === "" || beverage.unitPrice >= priceFrom
            )
            .filter(
                (beverage) =>
                    bPriceTo === "" || beverage.unitPrice <= priceTo
            )
            .sort((a, b) => b.lastModified.localeCompare(a.lastModified));
    }, [beverages, bSearch, bTypeFilter, bStatus, bPriceFrom, bPriceTo]);

    const openAddBeverage = () => {
        setEditingBeverage(null);
        setBeverageFormName("");
        setBeverageFormTypeId("");
        setBeverageFormPrice("");
        setBeverageFormImage("");
        setBeverageFormDesc("");
        setBeverageFormStatus(true);
        setBeverageMsg(null);
        setShowBeverageForm(true);
    };

    const openEditBeverage = (beverage: Beverage) => {
        setEditingBeverage(beverage);
        setBeverageFormName(beverage.name);
        setBeverageFormTypeId(beverage.beverageTypeId);
        setBeverageFormPrice(formatNumberWithDots(beverage.unitPrice));
        setBeverageFormImage(beverage.image);
        setBeverageFormDesc(beverage.description);
        setBeverageFormStatus(beverage.status === "Active");
        setBeverageMsg(null);
        setShowBeverageForm(true);
    };

    const saveBeverage = async () => {
        if (
            !beverageFormName.trim() ||
            beverageFormTypeId === "" ||
            !beverageFormPrice
        ) {
            setBeverageMsg({
                type: "error",
                text: "MSG2: Tên thức uống, loại thức uống và đơn giá không được để trống.",
            });
            return;
        }

        const price = parseDotMoney(beverageFormPrice);

        if (price <= 0) {
            setBeverageMsg({
                type: "error",
                text: "MSG13: Đơn giá phải lớn hơn 0.",
            });
            return;
        }

        try {
            setSaving(true);
            setBeverageMsg(null);

            const payload = {
                name: beverageFormName.trim(),
                beverageTypeId: beverageFormTypeId,
                unitPrice: price,
                beverageImage: beverageFormImage.trim(),
                description: beverageFormDesc.trim(),
                status: beverageFormStatus ? ("ACTIVE" as const) : ("INACTIVE" as const),
            };

            if (editingBeverage) {
                await beverageService.update(
                    editingBeverage.id,
                    payload,
                    editingBeverage.lastModified
                );

                setBeverageMsg({
                    type: "success",
                    text: "MSG17: Thức uống được cập nhật thành công.",
                });
            } else {
                await beverageService.create(payload);

                setBeverageMsg({
                    type: "success",
                    text: "MSG48: Thức uống được tạo thành công.",
                });
            }

            setShowBeverageForm(false);
            await fetchData();
        } catch (error) {
            setBeverageMsg({
                type: "error",
                text:
                    error instanceof Error
                        ? error.message
                        : "Cannot save beverage.",
            });
        } finally {
            setSaving(false);
        }
    };

    const deleteBeverage = async (id: string) => {
        const confirmed = window.confirm(
            "Bạn có chắc muốn xóa thức uống này không?"
        );

        if (!confirmed) return;

        try {
            setDeletingId(id);
            setBeverageMsg(null);

            await beverageService.remove(id, true);
            await fetchData();

            setBeverageMsg({
                type: "success",
                text: "MSG20: Thức uống được xóa thành công.",
            });
        } catch (error) {
            setBeverageMsg({
                type: "error",
                text:
                    error instanceof Error
                        ? error.message
                        : "Cannot delete beverage.",
            });
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return <HallListSkeleton />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-primary mb-2">
                        Beverages
                    </h1>
                    <p className="text-muted-foreground">
                        Manage beverages available in wedding menus and packages
                    </p>
                </div>

                <button
                    onClick={openAddBeverage}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Add Beverage
                </button>
            </div>

            {beverageMsg && (
                <div
                    className={`flex items-center gap-3 p-4 rounded-xl border text-sm ${beverageMsg.type === "success"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : beverageMsg.type === "warn"
                                ? "bg-amber-50 border-amber-200 text-amber-800"
                                : "bg-red-50 border-red-200 text-red-800"
                        }`}
                >
                    {beverageMsg.type === "success" ? (
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}

                    {beverageMsg.text}

                    <button
                        onClick={() => setBeverageMsg(null)}
                        className="ml-auto p-1 hover:opacity-70"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="bg-card rounded-[20px] p-5 border border-border shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                            Beverage Name
                        </label>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={bSearch}
                                onChange={(e) => setBSearch(e.target.value)}
                                placeholder="Search..."
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                            Beverage Type
                        </label>

                        <select
                            value={bTypeFilter}
                            onChange={(e) => setBTypeFilter(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                        >
                            <option value="All">All Types</option>
                            {beverageTypes
                                .filter((type) => !type.deleted)
                                .map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                            Price From (VND)
                        </label>

                        <input
                            type="text"
                            inputMode="numeric"
                            value={bPriceFrom}
                            onChange={(e) =>
                                setBPriceFrom(formatNumberWithDots(e.target.value))
                            }
                            placeholder="0"
                            className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                            Price To (VND)
                        </label>

                        <input
                            type="text"
                            inputMode="numeric"
                            value={bPriceTo}
                            onChange={(e) =>
                                setBPriceTo(formatNumberWithDots(e.target.value))
                            }
                            placeholder="∞"
                            className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                            Status
                        </label>

                        <select
                            value={bStatus}
                            onChange={(e) => setBStatus(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                        >
                            <option value="All">All</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                    {filtered.length} result(s) found
                </p>
            </div>

            <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-secondary">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                                    Beverage Name
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                                    Type
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide">
                                    Unit Price
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                                    Description
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                                    Last Modified
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                            {filtered.map((beverage) => (
                                <tr
                                    key={beverage.id}
                                    className="hover:bg-secondary/40 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                {beverage.image ? (
                                                    <img
                                                        src={beverage.image}
                                                        alt={beverage.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground text-xs">
                                                        No img
                                                    </div>
                                                )}
                                            </div>

                                            <span className="font-medium text-foreground">
                                                {beverage.name}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-accent/15 text-accent">
                                            {beverage.beverageTypeName}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-right font-mono text-sm font-semibold text-foreground">
                                        {formatVND(beverage.unitPrice)}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                                        {beverage.description}
                                    </td>

                                    <td className="px-6 py-4">
                                        <StatusBadge status={beverage.status} />
                                    </td>

                                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                                        {beverage.lastModifiedDisplay}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => openEditBeverage(beverage)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => deleteBeverage(beverage.id)}
                                                disabled={deletingId === beverage.id}
                                                className="p-2 text-destructive hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filtered.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-12 text-center text-sm text-muted-foreground"
                                    >
                                        No beverages found matching the current filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showBeverageForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
                    <div className="bg-card rounded-[24px] shadow-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
                            <h2 className="text-xl font-semibold text-primary">
                                {editingBeverage ? "Edit Beverage" : "Add Beverage"}
                            </h2>

                            <button
                                onClick={() => setShowBeverageForm(false)}
                                className="p-2 hover:bg-secondary rounded-lg"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Beverage Name{" "}
                                    <span className="text-destructive">*</span>
                                </label>

                                <input
                                    type="text"
                                    value={beverageFormName}
                                    onChange={(e) =>
                                        setBeverageFormName(e.target.value)
                                    }
                                    placeholder="e.g., Coca Cola"
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Beverage Type{" "}
                                    <span className="text-destructive">*</span>
                                </label>

                                <select
                                    value={beverageFormTypeId}
                                    onChange={(e) =>
                                        setBeverageFormTypeId(e.target.value)
                                    }
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                                >
                                    <option value="">Select type</option>
                                    {activeBeverageTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Unit Price (VND){" "}
                                    <span className="text-destructive">*</span>
                                </label>

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={beverageFormPrice}
                                    onChange={(e) =>
                                        setBeverageFormPrice(
                                            formatNumberWithDots(e.target.value)
                                        )
                                    }
                                    placeholder="0"
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Beverage Image URL
                                </label>

                                <input
                                    type="text"
                                    value={beverageFormImage}
                                    onChange={(e) =>
                                        setBeverageFormImage(e.target.value)
                                    }
                                    placeholder="https://..."
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Description
                                </label>

                                <textarea
                                    rows={3}
                                    value={beverageFormDesc}
                                    onChange={(e) =>
                                        setBeverageFormDesc(e.target.value)
                                    }
                                    placeholder="Optional description..."
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                                />
                            </div>

                            {editingBeverage && (
                                <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={beverageFormStatus}
                                            onChange={(e) =>
                                                setBeverageFormStatus(e.target.checked)
                                            }
                                            className="sr-only peer"
                                        />

                                        <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
                                    </label>

                                    <span className="text-sm font-medium">
                                        {beverageFormStatus ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            )}

                            {beverageMsg && (
                                <div
                                    className={`flex items-center gap-2 p-3 rounded-xl text-sm ${beverageMsg.type === "success"
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-red-50 text-red-700"
                                        }`}
                                >
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {beverageMsg.text}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-border flex justify-end gap-3">
                            <button
                                onClick={() => setShowBeverageForm(false)}
                                className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-secondary transition-all"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={saveBeverage}
                                disabled={saving}
                                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};