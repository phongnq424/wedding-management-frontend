import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
} from "lucide-react";
import { formatVND } from "../../../utils";
import { bookingService } from "../../../services/booking.service";
import { invoiceService } from "../../../services/invoice.service";
import type { BookingResponse } from "../../../dto/booking.dto";
import type {
  InvoiceBuyerRequestPayload,
  InvoicePaymentStatusApi,
  InvoiceResponse,
  InvoiceSearchParams,
  InvoiceStatusApi,
} from "../../../dto/invoice.dto";
import {
  ActionBtn,
  EmptyState,
  InfoRow,
  InvoicePaymentStatusBadge,
  InvoiceStatusBadge,
  LoadingTable,
  ModalShell,
  Toast,
} from "./FinanceShared";
import { InvoiceLineTable } from "./InvoiceLineTable";
import type { InvoiceModalMode, ToastState } from "./finance.types";
import { fmtDateTime } from "./finance.utils";

type InvoiceFilterState = {
  invoiceId: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  buyerName: string;
  buyerLegalName: string;
  buyerTaxCode: string;
  invoiceNumber: string;
  invoiceSymbol: string;
  taxAuthorityCode: string;
  issuedDateFrom: string;
  issuedDateTo: string;
  totalAmountFrom: string;
  totalAmountTo: string;
  paymentStatus: InvoicePaymentStatusApi | "";
  status: InvoiceStatusApi | "";
};

type BuyerFormState = {
  bookingId: string;
  buyerName: string;
  buyerLegalName: string;
  buyerTaxCode: string;
  buyerAddress: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerBankAccount: string;
  buyerBankName: string;
};

const EMPTY_FILTERS: InvoiceFilterState = {
  invoiceId: "",
  bookingId: "",
  customerName: "",
  customerPhone: "",
  buyerName: "",
  buyerLegalName: "",
  buyerTaxCode: "",
  invoiceNumber: "",
  invoiceSymbol: "",
  taxAuthorityCode: "",
  issuedDateFrom: "",
  issuedDateTo: "",
  totalAmountFrom: "",
  totalAmountTo: "",
  paymentStatus: "",
  status: "",
};

const EMPTY_BUYER_FORM: BuyerFormState = {
  bookingId: "",
  buyerName: "",
  buyerLegalName: "",
  buyerTaxCode: "",
  buyerAddress: "",
  buyerEmail: "",
  buyerPhone: "",
  buyerBankAccount: "",
  buyerBankName: "",
};

const INVOICE_STATUS_TABS: Array<{ label: string; value: InvoiceStatusApi | "" }> = [
  { label: "Tất cả", value: "" },
  { label: "Bản nháp", value: "DRAFT" },
  { label: "Đã phát hành", value: "ISSUED" },
  { label: "Bị từ chối", value: "REJECTED" },
  { label: "Đã hủy", value: "CANCELLED" },
];

function isInvoiceBookingEligible(booking: BookingResponse) {
  return booking.status === "COMPLETED";
}

function buyerPayloadFromForm(form: BuyerFormState): InvoiceBuyerRequestPayload {
  return {
    buyerName: form.buyerName.trim(),
    buyerLegalName: form.buyerLegalName.trim() || null,
    buyerTaxCode: form.buyerTaxCode.trim() || null,
    buyerAddress: form.buyerAddress.trim(),
    buyerEmail: form.buyerEmail.trim() || null,
    buyerPhone: form.buyerPhone.trim(),
    buyerBankAccount: form.buyerBankAccount.trim() || null,
    buyerBankName: form.buyerBankName.trim() || null,
  };
}

