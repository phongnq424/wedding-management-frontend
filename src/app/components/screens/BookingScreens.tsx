import React, { useState } from "react";
import {
  Plus, Filter, Download, Eye, Edit, Search, RefreshCw, ArrowLeft, ArrowRight,
  ChevronRight, CalendarCheck, Building2, Users, DollarSign, CheckCircle2,
  XCircle, AlertCircle, Check, UtensilsCrossed, Sparkles, CreditCard, Save,
  Wallet, Package, Trash2, RotateCcw, Gift, ShieldCheck, ChevronDown, ChevronUp,
  Info, MinusCircle, PlusCircle, Star, FileText, BadgeCheck,
} from "lucide-react";
import { Screen, WeddingPackage } from "../../types";
import {
  BOOKING_LIST, HALLS, SHIFT_OPTIONS, STATUS_TABS, HALL_AVAILABILITY_GRID,
  SERVICES, DISH_COMBOS_INIT, DISHES_INIT, BEVERAGES_INIT, WEDDING_PACKAGES_INIT,
} from "../../data";
import { formatVND, StatusBadge } from "../../utils";

interface BookingScreenProps {
  setScreen: (s: Screen) => void;
}

interface CheckHallAvailabilityProps {
  setScreen: (s: Screen) => void;
  setBookingPreselect: (p: { hallName: string; hallId: number; date: string; shift: string } | null) => void;
}

interface BookingFormProps {
  setScreen: (s: Screen) => void;
  bookingPreselect: { hallName: string; hallId: number; date: string; shift: string } | null;
  packages: WeddingPackage[];
}

// ── Action helpers ─────────────────────────────────────────────────────────────
const ActionBtn = ({
  onClick, title, colorClass, children, disabled,
}: {
  onClick?: () => void; title: string; colorClass: string; children: React.ReactNode; disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`p-1.5 rounded-lg transition-colors ${disabled ? "opacity-30 cursor-not-allowed" : colorClass}`}
  >
    {children}
  </button>
);

