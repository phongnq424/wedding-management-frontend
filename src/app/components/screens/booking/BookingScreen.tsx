import { useEffect, useMemo, useState } from "react";
import {
    BadgeCheck,
    CreditCard,
    Download,
    Edit,
    Eye,
    FileText,
    Filter,
    Plus,
    RefreshCw,
    Search,
    XCircle,
    Check,
} from "lucide-react";
import { formatVND, StatusBadge } from "../../../utils";
import { bookingService } from "../../../services/booking.service";
import type { BookingResponse, BookingStatusApi } from "../../../dto/booking.dto";
import { ActionBtn } from "./BookingActions";
import { BookingDetailDrawer } from "./BookingDetailDrawer";
import { BOOKING_STATUS_TABS, displayStatus } from "./booking.types";
import type { Screen } from "../../../types";
import { mapBookingToRow, type BookingTableRow } from "./booking.mapper";
import { hallService } from "../../../services/hallService";
import { shiftService } from "../../../services/shift.service";
import type { HallResponse } from "../../../dto/hall.dto";
import type { ShiftResponse } from "../../../dto/shift.dto";

const PAGE_SIZE = 20;

type BookingFilterState = {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    brideName: string;
    groomName: string;
    bookingDateFrom: string;
    bookingDateTo: string;
    weddingDateFrom: string;
    weddingDateTo: string;
    hallId: string;
    shiftId: string;
};

type BookingScreenProps = {
    setScreen: (s: Screen) => void;
    setSelectedBookingId?: (id: string | null) => void;
};

const EMPTY_FILTERS: BookingFilterState = {
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    brideName: "",
    groomName: "",
    bookingDateFrom: "",
    bookingDateTo: "",
    weddingDateFrom: "",
    weddingDateTo: "",
    hallId: "",
    shiftId: "",
};

