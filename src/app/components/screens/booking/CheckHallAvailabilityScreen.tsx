import { useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Building2,
    Check,
    CheckCircle2,
    ChevronRight,
    Filter,
    Users,
    DollarSign,
} from "lucide-react";
import { bookingService } from "../../../services/booking.service";
import { shiftService } from "../../../services/shift.service";
import type { HallAvailabilityResponse } from "../../../dto/booking.dto";
import type { ShiftResponse } from "../../../dto/shift.dto";
import { formatVND } from "../../../utils";
import type { BookingPreselect, CheckHallAvailabilityProps } from "./booking.types";

function todayDate() {
    return new Date().toISOString().slice(0, 10);
}

export const CheckHallAvailabilityScreen = ({ setScreen, setBookingPreselect }: CheckHallAvailabilityProps) => {
    const [availabilityDate, setAvailabilityDate] = useState(todayDate());
    const [capacity, setCapacity] = useState(30);
    const [shiftId, setShiftId] = useState("");
    const [hallTypeFilter, setHallTypeFilter] = useState("ALL");
    const [shifts, setShifts] = useState<ShiftResponse[]>([]);
    const [halls, setHalls] = useState<HallAvailabilityResponse[]>([]);
    const [selectedHall, setSelectedHall] = useState<HallAvailabilityResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [loadingShifts, setLoadingShifts] = useState(true);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        window.setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        let cancelled = false;

        async function loadShifts() {
            try {
                setLoadingShifts(true);

                const data = await shiftService.getAll();

                if (cancelled) return;

                setShifts(data);

                const defaultShiftId =
                    data.find((item) => item.status === "ACTIVE")?.id ||
                    data[0]?.id ||
                    "";

                setShiftId((prev) => prev || defaultShiftId);
            } catch (error) {
                if (!cancelled) {
                    showToast(
                        error instanceof Error ? error.message : "Cannot load shifts.",
                        "error"
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingShifts(false);
                }
            }
        }

        loadShifts();

        return () => {
            cancelled = true;
        };
    }, []);

    async function searchAvailability() {
        if (!availabilityDate || !shiftId || capacity <= 0) {
            showToast("Vui lòng chọn ngày, ca và số bàn hợp lệ.", "error");
            return;
        }

        try {
            setLoading(true);
            setHasSearched(true);
            setSelectedHall(null);

            const result = await bookingService.checkHallAvailability({
                bookingDate: availabilityDate,
                shiftId,
                capacity,
                page: 0,
                size: 20,
            });

            setHalls(result.content);
        } catch (error) {
            showToast(error instanceof Error ? error.message : "Cannot check hall availability.", "error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (shiftId && !loadingShifts) {
            searchAvailability();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shiftId, loadingShifts]);

    const selectedShift = shifts.find((item) => item.id === shiftId);
    const hallTypes = useMemo(() => ["ALL", ...Array.from(new Set(halls.map((h) => h.hallTypeName).filter(Boolean)))], [halls]);

    const availableHalls = halls.filter((hall) => {
        if (hallTypeFilter !== "ALL" && hall.hallTypeName !== hallTypeFilter) return false;
        return true;
    });

    const handleContinue = () => {
        if (!selectedHall || !selectedShift) return;

        const preselect: BookingPreselect = {
            hallId: selectedHall.hallId,
            hallName: selectedHall.hallName ?? "N/A",
            hallTypeName: selectedHall.hallTypeName,
            hallImage: selectedHall.hallImage,
            price: selectedHall.price ?? 0,
            maxTables: selectedHall.maxTables ?? capacity,
            date: availabilityDate,
            shiftId,
            shiftName: selectedShift.name,
        };

        setBookingPreselect(preselect);
        setScreen("booking-form");
    };
    const isInitialLoading = loadingShifts || (loading && !hasSearched);
    const showEmptyState = hasSearched && !loading && availableHalls.length === 0;
    const showHallGrid = hasSearched && !loading && availableHalls.length > 0;
    return (
        <div className="space-y-6">
            {toast && <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>{toast.msg}</div>}

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <button onClick={() => setScreen("booking")} className="hover:text-foreground flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> Danh sách Booking
                </button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground font-medium">Bước 1 — Chọn Sảnh & Ca</span>
            </div>

            <div className="bg-card rounded-[20px] p-5 border border-border shadow-sm">
                <div className="grid grid-cols-4 gap-4">
                    {["Chọn Sảnh & Ca", "Thông tin KH", "Thực đơn / Gói", "Đặt cọc"].map((label, idx) => (
                        <div key={label} className="relative">
                            <div className="flex flex-col items-center gap-1.5">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${idx === 0 ? "bg-accent text-accent-foreground shadow-md" : "bg-secondary text-muted-foreground"}`}>{idx + 1}</div>
                                <span className={`text-xs font-medium text-center ${idx === 0 ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
                            </div>
                            {idx < 3 && <div className="absolute top-5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5 bg-border" />}
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h1 className="text-3xl font-semibold text-primary mb-2">Bước 1 · Chọn Sảnh & Ca Tiệc</h1>
                <p className="text-muted-foreground">Chọn ngày cưới, ca tiệc và số bàn để xem sảnh còn trống.</p>
            </div>

            <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-accent" /> Lọc theo Ngày — Ca — Số bàn — Loại sảnh
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Ngày cưới</label>
                        <input type="date" value={availabilityDate} onChange={(e) => setAvailabilityDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Ca tiệc</label>
                        <select value={shiftId} onChange={(e) => setShiftId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent">
                            <option value="">-- Chọn ca --</option>
                            {shifts.map((shift) => <option key={shift.id} value={shift.id}>{shift.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Số bàn dự kiến</label>
                        <input type="number" min={1} value={capacity} onChange={(e) => setCapacity(Number(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Loại sảnh</label>
                        <select value={hallTypeFilter} onChange={(e) => setHallTypeFilter(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent">
                            {hallTypes.map((type) => <option key={String(type)} value={String(type)}>{type === "ALL" ? "Tất cả loại sảnh" : type}</option>)}
                        </select>
                    </div>
                </div>

                <div className="mt-5 flex justify-end">
                    <button onClick={searchAvailability} disabled={loading} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50">
                        {loading ? "Đang kiểm tra..." : "Kiểm tra sảnh trống"}
                    </button>
                </div>
            </div>

            {selectedHall && (
                <div className="bg-blue-50 border-2 border-blue-400 rounded-[20px] p-5">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="w-5 h-5 text-blue-700" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-blue-900">{selectedHall.hallName} — Available on {availabilityDate}, {selectedShift?.name}</p>
                                <p className="text-xs text-blue-700 mt-0.5">{selectedHall.hallTypeName} · max {selectedHall.maxTables} bàn · Base: {formatVND(selectedHall.price ?? 0)}</p>
                            </div>
                        </div>
                        <button onClick={handleContinue} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm whitespace-nowrap">
                            Tiếp tục — Bước 2 <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-accent" />
                        Sảnh còn trống
                        <span className="text-xs font-normal text-muted-foreground normal-case ml-1">
                            {loading || loadingShifts
                                ? "(đang kiểm tra...)"
                                : hasSearched
                                    ? `(${availableHalls.length} sảnh — ${availabilityDate})`
                                    : "(chưa kiểm tra)"}
                        </span>
                    </h3>
                </div>

                {loading || loadingShifts ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div
                                key={index}
                                className="rounded-[20px] border border-border overflow-hidden bg-card shadow-sm animate-pulse"
                            >
                                <div className="h-40 bg-secondary" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-secondary rounded w-2/3" />
                                    <div className="h-3 bg-secondary rounded w-1/2" />
                                    <div className="h-3 bg-secondary rounded w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : showEmptyState ? (
                    <div className="bg-card rounded-[20px] border border-border p-16 flex flex-col items-center gap-3 text-center">
                        <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                            <AlertCircle className="w-7 h-7 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-foreground">
                                Không có sảnh trống
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Vui lòng thử ngày, ca hoặc số bàn khác.
                            </p>
                        </div>
                    </div>
                ) : showHallGrid ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {availableHalls.map((hall) => {
                            const isSelected = selectedHall?.hallId === hall.hallId;

                            return (
                                <button
                                    key={hall.hallId}
                                    onClick={() => setSelectedHall(hall)}
                                    className={`text-left rounded-[20px] border overflow-hidden transition-all shadow-sm hover:shadow-md ${isSelected
                                        ? "border-blue-400 ring-2 ring-blue-300/50 shadow-md"
                                        : "border-border hover:border-accent/60"
                                        }`}
                                >
                                    <div className="relative h-40 bg-muted overflow-hidden">
                                        {hall.hallImage ? (
                                            <img
                                                src={hall.hallImage}
                                                alt={hall.hallName ?? "Hall"}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                No image
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                                        {isSelected && (
                                            <div className="absolute top-3 right-3">
                                                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold shadow">
                                                    <Check className="w-3 h-3" />
                                                    Selected
                                                </span>
                                            </div>
                                        )}

                                        <div className="absolute bottom-3 left-3">
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/90 text-white border border-emerald-400">
                                                Available
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-card">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <p className="font-semibold text-foreground text-sm">
                                                {hall.hallName}
                                            </p>
                                            <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-medium whitespace-nowrap">
                                                {hall.hallTypeName}
                                            </span>
                                        </div>

                                        <div className="space-y-1 text-xs text-muted-foreground">
                                            <p className="flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5" />
                                                Max {hall.maxTables} bàn
                                            </p>
                                            <p className="flex items-center gap-1.5">
                                                <DollarSign className="w-3.5 h-3.5" />
                                                From {formatVND(hall.price ?? 0)}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-card rounded-[20px] border border-border p-16 flex flex-col items-center gap-3 text-center">
                        <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                            <Building2 className="w-7 h-7 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-foreground">
                                Chưa kiểm tra sảnh
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Chọn ngày, ca và số bàn rồi bấm “Kiểm tra sảnh trống”.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
