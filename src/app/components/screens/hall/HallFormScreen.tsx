import { useEffect, useState } from "react";
import { AlertCircle, Upload } from "lucide-react";

import { Screen } from "../../../types";
import { hallService } from "../../../services/hallService";
import { formatVND } from "../../../utils";

import { HallFormSkeleton } from "./HallFormSkeleton";
import { HallPricingMatrixInput } from "./HallPricingMatrixInput";
import { mapHallToViewModel } from "./hall.mapper";
import { DEFAULT_PRICING_ROWS, getPrice } from "./hall.utils";
import type { HallPricingFormRow, HallViewModel } from "./hall.types";

import { hallTypeService } from "../../../services/hallTypeService";
import type { HallTypeResponse } from "../../../dto/hallType.dto";

interface HallFormProps {
    selectedHall: string | null;
    setScreen: (s: Screen) => void;
}

export function HallFormScreen({ selectedHall, setScreen }: HallFormProps) {
    const isEdit = selectedHall !== null;

    const [hall, setHall] = useState<HallViewModel | null>(null);
    const [loading, setLoading] = useState(isEdit);
    const [error, setError] = useState("");

    const [name, setName] = useState("");
    const [hallTypeId, setHallTypeId] = useState("");
    const [hallTypes, setHallTypes] = useState<HallTypeResponse[]>([]);
    const [minTables, setMinTables] = useState("");
    const [maxTables, setMaxTables] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("INACTIVE");

    const [hallImageFile, setHallImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | undefined>(
        undefined
    );

    const [saving, setSaving] = useState(false);


    const [pricingRows, setPricingRows] = useState<HallPricingFormRow[]>(
        DEFAULT_PRICING_ROWS.map((row) => ({ ...row }))
    );
    const selectedHallTypeData = hallTypes.find((type) => type.id === hallTypeId);

    const basePriceReference =
        selectedHallTypeData?.basePrice ?? hall?.basePrice ?? 0;

    async function handleSubmit() {
        try {
            setSaving(true);
            setError("");

            if (!name.trim()) {
                throw new Error("Tên sảnh không được để trống");
            }

            if (!hallTypeId.trim()) {
                throw new Error("Vui lòng nhập Hall Type ID");
            }

            if (!minTables || Number(minTables) <= 0) {
                throw new Error("Số bàn tối thiểu phải lớn hơn 0");
            }

            if (!maxTables || Number(maxTables) <= 0) {
                throw new Error("Số bàn tối đa phải lớn hơn 0");
            }

            if (Number(minTables) > Number(maxTables)) {
                throw new Error("Số bàn tối thiểu không được lớn hơn số bàn tối đa");
            }

            const payload = {
                name: name.trim(),
                hallTypeId: hallTypeId.trim(),
                minTables: Number(minTables),
                maxTables: Number(maxTables),
                description: description.trim(),
                status,
                pricings: pricingRows.map((row) => ({
                    timeSlot: row.timeSlot,
                    dayType: row.dayType,
                    price: Number(row.price),
                })),
            };

            if (isEdit) {
                if (!selectedHall || !hall?.lastModified) {
                    throw new Error("Missing hall id or lastModifiedAt");
                }

                await hallService.update(
                    selectedHall,
                    payload,
                    hall.lastModified,
                    hallImageFile
                );
            } else {
                await hallService.create(payload, hallImageFile);
            }

            setScreen("hall-list");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Cannot save hall");
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteCurrentHall() {
        if (!selectedHall) return;

        const confirmed = window.confirm("Bạn có chắc muốn xóa sảnh này không?");
        if (!confirmed) return;

        try {
            setSaving(true);
            setError("");

            await hallService.remove(selectedHall);
            setScreen("hall-list");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Cannot delete hall");
        } finally {
            setSaving(false);
        }
    }

    function handleImageChange(file: File | null) {
        setHallImageFile(file);

        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
    }

    useEffect(() => {
        async function loadInitialData() {
            try {
                setLoading(true);
                setError("");

                const hallTypeData = await hallTypeService.getAll();
                setHallTypes(hallTypeData);

                if (!selectedHall) {
                    setLoading(false);
                    return;
                }

                const data = await hallService.getById(selectedHall);
                const viewModel = mapHallToViewModel(data);

                setHall(viewModel);
                setName(data.name);
                setHallTypeId(data.hallTypeId);
                setMinTables(String(data.minTables));
                setMaxTables(String(data.maxTables));
                setDescription(data.description ?? "");
                setImagePreview(data.hallImage);
                setStatus(data.status);

                setPricingRows([
                    {
                        timeSlot: "MORNING",
                        dayType: "WEEKDAY",
                        price: getPrice(data.pricings ?? [], "MORNING", "WEEKDAY"),
                    },
                    {
                        timeSlot: "MORNING",
                        dayType: "WEEKEND",
                        price: getPrice(data.pricings ?? [], "MORNING", "WEEKEND"),
                    },
                    {
                        timeSlot: "AFTERNOON",
                        dayType: "WEEKDAY",
                        price: getPrice(data.pricings ?? [], "AFTERNOON", "WEEKDAY"),
                    },
                    {
                        timeSlot: "AFTERNOON",
                        dayType: "WEEKEND",
                        price: getPrice(data.pricings ?? [], "AFTERNOON", "WEEKEND"),
                    },
                    {
                        timeSlot: "EVENING",
                        dayType: "WEEKDAY",
                        price: getPrice(data.pricings ?? [], "EVENING", "WEEKDAY"),
                    },
                    {
                        timeSlot: "EVENING",
                        dayType: "WEEKEND",
                        price: getPrice(data.pricings ?? [], "EVENING", "WEEKEND"),
                    },
                ]);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Cannot load hall form data");
            } finally {
                setLoading(false);
            }
        }

        loadInitialData();
    }, [selectedHall]);

    if (loading) {
        return <HallFormSkeleton />;
    }

    if (error) {
        return (
            <div className="p-6 space-y-4">
                <p className="text-destructive">{error}</p>

                <button
                    onClick={() => setScreen("hall-list")}
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
                        {isEdit ? "Edit Hall" : "Add New Hall"}
                    </h1>

                    <p className="text-muted-foreground">
                        {isEdit
                            ? `Update details for ${hall?.name ?? ""}`
                            : "Create a new wedding reception hall"}
                    </p>
                </div>

                <button
                    onClick={() => setScreen("hall-list")}
                    className="px-6 py-3 border border-border text-foreground rounded-xl hover:bg-secondary transition-all"
                >
                    Back to List
                </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                    <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
                        <h3 className="text-lg font-semibold text-primary mb-4">
                            Basic Information
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Hall Name <span className="text-destructive">*</span>
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Diamond Hall"
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                />

                                <p className="text-xs text-muted-foreground mt-1">
                                    Must be unique
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Hall Type <span className="text-destructive">*</span>
                                </label>

                                <select
                                    value={hallTypeId}
                                    onChange={(e) => setHallTypeId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                >
                                    <option value="">Select hall type</option>

                                    {hallTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name} — {formatVND(type.basePrice)}
                                        </option>
                                    ))}
                                </select>

                                <p className="text-xs text-muted-foreground mt-1">
                                    Hall type is loaded from Hall Type API.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Base Price Reference
                                </label>

                                <input
                                    type="text"
                                    value={formatVND(basePriceReference)}
                                    disabled
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-muted-foreground cursor-not-allowed"
                                />

                                <p className="text-xs text-muted-foreground mt-1">
                                    Based on hall type
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Minimum Tables <span className="text-destructive">*</span>
                                    </label>

                                    <input
                                        type="number"
                                        value={minTables}
                                        onChange={(e) => setMinTables(e.target.value)}
                                        placeholder="20"
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Maximum Tables <span className="text-destructive">*</span>
                                    </label>

                                    <input
                                        type="number"
                                        value={maxTables}
                                        onChange={(e) => setMaxTables(e.target.value)}
                                        placeholder="50"
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Description
                                </label>

                                <textarea
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the hall..."
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
                        <h3 className="text-lg font-semibold text-primary mb-1">
                            Pricing Matrix
                        </h3>

                        <p className="text-sm text-muted-foreground mb-4">
                            Set prices per table for each shift and day type
                        </p>

                        <HallPricingMatrixInput
                            pricingRows={pricingRows}
                            setPricingRows={setPricingRows}
                        />

                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />

                            <p className="text-sm text-amber-900">
                                All prices must be equal to or greater than the base price (
                                {formatVND(basePriceReference || 0)})
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
                        <h3 className="text-lg font-semibold text-primary mb-4">
                            Hall Image
                        </h3>

                        <div className="space-y-4">
                            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-muted border-2 border-dashed border-border flex items-center justify-center">
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Hall preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-center">
                                        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            Click to upload
                                        </p>
                                    </div>
                                )}
                            </div>

                            <input
                                id="hall-image-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    handleImageChange(file);
                                }}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    document.getElementById("hall-image-input")?.click()
                                }
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-border rounded-xl hover:bg-secondary transition-all"
                            >
                                <Upload className="w-4 h-4" />
                                Upload Image
                            </button>
                        </div>
                    </div>

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

                                        <div className="flex items-center justify-between gap-3 p-4 bg-secondary rounded-xl">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {status === "ACTIVE" ? "Active" : "Inactive"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {status === "ACTIVE"
                                                        ? "This hall can be selected for booking."
                                                        : "This hall is hidden from normal selection."}
                                                </p>
                                            </div>

                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={status === "ACTIVE"}
                                                    onChange={(e) =>
                                                        setStatus(e.target.checked ? "ACTIVE" : "INACTIVE")
                                                    }
                                                    className="sr-only peer"
                                                    disabled={saving}
                                                />

                                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Last Modified
                                        </label>

                                        <input
                                            type="text"
                                            value={hall?.lastModifiedDisplay || ""}
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
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm font-medium disabled:opacity-50"
                        >
                            {saving ? "Saving..." : isEdit ? "Update Hall" : "Create Hall"}
                        </button>

                        <button
                            onClick={() => setScreen("hall-list")}
                            disabled={saving}
                            className="w-full py-3 border border-border text-foreground rounded-xl hover:bg-secondary transition-all font-medium disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        {isEdit && (
                            <button
                                onClick={handleDeleteCurrentHall}
                                disabled={saving}
                                className="w-full py-3 border border-destructive text-destructive rounded-xl hover:bg-red-50 transition-all font-medium disabled:opacity-50"
                            >
                                Delete Hall
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}