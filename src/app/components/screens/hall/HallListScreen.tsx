import { useEffect, useState } from "react";
import { Plus, Filter, Eye, Edit, Trash2 } from "lucide-react";

import { Screen } from "../../../types";
import { hallService } from "../../../services/hallService";
import { StatusBadge } from "../../../utils";

import { HallListSkeleton } from "./HallListSkeleton";
import { HallPricingModal } from "./HallPricingModal";
import { mapHallToViewModel } from "./hall.mapper";
import type { HallViewModel } from "./hall.types";
import { hallTypeService } from "../../../services/hallTypeService";
import type { HallTypeResponse } from "../../../dto/hallType.dto";

interface HallListProps {
    setSelectedHall: (id: string | null) => void;
    setScreen: (s: Screen) => void;
    showPriceModal: boolean;
    setShowPriceModal: (v: boolean) => void;
    selectedHall: string | null;
}

export function HallListScreen({
    setSelectedHall,
    setScreen,
    showPriceModal,
    setShowPriceModal,
    selectedHall,
}: HallListProps) {
    const [halls, setHalls] = useState<HallViewModel[]>([]);
    const [hallTypes, setHallTypes] = useState<HallTypeResponse[]>([]);
    const [selectedHallTypeFilter, setSelectedHallTypeFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const selectedHallData = halls.find((hall) => hall.id === selectedHall);

    async function loadHalls() {
        try {
            setLoading(true);
            setError("");

            const [hallData, hallTypeData] = await Promise.all([
                hallService.getAll(),
                hallTypeService.getAll(),
            ]);

            if (!Array.isArray(hallData)) {
                throw new Error("Hall API did not return a list");
            }

            setHalls(hallData.map(mapHallToViewModel));
            setHallTypes(hallTypeData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Cannot load halls");
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteHall(id: string) {
        const confirmed = window.confirm("Bạn có chắc muốn xóa sảnh này không?");
        if (!confirmed) return;

        try {
            setDeletingId(id);
            setError("");

            await hallService.remove(id);

            setHalls((prev) => prev.filter((hall) => hall.id !== id));

            if (selectedHall === id) {
                setShowPriceModal(false);
                setSelectedHall(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Cannot delete hall");
        } finally {
            setDeletingId(null);
        }
    }

    useEffect(() => {
        loadHalls();
    }, []);

    if (loading) {
        return <HallListSkeleton />;
    }

    if (error) {
        return (
            <div className="p-6 space-y-4">
                <p className="text-destructive">{error}</p>

                <button
                    onClick={loadHalls}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-xl"
                >
                    Retry
                </button>
            </div>
        );
    }

    const visibleHalls = selectedHallTypeFilter
        ? halls.filter((hall) => hall.hallTypeId === selectedHallTypeFilter)
        : halls;
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-primary mb-2">
                        Hall Management
                    </h1>
                    <p className="text-muted-foreground">
                        Manage wedding reception halls and pricing
                    </p>
                </div>

                <button
                    onClick={() => {
                        setSelectedHall(null);
                        setScreen("hall-form");
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Add New Hall
                </button>
            </div>

            <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <Filter className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-semibold">Filters</h3>
                </div>

                <div className="grid grid-cols-5 gap-4">
                    <input
                        type="text"
                        placeholder="Hall name"
                        className="px-4 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />

                    <select
                        value={selectedHallTypeFilter}
                        onChange={(e) => setSelectedHallTypeFilter(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent/50"
                    >
                        <option value="">All Hall Types</option>

                        {hallTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        placeholder="Min tables"
                        className="px-4 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />

                    <input
                        type="number"
                        placeholder="Max tables"
                        className="px-4 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />

                    <select className="px-4 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent/50">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Inactive</option>
                    </select>
                </div>
            </div>

            <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-secondary sticky top-0">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                    Hall
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                    Type
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                    Min Tables
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                    Max Tables
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
                            {visibleHalls.map((hall) => (
                                <tr
                                    key={hall.id}
                                    className="hover:bg-secondary/50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted">
                                                {hall.image ? (
                                                    <img
                                                        src={hall.image}
                                                        alt={hall.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-secondary" />
                                                )}
                                            </div>

                                            <span className="font-medium text-foreground">
                                                {hall.name}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-sm text-muted-foreground">
                                        {hall.type}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                                        {hall.minTables}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                                        {hall.maxTables}
                                    </td>

                                    <td className="px-6 py-4">
                                        <StatusBadge status={hall.status} />
                                    </td>

                                    <td className="px-6 py-4 text-sm text-muted-foreground">
                                        {hall.lastModifiedDisplay}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedHall(hall.id);
                                                    setShowPriceModal(true);
                                                }}
                                                className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                                                title="View Price"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setSelectedHall(hall.id);
                                                    setScreen("hall-form");
                                                }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => handleDeleteHall(hall.id)}
                                                disabled={deletingId === hall.id}
                                                className="p-2 text-destructive hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {visibleHalls.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-10 text-center text-muted-foreground"
                                    >
                                        No halls found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <HallPricingModal
                open={showPriceModal}
                hall={selectedHallData}
                onClose={() => setShowPriceModal(false)}
                onEdit={() => {
                    setShowPriceModal(false);
                    setScreen("hall-form");
                }}
            />
        </div>
    );
}