// ── Booking List Screen ────────────────────────────────────────────────────────
export const BookingScreen = ({ setScreen }: BookingScreenProps) => {
  const [bookingFilters, setBookingFilters] = useState({
    customerName: "", customerPhone: "", customerEmail: "",
    brideName: "", groomName: "",
    bookingDateFrom: "", bookingDateTo: "",
    weddingDateFrom: "", weddingDateTo: "",
    hall: "All", shift: "All",
  });
  const [bookingStatusTab, setBookingStatusTab] = useState("All");
  const [showBookingFilters, setShowBookingFilters] = useState(true);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [viewBooking, setViewBooking] = useState<typeof BOOKING_LIST[0] | null>(null);

  const filteredBookings = BOOKING_LIST.filter((b) => {
    if (bookingStatusTab !== "All" && b.status !== bookingStatusTab) return false;
    const f = bookingFilters;
    if (f.customerName && !b.customer.toLowerCase().includes(f.customerName.toLowerCase())) return false;
    if (f.customerPhone && !b.phone.replace(/\s/g, "").includes(f.customerPhone.replace(/\s/g, ""))) return false;
    if (f.customerEmail && !b.email.toLowerCase().includes(f.customerEmail.toLowerCase())) return false;
    if (f.brideName && !b.bride.toLowerCase().includes(f.brideName.toLowerCase())) return false;
    if (f.groomName && !b.groom.toLowerCase().includes(f.groomName.toLowerCase())) return false;
    if (f.hall !== "All" && b.hall !== f.hall) return false;
    if (f.shift !== "All" && b.shift !== f.shift) return false;
    if (f.bookingDateFrom && b.bookingDate < f.bookingDateFrom) return false;
    if (f.bookingDateTo && b.bookingDate > f.bookingDateTo) return false;
    if (f.weddingDateFrom && b.weddingDate < f.weddingDateFrom) return false;
    if (f.weddingDateTo && b.weddingDate > f.weddingDateTo) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">Booking Management</h1>
          <p className="text-muted-foreground">Search, review and manage wedding reception bookings</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowBookingFilters(!showBookingFilters)} className="flex items-center gap-2 px-4 py-2.5 border border-border bg-card rounded-xl hover:bg-secondary transition-all">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">{showBookingFilters ? "Hide" : "Show"} Filters</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-border bg-card rounded-xl hover:bg-secondary transition-all">
            <Download className="w-4 h-4" /><span className="text-sm font-medium">Export</span>
          </button>
          <button onClick={() => setScreen("booking-availability")} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm">
            <Plus className="w-5 h-5" /> New Booking
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border overflow-x-auto">
        {STATUS_TABS.map((tab) => {
          const count = tab === "All" ? BOOKING_LIST.length : BOOKING_LIST.filter((b) => b.status === tab).length;
          return (
            <button key={tab} onClick={() => setBookingStatusTab(tab)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${bookingStatusTab === tab ? "border-accent text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {tab}<span className="ml-2 px-2 py-0.5 rounded-full bg-secondary text-xs">{count}</span>
            </button>
          );
        })}
      </div>

      {showBookingFilters && (
        <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-primary">Search Filters</h3>
            <button onClick={() => setBookingFilters({ customerName: "", customerPhone: "", customerEmail: "", brideName: "", groomName: "", bookingDateFrom: "", bookingDateTo: "", weddingDateFrom: "", weddingDateTo: "", hall: "All", shift: "All" })} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
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
                <input type="text" value={bookingFilters[key as keyof typeof bookingFilters]} onChange={(e) => setBookingFilters({ ...bookingFilters, [key]: e.target.value })} placeholder={placeholder} className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Hall</label>
              <select value={bookingFilters.hall} onChange={(e) => setBookingFilters({ ...bookingFilters, hall: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
                <option value="All">All halls</option>
                {HALLS.map((h) => <option key={h.id} value={h.name}>{h.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Shift</label>
              <select value={bookingFilters.shift} onChange={(e) => setBookingFilters({ ...bookingFilters, shift: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
                <option value="All">All shifts</option>
                {SHIFT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="hidden lg:block" />
            {[
              { label: "Booking Date — From", key: "bookingDateFrom" },
              { label: "Booking Date — To", key: "bookingDateTo" },
              { label: "Wedding Date — From", key: "weddingDateFrom" },
              { label: "Wedding Date — To", key: "weddingDateTo" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
                <input type="date" value={bookingFilters[key as keyof typeof bookingFilters]} onChange={(e) => setBookingFilters({ ...bookingFilters, [key]: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>{filteredBookings.length} booking(s) match current filters</span>
            <span className="font-mono">Status: {bookingStatusTab}</span>
          </div>
        </div>
      )}

      {/* Action legend */}
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
        <span className="ml-auto text-muted-foreground/70 italic">* Hành động hiển thị theo trạng thái booking</span>
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
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-5 py-4 font-mono text-sm text-primary font-semibold">{booking.id}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-foreground">{booking.customer}</p>
                    <p className="text-xs text-muted-foreground">{booking.phone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-foreground">{booking.bride}</p>
                    <p className="text-xs text-muted-foreground">& {booking.groom}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-foreground">{booking.hall}</td>
                  <td className="px-5 py-4 text-sm font-mono text-foreground">{booking.weddingDate}</td>
                  <td className="px-5 py-4 text-sm text-foreground">{booking.shift}</td>
                  <td className="px-5 py-4"><StatusBadge status={booking.status} /></td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-foreground">{formatVND(booking.deposit)}</p>
                    <p className="text-xs text-muted-foreground">{booking.depositStatus}</p>
                  </td>
                  <td className="px-5 py-4 text-right text-sm font-semibold text-foreground font-mono">{formatVND(booking.total)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-0.5">
                      {/* View: luôn hiện */}
                      <ActionBtn title="Xem chi tiết" colorClass="text-accent hover:bg-accent/10" onClick={() => setViewBooking(booking)}>
                        <Eye className="w-4 h-4" />
                      </ActionBtn>

                      {/* Edit info: chỉ Pending / Confirmed */}
                      {(booking.status === "Pending" || booking.status === "Confirmed") && (
                        <ActionBtn title="Chỉnh sửa thông tin booking" colorClass="text-blue-700 hover:bg-blue-50" onClick={() => setScreen("booking-form")}>
                          <Edit className="w-4 h-4" />
                        </ActionBtn>
                      )}

                      {/* Xác nhận cọc → Confirmed: chỉ Pending */}
                      {booking.status === "Pending" && (
                        <ActionBtn title="Xác nhận đặt cọc — chuyển sang Confirmed" colorClass="text-emerald-700 hover:bg-emerald-50">
                          <BadgeCheck className="w-4 h-4" />
                        </ActionBtn>
                      )}

                      {/* Thanh toán: Confirmed hoặc Ongoing */}
                      {(booking.status === "Confirmed" || booking.status === "Ongoing") && (
                        <ActionBtn title="Ghi nhận thanh toán" colorClass="text-emerald-700 hover:bg-emerald-50" onClick={() => setScreen("payment")}>
                          <CreditCard className="w-4 h-4" />
                        </ActionBtn>
                      )}

                      {/* Hóa đơn: chỉ Completed */}
                      {booking.status === "Completed" && (
                        <ActionBtn title="Xem / in hóa đơn" colorClass="text-indigo-700 hover:bg-indigo-50" onClick={() => setScreen("invoice")}>
                          <FileText className="w-4 h-4" />
                        </ActionBtn>
                      )}

                      {/* Hủy có xác nhận inline: Pending hoặc Confirmed */}
                      {(booking.status === "Pending" || booking.status === "Confirmed") && (
                        confirmCancelId === booking.id ? (
                          <div className="flex items-center gap-0.5 ml-1 pl-1.5 border-l border-rose-200">
                            <span className="text-xs text-rose-700 font-medium">Hủy?</span>
                            <ActionBtn title="Xác nhận hủy" colorClass="text-rose-700 hover:bg-rose-50" onClick={() => setConfirmCancelId(null)}>
                              <Check className="w-3.5 h-3.5" />
                            </ActionBtn>
                            <ActionBtn title="Không" colorClass="text-muted-foreground hover:bg-secondary" onClick={() => setConfirmCancelId(null)}>
                              <XCircle className="w-3.5 h-3.5" />
                            </ActionBtn>
                          </div>
                        ) : (
                          <ActionBtn title="Hủy booking" colorClass="text-rose-700 hover:bg-rose-50" onClick={() => setConfirmCancelId(booking.id)}>
                            <XCircle className="w-4 h-4" />
                          </ActionBtn>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr><td colSpan={10} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Search className="w-8 h-8" /><p className="text-sm">Không tìm thấy booking phù hợp.</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Booking Detail Modal ── */}
      {viewBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end" onClick={() => setViewBooking(null)}>
          <div className="w-full max-w-xl h-full bg-card shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-semibold text-primary">{viewBooking.id}</h2>
                <p className="text-sm text-muted-foreground">Chi tiết booking</p>
              </div>
              <button onClick={() => setViewBooking(null)} className="p-2 hover:bg-secondary rounded-lg transition-colors"><XCircle className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status + Mode */}
              <div className="flex items-center gap-3">
                <StatusBadge status={viewBooking.status} />
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground">{viewBooking.mode}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground">{viewBooking.shift}</span>
              </div>

              {/* Hall & Date */}
              <div className="bg-secondary/60 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sảnh & Ngày</p>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-accent flex-shrink-0" />
                  <span className="text-sm font-semibold text-foreground">{viewBooking.hall}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <span>Ngày đặt: <strong className="text-foreground">{viewBooking.bookingDate}</strong></span>
                  <span>Ngày cưới: <strong className="text-foreground">{viewBooking.weddingDate}</strong></span>
                  <span>Số bàn: <strong className="text-foreground">{viewBooking.tables} bàn</strong></span>
                </div>
              </div>

              {/* Customer */}
              <div className="bg-secondary/60 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Khách hàng</p>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Tên:</span> <strong className="text-foreground">{viewBooking.customer}</strong></p>
                  <p><span className="text-muted-foreground">ĐT:</span> <span className="font-mono text-foreground">{viewBooking.phone}</span></p>
                  <p><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{viewBooking.email}</span></p>
                </div>
              </div>

              {/* Couple */}
              <div className="bg-secondary/60 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cặp đôi</p>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center text-xs">♀</span><span className="text-foreground">{viewBooking.bride}</span></div>
                  <span className="text-muted-foreground">♡</span>
                  <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs">♂</span><span className="text-foreground">{viewBooking.groom}</span></div>
                </div>
              </div>

              {/* Finance */}
              <div className="bg-secondary/60 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tài chính</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Tổng giá trị</span><span className="font-mono font-semibold text-foreground">{formatVND(viewBooking.total)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tiền cọc</span><span className="font-mono font-semibold text-emerald-600">{formatVND(viewBooking.deposit)}</span></div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Trạng thái cọc</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${viewBooking.depositStatus === "Paid" || viewBooking.depositStatus === "Settled" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{viewBooking.depositStatus}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-foreground font-medium">Còn lại</span>
                    <span className="font-mono font-bold text-rose-600">{formatVND(viewBooking.total - viewBooking.deposit)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Check Hall Availability Screen ────────────────────────────────────────────
export const CheckHallAvailabilityScreen = ({ setScreen, setBookingPreselect }: CheckHallAvailabilityProps) => {
  const [availabilityDate, setAvailabilityDate] = useState("2024-03-15");
  const [availabilityShift, setAvailabilityShift] = useState("Evening");
  const [availabilityHallType, setAvailabilityHallType] = useState("All");
  const [selectedHall, setSelectedHall] = useState<typeof HALLS[0] | null>(null);

  const hallTypes = ["All", ...Array.from(new Set(HALLS.map((h) => h.type)))];

  // Only show halls that are active AND available for the selected shift
  const availableHalls = HALLS.filter((h) => {
    if (h.status !== "Active") return false;
    if (availabilityHallType !== "All" && h.type !== availabilityHallType) return false;
    const avail = HALL_AVAILABILITY_GRID.find((r) => r.hall === h.name);
    return avail?.[availabilityShift as "Morning" | "Afternoon" | "Evening"] === "Available";
  });

  const handleContinue = () => {
    if (selectedHall) {
      setBookingPreselect({
        hallName: selectedHall.name,
        hallId: selectedHall.id,
        date: availabilityDate,
        shift: availabilityShift,
      });
      setScreen("booking-form");
    }
  };

  const handleDateOrShiftChange = (date: string, shift: string) => {
    setSelectedHall(null); // Reset selection when filters change
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <button onClick={() => setScreen("booking")} className="hover:text-foreground flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Danh sách Booking</button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">Bước 1 — Chọn Sảnh & Ca</span>
      </div>

      {/* Step indicator */}
      <div className="bg-card rounded-[20px] p-5 border border-border shadow-sm">
        <div className="grid grid-cols-4 gap-4">
          {[
            { num: 1, label: "Chọn Sảnh & Ca", active: true, done: false },
            { num: 2, label: "Thông tin KH", active: false, done: false },
            { num: 3, label: "Thực đơn / Gói", active: false, done: false },
            { num: 4, label: "Đặt cọc", active: false, done: false },
          ].map((s, idx) => (
            <div key={s.num} className="relative">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${s.active ? "bg-accent text-accent-foreground shadow-md" : "bg-secondary text-muted-foreground"}`}>
                  {s.num}
                </div>
                <span className={`text-xs font-medium text-center ${s.active ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
              </div>
              {idx < 3 && <div className="absolute top-5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5 bg-border" />}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-semibold text-primary mb-2">Bước 1 · Chọn Sảnh & Ca Tiệc</h1>
        <p className="text-muted-foreground">Chọn ngày cưới, ca tiệc và loại sảnh để xem sảnh còn trống. Nhấn vào sảnh để tiếp tục điền thông tin booking.</p>
      </div>

      {/* Filter bar */}
      <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-accent" /> Lọc theo Ngày — Ca — Loại sảnh
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Ngày cưới</label>
            <input
              type="date"
              value={availabilityDate}
              onChange={(e) => { setAvailabilityDate(e.target.value); handleDateOrShiftChange(e.target.value, availabilityShift); }}
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Ca tiệc</label>
            <select
              value={availabilityShift}
              onChange={(e) => { setAvailabilityShift(e.target.value); handleDateOrShiftChange(availabilityDate, e.target.value); }}
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {SHIFT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Loại sảnh</label>
            <select
              value={availabilityHallType}
              onChange={(e) => { setAvailabilityHallType(e.target.value); setSelectedHall(null); }}
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {hallTypes.map((t) => <option key={t} value={t}>{t === "All" ? "Tất cả loại sảnh" : t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Continue to Booking banner — appears immediately when a hall is selected */}
      {selectedHall && (
        <div className="bg-blue-50 border-2 border-blue-400 rounded-[20px] p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  {selectedHall.name} — Available on {availabilityDate}, {availabilityShift} shift
                </p>
                <p className="text-xs text-blue-700 mt-0.5">
                  {selectedHall.type} · {selectedHall.minTables}–{selectedHall.maxTables} tables · Base: {formatVND(selectedHall.basePrice)}
                </p>
              </div>
            </div>
            <button
              onClick={handleContinue}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
            >
              Tiếp tục — Bước 2 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Available halls grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
            <Building2 className="w-4 h-4 text-accent" />
            Sảnh còn trống
            <span className="text-xs font-normal text-muted-foreground normal-case ml-1">
              ({availableHalls.length} sảnh — ca {availabilityShift} — {availabilityDate})
            </span>
          </h3>
        </div>

        {availableHalls.length === 0 ? (
          <div className="bg-card rounded-[20px] border border-border p-16 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">Không có sảnh trống</p>
              <p className="text-sm text-muted-foreground mt-1">Không còn sảnh nào trống cho ca <strong>{availabilityShift}</strong> ngày <strong>{availabilityDate}</strong>. Vui lòng thử ngày hoặc ca khác.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {availableHalls.map((hall) => {
              const isSelected = selectedHall?.id === hall.id;
              return (
                <button
                  key={hall.id}
                  onClick={() => setSelectedHall(hall)}
                  className={`text-left rounded-[20px] border overflow-hidden transition-all shadow-sm hover:shadow-md ${isSelected ? "border-blue-400 ring-2 ring-blue-300/50 shadow-md" : "border-border hover:border-accent/60"}`}
                >
                  <div className="relative h-40 bg-muted overflow-hidden">
                    <img src={hall.image} alt={hall.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold shadow">
                          <Check className="w-3 h-3" /> Selected
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/90 text-white border border-emerald-400">
                        Available — {availabilityShift}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-card">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-semibold text-foreground text-sm">{hall.name}</p>
                      <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-medium whitespace-nowrap">{hall.type}</span>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {hall.minTables}–{hall.maxTables} tables</p>
                      <p className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> From {formatVND(hall.basePrice)}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {!selectedHall && availableHalls.length > 0 && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5 justify-center">
          <AlertCircle className="w-4 h-4" /> Nhấn vào sảnh để chọn và tiếp tục đặt tiệc.
        </p>
      )}
    </div>
  );
};

// ── Combo Slot Table (shared between Package + Manual) ────────────────────────
const ComboSlotTable = ({
  combo,
  slotReplacements,
  onReplace,
  replacingSlotId,
  setReplacingSlotId,
}: {
  combo: typeof DISH_COMBOS_INIT[0];
  slotReplacements: Record<number, { dishId: number; dishName: string; price: number }>;
  onReplace: (slotId: number, dishId: number, dishName: string, price: number) => void;
  replacingSlotId: number | null;
  setReplacingSlotId: (id: number | null) => void;
}) => {
  const activeDishes = DISHES_INIT.filter((d) => d.status === "Active" && !d.deleted);

  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <div className="px-4 py-3 bg-secondary flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{combo.name}</span>
        <span className="text-xs text-muted-foreground bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">
          {combo.comboDiscountRate}% discount applied
        </span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground border-b border-border bg-secondary/40">
            <th className="px-4 py-2.5 font-medium">#</th>
            <th className="px-4 py-2.5 font-medium">Loại món</th>
            <th className="px-4 py-2.5 font-medium">Món ăn</th>
            <th className="px-4 py-2.5 font-medium text-right">Đơn giá</th>
            <th className="px-4 py-2.5 font-medium text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {combo.slots.map((slot) => {
            const replacement = slotReplacements[slot.slotId];
            const currentDishName = replacement ? replacement.dishName : slot.defaultDishName;
            const currentPrice = replacement ? replacement.price : slot.unitPrice;
            const priceDiff = replacement ? replacement.price - slot.unitPrice : 0;
            const isReplacing = replacingSlotId === slot.slotId;
            const alternativeDishes = activeDishes.filter(
              (d) => d.dishTypeId === slot.dishTypeId && d.id !== slot.defaultDishId
            );

            return (
              <React.Fragment key={slot.slotId}>
                <tr className={`hover:bg-secondary/30 transition-colors ${replacement ? "bg-blue-50/30" : ""}`}>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{slot.displayOrder}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md bg-secondary text-xs font-medium text-muted-foreground">{slot.dishTypeName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-foreground ${replacement ? "font-medium text-blue-700" : ""}`}>{currentDishName}</span>
                      {replacement && (
                        <span className="text-xs text-muted-foreground line-through">{slot.defaultDishName}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    <span className="text-foreground">{formatVND(currentPrice)}</span>
                    {priceDiff !== 0 && (
                      <span className={`ml-1 text-xs ${priceDiff > 0 ? "text-red-600" : "text-emerald-600"}`}>
                        ({priceDiff > 0 ? "+" : ""}{formatVND(priceDiff)})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {slot.isReplaceable ? (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setReplacingSlotId(isReplacing ? null : slot.slotId)}
                          className="px-2.5 py-1 rounded-lg border border-blue-300 text-blue-700 bg-blue-50 text-xs font-medium hover:bg-blue-100 transition-all flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Thay thế
                        </button>
                        {replacement && (
                          <button
                            onClick={() => onReplace(slot.slotId, slot.defaultDishId, slot.defaultDishName, slot.unitPrice)}
                            className="px-2 py-1 rounded-lg border border-muted text-muted-foreground bg-secondary text-xs hover:bg-secondary/80 transition-all"
                            title="Khôi phục món gốc"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-lg">Cố định</span>
                    )}
                  </td>
                </tr>
                {isReplacing && alternativeDishes.length > 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-3 bg-blue-50/50 border-b border-blue-100">
                      <p className="text-xs text-blue-700 font-medium mb-3">Chọn món thay thế ({slot.dishTypeName}):</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {alternativeDishes.map((d) => {
                          const diff = d.unitPrice - slot.unitPrice;
                          return (
                            <button
                              key={d.id}
                              onClick={() => { onReplace(slot.slotId, d.id, d.name, d.unitPrice); setReplacingSlotId(null); }}
                              className="text-left rounded-lg border border-blue-200 bg-white hover:bg-blue-100 hover:border-blue-400 transition-all overflow-hidden group"
                            >
                              {d.image && (
                                <div className="relative h-20 overflow-hidden">
                                  <img src={d.image} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                </div>
                              )}
                              <div className="p-2">
                                <p className="text-xs font-semibold text-blue-900 line-clamp-1">{d.name}</p>
                                <p className={`text-xs mt-0.5 ${diff > 0 ? "text-red-600" : diff < 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                                  {diff === 0 ? "Cùng giá" : `${diff > 0 ? "+" : ""}${formatVND(diff)}`}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                )}
                {isReplacing && alternativeDishes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-2 bg-blue-50/50 text-xs text-muted-foreground">
                      Không có món thay thế cùng loại.
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ── Booking Form Screen ────────────────────────────────────────────────────────
export const BookingFormScreen = ({ setScreen, bookingPreselect, packages }: BookingFormProps) => {
  const [bookingStep, setBookingStep] = useState(bookingPreselect ? 2 : 1);
  const [bookingTables, setBookingTables] = useState(40);
  const [reserveTables, setReserveTables] = useState(3);
  const [bookingDeposit, setBookingDeposit] = useState(30000000);
  const [bookingMode, setBookingMode] = useState<"Package" | "Manual">("Package");

  // Hall/date/shift from pre-selection (or defaults)
  const preHall = HALLS.find((h) => h.id === bookingPreselect?.hallId) || HALLS[0];
  const preDate = bookingPreselect?.date || "2024-03-08";
  const preShift = bookingPreselect?.shift || "Evening";

  // ── Package mode state ──────────────────────────────────────────────────────
  const activePackages = (packages || WEDDING_PACKAGES_INIT).filter((p) => p.status === "Active" && !p.deleted);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(activePackages[0]?.id || null);
  const [selectedComboId, setSelectedComboId] = useState<number | null>(null);
  const [removedPkgServiceIds, setRemovedPkgServiceIds] = useState<number[]>([]);
  const [extraServices, setExtraServices] = useState<Array<{ id: number; name: string; price: number }>>([]);
  const [pkgSlotReplacements, setPkgSlotReplacements] = useState<Record<number, { dishId: number; dishName: string; price: number }>>({});
  const [pkgReplacingSlotId, setPkgReplacingSlotId] = useState<number | null>(null);
  const [pkgExtraDishes, setPkgExtraDishes] = useState<Array<{ id: number; name: string; price: number; qty: number }>>([]);
  const [showPkgBenefits, setShowPkgBenefits] = useState(false);
  const [addExtraServiceId, setAddExtraServiceId] = useState<string>("");

  // ── Manual mode state ───────────────────────────────────────────────────────
  const [manualServiceIds, setManualServiceIds] = useState<number[]>([]);
  const [manualUseCombo, setManualUseCombo] = useState<boolean>(true);
  const [manualComboId, setManualComboId] = useState<number | null>(null);
  const [manualSlotReplacements, setManualSlotReplacements] = useState<Record<number, { dishId: number; dishName: string; price: number }>>({});
  const [manualReplacingSlotId, setManualReplacingSlotId] = useState<number | null>(null);
  const [manualCustomDishes, setManualCustomDishes] = useState<Array<{ id: number; name: string; price: number; qty: number }>>([]);
  const [manualBeverages, setManualBeverages] = useState<Array<{ beverageId: number; beverageName: string; allowancePerTable: number; unitPrice: number }>>([]);
  const [addBeverageId, setAddBeverageId] = useState<string>("");
  const [addBeverageQty, setAddBeverageQty] = useState<number>(2);
  const [addDishId, setAddDishId] = useState<string>("");
  const [addDishQty, setAddDishQty] = useState<number>(1);

  // ── Derived data ───────────────────────────────────────────────────────────
  const selectedPackage = activePackages.find((p) => p.id === selectedPackageId) || null;

  // Auto-set combo when package changes
  const pkgComboId = selectedComboId || selectedPackage?.defaultMenuComboId || null;
  const pkgCombo = DISH_COMBOS_INIT.find((c) => c.id === pkgComboId) || null;

  const activeCombos = DISH_COMBOS_INIT.filter((c) => c.status === "Active" && !c.deleted);
  const activeServices = SERVICES.filter((s) => s.status === "Active");
  const activeDishes = DISHES_INIT.filter((d) => d.status === "Active" && !d.deleted);
  const activeBeverages = BEVERAGES_INIT.filter((b) => b.status === "Active" && !b.deleted);

  const manualCombo = activeCombos.find((c) => c.id === manualComboId) || null;

  // ── Pricing calculations ───────────────────────────────────────────────────
  const hallFee = preHall.basePrice;

  // Package pricing
  const pkgBaseCost = selectedPackage ? selectedPackage.pricePerTable * bookingTables : 0;
  const pkgSlotAdjustments = Object.entries(pkgSlotReplacements).reduce((sum, [slotIdStr, newDish]) => {
    if (!pkgCombo) return sum;
    const slot = pkgCombo.slots.find((s) => s.slotId === Number(slotIdStr));
    if (!slot) return sum;
    const diff = newDish.price - slot.unitPrice;
    return sum + (diff > 0 ? diff * bookingTables : 0); // only charge extra if more expensive
  }, 0);
  const pkgExtraServicesCost = extraServices.reduce((sum, s) => sum + s.price, 0);
  const pkgExtraDishesCost = pkgExtraDishes.reduce((sum, d) => sum + d.price * d.qty, 0);
  const pkgBeverageEstimate = selectedPackage
    ? selectedPackage.beverageAllowanceList.reduce((sum, b) => sum + b.allowancePerTable * b.unitPrice * bookingTables, 0)
    : 0;
  const pkgSubtotal = hallFee + pkgBaseCost + pkgSlotAdjustments + pkgExtraServicesCost + pkgExtraDishesCost;

  // Manual pricing
  const manualServicesCost = manualServiceIds.reduce((sum, sid) => {
    const svc = activeServices.find((s) => s.id === sid);
    return sum + (svc?.price || 0);
  }, 0);
  let manualComboCost = 0;
  if (manualUseCombo && manualCombo) {
    const baseTotal = manualCombo.slots.reduce((sum, slot) => {
      const rep = manualSlotReplacements[slot.slotId];
      return sum + (rep ? rep.price : slot.unitPrice);
    }, 0);
    manualComboCost = Math.round(baseTotal * (1 - manualCombo.comboDiscountRate / 100)) * bookingTables;
  }
  const manualCustomDishesCost = manualCustomDishes.reduce((sum, d) => sum + d.price * d.qty * bookingTables, 0);
  const manualBeverageCost = manualBeverages.reduce((sum, b) => sum + b.allowancePerTable * b.unitPrice * bookingTables, 0);
  const manualSubtotal = hallFee + manualServicesCost + manualComboCost + manualCustomDishesCost + manualBeverageCost;

  const bookingAmount = bookingMode === "Package" ? pkgSubtotal : manualSubtotal;
  const bookingRemaining = bookingAmount - bookingDeposit;

  const STEP_LABELS = [
    { label: "Sảnh & Ca", icon: Building2 },
    { label: "Thông tin KH", icon: Users },
    { label: "Thực đơn / Gói", icon: UtensilsCrossed },
    { label: "Đặt cọc", icon: Wallet },
  ];

  // ── Step 3: Package mode UI ────────────────────────────────────────────────
  const renderPackageMode = () => {
    const pkgServiceOptions = activeServices.filter(
      (s) => !selectedPackage?.includedServiceList.some((is) => is.serviceId === s.id)
        && !extraServices.some((es) => es.id === s.id)
    );
    const pkgDishOptions = activeDishes.filter((d) => !pkgExtraDishes.some((ed) => ed.id === d.id));

    return (
      <div className="space-y-6">
        {/* Package selector */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Chọn gói tiệc cưới</label>
          <div className="grid grid-cols-1 gap-3">
            {activePackages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => {
                  setSelectedPackageId(pkg.id);
                  setSelectedComboId(pkg.defaultMenuComboId);
                  setRemovedPkgServiceIds([]);
                  setExtraServices([]);
                  setPkgSlotReplacements({});
                  setPkgExtraDishes([]);
                }}
                className={`text-left rounded-xl border p-4 transition-all ${selectedPackageId === pkg.id ? "border-accent bg-accent/5 shadow-sm" : "border-border hover:bg-secondary"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {selectedPackageId === pkg.id && <Check className="w-4 h-4 text-accent flex-shrink-0" />}
                      <p className="text-sm font-semibold text-foreground">{pkg.packageName}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{pkg.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{pkg.includedServiceList.length} dịch vụ kèm</span>
                      <span>·</span>
                      <span>{pkg.menuComboOptions.length} combo menu</span>
                      <span>·</span>
                      <span>{pkg.beverageAllowanceList.length} loại thức uống</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-bold text-accent font-mono">{formatVND(pkg.pricePerTable)}</p>
                    <p className="text-xs text-muted-foreground">/ bàn</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedPackage && (
          <>
            {/* Menu Combo selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-accent" /> Menu Combo
              </label>
              {selectedPackage.menuComboOptions.length > 1 ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground mb-2">Gói này có {selectedPackage.menuComboOptions.length} lựa chọn menu. Chọn combo bạn muốn sử dụng:</p>
                  {selectedPackage.menuComboOptions.map((comboId) => {
                    const combo = DISH_COMBOS_INIT.find((c) => c.id === comboId);
                    if (!combo) return null;
                    const isDefault = comboId === selectedPackage.defaultMenuComboId;
                    const isSelected = pkgComboId === comboId;
                    return (
                      <button
                        key={comboId}
                        onClick={() => { setSelectedComboId(comboId); setPkgSlotReplacements({}); }}
                        className={`w-full text-left rounded-xl border p-3 transition-all ${isSelected ? "border-accent bg-accent/5" : "border-border hover:bg-secondary"}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-accent" : "border-muted-foreground"}`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-accent" />}
                            </div>
                            <span className="text-sm font-medium text-foreground">{combo.name}</span>
                            {isDefault && <span className="px-1.5 py-0.5 rounded text-xs bg-accent/10 text-accent font-medium">Mặc định</span>}
                          </div>
                          <span className="text-xs text-muted-foreground">{combo.slots.length} món · {combo.comboDiscountRate}% giảm</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary border border-border">
                  <Info className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">Gói này có một menu duy nhất. Bạn có thể thay thế các món được phép bên dưới.</p>
                </div>
              )}

              {pkgCombo && (
                <div className="mt-3">
                  <ComboSlotTable
                    combo={pkgCombo}
                    slotReplacements={pkgSlotReplacements}
                    onReplace={(slotId, dishId, dishName, price) =>
                      setPkgSlotReplacements((prev) => ({ ...prev, [slotId]: { dishId, dishName, price } }))
                    }
                    replacingSlotId={pkgReplacingSlotId}
                    setReplacingSlotId={setPkgReplacingSlotId}
                  />
                </div>
              )}
            </div>

            {/* Included services */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" /> Dịch vụ đã bao gồm trong gói
              </label>
              <div className="space-y-2 mb-3">
                {selectedPackage.includedServiceList.map((svc) => {
                  const isRemoved = removedPkgServiceIds.includes(svc.serviceId);
                  const svcMeta = SERVICES.find((s) => s.id === svc.serviceId);
                  return (
                    <div key={svc.serviceId} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isRemoved ? "border-dashed border-muted bg-secondary/40 opacity-60" : "border-border bg-emerald-50/40"}`}>
                      {/* Image thumbnail */}
                      {svcMeta?.image && (
                        <div className="w-14 h-11 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={svcMeta.image} alt={svc.serviceName} className={`w-full h-full object-cover ${isRemoved ? "grayscale" : ""}`} />
                        </div>
                      )}
                      <div className="flex-1 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isRemoved
                          ? <MinusCircle className="w-4 h-4 text-muted-foreground" />
                          : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        <div>
                          <span className={`text-sm font-medium ${isRemoved ? "line-through text-muted-foreground" : "text-foreground"}`}>{svc.serviceName}</span>
                          {svcMeta && <p className="text-xs text-muted-foreground line-clamp-1 max-w-[180px]">{svcMeta.description}</p>}
                        </div>
                        <span className="text-xs text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">{isRemoved ? "Đã bỏ" : "Đã bao gồm"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">{formatVND(svc.price)}</span>
                        {isRemoved ? (
                          <button
                            onClick={() => setRemovedPkgServiceIds((prev) => prev.filter((id) => id !== svc.serviceId))}
                            className="px-2.5 py-1 rounded-lg border border-emerald-300 text-emerald-700 bg-emerald-50 text-xs font-medium hover:bg-emerald-100 transition-all flex items-center gap-1"
                          >
                            <PlusCircle className="w-3 h-3" /> Khôi phục
                          </button>
                        ) : (
                          <button
                            onClick={() => setRemovedPkgServiceIds((prev) => [...prev, svc.serviceId])}
                            className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 text-xs font-medium hover:bg-rose-100 transition-all flex items-center gap-1"
                          >
                            <MinusCircle className="w-3 h-3" /> Bỏ
                          </button>
                        )}
                      </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {removedPkgServiceIds.length > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Bỏ dịch vụ không làm giảm giá gói. Giá gói đã bao gồm chi phí dịch vụ này.</span>
                </div>
              )}

              {/* Add extra service */}
              <div className="mt-3 p-4 rounded-xl border border-dashed border-border bg-secondary/30">
                <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5"><PlusCircle className="w-3.5 h-3.5 text-accent" /> Thêm dịch vụ ngoài gói (tính thêm)</p>
                {pkgServiceOptions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {pkgServiceOptions.map((svc) => (
                      <button
                        key={svc.id}
                        onClick={() => {
                          setExtraServices((prev) => [...prev, { id: svc.id, name: svc.name, price: svc.price }]);
                        }}
                        className="text-left rounded-xl border border-border bg-card hover:border-accent hover:shadow-sm transition-all overflow-hidden group"
                      >
                        {svc.image && (
                          <div className="relative h-20 overflow-hidden">
                            <img src={svc.image} alt={svc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          </div>
                        )}
                        <div className="p-2">
                          <p className="text-xs font-semibold text-foreground line-clamp-1">{svc.name}</p>
                          <p className="text-xs text-accent font-mono mt-0.5">+{formatVND(svc.price)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">Tất cả dịch vụ đã được thêm hoặc bao gồm trong gói.</p>
                )}
                {extraServices.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {extraServices.map((es) => {
                      const esMeta = SERVICES.find((s) => s.id === es.id);
                      return (
                        <div key={es.id} className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border">
                          {esMeta?.image && (
                            <div className="w-12 h-9 rounded overflow-hidden flex-shrink-0">
                              <img src={esMeta.image} alt={es.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <span className="text-sm text-foreground flex-1">{es.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-accent">+{formatVND(es.price)}</span>
                            <button onClick={() => setExtraServices((prev) => prev.filter((e) => e.id !== es.id))} className="p-1 rounded text-rose-600 hover:bg-rose-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Beverage allowance */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-accent" /> Hạn mức thức uống (theo gói)
              </label>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary text-left">
                      <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase">Thức uống</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase text-center">Hạn mức / bàn</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase text-right">Tổng ước tính ({bookingTables} bàn)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedPackage.beverageAllowanceList.map((b) => (
                      <tr key={b.beverageId} className="hover:bg-secondary/30">
                        <td className="px-4 py-3 font-medium text-foreground">{b.beverageName}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">{b.allowancePerTable} chai</span>
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground font-mono text-xs">
                          {b.allowancePerTable * bookingTables} chai ≈ {formatVND(b.allowancePerTable * b.unitPrice * bookingTables)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Benefits & Conditions collapsible */}
            <div className="rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setShowPkgBenefits(!showPkgBenefits)}
                className="w-full flex items-center justify-between px-4 py-3 bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <span className="text-sm font-semibold text-foreground flex items-center gap-2"><Gift className="w-4 h-4 text-accent" /> Quyền lợi & Điều kiện gói</span>
                {showPkgBenefits ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {showPkgBenefits && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-500" /> Quyền lợi</p>
                    <ul className="space-y-1.5">
                      {selectedPackage.packageBenefitList.map((b, i) => (
                        <li key={i} className="text-xs text-foreground flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" /> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Điều kiện</p>
                    <ul className="space-y-1.5">
                      {selectedPackage.conditionList.map((c, i) => (
                        <li key={i} className="text-xs text-foreground flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" /> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  // ── Step 3: Manual mode UI ─────────────────────────────────────────────────
  const renderManualMode = () => {
    const manualDishOptions = activeDishes.filter((d) => !manualCustomDishes.some((cd) => cd.id === d.id));
    const manualBevOptions = activeBeverages.filter((b) => !manualBeverages.some((mb) => mb.beverageId === b.id));

    return (
      <div className="space-y-6">
        {/* Services selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" /> Chọn dịch vụ
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeServices.map((svc) => {
              const isSelected = manualServiceIds.includes(svc.id);
              return (
                <button
                  key={svc.id}
                  onClick={() => setManualServiceIds((prev) => isSelected ? prev.filter((id) => id !== svc.id) : [...prev, svc.id])}
                  className={`text-left rounded-xl border overflow-hidden transition-all ${isSelected ? "border-accent ring-2 ring-accent/20 shadow-sm" : "border-border hover:border-accent/40 hover:shadow-sm"}`}
                >
                  {svc.image && (
                    <div className="relative h-28 overflow-hidden">
                      <img src={svc.image} alt={svc.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center shadow">
                          <Check className="w-3.5 h-3.5 text-accent-foreground" />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-3">
                    <p className={`text-sm font-semibold ${isSelected ? "text-accent" : "text-foreground"}`}>{svc.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{svc.description}</p>
                    <p className={`text-sm font-mono font-bold mt-1.5 ${isSelected ? "text-accent" : "text-foreground"}`}>{formatVND(svc.price)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dish menu section */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-accent" /> Thực đơn
          </label>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { val: true, label: "Sử dụng Dish Combo", desc: "Chọn combo có sẵn, được giảm giá theo tỷ lệ combo" },
              { val: false, label: "Tự chọn món", desc: "Chọn từng món riêng lẻ theo yêu cầu" },
            ].map(({ val, label, desc }) => (
              <button
                key={String(val)}
                onClick={() => { setManualUseCombo(val); setManualCustomDishes([]); setManualSlotReplacements({}); }}
                className={`text-left rounded-xl border p-3.5 transition-all ${manualUseCombo === val ? "border-accent bg-accent/5 shadow-sm" : "border-border hover:bg-secondary"}`}
              >
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-1">{desc}</p>
              </button>
            ))}
          </div>

          {manualUseCombo ? (
            <div className="space-y-3">
              <select
                value={manualComboId || ""}
                onChange={(e) => { setManualComboId(Number(e.target.value) || null); setManualSlotReplacements({}); }}
                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">-- Chọn combo --</option>
                {activeCombos.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} · {c.slots.length} món · {c.comboDiscountRate}% giảm</option>
                ))}
              </select>
              {manualCombo && (
                <ComboSlotTable
                  combo={manualCombo}
                  slotReplacements={manualSlotReplacements}
                  onReplace={(slotId, dishId, dishName, price) =>
                    setManualSlotReplacements((prev) => ({ ...prev, [slotId]: { dishId, dishName, price } }))
                  }
                  replacingSlotId={manualReplacingSlotId}
                  setReplacingSlotId={setManualReplacingSlotId}
                />
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {manualDishOptions.length > 0 ? (
                <>
                  <p className="text-xs text-muted-foreground mb-2">Chọn món ăn (nhấn vào món để thêm):</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto p-1">
                    {manualDishOptions.map((dish) => (
                      <button
                        key={dish.id}
                        onClick={() => {
                          setManualCustomDishes((prev) => [...prev, { id: dish.id, name: dish.name, price: dish.unitPrice, qty: 1 }]);
                        }}
                        className="text-left rounded-xl border border-border bg-card hover:border-accent hover:shadow-sm transition-all overflow-hidden group"
                      >
                        {dish.image && (
                          <div className="relative h-24 overflow-hidden">
                            <img src={dish.image} alt={dish.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-1 left-1 right-1">
                              <span className="text-[10px] font-medium text-white bg-black/40 px-1.5 py-0.5 rounded">{dish.dishTypeName}</span>
                            </div>
                          </div>
                        )}
                        <div className="p-2">
                          <p className="text-xs font-semibold text-foreground line-clamp-1">{dish.name}</p>
                          <p className="text-xs text-accent font-mono mt-0.5">{formatVND(dish.unitPrice)}/bàn</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">Tất cả món ăn đã được thêm.</p>
              )}
              {manualCustomDishes.length > 0 && (
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-secondary text-left">
                      <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Món ăn</th>
                      <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground text-right">Đơn giá</th>
                      <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground text-center">Qty/bàn</th>
                      <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground text-right">Tổng ({bookingTables} bàn)</th>
                      <th className="px-4 py-2.5 w-10"></th>
                    </tr></thead>
                    <tbody className="divide-y divide-border">
                      {manualCustomDishes.map((d) => {
                        const dishMeta = DISHES_INIT.find((dish) => dish.id === d.id);
                        return (
                          <tr key={d.id} className="hover:bg-secondary/30">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {dishMeta?.image && (
                                  <div className="w-10 h-8 rounded overflow-hidden flex-shrink-0">
                                    <img src={dishMeta.image} alt={d.name} className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <span className="font-medium text-foreground">{d.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-sm">{formatVND(d.price)}</td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                min={1}
                                value={d.qty}
                                onChange={(e) => {
                                  const newQty = Number(e.target.value) || 1;
                                  setManualCustomDishes((prev) =>
                                    prev.map((item) => item.id === d.id ? { ...item, qty: newQty } : item)
                                  );
                                }}
                                className="w-16 px-2 py-1 rounded border border-border bg-input-background text-center font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                              />
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-semibold text-accent">{formatVND(d.price * d.qty * bookingTables)}</td>
                            <td className="px-4 py-3 text-center">
                              <button onClick={() => setManualCustomDishes((prev) => prev.filter((x) => x.id !== d.id))} className="p-1 rounded text-rose-600 hover:bg-rose-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {manualCustomDishes.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-xl">Chưa có món nào. Chọn món ăn từ danh sách bên trên.</p>
              )}
            </div>
          )}
        </div>

        {/* Beverage section */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-accent" /> Thức uống
          </label>
          <div className="space-y-2 mb-3">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
              <select value={addBeverageId} onChange={(e) => setAddBeverageId(e.target.value)} className="px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
                <option value="">-- Chọn thức uống --</option>
                {manualBevOptions.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} ({b.beverageTypeName}) — {formatVND(b.unitPrice)}</option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <input
                    type="number" min={1} max={20} value={addBeverageQty}
                    onChange={(e) => setAddBeverageQty(Number(e.target.value) || 1)}
                    className="w-20 px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">/bàn</span>
                </div>
                <button
                  disabled={!addBeverageId}
                  onClick={() => {
                    const bev = activeBeverages.find((b) => b.id === Number(addBeverageId));
                    if (bev) { setManualBeverages((prev) => [...prev, { beverageId: bev.id, beverageName: bev.name, allowancePerTable: addBeverageQty, unitPrice: bev.unitPrice }]); setAddBeverageId(""); setAddBeverageQty(2); }
                  }}
                  className="px-4 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:bg-accent/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" /> Thêm
                </button>
              </div>
            </div>
          </div>
          {manualBeverages.length > 0 ? (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-secondary text-left">
                  <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Thức uống</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground text-center">Hạn mức/bàn</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground text-right">Ước tính ({bookingTables} bàn)</th>
                  <th className="px-4 py-2.5 w-10"></th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {manualBeverages.map((b) => (
                    <tr key={b.beverageId} className="hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium text-foreground">{b.beverageName}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">{b.allowancePerTable} chai</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                        {b.allowancePerTable * bookingTables} chai ≈ {formatVND(b.allowancePerTable * b.unitPrice * bookingTables)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => setManualBeverages((prev) => prev.filter((x) => x.beverageId !== b.beverageId))} className="p-1 rounded text-rose-600 hover:bg-rose-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-xl">Chưa thêm thức uống nào.</p>
          )}
        </div>
      </div>
    );
  };

  // ── Booking Summary sidebar ────────────────────────────────────────────────
  const renderSummary = () => {
    const SummaryRow = ({ label, value, bold, indent, strikethrough, sub }: {
      label: string; value: string; bold?: boolean; indent?: boolean; strikethrough?: boolean; sub?: boolean;
    }) => (
      <div className={`flex items-baseline justify-between ${sub ? "py-0.5" : "py-1"}`}>
        <span className={`${indent ? "pl-4 " : ""}${sub ? "text-xs" : "text-sm"} ${strikethrough ? "line-through text-muted-foreground/60" : "text-muted-foreground"}`}>{label}</span>
        <span className={`${sub ? "text-xs" : "text-sm"} font-mono ${bold ? "font-bold text-primary" : "text-foreground"} ${strikethrough ? "line-through text-muted-foreground/60" : ""}`}>{value}</span>
      </div>
    );

    return (
      <div className="bg-card rounded-[20px] p-5 border border-border shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-primary">Booking Summary</h3>

        {/* Basic info */}
        <div className="space-y-1">
          {[
            { label: "Sảnh", val: preHall.name },
            { label: "Ngày", val: preDate },
            { label: "Ca", val: preShift },
            { label: "Số bàn", val: `${bookingTables} bàn` },
            { label: "Bàn dự phòng", val: `${reserveTables} bàn` },
            { label: "Hình thức", val: bookingMode },
          ].map(({ label, val }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-xs font-medium text-foreground">{val}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-3 space-y-1">
          <SummaryRow label="Phí thuê sảnh" value={formatVND(hallFee)} />

          {bookingMode === "Package" && selectedPackage ? (
            <>
              <SummaryRow label={`Gói: ${bookingTables} × ${formatVND(selectedPackage.pricePerTable)}`} value={formatVND(pkgBaseCost)} />
              {selectedPackage.includedServiceList.map((svc) => {
                const isRemoved = removedPkgServiceIds.includes(svc.serviceId);
                return (
                  <SummaryRow
                    key={svc.serviceId}
                    label={`↳ ${svc.serviceName}`}
                    value={isRemoved ? "Đã bỏ" : "Đã bao gồm"}
                    indent sub
                    strikethrough={isRemoved}
                  />
                );
              })}
              {pkgSlotAdjustments > 0 && (
                <SummaryRow label="Thay thế món (phụ thu)" value={`+${formatVND(pkgSlotAdjustments)}`} />
              )}
              {extraServices.length > 0 && (
                <>
                  <p className="text-xs text-muted-foreground pt-1 pb-0.5 font-medium">Dịch vụ thêm:</p>
                  {extraServices.map((es) => (
                    <SummaryRow key={es.id} label={`↳ ${es.name}`} value={`+${formatVND(es.price)}`} indent sub />
                  ))}
                </>
              )}
              {pkgExtraDishes.length > 0 && (
                <>
                  <p className="text-xs text-muted-foreground pt-1 pb-0.5 font-medium">Món thêm:</p>
                  {pkgExtraDishes.map((d) => (
                    <SummaryRow key={d.id} label={`↳ ${d.name} ×${d.qty}`} value={`+${formatVND(d.price * d.qty)}`} indent sub />
                  ))}
                </>
              )}
              {pkgBeverageEstimate > 0 && (
                <SummaryRow label="Thức uống (ước tính)" value={`~${formatVND(pkgBeverageEstimate)}`} />
              )}
            </>
          ) : (
            <>
              {manualServiceIds.length > 0 && (
                <>
                  <p className="text-xs text-muted-foreground pt-1 pb-0.5 font-medium">Dịch vụ:</p>
                  {manualServiceIds.map((sid) => {
                    const svc = activeServices.find((s) => s.id === sid);
                    return svc ? <SummaryRow key={sid} label={`↳ ${svc.name}`} value={formatVND(svc.price)} indent sub /> : null;
                  })}
                </>
              )}
              {manualUseCombo && manualCombo ? (
                <SummaryRow label={`Combo: ${manualCombo.name} ×${bookingTables} (${manualCombo.comboDiscountRate}% giảm)`} value={formatVND(manualComboCost)} />
              ) : (
                manualCustomDishes.length > 0 && (
                  <>
                    <p className="text-xs text-muted-foreground pt-1 pb-0.5 font-medium">Món ăn tự chọn:</p>
                    {manualCustomDishes.map((d) => (
                      <SummaryRow key={d.id} label={`↳ ${d.name} ×${d.qty}/bàn`} value={formatVND(d.price * d.qty * bookingTables)} indent sub />
                    ))}
                  </>
                )
              )}
              {manualBeverages.length > 0 && (
                <>
                  <p className="text-xs text-muted-foreground pt-1 pb-0.5 font-medium">Thức uống:</p>
                  {manualBeverages.map((b) => (
                    <SummaryRow key={b.beverageId} label={`↳ ${b.beverageName} ×${b.allowancePerTable}/bàn`} value={`~${formatVND(b.allowancePerTable * b.unitPrice * bookingTables)}`} indent sub />
                  ))}
                </>
              )}
            </>
          )}
        </div>

        <div className="border-t border-border pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Tổng cộng</span>
            <span className="text-base font-bold font-mono text-primary">{formatVND(bookingAmount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Đặt cọc</span>
            <span className="text-sm font-mono text-foreground">- {formatVND(bookingDeposit)}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-dashed border-border">
            <span className="text-sm font-semibold text-primary">Còn lại</span>
            <span className={`text-base font-bold font-mono ${bookingRemaining < 0 ? "text-red-600" : "text-accent"}`}>{formatVND(bookingRemaining)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <button onClick={() => setScreen("booking")} className="hover:text-foreground flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Danh sách Booking</button>
        <ChevronRight className="w-4 h-4" />
        {bookingPreselect && (
          <>
            <button onClick={() => setScreen("booking-availability")} className="hover:text-foreground">Bước 1 — Chọn Sảnh</button>
            <ChevronRight className="w-4 h-4" />
          </>
        )}
        <span className="text-foreground font-medium">Bước {bookingStep} — {STEP_LABELS[bookingStep - 1].label}</span>
      </div>

      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">Set up Booking</h1>
          <p className="text-muted-foreground">Bước {bookingStep} / 4 — {STEP_LABELS[bookingStep - 1].label}</p>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-secondary text-xs font-mono text-muted-foreground">DRAFT • BK-NEW</span>
      </div>

      {/* Step indicator */}
      <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
        <div className="grid grid-cols-4 gap-4">
          {STEP_LABELS.map((s, idx) => {
            const stepNum = idx + 1;
            const active = stepNum === bookingStep;
            const done = stepNum < bookingStep;
            return (
              <div key={s.label} className="relative">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${active ? "bg-accent text-accent-foreground shadow-md" : done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {done ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-medium text-center ${active ? "text-primary" : "text-muted-foreground"}`}>Step {stepNum}</span>
                  <span className={`text-sm font-semibold text-center ${active ? "text-primary" : "text-foreground"}`}>{s.label}</span>
                </div>
                {idx < 3 && <div className="absolute top-6 left-[calc(50%+24px)] right-[calc(-50%+24px)] h-0.5 bg-border" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 bg-card rounded-[20px] p-6 border border-border shadow-sm">
          {/* Step 1 */}
          {bookingStep === 1 && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-primary">Bước 1 · Sảnh, Ngày & Ca</h3>
              {bookingPreselect ? (
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">{preHall.name} — Confirmed available</p>
                    <p className="text-xs text-blue-700 mt-0.5">{preDate} · {preShift} shift · {preHall.type} · {formatVND(preHall.basePrice)} base price</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Hall</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent">
                      {HALLS.filter((h) => h.status === "Active").map((h) => <option key={h.id}>{h.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Booking Date</label>
                    <input type="date" defaultValue={preDate} className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Shift</label>
                    <select defaultValue={preShift} className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent">
                      {SHIFT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2 */}
          {bookingStep === 2 && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-primary">Bước 2 · Thông tin Khách hàng & Cặp đôi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Tên khách hàng *", type: "text", value: "Vũ Anh Tuấn" },
                  { label: "Số điện thoại *", type: "tel", value: "0934 567 890" },
                  { label: "Email", type: "email", value: "tuan.vu@gmail.com" },
                ].map(({ label, type, value }) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
                    <input type={type} defaultValue={value} className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                ))}
                <div className="hidden md:block" />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tên cô dâu</label>
                  <input type="text" defaultValue="Nguyễn Hồng Nhung" className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tên chú rể</label>
                  <input type="text" defaultValue="Vũ Anh Tuấn" className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Số bàn *</label>
                  <input type="number" value={bookingTables} min={1} onChange={(e) => setBookingTables(Number(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent" />
                  <p className="text-xs text-muted-foreground mt-1">Sức chứa sảnh: {preHall.minTables}–{preHall.maxTables} bàn</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Bàn dự phòng</label>
                  <input type="number" value={reserveTables} min={0} onChange={(e) => setReserveTables(Number(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {bookingStep === 3 && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-primary">Bước 3 · Chọn Thực đơn / Gói tiệc</h3>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Hình thức đặt tiệc</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["Package", "Manual"] as const).map((m) => (
                    <button key={m} onClick={() => setBookingMode(m)} className={`px-4 py-4 rounded-xl border text-left transition-all ${bookingMode === m ? "border-accent bg-accent/5 shadow-sm" : "border-border hover:bg-secondary"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {bookingMode === m && <Check className="w-4 h-4 text-accent" />}
                        <p className="text-sm font-semibold text-foreground">{m === "Package" ? "Gói tiệc cưới" : "Tự chọn (Manual)"}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{m === "Package" ? "Chọn gói đã thiết kế sẵn với menu + dịch vụ bundled." : "Tự chọn dịch vụ, combo món ăn và thức uống riêng lẻ."}</p>
                    </button>
                  ))}
                </div>
              </div>
              {bookingMode === "Package" ? renderPackageMode() : renderManualMode()}
            </div>
          )}

          {/* Step 4 */}
          {bookingStep === 4 && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-primary">Bước 4 · Xác nhận Đặt cọc</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tổng giá trị booking</label>
                  <input readOnly value={formatVND(bookingAmount)} className="w-full px-4 py-3 rounded-xl border border-border bg-secondary font-mono text-foreground" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Số tiền đặt cọc *</label>
                  <input type="number" value={bookingDeposit} onChange={(e) => setBookingDeposit(Number(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl border border-border bg-input-background font-mono focus:outline-none focus:ring-2 focus:ring-accent" />
                  <p className="text-xs text-muted-foreground mt-1">Khuyến nghị: 30% = {formatVND(bookingAmount * 0.3)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Số tiền còn lại</label>
                  <input readOnly value={formatVND(bookingRemaining)} className={`w-full px-4 py-3 rounded-xl border font-mono ${bookingRemaining < 0 ? "border-red-300 bg-red-50 text-red-700" : "border-border bg-secondary text-foreground"}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phương thức thanh toán</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent">
                    <option>Chuyển khoản — Vietcombank</option>
                    <option>Tiền mặt tại quầy</option>
                    <option>Thẻ tín dụng (POS)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Ghi chú</label>
                  <textarea rows={3} placeholder="VD: Gia đình yêu cầu menu chay cho bàn số 5..." className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
            {bookingPreselect && bookingStep === 2 ? (
              <button onClick={() => setScreen("booking-availability")} className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-all flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Chọn lại sảnh
              </button>
            ) : (
              <button disabled={bookingStep === 1} onClick={() => setBookingStep(Math.max(1, bookingStep - 1))} className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                <ArrowLeft className="w-4 h-4" /> Quay lại
              </button>
            )}
            {bookingStep < 4 ? (
              <button onClick={() => setBookingStep(bookingStep + 1)} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm">
                Tiếp theo <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => setScreen("booking")} className="px-6 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:bg-accent/90 transition-all flex items-center gap-2 shadow-sm">
                <Save className="w-4 h-4" /> Lưu Booking — Chờ xác nhận cọc
              </button>
            )}
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="space-y-4">
          {renderSummary()}
          <div className="bg-secondary/60 rounded-[20px] p-5 border border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Lưu ý:</strong> Giá bao gồm phí sảnh + gói/thực đơn. Thức uống là ước tính. Hệ thống áp dụng quy tắc giá khi chỉnh sửa combo và dịch vụ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
