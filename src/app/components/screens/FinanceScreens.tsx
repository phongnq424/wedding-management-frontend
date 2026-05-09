import React, { useState } from "react";
import {
  Plus, Download, AlertCircle, Receipt, Sparkles, Filter, Search, RefreshCw,
  Eye, Edit, XCircle, CheckCircle2, CreditCard, FileText, ArrowLeft, ChevronRight,
  X, Save, Check, Info, Printer, Send, ExternalLink, Clock, Ban,
} from "lucide-react";
import { formatVND } from "../../utils";
import {
  PAYMENT_LIST_INIT, INVOICE_LIST_INIT, BOOKING_LIST,
  PaymentRecord, InvoiceRecord, InvoiceLineItem, PaymentStatus, PaymentType, PaymentMethod,
  InvoiceStatus, InvoicePaymentStatus,
} from "../../data";

// ── Status badges ─────────────────────────────────────────────────────────────
const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => {
  const map: Record<PaymentStatus, string> = {
    UNPROCESSED: "bg-gray-100 text-gray-700 border-gray-200",
    PROCESSED:   "bg-emerald-100 text-emerald-700 border-emerald-200",
    CANCELLED:   "bg-rose-100 text-rose-700 border-rose-200",
    REJECTED:    "bg-orange-100 text-orange-700 border-orange-200",
    FAILED:      "bg-red-100 text-red-700 border-red-200",
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${map[status]}`}>{status}</span>;
};

const InvoiceStatusBadge = ({ status }: { status: InvoiceStatus }) => {
  const map: Record<InvoiceStatus, string> = {
    DRAFT:    "bg-gray-100 text-gray-700 border-gray-200",
    ISSUED:   "bg-emerald-100 text-emerald-700 border-emerald-200",
    ADJUSTED: "bg-blue-100 text-blue-700 border-blue-200",
    REJECTED: "bg-rose-100 text-rose-700 border-rose-200",
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${map[status]}`}>{status}</span>;
};