export const BookingScreen = ({ setScreen, setSelectedBookingId }: BookingScreenProps) => {
    const [filters, setFilters] = useState<BookingFilterState>(EMPTY_FILTERS);
    const [statusTab, setStatusTab] = useState<"ALL" | BookingStatusApi>("ALL");
    const [showFilters, setShowFilters] = useState(true);
    const [rows, setRows] = useState<BookingTableRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
    const [viewBooking, setViewBooking] = useState<BookingTableRow | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const [halls, setHalls] = useState<HallResponse[]>([]);
    const [shifts, setShifts] = useState<ShiftResponse[]>([]);
    const [loadingFilterOptions, setLoadingFilterOptions] = useState(false);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        window.setTimeout(() => setToast(null), 3000);
    };

    async function loadBookings(forceSearch = false) {
        try {
            if (forceSearch) setSearching(true);
            else setLoading(true);

            const result = await bookingService.search({
                customerName: filters.customerName.trim() || undefined,
                customerPhone: filters.customerPhone.trim() || undefined,
                customerEmail: filters.customerEmail.trim() || undefined,
                brideName: filters.brideName.trim() || undefined,
                groomName: filters.groomName.trim() || undefined,
                bookingDateFrom: filters.bookingDateFrom || undefined,
                bookingDateTo: filters.bookingDateTo || undefined,
                weddingDateFrom: filters.weddingDateFrom || undefined,
                weddingDateTo: filters.weddingDateTo || undefined,
                hallId: filters.hallId || undefined,
                shiftId: filters.shiftId || undefined,
                status: statusTab === "ALL" ? undefined : statusTab,
                page: 0,
                size: PAGE_SIZE,
            });

            setRows(result.content.map(mapBookingToRow));
        } catch (error) {
            showToast(error instanceof Error ? error.message : "Cannot load bookings.", "error");
        } finally {
            setLoading(false);
            setSearching(false);
        }
    }

    useEffect(() => {
        loadBookings(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusTab]);

    const statusCounts = useMemo(() => {
        const result: Record<string, number> = { ALL: rows.length };
        rows.forEach((item) => {
            result[item.status] = (result[item.status] ?? 0) + 1;
        });
        return result;
    }, [rows]);
    useEffect(() => {
        let cancelled = false;

        async function loadFilterOptions() {
            try {
                setLoadingFilterOptions(true);

                const [hallData, shiftData] = await Promise.all([
                    hallService.getAll(),
                    shiftService.getAll(),
                ]);

                if (cancelled) return;

                setHalls(hallData);
                setShifts(shiftData);
            } catch (error) {
                if (!cancelled) {
                    showToast(
                        error instanceof Error
                            ? error.message
                            : "Cannot load hall and shift filters.",
                        "error"
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingFilterOptions(false);
                }
            }
        }

        loadFilterOptions();

        return () => {
            cancelled = true;
        };
    }, []);

    async function handleCancel(id: string) {
        try {
            const reason = window.prompt("Nhập lý do hủy booking:", "Khách yêu cầu hủy booking")?.trim();
            if (!reason) return;

            await bookingService.cancel(id, { reason });
            setConfirmCancelId(null);
            await loadBookings(true);
            showToast("Đã hủy booking.");
        } catch (error) {
            showToast(error instanceof Error ? error.message : "Cannot cancel booking.", "error");
        }
    }

    function handleEdit(id: string) {
        setSelectedBookingId?.(id);
        setScreen("booking-form");
    }

    return (
        <div className="space-y-6">
            {toast && (
                <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
                    {toast.msg}
                </div>
            )}

            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-primary mb-2">Booking Management</h1>
                    <p className="text-muted-foreground">Search, review and manage wedding reception bookings</p>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => setShowFilters((v) => !v)} className="flex items-center gap-2 px-4 py-2.5 border border-border bg-card rounded-xl hover:bg-secondary transition-all">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">{showFilters ? "Hide" : "Show"} Filters</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-border bg-card rounded-xl hover:bg-secondary transition-all">
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium">Export</span>
                    </button>
                    <button
                        onClick={() => {
                            setSelectedBookingId?.(null);
                            setScreen("booking-availability");
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm"
                    >
                        <Plus className="w-5 h-5" /> New Booking
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 border-b border-border overflow-x-auto">
                {BOOKING_STATUS_TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setStatusTab(tab)}
                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${statusTab === tab ? "border-accent text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    >
                        {tab === "ALL" ? "All" : displayStatus(tab)}
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-secondary text-xs">{statusCounts[tab] ?? 0}</span>
                    </button>
                ))}
            </div>

            {showFilters && (
                <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-primary">Search Filters</h3>
                        <button
                            onClick={() => {
                                setFilters(EMPTY_FILTERS);
                                window.setTimeout(() => loadBookings(true), 0);
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Reset
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Customer Name", key: "customerName", placeholder: "e.g. Nguyễn Văn An" },
                            { label: "Phone", key: "customerPhone", placeholder: "0901 234 567" },
                            { label: "Email", key: "customerEmail", placeholder: "customer@email.com" },
                            { label: "Bride Name", key: "brideName", placeholder: "e.g. Trần Thị Bình" },
                            { label: "Groom Name", key: "groomName", placeholder: "e.g. Lê Hoàng Minh" },
                        ].map(({ label, key, placeholder }) => (
                            <div key={key}>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
                                <input
                                    type="text"
                                    value={filters[key as keyof BookingFilterState]}
                                    onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                                    placeholder={placeholder}
                                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                                />
                            </div>
                        ))}
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                Hall
                            </label>

                            <select
                                value={filters.hallId}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        hallId: e.target.value,
                                    }))
                                }
                                disabled={loadingFilterOptions}
                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-60"
                            >
                                <option value="">
                                    {loadingFilterOptions ? "Loading halls..." : "All halls"}
                                </option>

                                {halls.map((hall) => (
                                    <option key={hall.id} value={hall.id}>
                                        {hall.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                Shift
                            </label>

                            <select
                                value={filters.shiftId}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        shiftId: e.target.value,
                                    }))
                                }
                                disabled={loadingFilterOptions}
                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-60"
                            >
                                <option value="">
                                    {loadingFilterOptions ? "Loading shifts..." : "All shifts"}
                                </option>

                                {shifts.map((shift) => (
                                    <option key={shift.id} value={shift.id}>
                                        {shift.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {[
                            { label: "Booking Date — From", key: "bookingDateFrom" },
                            { label: "Booking Date — To", key: "bookingDateTo" },
                            { label: "Wedding Date — From", key: "weddingDateFrom" },
                            { label: "Wedding Date — To", key: "weddingDateTo" },
                        ].map(({ label, key }) => (
                            <div key={key}>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
                                <input
                                    type="date"
                                    value={filters[key as keyof BookingFilterState]}
                                    onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                        <span>{rows.length} booking(s) loaded</span>
                        <button onClick={() => loadBookings(true)} disabled={searching} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm disabled:opacity-50">
                            {searching ? "Searching..." : "Search"}
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-xs text-muted-foreground">
                {[
                    { icon: <Eye className="w-3.5 h-3.5" />, label: "Xem chi tiết", color: "text-accent" },
                    { icon: <Edit className="w-3.5 h-3.5" />, label: "Sửa thông tin", color: "text-blue-600" },
                    { icon: <BadgeCheck className="w-3.5 h-3.5" />, label: "Xác nhận cọc", color: "text-emerald-600" },
                    { icon: <CreditCard className="w-3.5 h-3.5" />, label: "Thanh toán", color: "text-emerald-600" },
                    { icon: <FileText className="w-3.5 h-3.5" />, label: "Hóa đơn", color: "text-indigo-600" },
                    { icon: <XCircle className="w-3.5 h-3.5" />, label: "Hủy booking", color: "text-rose-600" },
                ].map(({ icon, label, color }) => (
                    <span key={label} className={`flex items-center gap-1 ${color}`}>
                        {icon} <span className="text-muted-foreground">{label}</span>
                    </span>
                ))}
            </div>

            <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-secondary sticky top-0">
                            <tr>
                                {["Booking Code", "Customer", "Bride / Groom", "Hall", "Wedding Date", "Shift", "Status", "Deposit", "Total Amount", "Actions"].map((h) => (
                                    <th key={h} className={`px-5 py-4 text-xs font-semibold text-foreground uppercase tracking-wide ${h === "Total Amount" ? "text-right" : h === "Actions" ? "text-center" : "text-left"}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={10} className="px-6 py-16 text-center text-sm text-muted-foreground">Loading bookings...</td></tr>
                            ) : rows.length === 0 ? (
                                <tr><td colSpan={10} className="px-6 py-16 text-center"><div className="flex flex-col items-center gap-2 text-muted-foreground"><Search className="w-8 h-8" /><p className="text-sm">Không tìm thấy booking phù hợp.</p></div></td></tr>
                            ) : rows.map((booking) => (
                                <tr key={booking.id} className="hover:bg-secondary/40 transition-colors">
                                    <td className="px-5 py-4 font-mono text-sm text-primary font-semibold">{booking.id.slice(0, 8)}</td>
                                    <td className="px-5 py-4"><p className="text-sm font-medium text-foreground">{booking.customerName}</p><p className="text-xs text-muted-foreground">{booking.customerPhone}</p></td>
                                    <td className="px-5 py-4"><p className="text-sm text-foreground">{booking.brideName}</p><p className="text-xs text-muted-foreground">& {booking.groomName}</p></td>
                                    <td className="px-5 py-4 text-sm text-foreground">{booking.hallName ?? "N/A"}</td>
                                    <td className="px-5 py-4 text-sm font-mono text-foreground">{booking.weddingDateText}</td>
                                    <td className="px-5 py-4 text-sm text-foreground">{booking.shiftName ?? "N/A"}</td>
                                    <td className="px-5 py-4"><StatusBadge status={booking.displayStatus} /></td>
                                    <td className="px-5 py-4"><p className="text-sm font-medium text-foreground">{formatVND(booking.depositAmount ?? 0)}</p><p className="text-xs text-muted-foreground">{booking.depositStatus}</p></td>
                                    <td className="px-5 py-4 text-right text-sm font-semibold text-foreground font-mono">{formatVND(booking.bookingAmount ?? 0)}</td>
                                    <td className="px-5 py-4"><div className="flex items-center justify-center gap-0.5">
                                        <ActionBtn title="Xem chi tiết" colorClass="text-accent hover:bg-accent/10" onClick={() => setViewBooking(booking)}><Eye className="w-4 h-4" /></ActionBtn>
                                        {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                                            <ActionBtn title="Chỉnh sửa thông tin booking" colorClass="text-blue-700 hover:bg-blue-50" onClick={() => handleEdit(booking.id)}><Edit className="w-4 h-4" /></ActionBtn>
                                        )}
                                        {(booking.status === "CONFIRMED" || booking.status === "ONGOING") && (
                                            <ActionBtn title="Ghi nhận thanh toán" colorClass="text-emerald-700 hover:bg-emerald-50" onClick={() => setScreen("payment")}><CreditCard className="w-4 h-4" /></ActionBtn>
                                        )}
                                        {booking.status === "COMPLETED" && (
                                            <ActionBtn title="Xem / in hóa đơn" colorClass="text-indigo-700 hover:bg-indigo-50" onClick={() => setScreen("invoice")}><FileText className="w-4 h-4" /></ActionBtn>
                                        )}
                                        {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                                            confirmCancelId === booking.id ? (
                                                <div className="flex items-center gap-0.5 ml-1 pl-1.5 border-l border-rose-200">
                                                    <span className="text-xs text-rose-700 font-medium">Hủy?</span>
                                                    <ActionBtn title="Xác nhận hủy" colorClass="text-rose-700 hover:bg-rose-50" onClick={() => handleCancel(booking.id)}><Check className="w-3.5 h-3.5" /></ActionBtn>
                                                    <ActionBtn title="Không" colorClass="text-muted-foreground hover:bg-secondary" onClick={() => setConfirmCancelId(null)}><XCircle className="w-3.5 h-3.5" /></ActionBtn>
                                                </div>
                                            ) : (
                                                <ActionBtn title="Hủy booking" colorClass="text-rose-700 hover:bg-rose-50" onClick={() => setConfirmCancelId(booking.id)}><XCircle className="w-4 h-4" /></ActionBtn>
                                            )
                                        )}
                                    </div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {viewBooking && <BookingDetailDrawer booking={viewBooking} onClose={() => setViewBooking(null)} />}
        </div>
    );
};
