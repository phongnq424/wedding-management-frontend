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
import { StatusBadge } from "../../utils";
import { beverageTypeService } from "../../services/beverageType.service";
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

function formatDateTime(value: string | null | undefined) {
    return value ? value.slice(0, 16).replace("T", " ") : "N/A";
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

export const BeverageTypeListScreen = () => {
    const [beverageTypes, setBeverageTypes] = useState<BeverageType[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [btSearch, setBtSearch] = useState("");
    const [btStatus, setBtStatus] = useState("All");

    const [showBtForm, setShowBtForm] = useState(false);
    const [editingBt, setEditingBt] = useState<BeverageType | null>(null);
    const [btFormName, setBtFormName] = useState("");
    const [btFormDesc, setBtFormDesc] = useState("");
    const [btFormStatus, setBtFormStatus] = useState(true);

    const [btMsg, setBtMsg] = useState<{
        type: "success" | "error" | "warn";
        text: string;
    } | null>(null);

    const fetchBeverageTypes = async () => {
        try {
            setLoading(true);
            setBtMsg(null);

            const data = await beverageTypeService.getAll();
            setBeverageTypes(data.map(mapBeverageTypeToViewModel));
        } catch (error) {
            setBtMsg({
                type: "error",
                text:
                    error instanceof Error
                        ? error.message
                        : "Cannot load beverage types.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBeverageTypes();
    }, []);

    const filtered = useMemo(() => {
        return beverageTypes
            .filter((type) => !type.deleted)
            .filter(
                (type) =>
                    btSearch === "" ||
                    type.name.toLowerCase().includes(btSearch.toLowerCase())
            )
            .filter((type) => btStatus === "All" || type.status === btStatus)
            .sort((a, b) => b.lastModified.localeCompare(a.lastModified));
    }, [beverageTypes, btSearch, btStatus]);

    const openAdd = () => {
        setEditingBt(null);
        setBtFormName("");
        setBtFormDesc("");
        setBtFormStatus(true);
        setBtMsg(null);
        setShowBtForm(true);
    };

    const openEdit = (type: BeverageType) => {
        setEditingBt(type);
        setBtFormName(type.name);
        setBtFormDesc(type.description);
        setBtFormStatus(type.status === "Active");
        setBtMsg(null);
        setShowBtForm(true);
    };

    const saveBt = async () => {
        if (!btFormName.trim()) {
            setBtMsg({
                type: "error",
                text: "MSG2: Tên loại thức uống không được để trống.",
            });
            return;
        }

        try {
            setSaving(true);
            setBtMsg(null);

            const payload = {
                name: btFormName.trim(),
                description: btFormDesc.trim(),
                status: btFormStatus ? ("ACTIVE" as const) : ("INACTIVE" as const),
            };

            if (editingBt) {
                await beverageTypeService.update(
                    editingBt.id,
                    payload,
                    editingBt.lastModified
                );

                setBtMsg({
                    type: "success",
                    text: "MSG17: Cập nhật thành công.",
                });
            } else {
                await beverageTypeService.create(payload);

                setBtMsg({
                    type: "success",
                    text: "MSG48: Tạo thành công.",
                });
            }

            setShowBtForm(false);
            await fetchBeverageTypes();
        } catch (error) {
            setBtMsg({
                type: "error",
                text:
                    error instanceof Error
                        ? error.message
                        : "Cannot save beverage type.",
            });
        } finally {
            setSaving(false);
        }
    };

    const deleteBt = async (id: string) => {
        const confirmed = window.confirm(
            "Bạn có chắc muốn xóa loại thức uống này không?"
        );

        if (!confirmed) return;

        try {
            setDeletingId(id);
            setBtMsg(null);

            await beverageTypeService.remove(id, true);
            await fetchBeverageTypes();

            setBtMsg({
                type: "success",
                text: "MSG20: Xóa thành công.",
            });
        } catch (error) {
            setBtMsg({
                type: "error",
                text:
                    error instanceof Error
                        ? error.message
                        : "Cannot delete beverage type.",
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
                        Beverage Types
                    </h1>
                    <p className="text-muted-foreground">
                        Manage beverage type categories used across beverage menus
                    </p>
                </div>

                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Add Beverage Type
                </button>
            </div>

            {btMsg && (
                <div
                    className={`flex items-center gap-3 p-4 rounded-xl border text-sm ${btMsg.type === "success"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : btMsg.type === "warn"
                                ? "bg-amber-50 border-amber-200 text-amber-800"
                                : "bg-red-50 border-red-200 text-red-800"
                        }`}
                >
                    {btMsg.type === "success" ? (
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}

                    {btMsg.text}

                    <button
                        onClick={() => setBtMsg(null)}
                        className="ml-auto p-1 hover:opacity-70"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="bg-card rounded-[20px] p-5 border border-border shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                            Beverage Type Name
                        </label>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={btSearch}
                                onChange={(e) => setBtSearch(e.target.value)}
                                placeholder="Search by name..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                            Status
                        </label>

                        <select
                            value={btStatus}
                            onChange={(e) => setBtStatus(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
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
                <table className="w-full">
                    <thead className="bg-secondary">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                                Name
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
                        {filtered.map((type) => (
                            <tr
                                key={type.id}
                                className="hover:bg-secondary/40 transition-colors"
                            >
                                <td className="px-6 py-4 font-medium text-foreground">
                                    {type.name}
                                </td>

                                <td className="px-6 py-4 text-sm text-muted-foreground max-w-sm truncate">
                                    {type.description}
                                </td>

                                <td className="px-6 py-4">
                                    <StatusBadge status={type.status} />
                                </td>

                                <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                                    {type.lastModifiedDisplay}
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => openEdit(type)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => deleteBt(type.id)}
                                            disabled={deletingId === type.id}
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
                                    colSpan={5}
                                    className="px-6 py-12 text-center text-sm text-muted-foreground"
                                >
                                    No beverage types found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showBtForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
                    <div className="bg-card rounded-[24px] shadow-xl border border-border w-full max-w-lg">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-primary">
                                {editingBt ? "Edit Beverage Type" : "Add Beverage Type"}
                            </h2>

                            <button
                                onClick={() => setShowBtForm(false)}
                                className="p-2 hover:bg-secondary rounded-lg"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Beverage Type Name{" "}
                                    <span className="text-destructive">*</span>
                                </label>

                                <input
                                    type="text"
                                    value={btFormName}
                                    onChange={(e) => setBtFormName(e.target.value)}
                                    placeholder="e.g., Nước ngọt"
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Description
                                </label>

                                <textarea
                                    rows={3}
                                    value={btFormDesc}
                                    onChange={(e) => setBtFormDesc(e.target.value)}
                                    placeholder="Optional description..."
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                                />
                            </div>

                            {editingBt && (
                                <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={btFormStatus}
                                            onChange={(e) =>
                                                setBtFormStatus(e.target.checked)
                                            }
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
                                    </label>

                                    <span className="text-sm font-medium">
                                        {btFormStatus ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            )}

                            {btMsg && (
                                <div
                                    className={`flex items-center gap-2 p-3 rounded-xl text-sm ${btMsg.type === "success"
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-red-50 text-red-700"
                                        }`}
                                >
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {btMsg.text}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-border flex justify-end gap-3">
                            <button
                                onClick={() => setShowBtForm(false)}
                                className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-secondary transition-all"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={saveBt}
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