export function InvoiceScreen() {
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [filters, setFilters] = useState<InvoiceFilterState>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [modal, setModal] = useState<InvoiceModalMode>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const [buyerForm, setBuyerForm] = useState<BuyerFormState>(EMPTY_BUYER_FORM);
  const [generateCode, setGenerateCode] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const eligibleBookings = useMemo(
    () => bookings.filter(isInvoiceBookingEligible),
    [bookings]
  );

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === buyerForm.bookingId) ?? null,
    [bookings, buyerForm.bookingId]
  );

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  function buildSearchParams(nextPage = page, sourceFilters: InvoiceFilterState = filters): InvoiceSearchParams {
    return {
      invoiceId: sourceFilters.invoiceId.trim() || undefined,
      bookingId: sourceFilters.bookingId.trim() || undefined,
      customerName: sourceFilters.customerName.trim() || undefined,
      customerPhone: sourceFilters.customerPhone.trim() || undefined,
      buyerName: sourceFilters.buyerName.trim() || undefined,
      buyerLegalName: sourceFilters.buyerLegalName.trim() || undefined,
      buyerTaxCode: sourceFilters.buyerTaxCode.trim() || undefined,
      invoiceNumber: sourceFilters.invoiceNumber.trim() || undefined,
      invoiceSymbol: sourceFilters.invoiceSymbol.trim() || undefined,
      taxAuthorityCode: sourceFilters.taxAuthorityCode.trim() || undefined,
      issuedDateFrom: sourceFilters.issuedDateFrom || undefined,
      issuedDateTo: sourceFilters.issuedDateTo || undefined,
      totalAmountFrom: sourceFilters.totalAmountFrom || undefined,
      totalAmountTo: sourceFilters.totalAmountTo || undefined,
      paymentStatus: sourceFilters.paymentStatus || undefined,
      status: sourceFilters.status || undefined,
      page: nextPage,
      size: 20,
    };
  }

  async function loadBookings() {
    const data = await bookingService.getAll();
    setBookings(data);
  }

  async function loadInvoices(nextPage = page, sourceFilters: InvoiceFilterState = filters) {
    try {
      setLoading(true);
      const result = await invoiceService.search(buildSearchParams(nextPage, sourceFilters));
      setInvoices(result.content ?? []);
      setPage(result.number ?? nextPage);
      setTotalPages(result.totalPages ?? 0);
      setTotalElements(result.totalElements ?? 0);
      setHasLoaded(true);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Cannot load invoices.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setLoading(true);
        const [bookingData, invoicePage] = await Promise.all([
          bookingService.getAll(),
          invoiceService.search({ page: 0, size: 20 }),
        ]);

        if (cancelled) return;

        setBookings(bookingData);
        setInvoices(invoicePage.content ?? []);
        setPage(invoicePage.number ?? 0);
        setTotalPages(invoicePage.totalPages ?? 0);
        setTotalElements(invoicePage.totalElements ?? 0);
        setHasLoaded(true);
      } catch (error) {
        if (!cancelled) {
          showToast(error instanceof Error ? error.message : "Cannot load invoices.", "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  function resetCreateModal() {
    setBuyerForm(EMPTY_BUYER_FORM);
    setFormError(null);
    setModal({ type: "create" });
    loadBookings().catch(() => undefined);
  }

  function openEdit(invoice: InvoiceResponse) {
    setBuyerForm({
      bookingId: invoice.bookingId,
      buyerName: invoice.buyerName ?? "",
      buyerLegalName: invoice.buyerLegalName ?? "",
      buyerTaxCode: invoice.buyerTaxCode ?? "",
      buyerAddress: invoice.buyerAddress ?? "",
      buyerEmail: invoice.buyerEmail ?? "",
      buyerPhone: invoice.buyerPhone ?? "",
      buyerBankAccount: invoice.buyerBankAccount ?? "",
      buyerBankName: invoice.buyerBankName ?? "",
    });
    setFormError(null);
    setModal({ type: "edit", invoice });
  }

  function openGenerate(invoice: InvoiceResponse) {
    setGenerateCode("");
    setFormError(null);
    setModal({ type: "generate", invoice });
  }

  function openCancel(invoice: InvoiceResponse) {
    setCancelReason("");
    setFormError(null);
    setModal({ type: "cancel", invoice });
  }

  function validateBuyerForm(form: BuyerFormState) {
    if (!form.buyerName.trim() || !form.buyerAddress.trim() || !form.buyerPhone.trim()) {
      return "MSG2: Vui lòng nhập đủ tên người mua, địa chỉ và số điện thoại.";
    }

    if (form.buyerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.buyerEmail.trim())) {
      return "MSG31: Email người mua không hợp lệ.";
    }

    if (!/^[0-9+\-\s]{8,15}$/.test(form.buyerPhone.trim())) {
      return "MSG30: Số điện thoại người mua không hợp lệ.";
    }

    if (form.buyerTaxCode.trim() && !/^[0-9A-Za-z-]{5,20}$/.test(form.buyerTaxCode.trim())) {
      return "MSG71: Mã số thuế không hợp lệ.";
    }

    return null;
  }

  async function handleCreateInvoice() {
    if (!buyerForm.bookingId) {
      setFormError("MSG70: Vui lòng chọn booking hoàn thành để tạo hóa đơn.");
      return;
    }

    const error = validateBuyerForm(buyerForm);
    if (error) {
      setFormError(error);
      return;
    }

    try {
      setSaving(true);
      await invoiceService.createDraft({
        bookingId: buyerForm.bookingId,
        ...buyerPayloadFromForm(buyerForm),
      });
      showToast("MSG48: Tạo hóa đơn nháp thành công.");
      setModal(null);
      await loadInvoices(0);
      await loadBookings();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "MSG50: Không thể tạo hóa đơn.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateInvoice(invoice: InvoiceResponse) {
    if (!["DRAFT", "REJECTED"].includes(invoice.status)) {
      setFormError("MSG28: Chỉ hóa đơn DRAFT hoặc REJECTED mới được cập nhật.");
      return;
    }

    if (!invoice.lastModifiedAt) {
      setFormError("MSG62: Thiếu lastModifiedAt. Vui lòng tải lại dữ liệu.");
      return;
    }

    const error = validateBuyerForm(buyerForm);
    if (error) {
      setFormError(error);
      return;
    }

    try {
      setSaving(true);
      await invoiceService.update(invoice.id, buyerPayloadFromForm(buyerForm), invoice.lastModifiedAt);
      showToast("MSG17: Cập nhật hóa đơn thành công.");
      setModal(null);
      await loadInvoices(page);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "MSG16: Không thể cập nhật hóa đơn.");
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateInvoice(invoice: InvoiceResponse) {
    if (invoice.status !== "DRAFT") {
      setFormError("MSG72: Chỉ hóa đơn DRAFT mới được phát hành.");
      return;
    }

    if (!generateCode.trim()) {
      setFormError("MSG2: Vui lòng nhập mã xác thực 2FA.");
      return;
    }

    try {
      setSaving(true);
      await invoiceService.generate(invoice.id, { inputCode: generateCode.trim() });
      showToast("MSG17: Phát hành hóa đơn thành công.");
      setModal(null);
      await loadInvoices(page);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "MSG16: Không thể phát hành hóa đơn.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelInvoice(invoice: InvoiceResponse) {
    if (!["DRAFT", "REJECTED"].includes(invoice.status)) {
      setFormError("MSG67: Chỉ hóa đơn DRAFT hoặc REJECTED mới được hủy.");
      return;
    }

    if (!cancelReason.trim()) {
      setFormError("MSG2: Vui lòng nhập lý do hủy.");
      return;
    }

    try {
      setSaving(true);
      await invoiceService.cancel(invoice.id, { reason: cancelReason.trim() });
      showToast("MSG20: Hủy hóa đơn thành công.");
      setModal(null);
      await loadInvoices(page);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "MSG21: Không thể hủy hóa đơn.");
    } finally {
      setSaving(false);
    }
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS);
    loadInvoices(0, EMPTY_FILTERS);
  }

  function handleSearch() {
    loadInvoices(0);
  }

  const statusCounts = useMemo(() => {
    const map: Record<string, number> = { "": totalElements };
    for (const status of ["DRAFT", "ISSUED", "REJECTED", "CANCELLED"] as InvoiceStatusApi[]) {
      map[status] = invoices.filter((item) => item.status === status).length;
    }
    return map;
  }, [invoices, totalElements]);

  const tableContent = () => {
    if (loading) return <LoadingTable columns={10} />;
    if (hasLoaded && invoices.length === 0) {
      return (
        <EmptyState
          icon="invoice"
          title="Không tìm thấy hóa đơn"
          description="Không có invoice nào khớp với bộ lọc hiện tại."
        />
      );
    }

    return (
      <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                {["Mã HĐ", "Booking / Khách", "Người mua", "Số HĐ", "Tổng tiền", "Thanh toán", "Trạng thái", "Ngày tạo", "Ngày phát hành", "Hành động"].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${
                      h === "Tổng tiền" ? "text-right" : h === "Hành động" ? "text-center" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs text-primary font-semibold whitespace-nowrap">
                    {invoice.id}
                  </td>
                  <td className="px-4 py-3.5 min-w-[220px]">
                    <p className="text-xs font-mono text-accent truncate">{invoice.bookingId}</p>
                    <p className="text-sm font-medium text-foreground truncate">{invoice.customerName ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{invoice.customerPhone ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3.5 min-w-[200px]">
                    <p className="text-sm font-medium text-foreground truncate">{invoice.buyerName ?? "—"}</p>
                    <p className="text-xs text-muted-foreground truncate">{invoice.buyerTaxCode ?? invoice.buyerPhone ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground font-mono whitespace-nowrap">
                    {invoice.invoiceNumber ?? "—"}
                    {invoice.invoiceSymbol && <p className="text-xs">{invoice.invoiceSymbol}</p>}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm font-semibold text-foreground">
                    {formatVND(invoice.totalAmount ?? 0)}
                  </td>
                  <td className="px-4 py-3.5">
                    <InvoicePaymentStatusBadge status={invoice.paymentStatus} />
                  </td>
                  <td className="px-4 py-3.5">
                    <InvoiceStatusBadge status={invoice.status} />
                  </td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground font-mono whitespace-nowrap">
                    {fmtDateTime(invoice.createdAt)}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground font-mono whitespace-nowrap">
                    {fmtDateTime(invoice.issuedAt)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <ActionBtn title="Xem chi tiết" colorClass="text-accent hover:bg-accent/10" onClick={() => setModal({ type: "view", invoice })}>
                        <Eye className="w-4 h-4" />
                      </ActionBtn>
                      {invoice.status === "DRAFT" || invoice.status === "REJECTED" ? (
                        <>
                          <ActionBtn title="Cập nhật" colorClass="text-blue-600 hover:bg-blue-50" onClick={() => openEdit(invoice)}>
                            <Edit className="w-4 h-4" />
                          </ActionBtn>
                          <ActionBtn title="Phát hành hóa đơn" colorClass="text-emerald-700 hover:bg-emerald-50" onClick={() => openGenerate(invoice)}>
                            <Send className="w-4 h-4" />
                          </ActionBtn>
                          <ActionBtn title="Hủy hóa đơn" colorClass="text-rose-700 hover:bg-rose-50" onClick={() => openCancel(invoice)}>
                            <Ban className="w-4 h-4" />
                          </ActionBtn>
                        </>
                      ) : null}
                      {invoice.status === "ISSUED" && invoice.pdfUrl && (
                        <ActionBtn title="Tải PDF" colorClass="text-primary hover:bg-primary/10" onClick={() => window.open(invoice.pdfUrl!, "_blank")}>
                          <ExternalLink className="w-4 h-4" />
                        </ActionBtn>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Toast toast={toast} />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">Quản lý Hóa đơn VAT</h1>
          <p className="text-muted-foreground">Tạo, cập nhật, phát hành và quản lý hóa đơn điện tử cho booking hoàn thành</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2.5 border border-border bg-card rounded-xl hover:bg-secondary transition-all"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">{showFilters ? "Ẩn" : "Hiện"} lọc</span>
          </button>
          <button
            type="button"
            onClick={() => showToast("Chức năng xuất file sẽ dùng API export nếu backend bổ sung.")}
            className="flex items-center gap-2 px-4 py-2.5 border border-border bg-card rounded-xl hover:bg-secondary transition-all"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Xuất</span>
          </button>
          <button
            type="button"
            onClick={resetCreateModal}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Tạo hóa đơn
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border overflow-x-auto">
        {INVOICE_STATUS_TABS.map((tab) => (
          <button
            key={tab.value || "ALL"}
            type="button"
            onClick={() => {
              const nextFilters = { ...filters, status: tab.value };
              setFilters(nextFilters);
              loadInvoices(0, nextFilters);
            }}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              filters.status === tab.value
                ? "border-accent text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <span className="ml-2 px-2 py-0.5 rounded-full bg-secondary text-xs">
              {statusCounts[tab.value] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {showFilters && (
        <div className="bg-card rounded-[20px] p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-primary">Lọc & Tìm kiếm</h3>
            <button type="button" onClick={resetFilters} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Mã hóa đơn", key: "invoiceId", placeholder: "UUID / INV..." },
              { label: "Mã booking", key: "bookingId", placeholder: "UUID booking" },
              { label: "Tên khách", key: "customerName", placeholder: "Tên khách..." },
              { label: "SĐT khách", key: "customerPhone", placeholder: "09..." },
              { label: "Tên người mua", key: "buyerName", placeholder: "Người mua..." },
              { label: "Tên pháp lý", key: "buyerLegalName", placeholder: "Công ty..." },
              { label: "MST", key: "buyerTaxCode", placeholder: "031..." },
              { label: "Số hóa đơn", key: "invoiceNumber", placeholder: "000..." },
              { label: "Ký hiệu", key: "invoiceSymbol", placeholder: "01GTKT..." },
              { label: "Mã CQT", key: "taxAuthorityCode", placeholder: "CQT..." },
              { label: "Tổng tiền từ", key: "totalAmountFrom", placeholder: "0", type: "number" },
              { label: "Tổng tiền đến", key: "totalAmountTo", placeholder: "0", type: "number" },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
                <input
                  type={type ?? "text"}
                  value={(filters as any)[key]}
                  onChange={(e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Trạng thái thanh toán</label>
              <select
                value={filters.paymentStatus}
                onChange={(e) => setFilters((prev) => ({ ...prev, paymentStatus: e.target.value as InvoicePaymentStatusApi | "" }))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                <option value="">Tất cả</option>
                <option value="UNPAID">Chưa thanh toán</option>
                <option value="PARTIALLY_PAID">Thanh toán một phần</option>
                <option value="PAID">Đã thanh toán</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Ngày phát hành từ</label>
              <input
                type="date"
                value={filters.issuedDateFrom}
                onChange={(e) => setFilters((prev) => ({ ...prev, issuedDateFrom: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Đến</label>
              <input
                type="date"
                value={filters.issuedDateTo}
                onChange={(e) => setFilters((prev) => ({ ...prev, issuedDateTo: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-muted-foreground">
              {loading ? "Đang tìm kiếm..." : `${totalElements} kết quả`}
            </p>
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              Tìm kiếm
            </button>
          </div>
        </div>
      )}

      {tableContent()}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={page <= 0 || loading}
            onClick={() => loadInvoices(page - 1)}
            className="px-4 py-2 rounded-xl border border-border bg-card text-sm disabled:opacity-50"
          >
            Trang trước
          </button>
          <span className="text-sm text-muted-foreground">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page + 1 >= totalPages || loading}
            onClick={() => loadInvoices(page + 1)}
            className="px-4 py-2 rounded-xl border border-border bg-card text-sm disabled:opacity-50"
          >
            Trang sau
          </button>
        </div>
      )}

      {(modal?.type === "create" || modal?.type === "edit") && (
        <ModalShell
          title={modal.type === "create" ? "Tạo hóa đơn nháp" : "Cập nhật hóa đơn"}
          onClose={() => setModal(null)}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setModal(null)} className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-secondary">
                Hủy
              </button>
              <button
                type="button"
                onClick={() =>
                  modal.type === "create"
                    ? handleCreateInvoice()
                    : handleUpdateInvoice(modal.invoice)
                }
                disabled={saving}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Đang lưu..." : modal.type === "create" ? "Tạo hóa đơn" : "Cập nhật"}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            {modal.type === "create" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Booking hoàn thành *</label>
                <select
                  value={buyerForm.bookingId}
                  onChange={(e) => setBuyerForm((prev) => ({ ...prev, bookingId: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                >
                  <option value="">-- Chọn booking --</option>
                  {eligibleBookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      {booking.customerName} · {booking.customerPhone} · {formatVND(booking.bookingAmount ?? 0)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedBooking && modal.type === "create" && (
              <div className="bg-secondary/60 rounded-xl p-4 space-y-1.5 text-sm">
                <InfoRow label="Booking ID" value={selectedBooking.id} mono />
                <InfoRow label="Khách" value={selectedBooking.customerName} />
                <InfoRow label="SĐT" value={selectedBooking.customerPhone} mono />
                <InfoRow label="Tổng booking" value={formatVND(selectedBooking.bookingAmount ?? 0)} mono />
                <InfoRow label="Đã thanh toán" value={formatVND(selectedBooking.confirmedPaymentAmount ?? 0)} mono />
                <InfoRow label="Còn lại" value={formatVND(selectedBooking.remainingAmount ?? 0)} mono />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tên người mua *</label>
                <input
                  value={buyerForm.buyerName}
                  onChange={(e) => setBuyerForm((prev) => ({ ...prev, buyerName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tên pháp lý</label>
                <input
                  value={buyerForm.buyerLegalName}
                  onChange={(e) => setBuyerForm((prev) => ({ ...prev, buyerLegalName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Mã số thuế</label>
                <input
                  value={buyerForm.buyerTaxCode}
                  onChange={(e) => setBuyerForm((prev) => ({ ...prev, buyerTaxCode: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Số điện thoại *</label>
                <input
                  value={buyerForm.buyerPhone}
                  onChange={(e) => setBuyerForm((prev) => ({ ...prev, buyerPhone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  value={buyerForm.buyerEmail}
                  onChange={(e) => setBuyerForm((prev) => ({ ...prev, buyerEmail: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Số tài khoản</label>
                <input
                  value={buyerForm.buyerBankAccount}
                  onChange={(e) => setBuyerForm((prev) => ({ ...prev, buyerBankAccount: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tên ngân hàng</label>
                <input
                  value={buyerForm.buyerBankName}
                  onChange={(e) => setBuyerForm((prev) => ({ ...prev, buyerBankName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Địa chỉ *</label>
                <textarea
                  rows={2}
                  value={buyerForm.buyerAddress}
                  onChange={(e) => setBuyerForm((prev) => ({ ...prev, buyerAddress: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>
            </div>

            {modal.type === "edit" && (
              <div className="text-xs text-muted-foreground bg-secondary/60 rounded-xl p-3 flex gap-2">
                <FileText className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" />
                Cập nhật hóa đơn chỉ sửa thông tin người mua. Dòng hóa đơn snapshot không bị tính lại từ booking/package hiện tại.
              </div>
            )}

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {formError}
              </div>
            )}
          </div>
        </ModalShell>
      )}

      {modal?.type === "generate" && (
        <ModalShell
          title="Phát hành hóa đơn"
          onClose={() => setModal(null)}
          footer={
            <div className="flex justify-between gap-3">
              <button type="button" onClick={() => setModal(null)} className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-secondary">
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleGenerateInvoice(modal.invoice)}
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {saving ? "Đang phát hành..." : "Xác nhận phát hành"}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 space-y-1.5">
              <p className="font-semibold">Xác nhận phát hành hóa đơn:</p>
              <InfoRow label="Booking" value={modal.invoice.bookingId} mono />
              <InfoRow label="Khách" value={modal.invoice.customerName ?? "—"} />
              <InfoRow label="Người mua" value={modal.invoice.buyerName ?? "—"} />
              <InfoRow label="Tổng tiền" value={formatVND(modal.invoice.totalAmount ?? 0)} mono />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Mã xác thực 2FA *</label>
              <input
                value={generateCode}
                onChange={(e) => setGenerateCode(e.target.value)}
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent text-center text-2xl tracking-widest font-mono"
              />
            </div>
            {formError && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{formError}</div>}
          </div>
        </ModalShell>
      )}

      {modal?.type === "cancel" && (
        <ModalShell
          title="Hủy hóa đơn"
          onClose={() => setModal(null)}
          footer={
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setModal(null)} className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-secondary">
                Đóng
              </button>
              <button
                type="button"
                onClick={() => handleCancelInvoice(modal.invoice)}
                disabled={saving}
                className="px-6 py-2.5 bg-rose-600 text-white rounded-xl text-sm hover:bg-rose-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Ban className="w-4 h-4" />
                {saving ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="bg-secondary/60 rounded-xl p-4 space-y-1.5 text-sm">
              <InfoRow label="Invoice" value={modal.invoice.id} mono />
              <InfoRow label="Booking" value={modal.invoice.bookingId} mono />
              <InfoRow label="Khách" value={modal.invoice.customerName ?? "—"} />
              <InfoRow label="Người mua" value={modal.invoice.buyerName ?? "—"} />
              <InfoRow label="Tổng tiền" value={formatVND(modal.invoice.totalAmount ?? 0)} mono />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Lý do hủy *</label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent resize-none text-sm"
              />
            </div>
            {formError && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{formError}</div>}
          </div>
        </ModalShell>
      )}

      {modal?.type === "view" && (
        <ModalShell title={modal.invoice.id} onClose={() => setModal(null)} maxWidth="max-w-6xl">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-secondary/60 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-primary">Thông tin hóa đơn</p>
                  <InvoiceStatusBadge status={modal.invoice.status} />
                </div>
                <InfoRow label="Số HĐ" value={modal.invoice.invoiceNumber ?? "—"} mono />
                <InfoRow label="Ký hiệu" value={modal.invoice.invoiceSymbol ?? "—"} mono />
                <InfoRow label="Mã CQT" value={modal.invoice.taxAuthorityCode ?? "—"} mono />
                <InfoRow label="Ngày phát hành" value={fmtDateTime(modal.invoice.issuedAt)} mono />
              </div>
              <div className="bg-secondary/60 rounded-xl p-4 space-y-1.5">
                <p className="text-sm font-semibold text-primary mb-2">Booking</p>
                <InfoRow label="Booking" value={modal.invoice.bookingId} mono />
                <InfoRow label="Khách" value={modal.invoice.customerName ?? "—"} />
                <InfoRow label="SĐT" value={modal.invoice.customerPhone ?? "—"} mono />
                <InfoRow label="Ngày cưới" value={modal.invoice.weddingDate ?? "—"} mono />
              </div>
              <div className="bg-secondary/60 rounded-xl p-4 space-y-1.5">
                <p className="text-sm font-semibold text-primary mb-2">Người mua</p>
                <InfoRow label="Tên" value={modal.invoice.buyerName ?? "—"} />
                <InfoRow label="Pháp lý" value={modal.invoice.buyerLegalName ?? "—"} />
                <InfoRow label="MST" value={modal.invoice.buyerTaxCode ?? "—"} mono />
                <InfoRow label="Thanh toán" value={<InvoicePaymentStatusBadge status={modal.invoice.paymentStatus} />} />
              </div>
            </div>

            <InvoiceLineTable lines={modal.invoice.lines ?? []} />

            {modal.invoice.pdfUrl && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => window.open(modal.invoice.pdfUrl!, "_blank")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90"
                >
                  <ExternalLink className="w-4 h-4" />
                  Mở PDF
                </button>
              </div>
            )}
          </div>
        </ModalShell>
      )}
    </div>
  );
}
