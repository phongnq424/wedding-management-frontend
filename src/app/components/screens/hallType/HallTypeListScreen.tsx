import { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Filter,
    Search,
    Edit,
    Trash2,
    Layers,
    DollarSign,
    Building2,
} from "lucide-react";

import { Screen } from "../../../types";
import { hallTypeService } from "../../../services/hallTypeService";
import { hallService } from "../../../services/hallService";
import { formatVND, StatusBadge } from "../../../utils";
import { mapHallTypeToViewModel } from "./hallType.mapper";
import type { HallTypeViewModel } from "./hallType.types";
import { HallTypeListSkeleton } from "./HallTypeListSkeleton";

interface HallTypeListProps {
    setSelectedHallType: (id: string | null) => void;
    setScreen: (s: Screen) => void;
}

export function HallTypeListScreen({
    setSelectedHallType,
    setScreen,
}: HallTypeListProps) {
    const [hallTypes, setHallTypes] = useState<HallTypeViewModel[]>([]);
    const [totalHalls, setTotalHalls] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filtering, setFiltering] = useState(false);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [nameKeyword, setNameKeyword] = useState("");
    const [minBasePrice, setMinBasePrice] = useState("");
    const [status, setStatus] = useState<"" | "ACTIVE" | "INACTIVE">("");

    const activeCount = useMemo(
        () => hallTypes.filter((item) => item.status === "Active").length,
        [hallTypes]
    );

    const avgBasePrice = useMemo(() => {
        if (hallTypes.length === 0) return 0;

        return (
            hallTypes.reduce((total, item) => total + item.basePrice, 0) /
            hallTypes.length
        );
    }, [hallTypes]);

    async function loadHallTypes() {
        try {
            setLoading(true);
            setError("");

            const [hallTypeData, hallData] = await Promise.all([
                hallTypeService.getAll(),
                hallService.getAll().catch(() => []),
            ]);

            if (!Array.isArray(hallTypeData)) {
                throw new Error("Hall Type API did not return a list");
            }

            setHallTypes(hallTypeData.map(mapHallTypeToViewModel));
            setTotalHalls(Array.isArray(hallData) ? hallData.length : 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Cannot load hall types");
        } finally {
            setLoading(false);
        }
    }

    async function handleSearch() {
        try {
            setFiltering(true);
            setError("");

            const result = await hallTypeService.search({
                nameKeyword: nameKeyword.trim() || undefined,
                minBasePrice: minBasePrice ? Number(minBasePrice) : undefined,
                status: status || undefined,
                page: 0,
                size: 20,
            });

            setHallTypes((result.content ?? []).map(mapHallTypeToViewModel));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Cannot search hall types");
        } finally {
            setFiltering(false);
        }
    }

    async function handleDelete(id: string) {
        const confirmed = window.confirm("Bạn có chắc muốn xóa loại sảnh này không?");
        if (!confirmed) return;

        try {
            setDeletingId(id);
            setError("");

            await hallTypeService.remove(id);
            setHallTypes((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Cannot delete hall type");
        } finally {
            setDeletingId(null);
        }
    }

    useEffect(() => {
        loadHallTypes();
    }, []);

    if (loading) {
        return <HallTypeListSkeleton />;
    }

    if (error) {
        return (
            <div className="p-6 space-y-4">
                <p className="text-destructive">{error}</p>

                <button
                    onClick={loadHallTypes}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-xl"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-primary mb-2">
                        Hall Type Management
                    </h1>
                    <p className="text-muted-foreground">
                        Define and manage hall types with base pricing
                    </p>
                </div>

                <button
                    onClick={() => {
                        setSelectedHallType(null);
                        setScreen("hall-type-form");
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Add Hall Type
                </button>
            </div>

            <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />

                            <input
                                type="text"
                                value={nameKeyword}
                                onChange={(e) => setNameKeyword(e.target.value)}
                                placeholder="Search by hall type name..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent/50"
                            />
                        </div>
                    </div>

                    <input
                        type="number"
                        value={minBasePrice}
                        onChange={(e) => setMinBasePrice(e.target.value)}
                        placeholder="Min Base Price"
                        className="px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent/50 w-48"
                    />

                    <select
                        value={status}
                        onChange={(e) =>
                            setStatus(e.target.value as "" | "ACTIVE" | "INACTIVE")
                        }
                        className="px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent/50"
                    >
                        <option value="">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>

                    <button
                        onClick={handleSearch}
                        disabled={filtering}
                        className="flex items-center gap-2 px-6 py-3 border border-border rounded-xl hover:bg-secondary transition-all disabled:opacity-50"
                    >
                        <Filter className="w-5 h-5" />
                        {filtering ? "Filtering..." : "Filter"}
                    </button>
                </div>
            </div>

            <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-secondary sticky top-0">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                    Hall Type Name
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                    Base Price
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                    Description
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                    Last Modified
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                            {hallTypes.map((type) => (
                                <tr
                                    key={type.id}
                                    className="hover:bg-secondary/50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                                                <Layers className="w-5 h-5 text-accent" />
                                            </div>

                                            <span className="font-semibold text-foreground">
                                                {type.name}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm font-medium text-foreground">
                                            {formatVND(type.basePrice)}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <p className="text-sm text-muted-foreground max-w-md line-clamp-2">
                                            {type.description || "—"}
                                        </p>
                                    </td>

                                    <td className="px-6 py-4">
                                        <StatusBadge status={type.status} />
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="text-sm text-muted-foreground">
                                            {type.lastModifiedDisplay}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedHallType(type.id);
                                                    setScreen("hall-type-form");
                                                }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => handleDelete(type.id)}
                                                disabled={deletingId === type.id}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {hallTypes.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-10 text-center text-muted-foreground"
                                    >
                                        No hall types found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <Layers className="w-6 h-6 text-green-600" />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Active Types</p>
                            <p className="text-2xl font-semibold text-foreground">
                                {activeCount}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-accent" />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Avg Base Price</p>
                            <p className="text-2xl font-semibold text-foreground font-mono">
                                {formatVND(avgBasePrice)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-blue-600" />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Total Halls</p>
                            <p className="text-2xl font-semibold text-foreground">
                                {totalHalls}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}