const InvPayStatusBadge = ({ status }: { status: InvoicePaymentStatus }) => {
  const map: Record<InvoicePaymentStatus, string> = {
    UNPAID:        "bg-rose-100 text-rose-700",
    PARTIALLY_PAID:"bg-amber-100 text-amber-700",
    PAID:          "bg-emerald-100 text-emerald-700",
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[status]}`}>{status.replace("_", " ")}</span>;
};

const paymentTypeLabel: Record<PaymentType, string> = {
  DEPOSIT:         "Đặt cọc",
  PARTIAL_PAYMENT: "Thanh toán một phần",
  FINAL_PAYMENT:   "Thanh toán cuối",
};

// ── Field row helper ──────────────────────────────────────────────────────────
const InfoRow = ({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) => (
  <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={`text-sm font-semibold text-foreground ${mono ? "font-mono" : ""}`}>{value}</span>
  </div>
);

// ── Số tiền bằng chữ (Tiếng Việt) ────────────────────────────────────────────
const ONES_VN = ["không","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];
const TEENS_VN = ["mười","mười một","mười hai","mười ba","mười bốn","mười lăm","mười sáu","mười bảy","mười tám","mười chín"];
const TENS_VN = ["","","hai mươi","ba mươi","bốn mươi","năm mươi","sáu mươi","bảy mươi","tám mươi","chín mươi"];
function twoD(n: number): string {
  if (n < 10) return ONES_VN[n];
  if (n < 20) return TEENS_VN[n - 10];
  const t = Math.floor(n / 10), o = n % 10;
  return TENS_VN[t] + (o > 0 ? (o === 5 ? " lăm" : o === 1 ? " mốt" : " " + ONES_VN[o]) : "");
}
function threeD(n: number): string {
  const h = Math.floor(n / 100), r = n % 100;
  if (h === 0) return twoD(r);
  return ONES_VN[h] + " trăm" + (r === 0 ? "" : r < 10 ? " lẻ " + ONES_VN[r] : " " + twoD(r));
}
function numberToWords(n: number): string {
  if (n === 0) return "Không đồng";
  const ty = Math.floor(n / 1_000_000_000);
  const trieu = Math.floor((n % 1_000_000_000) / 1_000_000);
  const nghin = Math.floor((n % 1_000_000) / 1_000);
  const dong = n % 1_000;
  const parts: string[] = [];
  if (ty > 0) parts.push(threeD(ty) + " tỷ");
  if (trieu > 0) parts.push(threeD(trieu) + " triệu");
  if (nghin > 0) parts.push(threeD(nghin) + " nghìn");
  if (dong > 0) parts.push(threeD(dong));
  const s = parts.join(" ");
  return s.charAt(0).toUpperCase() + s.slice(1) + " đồng";
}

// ── Mock line items builder ───────────────────────────────────────────────────
function buildMockLineItems(bookingId: string, subtotal: number): InvoiceLineItem[] {
  const bk = BOOKING_LIST.find((b) => b.id === bookingId);
  if (!bk) return [];
  const t = bk.tables;
  const hallPrice = bk.shift === "Evening" ? 12_000_000 : 10_000_000;
  const svcTotal = 9_000_000;
  const foodSubtotal = subtotal - hallPrice - svcTotal;
  const menuPerTable = Math.round(foodSubtotal * 0.85 / t / 1_000) * 1_000;
  const bevTotal = Math.round(foodSubtotal * 0.15 / 1_000) * 1_000;
  return [
    { stt: 1, description: `Cho thuê sảnh ${bk.hall} — Ca ${bk.shift === "Morning" ? "sáng" : bk.shift === "Afternoon" ? "chiều" : "tối"}`, unit: "Buổi", quantity: 1, unitPrice: hallPrice, amount: hallPrice, taxRate: 10, taxAmount: Math.round(hallPrice * 0.1), category: "hall" },
    { stt: 2, description: "Trang trí hoa tươi & đèn sân khấu cao cấp", unit: "Gói", quantity: 1, unitPrice: 4_000_000, amount: 4_000_000, taxRate: 10, taxAmount: 400_000, category: "service" },
    { stt: 3, description: "Chụp ảnh & quay phim cưới chuyên nghiệp", unit: "Ca", quantity: 1, unitPrice: 5_000_000, amount: 5_000_000, taxRate: 10, taxAmount: 500_000, category: "service" },
    { stt: 4, description: `Thực đơn tiệc cưới (${t} bàn × ${formatVND(menuPerTable)}/bàn)`, unit: "Bàn", quantity: t, unitPrice: menuPerTable, amount: menuPerTable * t, taxRate: 8, taxAmount: Math.round(menuPerTable * t * 0.08), category: "food" },
    { stt: 5, description: "Bia Tiger lon 330ml", unit: "Chai", quantity: t * 3, unitPrice: 25_000, amount: t * 3 * 25_000, taxRate: 8, taxAmount: Math.round(t * 3 * 25_000 * 0.08), category: "beverage" },
    { stt: 6, description: "Nước khoáng Aquafina 500ml", unit: "Chai", quantity: t * 4, unitPrice: 8_000, amount: t * 4 * 8_000, taxRate: 8, taxAmount: Math.round(t * 4 * 8_000 * 0.08), category: "beverage" },
    { stt: 7, description: "Bánh cưới trang trí", unit: "Cái", quantity: 1, unitPrice: bevTotal, amount: bevTotal, taxRate: 8, taxAmount: Math.round(bevTotal * 0.08), category: "food" },
  ];
}

// ── Category & tax badges ─────────────────────────────────────────────────────
const catColor: Record<string, string> = { hall: "bg-primary/10 text-primary", service: "bg-blue-50 text-blue-700", food: "bg-amber-50 text-amber-700", beverage: "bg-emerald-50 text-emerald-700" };
const catLabel: Record<string, string> = { hall: "Sảnh", service: "Dịch vụ", food: "Thực phẩm", beverage: "Đồ uống" };

// ── Invoice line items component ──────────────────────────────────────────────
const InvoiceLineTable = ({ items }: { items: InvoiceLineItem[] }) => {
  const g10 = items.filter((i) => i.taxRate === 10);
  const g8  = items.filter((i) => i.taxRate === 8);
  const sub10 = g10.reduce((s, i) => s + i.amount, 0);
  const tax10 = g10.reduce((s, i) => s + i.taxAmount, 0);
  const sub8  = g8.reduce((s, i) => s + i.amount, 0);
  const tax8  = g8.reduce((s, i) => s + i.taxAmount, 0);
  const subAll = sub10 + sub8;
  const taxAll = tax10 + tax8;
  const grandTotal = subAll + taxAll;

  const renderGroup = (rows: InvoiceLineItem[], rate: number) => (
    <>
      <tr className="bg-secondary/60">
        <td colSpan={8} className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide ${rate === 10 ? "text-blue-700" : "text-amber-700"}`}>
          {rate === 10 ? "Dịch vụ & Sảnh — Thuế suất GTGT 10%" : "Thực phẩm & Đồ uống — Thuế suất GTGT 8%"}
        </td>
      </tr>
      {rows.map((item) => (
        <tr key={item.stt} className="hover:bg-secondary/20 transition-colors">
          <td className="px-3 py-2.5 text-center text-sm text-muted-foreground">{item.stt}</td>
          <td className="px-3 py-2.5">
            <p className="text-sm text-foreground leading-snug">{item.description}</p>
            <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${catColor[item.category]}`}>{catLabel[item.category]}</span>
          </td>
          <td className="px-3 py-2.5 text-center text-sm text-muted-foreground">{item.unit}</td>
          <td className="px-3 py-2.5 text-center text-sm font-mono">{item.quantity.toLocaleString("vi-VN")}</td>
          <td className="px-3 py-2.5 text-right text-sm font-mono">{formatVND(item.unitPrice)}</td>
          <td className="px-3 py-2.5 text-right text-sm font-mono font-semibold">{formatVND(item.amount)}</td>
          <td className="px-3 py-2.5 text-center">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${rate === 10 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{rate}%</span>
          </td>
          <td className="px-3 py-2.5 text-right text-sm font-mono text-muted-foreground">{formatVND(item.taxAmount)}</td>
        </tr>
      ))}
      <tr className={`border-t-2 border-border ${rate === 10 ? "bg-blue-50/40" : "bg-amber-50/40"}`}>
        <td colSpan={5} className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground italic">Cộng nhóm {rate}%</td>
        <td className="px-3 py-2 text-right text-sm font-mono font-bold">{formatVND(rate === 10 ? sub10 : sub8)}</td>
        <td className="px-3 py-2 text-center text-xs font-bold">{rate}%</td>
        <td className="px-3 py-2 text-right text-sm font-mono font-bold text-accent">{formatVND(rate === 10 ? tax10 : tax8)}</td>
      </tr>
    </>
  );

  return (
    <div className="space-y-5">
      {/* Line items table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              {["STT","Tên hàng hóa / dịch vụ","ĐVT","SL","Đơn giá (chưa thuế)","Thành tiền","TS%","Tiền thuế"].map((h, i) => (
                <th key={h} className={`px-3 py-3 text-xs font-semibold ${i === 0 || i === 2 || i === 3 || i === 6 ? "text-center" : i >= 4 ? "text-right" : "text-left"} whitespace-nowrap`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {g10.length > 0 && renderGroup(g10, 10)}
            {g8.length  > 0 && renderGroup(g8,  8)}
          </tbody>
        </table>
      </div>

      {/* Totals grid */}
      <div className="grid grid-cols-5 gap-4">
        {/* Tax summary table — 3 cols */}
        <div className="col-span-3 border border-border rounded-xl overflow-hidden text-sm">
          <div className="bg-secondary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tổng hợp thuế GTGT</div>
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/50 text-xs text-muted-foreground">
                <th className="px-3 py-2 text-left">Thuế suất</th>
                <th className="px-3 py-2 text-right">Doanh thu chưa thuế</th>
                <th className="px-3 py-2 text-right">Tiền thuế GTGT</th>
                <th className="px-3 py-2 text-right">Tổng (có thuế)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {g10.length > 0 && (
                <tr>
                  <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">10%</span></td>
                  <td className="px-3 py-2 text-right font-mono">{formatVND(sub10)}</td>
                  <td className="px-3 py-2 text-right font-mono text-blue-600">{formatVND(tax10)}</td>
                  <td className="px-3 py-2 text-right font-mono font-semibold">{formatVND(sub10 + tax10)}</td>
                </tr>
              )}
              {g8.length > 0 && (
                <tr>
                  <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">8%</span></td>
                  <td className="px-3 py-2 text-right font-mono">{formatVND(sub8)}</td>
                  <td className="px-3 py-2 text-right font-mono text-amber-600">{formatVND(tax8)}</td>
                  <td className="px-3 py-2 text-right font-mono font-semibold">{formatVND(sub8 + tax8)}</td>
                </tr>
              )}
              <tr className="bg-primary/5 font-bold">
                <td className="px-3 py-2 text-sm">Tổng cộng</td>
                <td className="px-3 py-2 text-right font-mono">{formatVND(subAll)}</td>
                <td className="px-3 py-2 text-right font-mono text-accent">{formatVND(taxAll)}</td>
                <td className="px-3 py-2 text-right font-mono text-primary">{formatVND(grandTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Grand total box — 2 cols */}
        <div className="col-span-2 border-2 border-primary/30 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 p-4 flex flex-col justify-between">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Tổng tiền hàng:</span><span className="font-mono">{formatVND(subAll)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Thuế GTGT:</span><span className="font-mono text-accent">{formatVND(taxAll)}</span></div>
            <div className="flex justify-between pt-2 border-t-2 border-primary/20">
              <span className="font-bold text-primary text-base">TỔNG THANH TOÁN:</span>
              <span className="font-mono font-bold text-xl text-primary">{formatVND(grandTotal)}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-dashed border-primary/20">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Viết bằng chữ:</p>
            <p className="text-xs italic text-foreground leading-relaxed font-medium">{numberToWords(grandTotal)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Payment Screen ─────────────────────────────────────────────────────────────
export const PaymentScreen = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>(PAYMENT_LIST_INIT);
  const [statusTab, setStatusTab] = useState<string>("All");
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({ paymentId: "", bookingId: "", customerName: "", customerPhone: "", paymentType: "All", paymentMethod: "All", dateFrom: "", dateTo: "" });

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [showProcess, setShowProcess] = useState<PaymentRecord | null>(null);
  const [showCancel, setShowCancel] = useState<PaymentRecord | null>(null);
  const [showEdit, setShowEdit] = useState<PaymentRecord | null>(null);
  const [showView, setShowView] = useState<PaymentRecord | null>(null);

  // Create form state
  const [createBookingId, setCreateBookingId] = useState("");
  const [createType, setCreateType] = useState<PaymentType>("DEPOSIT");
  const [createAmount, setCreateAmount] = useState("");
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  // Process form state
  const [procMethod, setProcMethod] = useState<PaymentMethod>("Cash");
  const [procDate, setProcDate] = useState(new Date().toISOString().slice(0, 10));
  const [procReceived, setProcReceived] = useState("");
  const [procRef, setProcRef] = useState("");
  const [procNote, setProcNote] = useState("");
  const [proc2FA, setProc2FA] = useState(false);
  const [proc2FACode, setProc2FACode] = useState("");
  const [procMsg, setProcMsg] = useState<string | null>(null);

  // Cancel state
  const [cancelReason, setCancelReason] = useState("");
  const [cancelMsg, setCancelMsg] = useState<string | null>(null);

  // Edit form state
  const [editType, setEditType] = useState<PaymentType>("DEPOSIT");
  const [editAmount, setEditAmount] = useState("");
  const [editMsg, setEditMsg] = useState<string | null>(null);

  const selectedBooking = BOOKING_LIST.find((b) => b.id === createBookingId);
  const confirmedPaid = selectedBooking
    ? payments.filter((p) => p.bookingId === createBookingId && p.status === "PROCESSED").reduce((s, p) => s + p.amount, 0)
    : 0;
  const pendingAmt = selectedBooking
    ? payments.filter((p) => p.bookingId === createBookingId && p.status === "UNPROCESSED").reduce((s, p) => s + p.amount, 0)
    : 0;
  const remainingAmt = selectedBooking ? selectedBooking.total - confirmedPaid : 0;

  const filtered = payments.filter((p) => {
    if (statusTab !== "All" && p.status !== statusTab) return false;
    const f = filters;
    if (f.paymentId && !p.id.toLowerCase().includes(f.paymentId.toLowerCase())) return false;
    if (f.bookingId && !p.bookingId.toLowerCase().includes(f.bookingId.toLowerCase())) return false;
    if (f.customerName && !p.customerName.toLowerCase().includes(f.customerName.toLowerCase())) return false;
    if (f.customerPhone && !p.customerPhone.replace(/\s/g, "").includes(f.customerPhone.replace(/\s/g, ""))) return false;
    if (f.paymentType !== "All" && p.paymentType !== f.paymentType) return false;
    if (f.paymentMethod !== "All" && p.paymentMethod !== f.paymentMethod) return false;
    if (f.dateFrom && p.paymentDate && p.paymentDate < f.dateFrom) return false;
    if (f.dateTo && p.paymentDate && p.paymentDate > f.dateTo) return false;
    return true;
  });

  const handleCreate = () => {
    if (!createBookingId || !createAmount) { setCreateMsg("MSG 2: Vui lòng nhập đầy đủ thông tin."); return; }
    const amt = Number(createAmount);
    if (!selectedBooking) { setCreateMsg("Không tìm thấy booking."); return; }
    // BR-CPM-2 validations
    if (createType === "DEPOSIT" && amt < selectedBooking.deposit) { setCreateMsg(`MSG 38: Số tiền cọc phải ≥ ${formatVND(selectedBooking.deposit)}.`); return; }
    if (createType === "FINAL_PAYMENT" && amt !== remainingAmt) { setCreateMsg(`MSG 39: Thanh toán cuối phải đúng bằng số còn lại ${formatVND(remainingAmt)}.`); return; }
    if (createType === "PARTIAL_PAYMENT" && amt >= remainingAmt) { setCreateMsg(`MSG 19: Số tiền ≥ số còn lại — dùng Thanh toán cuối thay thế.`); return; }
    // BR-CPM-3 duplicate check
    const dup = payments.find((p) => p.bookingId === createBookingId && p.paymentType === createType && p.status === "UNPROCESSED");
    if (dup) { setCreateMsg(`MSG 68: Đã tồn tại khoản thanh toán ${createType} chưa xử lý cho booking này.`); return; }
    const now = new Date().toISOString();
    const newPay: PaymentRecord = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      bookingId: createBookingId,
      customerName: selectedBooking.customer,
      customerPhone: selectedBooking.phone,
      paymentType: createType,
      amount: amt,
      paymentMethod: null, paymentDate: null, receivedAmount: null, changeAmount: null,
      referenceNumber: null, note: null,
      status: "UNPROCESSED",
      createdAt: now, processedAt: null, lastModifiedAt: now,
      cancelReason: null,
    };
    setPayments((prev) => [newPay, ...prev]);
    setShowCreate(false);
    setCreateBookingId(""); setCreateAmount(""); setCreateMsg(null);
  };

  const handleProcess = () => {
    if (!showProcess) return;
    if (!procMethod || !procDate || !procReceived) { setProcMsg("MSG 2: Vui lòng nhập đầy đủ thông tin."); return; }
    if ((procMethod === "Bank Transfer" || procMethod === "Card") && !procRef) { setProcMsg("MSG 2: Số tham chiếu bắt buộc với Bank Transfer / Card."); return; }
    const received = Number(procReceived);
    if (procMethod === "Cash" && received < showProcess.amount) { setProcMsg(`MSG 69: Số tiền nhận phải ≥ ${formatVND(showProcess.amount)}.`); return; }
    setProc2FA(true);
  };

  const handle2FA = () => {
    if (!proc2FACode) { setProcMsg("MSG 2: Nhập mã xác thực."); return; }
    if (proc2FACode !== "123456") { setProcMsg("MSG 56: Mã xác thực không đúng."); return; }
    if (!showProcess) return;
    const received = procMethod === "Cash" ? Number(procReceived) : showProcess.amount;
    const change = received - showProcess.amount;
    const now = new Date().toISOString();
    setPayments((prev) => prev.map((p) => p.id === showProcess.id ? {
      ...p, status: "PROCESSED", paymentMethod: procMethod, paymentDate: procDate,
      receivedAmount: received, changeAmount: change,
      referenceNumber: procRef || null, note: procNote || null,
      processedAt: now, lastModifiedAt: now,
    } : p));
    setShowProcess(null); setProc2FA(false); setProc2FACode(""); setProcReceived(""); setProcRef(""); setProcNote(""); setProcMsg(null);
  };

  const handleCancel = () => {
    if (!showCancel) return;
    if (!cancelReason.trim()) { setCancelMsg("MSG 2: Vui lòng nhập lý do hủy."); return; }
    const now = new Date().toISOString();
    setPayments((prev) => prev.map((p) => p.id === showCancel.id ? {
      ...p, status: "CANCELLED", cancelReason: cancelReason, lastModifiedAt: now,
    } : p));
    setShowCancel(null); setCancelReason(""); setCancelMsg(null);
  };

  const handleSaveEdit = () => {
    if (!showEdit) return;
    if (!editAmount) { setEditMsg("MSG 2: Số tiền bắt buộc."); return; }
    const amt = Number(editAmount);
    const bk = BOOKING_LIST.find((b) => b.id === showEdit.bookingId);
    if (bk) {
      if (editType === "DEPOSIT" && amt < bk.deposit) { setEditMsg(`MSG 38: Số tiền cọc phải ≥ ${formatVND(bk.deposit)}.`); return; }
      const rem = bk.total - payments.filter((p) => p.bookingId === bk.id && p.status === "PROCESSED" && p.id !== showEdit.id).reduce((s, p) => s + p.amount, 0);
      if (editType === "FINAL_PAYMENT" && amt !== rem) { setEditMsg(`MSG 39: Phải bằng số còn lại ${formatVND(rem)}.`); return; }
      if (editType === "PARTIAL_PAYMENT" && amt >= rem) { setEditMsg(`MSG 19: Dùng Thanh toán cuối thay thế.`); return; }
    }
    const dup = payments.find((p) => p.bookingId === showEdit.bookingId && p.paymentType === editType && p.status === "UNPROCESSED" && p.id !== showEdit.id);
    if (dup) { setEditMsg("MSG 68: Trùng loại thanh toán chưa xử lý."); return; }
    const now = new Date().toISOString();
    setPayments((prev) => prev.map((p) => p.id === showEdit.id ? { ...p, paymentType: editType, amount: amt, lastModifiedAt: now } : p));
    setShowEdit(null); setEditMsg(null);
  };

  const tabCounts: Record<string, number> = {
    All: payments.length,
    UNPROCESSED: payments.filter((p) => p.status === "UNPROCESSED").length,
    PROCESSED:   payments.filter((p) => p.status === "PROCESSED").length,
    CANCELLED:   payments.filter((p) => p.status === "CANCELLED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">Quản lý Thanh toán</h1>
          <p className="text-muted-foreground">Tạo, xử lý và theo dõi các khoản thanh toán booking</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2.5 border border-border bg-card rounded-xl hover:bg-secondary transition-all">
            <Filter className="w-4 h-4" /><span className="text-sm font-medium">{showFilters ? "Ẩn" : "Hiện"} lọc</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-border bg-card rounded-xl hover:bg-secondary transition-all">
            <Download className="w-4 h-4" /><span className="text-sm font-medium">Xuất</span>
          </button>
          <button onClick={() => { setShowCreate(true); setCreateMsg(null); }} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm">
            <Plus className="w-5 h-5" /> Tạo thanh toán
          </button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto">
        {["All", "UNPROCESSED", "PROCESSED", "CANCELLED"].map((tab) => (
          <button key={tab} onClick={() => setStatusTab(tab)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${statusTab === tab ? "border-accent text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {tab === "All" ? "Tất cả" : tab}
            <span className="ml-2 px-2 py-0.5 rounded-full bg-secondary text-xs">{tabCounts[tab] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-card rounded-[20px] p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-primary">Lọc & Tìm kiếm</h3>
            <button onClick={() => setFilters({ paymentId: "", bookingId: "", customerName: "", customerPhone: "", paymentType: "All", paymentMethod: "All", dateFrom: "", dateTo: "" })} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Mã thanh toán", key: "paymentId", placeholder: "PAY-..." },
              { label: "Mã booking",    key: "bookingId", placeholder: "BK..." },
              { label: "Tên khách",     key: "customerName", placeholder: "Tên..." },
              { label: "SĐT",           key: "customerPhone", placeholder: "09..." },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
                <input value={(filters as any)[key]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })} placeholder={placeholder}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Loại thanh toán</label>
              <select value={filters.paymentType} onChange={(e) => setFilters({ ...filters, paymentType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
                <option value="All">Tất cả</option>
                <option value="DEPOSIT">DEPOSIT</option>
                <option value="PARTIAL_PAYMENT">PARTIAL_PAYMENT</option>
                <option value="FINAL_PAYMENT">FINAL_PAYMENT</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Phương thức</label>
              <select value={filters.paymentMethod} onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
                <option value="All">Tất cả</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Ngày TT từ</label>
              <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Đến</label>
              <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{filtered.length} kết quả</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                {["Mã TT", "Booking / Khách", "Loại TT", "Số tiền", "Phương thức", "Ngày TT", "Đã nhận", "Tiền thừa", "Trạng thái", "Hành động"].map((h) => (
                  <th key={h} className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${h === "Số tiền" || h === "Đã nhận" || h === "Tiền thừa" ? "text-right" : h === "Hành động" ? "text-center" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((pay) => (
                <tr key={pay.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs text-primary font-semibold whitespace-nowrap">{pay.id}</td>
                  <td className="px-4 py-3.5">
                    <p className="text-xs font-mono text-accent">{pay.bookingId}</p>
                    <p className="text-sm font-medium text-foreground">{pay.customerName}</p>
                    <p className="text-xs text-muted-foreground">{pay.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-secondary text-foreground">{pay.paymentType}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm font-semibold text-foreground">{formatVND(pay.amount)}</td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground">{pay.paymentMethod ?? <span className="text-muted-foreground/50">—</span>}</td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground font-mono">{pay.paymentDate ?? "—"}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm">{pay.receivedAmount !== null ? formatVND(pay.receivedAmount) : "—"}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm text-emerald-600">{pay.changeAmount !== null ? formatVND(pay.changeAmount) : "—"}</td>
                  <td className="px-4 py-3.5"><PaymentStatusBadge status={pay.status} /></td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <button title="Xem chi tiết" onClick={() => setShowView(pay)} className="p-1.5 text-accent hover:bg-accent/10 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                      {pay.status === "UNPROCESSED" && (<>
                        <button title="Cập nhật" onClick={() => { setShowEdit(pay); setEditType(pay.paymentType); setEditAmount(String(pay.amount)); setEditMsg(null); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                        <button title="Xử lý thanh toán" onClick={() => { setShowProcess(pay); setProc2FA(false); setProcMethod("Cash"); setProcDate(new Date().toISOString().slice(0, 10)); setProcReceived(""); setProcRef(""); setProcNote(""); setProcMsg(null); }} className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"><CheckCircle2 className="w-4 h-4" /></button>
                        <button title="Hủy thanh toán" onClick={() => { setShowCancel(pay); setCancelReason(""); setCancelMsg(null); }} className="p-1.5 text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"><Ban className="w-4 h-4" /></button>
                      </>)}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Search className="w-8 h-8" /><p className="text-sm">Không tìm thấy thanh toán nào.</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CREATE PAYMENT MODAL ──────────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-[24px] w-full max-w-lg shadow-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">Tạo khoản thanh toán</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-secondary rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Booking selector */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Booking <span className="text-destructive">*</span></label>
                <select value={createBookingId} onChange={(e) => setCreateBookingId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent text-sm">
                  <option value="">-- Chọn booking --</option>
                  {BOOKING_LIST.filter((b) => b.status === "Pending" || b.status === "Confirmed" || b.status === "Ongoing").map((b) => (
                    <option key={b.id} value={b.id}>{b.id} — {b.customer} ({b.status})</option>
                  ))}
                </select>
              </div>
              {/* Read-only booking info */}
              {selectedBooking && (
                <div className="bg-secondary/60 rounded-xl p-4 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Khách:</span><span className="font-medium">{selectedBooking.customer}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">SĐT:</span><span className="font-mono">{selectedBooking.phone}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tổng booking:</span><span className="font-mono font-semibold">{formatVND(selectedBooking.total)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Số tiền cọc quy định:</span><span className="font-mono">{formatVND(selectedBooking.deposit)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Đã TT xác nhận:</span><span className="font-mono text-emerald-600">{formatVND(confirmedPaid)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Đang chờ xử lý:</span><span className="font-mono text-amber-600">{formatVND(pendingAmt)}</span></div>
                  <div className="flex justify-between border-t border-border pt-1.5"><span className="font-semibold">Còn lại:</span><span className="font-mono font-bold text-rose-600">{formatVND(remainingAmt)}</span></div>
                </div>
              )}
              {/* Payment type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Loại thanh toán <span className="text-destructive">*</span></label>
                <select value={createType} onChange={(e) => setCreateType(e.target.value as PaymentType)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent text-sm">
                  <option value="DEPOSIT">DEPOSIT — Đặt cọc</option>
                  <option value="PARTIAL_PAYMENT">PARTIAL_PAYMENT — Một phần</option>
                  <option value="FINAL_PAYMENT">FINAL_PAYMENT — Thanh toán cuối</option>
                </select>
              </div>
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Số tiền (VND) <span className="text-destructive">*</span></label>
                <input type="number" value={createAmount} onChange={(e) => setCreateAmount(e.target.value)} placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent font-mono" />
                {createType === "FINAL_PAYMENT" && selectedBooking && (
                  <button className="text-xs text-accent mt-1" onClick={() => setCreateAmount(String(remainingAmt))}>Điền tự động: {formatVND(remainingAmt)}</button>
                )}
              </div>
              <div className="text-xs text-muted-foreground bg-secondary/60 rounded-xl p-3 flex gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" />
                <span>Khoản thanh toán được tạo với trạng thái <strong>UNPROCESSED</strong>. Kế toán cần xử lý để cập nhật số dư booking.</span>
              </div>
              {createMsg && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{createMsg}</div>}
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowCreate(false)} className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-secondary">Hủy</button>
              <button onClick={handleCreate} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 flex items-center gap-2">
                <Save className="w-4 h-4" /> Tạo thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PROCESS PAYMENT MODAL ─────────────────────────────────────────────── */}
      {showProcess && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-[24px] w-full max-w-lg shadow-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">{proc2FA ? "Xác thực 2FA" : "Xử lý thanh toán"}</h2>
              <button onClick={() => { setShowProcess(null); setProc2FA(false); }} className="p-2 hover:bg-secondary rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            {!proc2FA ? (
              <div className="p-6 space-y-4">
                {/* Summary */}
                <div className="bg-secondary/60 rounded-xl p-4 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Booking:</span><span className="font-mono font-semibold text-accent">{showProcess.bookingId}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Khách:</span><span>{showProcess.customerName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Loại TT:</span><span className="font-medium">{paymentTypeLabel[showProcess.paymentType]}</span></div>
                  <div className="flex justify-between border-t border-border pt-1.5"><span className="font-semibold">Cần thu:</span><span className="font-mono font-bold text-rose-600">{formatVND(showProcess.amount)}</span></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phương thức thanh toán <span className="text-destructive">*</span></label>
                  <select value={procMethod} onChange={(e) => { setProcMethod(e.target.value as PaymentMethod); if (e.target.value !== "Cash") setProcReceived(String(showProcess.amount)); }}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent text-sm">
                    <option value="Cash">Tiền mặt</option>
                    <option value="Bank Transfer">Chuyển khoản</option>
                    <option value="Card">Thẻ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Ngày thanh toán <span className="text-destructive">*</span></label>
                  <input type="date" value={procDate} onChange={(e) => setProcDate(e.target.value)} max={new Date().toISOString().slice(0, 10)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Số tiền nhận được <span className="text-destructive">*</span></label>
                  <input type="number" value={procReceived} onChange={(e) => setProcReceived(e.target.value)}
                    disabled={procMethod !== "Cash"} placeholder="0"
                    className={`w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-accent font-mono ${procMethod !== "Cash" ? "bg-secondary text-muted-foreground cursor-not-allowed" : "bg-input-background"}`} />
                  {procMethod !== "Cash" && <p className="text-xs text-muted-foreground mt-1">Tự động bằng số cần thu với Bank Transfer / Card</p>}
                </div>
                {(procMethod === "Bank Transfer" || procMethod === "Card") && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Số tham chiếu <span className="text-destructive">*</span></label>
                    <input type="text" value={procRef} onChange={(e) => setProcRef(e.target.value)} placeholder="Mã GD / Số hóa đơn..."
                      className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                )}
                {procMethod === "Cash" && procReceived && Number(procReceived) >= showProcess.amount && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex justify-between text-sm">
                    <span className="text-emerald-800">Tiền thừa trả lại:</span>
                    <span className="font-mono font-bold text-emerald-700">{formatVND(Number(procReceived) - showProcess.amount)}</span>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Ghi chú (tuỳ chọn)</label>
                  <textarea rows={2} value={procNote} onChange={(e) => setProcNote(e.target.value)} placeholder="Ghi chú thêm..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent resize-none text-sm" />
                </div>
                {procMsg && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0" />{procMsg}</div>}
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 space-y-1.5">
                  <p className="font-semibold">Xác nhận xử lý thanh toán:</p>
                  <div className="flex justify-between"><span>Booking:</span><span className="font-mono">{showProcess.bookingId}</span></div>
                  <div className="flex justify-between"><span>Khách:</span><span>{showProcess.customerName}</span></div>
                  <div className="flex justify-between"><span>Loại:</span><span>{paymentTypeLabel[showProcess.paymentType]}</span></div>
                  <div className="flex justify-between"><span>Phương thức:</span><span>{procMethod}</span></div>
                  <div className="flex justify-between border-t border-amber-300 pt-1.5"><span className="font-semibold">Số tiền:</span><span className="font-mono font-bold">{formatVND(showProcess.amount)}</span></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Mã xác thực 2FA <span className="text-destructive">*</span></label>
                  <input type="text" value={proc2FACode} onChange={(e) => setProc2FACode(e.target.value)} placeholder="Nhập mã 6 chữ số (demo: 123456)"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent text-center text-2xl tracking-widest font-mono" maxLength={6} />
                </div>
                {procMsg && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0" />{procMsg}</div>}
              </div>
            )}
            <div className="px-6 py-4 border-t border-border flex justify-between gap-3">
              <button onClick={() => proc2FA ? setProc2FA(false) : setShowProcess(null)} className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-secondary">
                {proc2FA ? "← Quay lại" : "Hủy"}
              </button>
              <button onClick={proc2FA ? handle2FA : handleProcess} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {proc2FA ? "Xác nhận" : "Tiếp tục →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CANCEL PAYMENT MODAL ─────────────────────────────────────────────── */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-[24px] w-full max-w-md shadow-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">Hủy thanh toán</h2>
              <button onClick={() => setShowCancel(null)} className="p-2 hover:bg-secondary rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-secondary/60 rounded-xl p-4 text-sm space-y-1.5">
                <p><span className="text-muted-foreground">Mã TT:</span> <strong>{showCancel.id}</strong></p>
                <p><span className="text-muted-foreground">Khách:</span> {showCancel.customerName}</p>
                <p><span className="text-muted-foreground">Loại:</span> {showCancel.paymentType}</p>
                <p><span className="text-muted-foreground">Số tiền:</span> <strong className="font-mono">{formatVND(showCancel.amount)}</strong></p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Lý do hủy <span className="text-destructive">*</span></label>
                <textarea rows={3} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Nhập lý do hủy thanh toán..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent resize-none text-sm" />
              </div>
              {cancelMsg && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{cancelMsg}</div>}
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowCancel(null)} className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-secondary">Đóng</button>
              <button onClick={handleCancel} className="px-6 py-2.5 bg-rose-600 text-white rounded-xl text-sm hover:bg-rose-700 flex items-center gap-2">
                <Ban className="w-4 h-4" /> Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT PAYMENT MODAL ───────────────────────────────────────────────── */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-[24px] w-full max-w-md shadow-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">Cập nhật thanh toán</h2>
              <button onClick={() => setShowEdit(null)} className="p-2 hover:bg-secondary rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-secondary/60 rounded-xl p-3 text-xs text-muted-foreground flex gap-2">
                <Info className="w-4 h-4 flex-shrink-0 text-blue-500 mt-0.5" />Chỉ cập nhật được khi trạng thái = UNPROCESSED.
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Loại thanh toán</label>
                <select value={editType} onChange={(e) => setEditType(e.target.value as PaymentType)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent text-sm">
                  <option value="DEPOSIT">DEPOSIT</option>
                  <option value="PARTIAL_PAYMENT">PARTIAL_PAYMENT</option>
                  <option value="FINAL_PAYMENT">FINAL_PAYMENT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Số tiền (VND)</label>
                <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent font-mono" />
              </div>
              {editMsg && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{editMsg}</div>}
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowEdit(null)} className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-secondary">Hủy</button>
              <button onClick={handleSaveEdit} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 flex items-center gap-2">
                <Save className="w-4 h-4" /> Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW PAYMENT MODAL ───────────────────────────────────────────────── */}
      {showView && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowView(null)}>
          <div className="bg-card rounded-[24px] w-full max-w-md shadow-2xl border border-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">{showView.id}</h2>
              <PaymentStatusBadge status={showView.status} />
            </div>
            <div className="p-6 space-y-1">
              <InfoRow label="Booking" value={<span className="font-mono text-accent">{showView.bookingId}</span>} />
              <InfoRow label="Khách hàng" value={showView.customerName} />
              <InfoRow label="SĐT" value={showView.customerPhone} mono />
              <InfoRow label="Loại TT" value={<span className="px-2 py-0.5 rounded bg-secondary text-xs font-medium">{showView.paymentType}</span>} />
              <InfoRow label="Số tiền" value={formatVND(showView.amount)} mono />
              <InfoRow label="Phương thức" value={showView.paymentMethod ?? "—"} />
              <InfoRow label="Ngày TT" value={showView.paymentDate ?? "—"} mono />
              <InfoRow label="Đã nhận" value={showView.receivedAmount !== null ? formatVND(showView.receivedAmount) : "—"} mono />
              <InfoRow label="Tiền thừa" value={showView.changeAmount !== null ? formatVND(showView.changeAmount) : "—"} mono />
              <InfoRow label="Mã tham chiếu" value={showView.referenceNumber ?? "—"} />
              <InfoRow label="Ngày tạo" value={showView.createdAt.replace("T", " ").slice(0, 16)} mono />
              {showView.processedAt && <InfoRow label="Ngày xử lý" value={showView.processedAt.replace("T", " ").slice(0, 16)} mono />}
              {showView.cancelReason && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">Lý do hủy:</p>
                  <p className="text-sm text-foreground mt-1">{showView.cancelReason}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end">
              <button onClick={() => setShowView(null)} className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-secondary">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Invoice Screen ─────────────────────────────────────────────────────────────
export const InvoiceScreen = () => {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(INVOICE_LIST_INIT);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [showGenerate, setShowGenerate] = useState<InvoiceRecord | null>(null);
  const [showView, setShowView] = useState<InvoiceRecord | null>(null);

  // Create form
  const [createBookingId, setCreateBookingId] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerLegalName, setBuyerLegalName] = useState("");
  const [buyerTaxCode, setBuyerTaxCode] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  // Generate form
  const [gen2FACode, setGen2FACode] = useState("");
  const [genMsg, setGenMsg] = useState<string | null>(null);

  const completedBookings = BOOKING_LIST.filter((b) => b.status === "Completed");
  const selectedBooking = BOOKING_LIST.find((b) => b.id === createBookingId);

  const filtered = invoices.filter((inv) => {
    if (statusFilter !== "All" && inv.status !== statusFilter) return false;
    if (search && !inv.customerName.toLowerCase().includes(search.toLowerCase()) && !inv.bookingId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreateInvoice = () => {
    if (!createBookingId) { setCreateMsg("MSG 70: Chọn booking."); return; }
    if (!buyerName.trim() || !buyerAddress.trim() || !buyerEmail.trim() || !buyerPhone.trim()) { setCreateMsg("MSG 2: Điền đầy đủ thông tin bên mua."); return; }
    // Check existing invoice
    const exists = invoices.find((i) => i.bookingId === createBookingId && ["DRAFT","ISSUED","ADJUSTED"].includes(i.status));
    if (exists) { setCreateMsg("MSG 32: Đã tồn tại hóa đơn cho booking này."); return; }
    if (!selectedBooking) { setCreateMsg("Không tìm thấy booking."); return; }
    const subtotal = selectedBooking.total;
    const lines = buildMockLineItems(createBookingId, subtotal);
    const tax = lines.reduce((s, l) => s + l.taxAmount, 0);
    const total = subtotal + tax;
    const confirmedPaidForInv = payments.filter((p) => p.bookingId === createBookingId && p.status === "PROCESSED").reduce((s, p) => s + p.amount, 0);
    const invPayStatus = (confirmedPaidForInv === 0 ? "UNPAID" : confirmedPaidForInv >= total ? "PAID" : "PARTIALLY_PAID") as InvoicePaymentStatus;
    const now = new Date().toISOString();
    const newInv: InvoiceRecord = {
      id: `INV-${new Date().getFullYear()}-${String(invoices.length + 2).padStart(3, "0")}`,
      bookingId: createBookingId,
      customerName: selectedBooking.customer, customerPhone: selectedBooking.phone,
      buyerName: buyerName.trim(), buyerLegalName: buyerLegalName.trim() || "Cá nhân",
      buyerTaxCode: buyerTaxCode.trim() || null,
      buyerAddress: buyerAddress.trim(), buyerEmail: buyerEmail.trim(), buyerPhone: buyerPhone.trim(),
      subtotalAmount: subtotal, taxAmount: tax, totalAmount: total,
      paymentStatus: invPayStatus, status: "DRAFT",
      invoiceNumber: null, invoiceSymbol: null,
      createdAt: now, issuedAt: null, lastModifiedAt: now,
      lineItems: lines,
    };
    setInvoices((prev) => [newInv, ...prev]);
    setShowCreate(false);
    setCreateBookingId(""); setBuyerName(""); setBuyerLegalName(""); setBuyerTaxCode(""); setBuyerAddress(""); setBuyerEmail(""); setBuyerPhone(""); setCreateMsg(null);
  };

  const handleGenerateInvoice = () => {
    if (!gen2FACode) { setGenMsg("MSG 2: Nhập mã 2FA."); return; }
    if (gen2FACode !== "123456") { setGenMsg("MSG 56: Mã 2FA không đúng. (Demo: 123456)"); return; }
    if (!showGenerate) return;
    const now = new Date().toISOString();
    const invNum = String(Math.floor(Math.random() * 9000000 + 1000000));
    setInvoices((prev) => prev.map((i) => i.id === showGenerate.id ? {
      ...i, status: "ISSUED", invoiceNumber: invNum, invoiceSymbol: "01GTKT0/001",
      issuedAt: now, lastModifiedAt: now,
    } : i));
    setShowGenerate(null); setGen2FACode(""); setGenMsg(null);
  };

  const tabCounts: Record<string, number> = {
    All: invoices.length,
    DRAFT:  invoices.filter((i) => i.status === "DRAFT").length,
    ISSUED: invoices.filter((i) => i.status === "ISSUED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">Quản lý Hóa đơn VAT</h1>
          <p className="text-muted-foreground">Tạo, phát hành và quản lý hóa đơn điện tử cho các booking hoàn thành</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-border bg-card rounded-xl hover:bg-secondary transition-all">
            <Download className="w-4 h-4" /><span className="text-sm font-medium">Xuất</span>
          </button>
          <button onClick={() => { setShowCreate(true); setCreateMsg(null); }} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm">
            <Plus className="w-5 h-5" /> Tạo hóa đơn
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto">
        {["All", "DRAFT", "ISSUED", "ADJUSTED", "REJECTED"].map((tab) => (
          <button key={tab} onClick={() => setStatusFilter(tab)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${statusFilter === tab ? "border-accent text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {tab === "All" ? "Tất cả" : tab}
            {tabCounts[tab] !== undefined && <span className="ml-2 px-2 py-0.5 rounded-full bg-secondary text-xs">{tabCounts[tab]}</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên khách / booking..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 shadow-sm" />
      </div>

      {/* Table */}
      <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                {["Mã HĐ", "Booking / Khách", "Bên mua", "Tổng tiền (incl. VAT)", "TT Thanh toán", "Trạng thái", "Ngày tạo", "Ngày phát hành", "Hành động"].map((h) => (
                  <th key={h} className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${h === "Tổng tiền (incl. VAT)" ? "text-right" : h === "Hành động" ? "text-center" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs text-primary font-semibold whitespace-nowrap">{inv.id}</td>
                  <td className="px-4 py-3.5">
                    <p className="text-xs font-mono text-accent">{inv.bookingId}</p>
                    <p className="text-sm font-medium text-foreground">{inv.customerName}</p>
                    <p className="text-xs text-muted-foreground">{inv.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-foreground">{inv.buyerName}</p>
                    {inv.buyerTaxCode && <p className="text-xs text-muted-foreground">MST: {inv.buyerTaxCode}</p>}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <p className="font-mono font-semibold text-sm text-foreground">{formatVND(inv.totalAmount)}</p>
                    <p className="text-xs text-muted-foreground font-mono">VAT: {formatVND(inv.taxAmount)}</p>
                  </td>
                  <td className="px-4 py-3.5"><InvPayStatusBadge status={inv.paymentStatus} /></td>
                  <td className="px-4 py-3.5"><InvoiceStatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground font-mono">{inv.createdAt.slice(0, 10)}</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground font-mono">{inv.issuedAt ? inv.issuedAt.slice(0, 10) : "—"}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <button title="Xem hóa đơn" onClick={() => setShowView(inv)} className="p-1.5 text-accent hover:bg-accent/10 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                      {inv.status === "DRAFT" && (
                        <button title="Phát hành hóa đơn" onClick={() => { setShowGenerate(inv); setGen2FACode(""); setGenMsg(null); }} className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"><ExternalLink className="w-4 h-4" /></button>
                      )}
                      {inv.status === "ISSUED" && (
                        <button title="In / Tải PDF" className="p-1.5 text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"><Printer className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileText className="w-8 h-8" /><p className="text-sm">Không tìm thấy hóa đơn nào.</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CREATE INVOICE MODAL ─────────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-[24px] w-full max-w-xl shadow-2xl border border-border overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card px-6 py-4 border-b border-border flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-primary">Tạo hóa đơn VAT</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-secondary rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-xs text-muted-foreground bg-secondary/60 rounded-xl p-3 flex gap-2">
                <Info className="w-4 h-4 flex-shrink-0 text-accent mt-0.5" />
                Chỉ tạo được hóa đơn cho booking có trạng thái <strong>Completed</strong>.
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Booking <span className="text-destructive">*</span></label>
                <select value={createBookingId} onChange={(e) => { setCreateBookingId(e.target.value); const b = BOOKING_LIST.find((bk) => bk.id === e.target.value); if (b) { setBuyerName(b.customer); setBuyerPhone(b.phone); setBuyerEmail(b.email); } }}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent text-sm">
                  <option value="">-- Chọn booking Completed --</option>
                  {completedBookings.filter((b) => !invoices.find((i) => i.bookingId === b.id && ["DRAFT","ISSUED","ADJUSTED"].includes(i.status))).map((b) => (
                    <option key={b.id} value={b.id}>{b.id} — {b.customer}</option>
                  ))}
                </select>
              </div>
              {selectedBooking && (
                <div className="bg-secondary/60 rounded-xl p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Tổng booking:</span><span className="font-mono font-semibold">{formatVND(selectedBooking.total)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">VAT 10%:</span><span className="font-mono">{formatVND(Math.round(selectedBooking.total * 0.1))}</span></div>
                  <div className="flex justify-between border-t border-border pt-1.5"><span className="font-semibold">Tổng cộng:</span><span className="font-mono font-bold text-accent">{formatVND(Math.round(selectedBooking.total * 1.1))}</span></div>
                </div>
              )}
              <div className="border-t border-border pt-4">
                <p className="text-sm font-semibold text-primary mb-3">Thông tin bên mua</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Tên bên mua *", value: buyerName, setter: setBuyerName, placeholder: "Nguyễn Văn A" },
                    { label: "Tên pháp nhân", value: buyerLegalName, setter: setBuyerLegalName, placeholder: "Cá nhân / Công ty ABC" },
                    { label: "Mã số thuế", value: buyerTaxCode, setter: setBuyerTaxCode, placeholder: "0123456789 (nếu có)" },
                    { label: "Email *", value: buyerEmail, setter: setBuyerEmail, placeholder: "email@..." },
                    { label: "SĐT *", value: buyerPhone, setter: setBuyerPhone, placeholder: "09..." },
                  ].map(({ label, value, setter, placeholder }) => (
                    <div key={label} className={label.includes("Địa chỉ") ? "col-span-2" : ""}>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
                      <input value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Địa chỉ *</label>
                    <input value={buyerAddress} onChange={(e) => setBuyerAddress(e.target.value)} placeholder="Số nhà, đường, quận, thành phố..."
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
                  </div>
                </div>
              </div>
              {createMsg && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0" />{createMsg}</div>}
            </div>
            <div className="sticky bottom-0 bg-card px-6 py-4 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowCreate(false)} className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-secondary">Hủy</button>
              <button onClick={handleCreateInvoice} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 flex items-center gap-2">
                <Save className="w-4 h-4" /> Tạo hóa đơn DRAFT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GENERATE INVOICE MODAL ──────────────────────────────────────────── */}
      {showGenerate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-[24px] w-full max-w-md shadow-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">Phát hành hóa đơn</h2>
              <button onClick={() => setShowGenerate(null)} className="p-2 hover:bg-secondary rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 space-y-1.5">
                <p className="font-semibold">Xác nhận phát hành hóa đơn qua nhà cung cấp e-invoice:</p>
                <div className="flex justify-between"><span>Mã HĐ:</span><span className="font-mono">{showGenerate.id}</span></div>
                <div className="flex justify-between"><span>Booking:</span><span className="font-mono">{showGenerate.bookingId}</span></div>
                <div className="flex justify-between"><span>Bên mua:</span><span>{showGenerate.buyerName}</span></div>
                <div className="flex justify-between border-t border-amber-300 pt-1.5"><span className="font-semibold">Tổng tiền:</span><span className="font-mono font-bold">{formatVND(showGenerate.totalAmount)}</span></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Mã xác thực 2FA <span className="text-destructive">*</span></label>
                <input type="text" value={gen2FACode} onChange={(e) => setGen2FACode(e.target.value)} placeholder="Mã 6 chữ số (demo: 123456)"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent text-center text-2xl tracking-widest font-mono" maxLength={6} />
              </div>
              {genMsg && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{genMsg}</div>}
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowGenerate(null)} className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-secondary">Hủy</button>
              <button onClick={handleGenerateInvoice} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" /> Phát hành ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW INVOICE MODAL ──────────────────────────────────────────────── */}
      {showView && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setShowView(null)}>
          <div className="bg-white rounded-[24px] w-full max-w-5xl shadow-2xl border border-border my-6" onClick={(e) => e.stopPropagation()}>

            {/* ── Page header bar ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card rounded-t-[24px]">
              <div className="flex items-center gap-3">
                <InvoiceStatusBadge status={showView.status} />
                <InvPayStatusBadge status={showView.paymentStatus} />
                {showView.invoiceNumber && (
                  <span className="text-xs text-muted-foreground font-mono">Số: {showView.invoiceNumber} · KH: {showView.invoiceSymbol}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {showView.status === "ISSUED" && (
                  <button className="px-4 py-2 border border-border rounded-xl hover:bg-secondary transition-colors text-sm flex items-center gap-2">
                    <Printer className="w-4 h-4" /> In PDF
                  </button>
                )}
                <button onClick={() => setShowView(null)} className="p-2 hover:bg-secondary rounded-lg transition-colors"><X className="w-5 h-5" /></button>
              </div>
            </div>

            {/* ── Invoice paper ── */}
            <div className="p-8 space-y-6">

              {/* Title + Logo */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-[#b89851] flex items-center justify-center shadow-md">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Wedding Center JSC</p>
                    <p className="text-xs text-muted-foreground">123 Nguyễn Huệ, Phường Bến Nghé, Q.1, TP. Hồ Chí Minh</p>
                    <p className="text-xs text-muted-foreground">MST: 0123456789 · ĐT: (028) 1234 5678 · Email: billing@wedding.vn</p>
                  </div>
                </div>
                <div className="text-right">
                  <h1 className="text-3xl font-bold tracking-tight text-primary">HÓA ĐƠN</h1>
                  <p className="text-base font-semibold text-accent">GIÁ TRỊ GIA TĂNG</p>
                  <p className="text-xs text-muted-foreground mt-1">(VAT Invoice)</p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">{showView.id}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    Ngày: {showView.issuedAt ? showView.issuedAt.slice(0,10).split("-").reverse().join("/") : showView.createdAt.slice(0,10).split("-").reverse().join("/")}
                  </p>
                </div>
              </div>

              {/* Seller / Buyer */}
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-secondary/50 rounded-2xl p-4 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-primary inline-block" /> ĐƠN VỊ BÁN HÀNG
                  </p>
                  <p className="text-sm font-semibold text-foreground">Công ty TNHH Wedding Center</p>
                  <p className="text-xs text-muted-foreground">Địa chỉ: 123 Nguyễn Huệ, P. Bến Nghé, Q. 1, TP. HCM</p>
                  <p className="text-xs text-muted-foreground">MST: <strong className="text-foreground font-mono">0123456789</strong></p>
                  <p className="text-xs text-muted-foreground">Tài khoản: <strong className="text-foreground font-mono">0123 4567 89</strong> — Vietcombank CN. Q.1</p>
                  <p className="text-xs text-muted-foreground">ĐT: (028) 1234 5678 · billing@wedding.vn</p>
                </div>
                <div className="bg-secondary/50 rounded-2xl p-4 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-accent inline-block" /> ĐƠN VỊ MUA HÀNG
                  </p>
                  <p className="text-sm font-semibold text-foreground">{showView.buyerName}</p>
                  <p className="text-xs text-muted-foreground">Pháp nhân: {showView.buyerLegalName}</p>
                  <p className="text-xs text-muted-foreground">Địa chỉ: {showView.buyerAddress}</p>
                  {showView.buyerTaxCode && <p className="text-xs text-muted-foreground">MST: <strong className="text-foreground font-mono">{showView.buyerTaxCode}</strong></p>}
                  <p className="text-xs text-muted-foreground">Email: {showView.buyerEmail}</p>
                  <p className="text-xs text-muted-foreground">ĐT: {showView.buyerPhone}</p>
                </div>
              </div>

              {/* Booking reference */}
              <div className="flex items-center gap-6 px-4 py-3 bg-accent/8 border border-accent/20 rounded-xl text-sm">
                <span className="text-muted-foreground">Booking tham chiếu:</span><span className="font-mono font-semibold text-accent">{showView.bookingId}</span>
                <span className="text-muted-foreground">Khách hàng:</span><span className="font-medium">{showView.customerName}</span>
                <span className="text-muted-foreground">SĐT:</span><span className="font-mono">{showView.customerPhone}</span>
              </div>

              {/* Line items */}
              {showView.lineItems && showView.lineItems.length > 0 ? (
                <InvoiceLineTable items={showView.lineItems} />
              ) : (
                <div className="border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Chi tiết dòng hàng sẽ hiển thị sau khi snapshot dữ liệu được tạo.</p>
                </div>
              )}

              {/* Payment summary */}
              <div className="border border-border rounded-xl overflow-hidden text-sm">
                <div className="bg-secondary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tình trạng thanh toán</div>
                <div className="p-4 grid grid-cols-4 gap-4">
                  {[
                    { label: "Tổng hóa đơn", val: formatVND(showView.totalAmount), cls: "text-primary font-bold" },
                    { label: "Đã thanh toán", val: formatVND(showView.subtotalAmount), cls: "text-emerald-600" },
                    { label: "Còn lại (VAT)", val: formatVND(showView.taxAmount), cls: "text-rose-600" },
                    { label: "Trạng thái", val: <InvPayStatusBadge status={showView.paymentStatus} />, cls: "" },
                  ].map(({ label, val, cls }) => (
                    <div key={label} className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">{label}</p>
                      <p className={`font-mono font-semibold ${cls}`}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="text-xs text-muted-foreground space-y-1 border-t border-dashed border-border pt-4">
                <p>• Hóa đơn có giá trị từ ngày phát hành. Vui lòng thanh toán phần VAT còn lại trong vòng <strong>7 ngày</strong> kể từ ngày phát hành.</p>
                <p>• Chuyển khoản: <strong>0123 456 789</strong> — Vietcombank CN. Quận 1, TP.HCM — Nội dung: <strong>{showView.id}</strong></p>
                <p>• Hóa đơn điện tử được ký số và gửi qua nhà cung cấp hóa đơn điện tử theo quy định của Bộ Tài chính.</p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="text-center space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Người mua hàng</p>
                  <p className="text-xs text-muted-foreground">(Ký, ghi rõ họ tên)</p>
                  <div className="h-14 border-b border-dashed border-border mt-4" />
                  <p className="text-xs text-muted-foreground font-medium">{showView.buyerName}</p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Người bán hàng</p>
                  <p className="text-xs text-muted-foreground">(Ký, đóng dấu)</p>
                  <div className="h-14 border-b border-dashed border-border mt-4" />
                  <p className="text-xs text-muted-foreground font-medium">Kế toán trưởng — Wedding Center JSC</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
