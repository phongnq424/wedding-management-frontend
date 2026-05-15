import { Building2, XCircle } from "lucide-react";
import { formatVND, StatusBadge } from "../../../utils";
import type { BookingTableRow } from "./booking.mapper";
import { getBookingLinePriceLabel } from "./booking.mapper";

export function BookingDetailDrawer({
    booking,
    onClose,
}: {
    booking: BookingTableRow;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end" onClick={onClose}>
            <div
                className="w-full max-w-xl h-full bg-card shadow-2xl overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-primary font-mono">{booking.id}</h2>
                        <p className="text-sm text-muted-foreground">Chi tiết booking</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                        <XCircle className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <div className="flex items-center gap-3 flex-wrap">
                        <StatusBadge status={booking.displayStatus} />
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground">
                            {booking.bookingMode}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground">
                            {booking.shiftName ?? "N/A"}
                        </span>
                    </div>

                    <section className="bg-secondary/60 rounded-xl p-4 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sảnh & Ngày</p>
                        <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-accent flex-shrink-0" />
                            <span className="text-sm font-semibold text-foreground">{booking.hallName ?? "N/A"}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <span>Ngày đặt: <strong className="text-foreground">{booking.bookingDateText}</strong></span>
                            <span>Ngày cưới: <strong className="text-foreground">{booking.weddingDateText}</strong></span>
                            <span>Số bàn: <strong className="text-foreground">{booking.numberOfTables} bàn</strong></span>
                            <span>Dự phòng: <strong className="text-foreground">{booking.numberOfReserveTables} bàn</strong></span>
                        </div>
                    </section>

                    <section className="bg-secondary/60 rounded-xl p-4 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Khách hàng</p>
                        <div className="space-y-1 text-sm">
                            <p><span className="text-muted-foreground">Tên:</span> <strong className="text-foreground">{booking.customerName}</strong></p>
                            <p><span className="text-muted-foreground">ĐT:</span> <span className="font-mono text-foreground">{booking.customerPhone}</span></p>
                            <p><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{booking.customerEmail ?? "N/A"}</span></p>
                        </div>
                    </section>

                    <section className="bg-secondary/60 rounded-xl p-4 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cặp đôi</p>
                        <div className="flex items-center gap-6 text-sm">
                            <span className="text-foreground">{booking.brideName}</span>
                            <span className="text-muted-foreground">♡</span>
                            <span className="text-foreground">{booking.groomName}</span>
                        </div>
                    </section>

                    <section className="bg-secondary/60 rounded-xl p-4 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tài chính</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Tổng giá trị</span><span className="font-mono font-semibold text-foreground">{formatVND(booking.bookingAmount ?? 0)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Tiền cọc</span><span className="font-mono font-semibold text-emerald-600">{formatVND(booking.depositAmount ?? 0)}</span></div>
                            <div className="flex justify-between border-t border-border pt-2"><span className="text-foreground font-medium">Còn lại</span><span className="font-mono font-bold text-rose-600">{formatVND(booking.remainingAmount ?? 0)}</span></div>
                        </div>
                    </section>

                    {booking.bookingLines?.length > 0 && (
                        <section className="bg-secondary/60 rounded-xl p-4 space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dòng đặt tiệc</p>
                            <div className="space-y-2">
                                {booking.bookingLines.map((line) => (
                                    <div key={line.id} className="flex items-center justify-between gap-3 text-sm border-b border-border last:border-b-0 pb-2 last:pb-0">
                                        <div className="min-w-0">
                                            <p className="text-foreground font-medium truncate">{line.itemName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {line.itemType}
                                                {line.sourceType ? ` · ${line.sourceType}` : ""}
                                                {line.itemType !== "DISCOUNT" && line.itemType !== "BENEFIT"
                                                    ? ` · x${line.quantity ?? 1}`
                                                    : ""}
                                            </p>
                                        </div>
                                        <span
                                            className={`font-mono text-xs ${line.sourceType === "PACKAGE_BENEFIT" || line.itemType === "BENEFIT"
                                                ? "text-emerald-600"
                                                : line.sourceType === "PACKAGE_INCLUDED"
                                                    ? "text-muted-foreground"
                                                    : line.sourceType === "PACKAGE_DISCOUNT" || line.itemType === "DISCOUNT"
                                                        ? "text-rose-600"
                                                        : "text-foreground"
                                                }`}
                                        >
                                            {getBookingLinePriceLabel(line)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
