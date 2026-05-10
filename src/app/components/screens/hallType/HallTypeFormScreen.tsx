import { useEffect, useState } from "react";
import { AlertCircle, Building2 } from "lucide-react";

import { Screen } from "../../../types";
import { hallTypeService } from "../../../services/hallTypeService";
import { hallService } from "../../../services/hallService";
import { formatVND, StatusBadge } from "../../../utils";
import { mapHallTypeToViewModel } from "./hallType.mapper";
import type { HallTypeViewModel } from "./hallType.types";
import { HallTypeFormSkeleton } from "./HallTypeFormSkeleton";

interface HallTypeFormProps {
    selectedHallType: string | null;
    setScreen: (s: Screen) => void;
}

type RelatedHall = {
    id: string;
    name: string;
    status: "Active" | "Inactive";
};

export function HallTypeFormScreen({
    selectedHallType,
    setScreen,
}: HallTypeFormProps) {
    const isEdit = selectedHallType !== null;

    const [hallType, setHallType] = useState<HallTypeViewModel | null>(null);
    const [relatedHalls, setRelatedHalls] = useState<RelatedHall[]>([]);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [basePrice, setBasePrice] = useState("");

    async function handleSubmit() {
        try {
            setSaving(true);
            setError("");

            if (!name.trim()) {
                throw new Error("Tên loại sảnh không được để trống");
            }

            if (basePrice === "" || Number(basePrice) < 0) {
                throw new Error("Giá cơ sở phải lớn hơn hoặc bằng 0");
            }

            const payload = {
                name: name.trim(),
                description: description.trim(),
                basePrice: Number(basePrice),
            };

            if (isEdit) {
                if (!selectedHallType || !hallType?.lastModifiedAt) {
                    throw new Error("Missing hall type id or lastModifiedAt");
                }

                await hallTypeService.update(
                    selectedHallType,
                    payload,
                    hallType.lastModifiedAt
                );
            } else {
                await hallTypeService.create(payload);
            }

            setScreen("hall-type-list");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Cannot save hall type");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!selectedHallType) return;

        const confirmed = window.confirm("Bạn có chắc muốn xóa loại sảnh này không?");
        if (!confirmed) return;

        try {
            setSaving(true);
            setError("");

            await hallTypeService.remove(selectedHallType);
            setScreen("hall-type-list");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Cannot delete hall type");
        } finally {
            setSaving(false);
        }
    }

    useEffect(() => {
        async function loadHallType() {
            if (!selectedHallType) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const [hallTypeData, hallData] = await Promise.all([
                    hallTypeService.getById(selectedHallType),
                    hallService.getAll().catch(() => []),
                ]);

                const viewModel = mapHallTypeToViewModel(hallTypeData);

                setHallType(viewModel);
                setName(hallTypeData.name);
                setDescription(hallTypeData.description ?? "");
                setBasePrice(String(hallTypeData.basePrice ?? 0));

                const related: RelatedHall[] = Array.isArray(hallData)
                    ? hallData
                        .filter((hall) => hall.hallTypeId === selectedHallType)
                        .map((hall) => ({
                            id: hall.id,
                            name: hall.name,
                            status: hall.status === "ACTIVE" ? "Active" : "Inactive",
                        }))
                    : [];

                setRelatedHalls(related);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Cannot load hall type");
            } finally {
                setLoading(false);
            }
        }

        loadHallType();
    }, [selectedHallType]);

    if (loading) {
        return <HallTypeFormSkeleton />;
    }

    if (error) {
        return (
            <div className="p-6 space-y-4">
                <p className="text-destructive">{error}</p>

                <button
                    onClick={() => setScreen("hall-type-list")}
                    className="px-4 py-2 border border-border rounded-xl"
                >
                    Back to List
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-primary mb-2">
                        {isEdit ? "Edit Hall Type" : "Add New Hall Type"}
                    </h1>

                    <p className="text-muted-foreground">
                        {isEdit
                            ? `Update details for ${hallType?.name ?? ""}`
                            : "Create a new hall type category"}
                    </p>
                </div>

                <button
                    onClick={() => setScreen("hall-type-list")}
                    className="px-6 py-3 border border-border text-foreground rounded-xl hover:bg-secondary transition-all"
                >
                    Back to List
                </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                    <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
                        <h3 className="text-lg font-semibold text-primary mb-4">
                            Hall Type Information
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Hall Type Name <span className="text-destructive">*</span>
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Premium"
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                />

                                <p className="text-xs text-muted-foreground mt-1">
                                    Must be unique and descriptive
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Base Price (VND) <span className="text-destructive">*</span>
                                </label>

                                <input
                                    type="number"
                                    value={basePrice}
                                    onChange={(e) => setBasePrice(e.target.value)}
                                    placeholder="15000000"
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all font-mono"
                                />

                                <p className="text-xs text-muted-foreground mt-1">
                                    Preview: {formatVND(Number(basePrice || 0))}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Description
                                </label>

                                <textarea
                                    rows={5}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the hall type features..."
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />

                            <div className="flex-1">
                                <p className="text-sm font-medium text-blue-900 mb-1">
                                    Base Price Guidelines
                                </p>

                                <p className="text-xs text-blue-800">
                                    The base price sets the minimum pricing floor for all halls of
                                    this type.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
                        <h3 className="text-lg font-semibold text-primary mb-4">
                            Status & Metadata
                        </h3>

                        <div className="space-y-4">
                            {isEdit && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Status
                                        </label>

                                        <input
                                            type="text"
                                            value={hallType?.status ?? ""}
                                            disabled
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-muted-foreground cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Last Modified
                                        </label>

                                        <input
                                            type="text"
                                            value={hallType?.lastModifiedDisplay || ""}
                                            disabled
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-muted-foreground cursor-not-allowed"
                                        />
                                    </div>
                                </>
                            )}

                            {!isEdit && (
                                <p className="text-sm text-muted-foreground">
                                    Status will be assigned by backend after creation.
                                </p>
                            )}

                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <p className="text-xs text-amber-900">
                                    <strong>Important:</strong> Changing the base price will affect
                                    all halls using this type.
                                </p>
                            </div>
                        </div>
                    </div>

                    {isEdit && (
                        <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
                            <h3 className="text-lg font-semibold text-primary mb-4">
                                Halls Using This Type
                            </h3>

                            <div className="space-y-2">
                                {relatedHalls.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No halls are using this type
                                    </p>
                                ) : (
                                    relatedHalls.map((hall) => (
                                        <div
                                            key={hall.id}
                                            className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
                                        >
                                            <Building2 className="w-4 h-4 text-accent flex-shrink-0" />

                                            <span className="text-sm font-medium text-foreground flex-1">
                                                {hall.name}
                                            </span>

                                            <StatusBadge status={hall.status} />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm font-medium disabled:opacity-50"
                        >
                            {saving
                                ? "Saving..."
                                : isEdit
                                    ? "Update Hall Type"
                                    : "Create Hall Type"}
                        </button>

                        <button
                            onClick={() => setScreen("hall-type-list")}
                            disabled={saving}
                            className="w-full py-3 border border-border text-foreground rounded-xl hover:bg-secondary transition-all font-medium disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        {isEdit && (
                            <button
                                onClick={handleDelete}
                                disabled={saving || relatedHalls.length > 0}
                                className="w-full py-3 border border-destructive text-destructive rounded-xl hover:bg-red-50 transition-all font-medium disabled:opacity-50"
                            >
                                Delete Hall Type
                            </button>
                        )}

                        {isEdit && relatedHalls.length > 0 && (
                            <p className="text-xs text-muted-foreground text-center">
                                Cannot delete while halls are using this type.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}