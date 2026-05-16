import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  CreditCard,
  Download,
  Edit,
  Eye,
  Filter,
  Info,
  Plus,
  RefreshCw,
  Save,
  Search,
} from "lucide-react";
import { formatVND } from "../../../utils";
import { bookingService } from "../../../services/booking.service";
import { paymentService } from "../../../services/payment.service";
import type { BookingResponse } from "../../../dto/booking.dto";
import type {
  PaymentMethodApi,
  PaymentResponse,
  PaymentSearchParams,
  PaymentStatusApi,
  PaymentTypeApi,
} from "../../../dto/payment.dto";
import {
  ActionBtn,
  EmptyState,
  InfoRow,
  LoadingTable,
  ModalShell,
  PaymentStatusBadge,
  Toast,
} from "./FinanceShared";
import type { PaymentModalMode, ToastState } from "./finance.types";
import {
  fmtDateTime,
  parseMoney,
  PAYMENT_METHOD_LABEL,
  PAYMENT_TYPE_LABEL,
  todayDate,
} from "./finance.utils";

type PaymentFilterState = {
  paymentId: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  paymentType: PaymentTypeApi | "";
  paymentMethod: PaymentMethodApi | "";
  status: PaymentStatusApi | "";
  paymentDateFrom: string;
  paymentDateTo: string;
  amountFrom: string;
  amountTo: string;
  referenceNumber: string;
};

type CreateFormState = {
  bookingId: string;
  paymentType: PaymentTypeApi;
  amount: string;
};

type EditFormState = {
  paymentType: PaymentTypeApi;
  amount: string;
};

type ProcessFormState = {
  paymentMethod: PaymentMethodApi;
  paymentDate: string;
  referenceNumber: string;
  receivedAmount: string;
  note: string;

  mfaChallengeId: string;
  otpEmail: string;
  otpExpiresInSeconds: number | null;
  inputCode: string;

  step: "DETAIL" | "TWO_FA";
};

const EMPTY_FILTERS: PaymentFilterState = {
  paymentId: "",
  bookingId: "",
  customerName: "",
  customerPhone: "",
  paymentType: "",
  paymentMethod: "",
  status: "",
  paymentDateFrom: "",
  paymentDateTo: "",
  amountFrom: "",
  amountTo: "",
  referenceNumber: "",
};

const PAYMENT_STATUS_TABS: Array<{ label: string; value: PaymentStatusApi | "" }> = [
  { label: "Tất cả", value: "" },
  { label: "Chưa xử lý", value: "UNPROCESSED" },
  { label: "Đã xử lý", value: "PROCESSED" },
  { label: "Đã hủy", value: "CANCELLED" },
  { label: "Bị từ chối", value: "REJECTED" },
  { label: "Thất bại", value: "FAILED" },
];

function isPaymentBookingEligible(booking: BookingResponse) {
  return ["PENDING", "CONFIRMED", "ONGOING"].includes(booking.status);
}

function getBookingRemaining(booking: BookingResponse | null) {
  return Math.max(booking?.remainingAmount ?? 0, 0);
}

function getBookingDeposit(booking: BookingResponse | null) {
  return Math.max(booking?.depositAmount ?? 0, 0);
}

export function PaymentScreen() {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [filters, setFilters] = useState<PaymentFilterState>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [modal, setModal] = useState<PaymentModalMode>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const [createForm, setCreateForm] = useState<CreateFormState>({
    bookingId: "",
    paymentType: "DEPOSIT",
    amount: "",
  });

  const [editForm, setEditForm] = useState<EditFormState>({
    paymentType: "DEPOSIT",
    amount: "",
  });

  const [processForm, setProcessForm] = useState<ProcessFormState>({
    paymentMethod: "CASH",
    paymentDate: todayDate(),
    referenceNumber: "",
    receivedAmount: "",
    note: "",
    mfaChallengeId: "",
    otpEmail: "",
    otpExpiresInSeconds: null,
    inputCode: "",
    step: "DETAIL",
  });

  const [cancelReason, setCancelReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const selectedCreateBooking = useMemo(
    () => bookings.find((item) => item.id === createForm.bookingId) ?? null,
    [bookings, createForm.bookingId]
  );

  const eligibleBookings = useMemo(
    () => bookings.filter(isPaymentBookingEligible),
    [bookings]
  );

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  async function loadBookings() {
    const data = await bookingService.getAll();
    setBookings(data);
  }

  function buildSearchParams(nextPage = page, sourceFilters: PaymentFilterState = filters): PaymentSearchParams {
    return {
      paymentId: sourceFilters.paymentId.trim() || undefined,
      bookingId: sourceFilters.bookingId.trim() || undefined,
      customerName: sourceFilters.customerName.trim() || undefined,
      customerPhone: sourceFilters.customerPhone.trim() || undefined,
      paymentType: sourceFilters.paymentType || undefined,
      paymentMethod: sourceFilters.paymentMethod || undefined,
      status: sourceFilters.status || undefined,
      paymentDateFrom: sourceFilters.paymentDateFrom || undefined,
      paymentDateTo: sourceFilters.paymentDateTo || undefined,
      amountFrom: sourceFilters.amountFrom || undefined,
      amountTo: sourceFilters.amountTo || undefined,
      referenceNumber: sourceFilters.referenceNumber.trim() || undefined,
      page: nextPage,
      size: 20,
    };
  }

  async function loadPayments(nextPage = page, sourceFilters: PaymentFilterState = filters) {
    try {
      setLoading(true);
      const result = await paymentService.search(buildSearchParams(nextPage, sourceFilters));
      setPayments(result.content ?? []);
      setPage(result.number ?? nextPage);
      setTotalPages(result.totalPages ?? 0);
      setTotalElements(result.totalElements ?? 0);
      setHasLoaded(true);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Cannot load payments.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setLoading(true);
        const [bookingData, paymentPage] = await Promise.all([
          bookingService.getAll(),
          paymentService.search({ page: 0, size: 20 }),
        ]);

        if (cancelled) return;

        setBookings(bookingData);
        setPayments(paymentPage.content ?? []);
        setPage(paymentPage.number ?? 0);
        setTotalPages(paymentPage.totalPages ?? 0);
        setTotalElements(paymentPage.totalElements ?? 0);
        setHasLoaded(true);
      } catch (error) {
        if (!cancelled) {
          showToast(error instanceof Error ? error.message : "Cannot load payments.", "error");
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
    setCreateForm({ bookingId: "", paymentType: "DEPOSIT", amount: "" });
    setFormError(null);
    setModal({ type: "create" });
    loadBookings().catch(() => undefined);
  }

  function openEdit(payment: PaymentResponse) {
    setEditForm({ paymentType: payment.paymentType, amount: String(payment.amount) });
    setFormError(null);
    setModal({ type: "edit", payment });
  }

  function openProcess(payment: PaymentResponse) {
    setProcessForm({
      paymentMethod: "CASH",
      paymentDate: todayDate(),
      referenceNumber: "",
      receivedAmount: String(payment.amount),
      note: "",
      mfaChallengeId: "",
      otpEmail: "",
      otpExpiresInSeconds: null,
      inputCode: "",
      step: "DETAIL",
    });
    setFormError(null);
    setModal({ type: "process", payment });
  }

  function openCancel(payment: PaymentResponse) {
    setCancelReason("");
    setFormError(null);
    setModal({ type: "cancel", payment });
  }

  function validatePaymentAmount(
    booking: BookingResponse | null,
    paymentType: PaymentTypeApi,
    amount: number,
    editingPaymentId?: string
  ) {
    if (!booking) return "Không tìm thấy booking.";
    if (!amount || amount <= 0) return "MSG2: Số tiền thanh toán không hợp lệ.";

    const depositAmount = getBookingDeposit(booking);
    const remainingAmount = getBookingRemaining(booking);

    if (paymentType === "DEPOSIT" && amount < depositAmount) {
      return `MSG38: Số tiền cọc phải lớn hơn hoặc bằng ${formatVND(depositAmount)}.`;
    }

    if (paymentType === "FINAL_PAYMENT" && amount !== remainingAmount) {
      return `MSG39: Thanh toán cuối phải đúng bằng số còn lại ${formatVND(remainingAmount)}.`;
    }

    if (paymentType === "PARTIAL_PAYMENT" && amount >= remainingAmount) {
      return "MSG19: Thanh toán một phần phải nhỏ hơn số tiền còn lại. Hãy dùng FINAL_PAYMENT.";
    }

    const duplicate = payments.find(
      (item) =>
        item.bookingId === booking.id &&
        item.paymentType === paymentType &&
        item.status === "UNPROCESSED" &&
        item.id !== editingPaymentId
    );

    if (duplicate) {
      return "MSG68: Đã tồn tại khoản thanh toán chưa xử lý cùng loại cho booking này.";
    }

    return null;
  }

  async function handleCreatePayment() {
    const amount = parseMoney(createForm.amount);
    const error = validatePaymentAmount(selectedCreateBooking, createForm.paymentType, amount);
    if (error) {
      setFormError(error);
      return;
    }

    try {
      setSaving(true);
      await paymentService.create({
        bookingId: createForm.bookingId,
        paymentType: createForm.paymentType,
        amount,
      });
      showToast("MSG48: Tạo thanh toán thành công.");
      setModal(null);
      await loadPayments(0);
      await loadBookings();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "MSG50: Không thể tạo thanh toán.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdatePayment(payment: PaymentResponse) {
    if (payment.status !== "UNPROCESSED") {
      setFormError("MSG28: Chỉ có thể cập nhật thanh toán UNPROCESSED.");
      return;
    }

    if (!payment.lastModifiedAt) {
      setFormError("MSG62: Thiếu lastModifiedAt. Vui lòng tải lại dữ liệu.");
      return;
    }

    const booking = bookings.find((item) => item.id === payment.bookingId) ?? null;
    const amount = parseMoney(editForm.amount);
    const error = validatePaymentAmount(booking, editForm.paymentType, amount, payment.id);
    if (error) {
      setFormError(error);
      return;
    }

    try {
      setSaving(true);
      await paymentService.update(
        payment.id,
        { paymentType: editForm.paymentType, amount },
        payment.lastModifiedAt
      );
      showToast("MSG17: Cập nhật thanh toán thành công.");
      setModal(null);
      await loadPayments(page);
      await loadBookings();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "MSG16: Không thể cập nhật thanh toán.");
    } finally {
      setSaving(false);
    }
  }

  function validateProcess(payment: PaymentResponse) {
    if (payment.status !== "UNPROCESSED") return "MSG67: Chỉ có thể xử lý thanh toán UNPROCESSED.";
    if (!processForm.paymentMethod || !processForm.paymentDate) return "MSG2: Vui lòng nhập đủ phương thức và ngày thanh toán.";
    if (processForm.paymentDate > todayDate()) return "MSG37: Ngày thanh toán không được là ngày tương lai.";

    const received = parseMoney(processForm.receivedAmount);
    if (processForm.paymentMethod === "CASH" && received < payment.amount) {
      return `MSG69: Tiền nhận phải lớn hơn hoặc bằng ${formatVND(payment.amount)}.`;
    }

    if (
      (processForm.paymentMethod === "BANK_TRANSFER" || processForm.paymentMethod === "CARD") &&
      !processForm.referenceNumber.trim()
    ) {
      return "MSG2: Số tham chiếu bắt buộc với chuyển khoản hoặc thẻ.";
    }

    return null;
  }

  async function handleProcessNext(payment: PaymentResponse) {
    const error = validateProcess(payment);

    if (error) {
      setFormError(error);
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      const otp = await paymentService.createProcessPaymentOtp(payment.id);

      setProcessForm((prev) => ({
        ...prev,
        receivedAmount:
          prev.paymentMethod === "CASH"
            ? prev.receivedAmount
            : String(payment.amount),
        mfaChallengeId: otp.mfaChallengeId,
        otpEmail: otp.email,
        otpExpiresInSeconds: otp.expiresInSeconds,
        inputCode: "",
        step: "TWO_FA",
      }));

      showToast("MSG55: Mã OTP đã được gửi đến email nhân viên.");
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "MSG55: Không thể gửi mã OTP."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmProcess(payment: PaymentResponse) {
    if (!processForm.mfaChallengeId) {
      setFormError("MSG56: Phiên xác thực OTP không hợp lệ. Vui lòng gửi lại mã.");
      return;
    }

    if (!processForm.inputCode.trim()) {
      setFormError("MSG2: Vui lòng nhập mã xác thực 2FA.");
      return;
    }

    const receivedAmount =
      processForm.paymentMethod === "CASH"
        ? parseMoney(processForm.receivedAmount)
        : payment.amount;

    try {
      setSaving(true);
      setFormError(null);

      await paymentService.process(payment.id, {
        paymentMethod: processForm.paymentMethod,
        paymentDate: processForm.paymentDate,
        referenceNumber: processForm.referenceNumber.trim() || null,
        receivedAmount,
        note: processForm.note.trim() || null,
        mfaChallengeId: processForm.mfaChallengeId,
        inputCode: processForm.inputCode.trim(),
      });

      showToast("MSG6: Xử lý thanh toán thành công.");
      setModal(null);

      await loadPayments(page);
      await loadBookings();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "MSG5: Không thể xử lý thanh toán."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelPayment(payment: PaymentResponse) {
    if (payment.status !== "UNPROCESSED") {
      setFormError("MSG67: Chỉ có thể hủy thanh toán UNPROCESSED.");
      return;
    }

    if (!cancelReason.trim()) {
      setFormError("MSG2: Vui lòng nhập lý do hủy.");
      return;
    }

    try {
      setSaving(true);
      await paymentService.cancel(payment.id, { reason: cancelReason.trim() });
      showToast("MSG20: Hủy thanh toán thành công.");
      setModal(null);
      await loadPayments(page);
      await loadBookings();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "MSG21: Không thể hủy thanh toán.");
    } finally {
      setSaving(false);
    }
  }

  function handleSearch() {
    loadPayments(0);
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS);
    loadPayments(0, EMPTY_FILTERS);
  }

  const statusCounts = useMemo(() => {
    const map: Record<string, number> = { "": totalElements };
    for (const status of ["UNPROCESSED", "PROCESSED", "CANCELLED", "REJECTED", "FAILED"] as PaymentStatusApi[]) {
      map[status] = payments.filter((item) => item.status === status).length;
    }
    return map;
  }, [payments, totalElements]);

  const tableContent = () => {
    if (loading) return <LoadingTable columns={10} />;
    if (hasLoaded && payments.length === 0) {
      return (
        <EmptyState
          title="Không tìm thấy thanh toán"
          description="Không có payment nào khớp với bộ lọc hiện tại."
        />
      );
    }

    return (
      <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                {["Mã TT", "Booking / Khách", "Loại", "Số tiền", "Phương thức", "Ngày TT", "Đã nhận", "Tiền thừa", "Trạng thái", "Hành động"].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${["Số tiền", "Đã nhận", "Tiền thừa"].includes(h)
                      ? "text-right"
                      : h === "Hành động"
                        ? "text-center"
                        : "text-left"
                      }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((pay) => (
                <tr key={pay.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs text-primary font-semibold whitespace-nowrap">
                    {pay.id}
                  </td>
                  <td className="px-4 py-3.5 min-w-[220px]">
                    <p className="text-xs font-mono text-accent truncate">{pay.bookingId}</p>
                    <p className="text-sm font-medium text-foreground truncate">{pay.customerName ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{pay.customerPhone ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-secondary text-foreground whitespace-nowrap">
                      {PAYMENT_TYPE_LABEL[pay.paymentType]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm font-semibold text-foreground">
                    {formatVND(pay.amount ?? 0)}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground whitespace-nowrap">
                    {pay.paymentMethod ? PAYMENT_METHOD_LABEL[pay.paymentMethod] : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground font-mono whitespace-nowrap">
                    {pay.paymentDate ?? "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm">
                    {pay.receivedAmount !== null && pay.receivedAmount !== undefined
                      ? formatVND(pay.receivedAmount)
                      : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm text-emerald-600">
                    {pay.changeAmount !== null && pay.changeAmount !== undefined
                      ? formatVND(pay.changeAmount)
                      : "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <PaymentStatusBadge status={pay.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <ActionBtn title="Xem chi tiết" colorClass="text-accent hover:bg-accent/10" onClick={() => setModal({ type: "view", payment: pay })}>
                        <Eye className="w-4 h-4" />
                      </ActionBtn>
                      {pay.status === "UNPROCESSED" && (
                        <>
                          <ActionBtn title="Cập nhật" colorClass="text-blue-600 hover:bg-blue-50" onClick={() => openEdit(pay)}>
                            <Edit className="w-4 h-4" />
                          </ActionBtn>
                          <ActionBtn title="Xử lý thanh toán" colorClass="text-emerald-700 hover:bg-emerald-50" onClick={() => openProcess(pay)}>
                            <CheckCircle2 className="w-4 h-4" />
                          </ActionBtn>
                          <ActionBtn title="Hủy thanh toán" colorClass="text-rose-700 hover:bg-rose-50" onClick={() => openCancel(pay)}>
                            <Ban className="w-4 h-4" />
                          </ActionBtn>
                        </>
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
          <h1 className="text-3xl font-semibold text-primary mb-2">Quản lý Thanh toán</h1>
          <p className="text-muted-foreground">Tạo, xử lý và theo dõi các khoản thanh toán booking</p>
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
            Tạo thanh toán
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border overflow-x-auto">
        {PAYMENT_STATUS_TABS.map((tab) => (
          <button
            key={tab.value || "ALL"}
            type="button"
            onClick={() => {
              const nextFilters = { ...filters, status: tab.value };
              setFilters(nextFilters);
              loadPayments(0, nextFilters);
            }}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${filters.status === tab.value
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
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Mã thanh toán", key: "paymentId", placeholder: "UUID / PAY..." },
              { label: "Mã booking", key: "bookingId", placeholder: "UUID booking" },
              { label: "Tên khách", key: "customerName", placeholder: "Tên khách..." },
              { label: "SĐT", key: "customerPhone", placeholder: "09..." },
              { label: "Mã tham chiếu", key: "referenceNumber", placeholder: "Mã GD..." },
              { label: "Số tiền từ", key: "amountFrom", placeholder: "0", type: "number" },
              { label: "Số tiền đến", key: "amountTo", placeholder: "0", type: "number" },
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
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Loại thanh toán</label>
              <select
                value={filters.paymentType}
                onChange={(e) => setFilters((prev) => ({ ...prev, paymentType: e.target.value as PaymentTypeApi | "" }))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                <option value="">Tất cả</option>
                <option value="DEPOSIT">Đặt cọc</option>
                <option value="PARTIAL_PAYMENT">Một phần</option>
                <option value="FINAL_PAYMENT">Thanh toán cuối</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Phương thức</label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => setFilters((prev) => ({ ...prev, paymentMethod: e.target.value as PaymentMethodApi | "" }))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                <option value="">Tất cả</option>
                <option value="CASH">Tiền mặt</option>
                <option value="BANK_TRANSFER">Chuyển khoản</option>
                <option value="CARD">Thẻ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Ngày TT từ</label>
              <input
                type="date"
                value={filters.paymentDateFrom}
                onChange={(e) => setFilters((prev) => ({ ...prev, paymentDateFrom: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Đến</label>
              <input
                type="date"
                value={filters.paymentDateTo}
                onChange={(e) => setFilters((prev) => ({ ...prev, paymentDateTo: e.target.value }))}
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
            onClick={() => loadPayments(page - 1)}
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
            onClick={() => loadPayments(page + 1)}
            className="px-4 py-2 rounded-xl border border-border bg-card text-sm disabled:opacity-50"
          >
            Trang sau
          </button>
        </div>
      )}

      {modal?.type === "create" && (
        <ModalShell
          title="Tạo khoản thanh toán"
          onClose={() => setModal(null)}
          footer={
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setModal(null)} className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-secondary">
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreatePayment}
                disabled={saving}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Đang tạo..." : "Tạo thanh toán"}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Booking *</label>
              <select
                value={createForm.bookingId}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, bookingId: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              >
                <option value="">-- Chọn booking --</option>
                {eligibleBookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    {booking.customerName} · {booking.customerPhone} · {booking.status}
                  </option>
                ))}
              </select>
            </div>

            {selectedCreateBooking && (
              <div className="bg-secondary/60 rounded-xl p-4 space-y-1.5 text-sm">
                <InfoRow label="Booking ID" value={selectedCreateBooking.id} mono />
                <InfoRow label="Khách" value={selectedCreateBooking.customerName} />
                <InfoRow label="SĐT" value={selectedCreateBooking.customerPhone} mono />
                <InfoRow label="Tổng booking" value={formatVND(selectedCreateBooking.bookingAmount ?? 0)} mono />
                <InfoRow label="Cọc quy định" value={formatVND(selectedCreateBooking.depositAmount ?? 0)} mono />
                <InfoRow label="Đã xác nhận" value={formatVND(selectedCreateBooking.confirmedPaymentAmount ?? 0)} mono />
                <InfoRow label="Còn lại" value={formatVND(selectedCreateBooking.remainingAmount ?? 0)} mono />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Loại thanh toán *</label>
              <select
                value={createForm.paymentType}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, paymentType: e.target.value as PaymentTypeApi }))}
                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              >
                <option value="DEPOSIT">DEPOSIT — Đặt cọc</option>
                <option value="PARTIAL_PAYMENT">PARTIAL_PAYMENT — Một phần</option>
                <option value="FINAL_PAYMENT">FINAL_PAYMENT — Thanh toán cuối</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Số tiền *</label>
              <input
                type="number"
                value={createForm.amount}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, amount: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent font-mono"
              />
              {createForm.paymentType === "FINAL_PAYMENT" && selectedCreateBooking && (
                <button
                  type="button"
                  onClick={() => setCreateForm((prev) => ({ ...prev, amount: String(selectedCreateBooking.remainingAmount ?? 0) }))}
                  className="text-xs text-accent mt-1"
                >
                  Điền số còn lại: {formatVND(selectedCreateBooking.remainingAmount ?? 0)}
                </button>
              )}
            </div>

            <div className="text-xs text-muted-foreground bg-secondary/60 rounded-xl p-3 flex gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" />
              <span>
                Thanh toán tạo mới sẽ ở trạng thái <strong>UNPROCESSED</strong>. Chỉ khi xử lý payment thì booking mới cập nhật số tiền đã xác nhận.
              </span>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {formError}
              </div>
            )}
          </div>
        </ModalShell>
      )}

      {modal?.type === "edit" && (
        <ModalShell
          title="Cập nhật thanh toán"
          onClose={() => setModal(null)}
          footer={
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setModal(null)} className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-secondary">
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleUpdatePayment(modal.payment)}
                disabled={saving}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="bg-secondary/60 rounded-xl p-3 text-xs text-muted-foreground flex gap-2">
              <Info className="w-4 h-4 flex-shrink-0 text-blue-500 mt-0.5" />
              Chỉ cập nhật được khi trạng thái = UNPROCESSED. Cập nhật payment không làm thay đổi booking financial state.
            </div>
            <InfoRow label="Booking" value={modal.payment.bookingId} mono />
            <InfoRow label="Khách" value={modal.payment.customerName ?? "—"} />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Loại thanh toán</label>
              <select
                value={editForm.paymentType}
                onChange={(e) => setEditForm((prev) => ({ ...prev, paymentType: e.target.value as PaymentTypeApi }))}
                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              >
                <option value="DEPOSIT">DEPOSIT</option>
                <option value="PARTIAL_PAYMENT">PARTIAL_PAYMENT</option>
                <option value="FINAL_PAYMENT">FINAL_PAYMENT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Số tiền</label>
              <input
                type="number"
                value={editForm.amount}
                onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent font-mono"
              />
            </div>
            {formError && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{formError}</div>}
          </div>
        </ModalShell>
      )}

      {modal?.type === "process" && (
        <ModalShell
          title={processForm.step === "TWO_FA" ? "Xác thực 2FA" : "Xử lý thanh toán"}
          onClose={() => setModal(null)}
          footer={
            <div className="flex justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  processForm.step === "TWO_FA"
                    ? setProcessForm((prev) => ({ ...prev, step: "DETAIL" }))
                    : setModal(null)
                }
                className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-secondary"
              >
                {processForm.step === "TWO_FA" ? "← Quay lại" : "Hủy"}
              </button>
              <button
                type="button"
                onClick={() =>
                  processForm.step === "TWO_FA"
                    ? handleConfirmProcess(modal.payment)
                    : handleProcessNext(modal.payment)
                }
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {saving ? "Đang xử lý..." : processForm.step === "TWO_FA" ? "Xác nhận" : "Tiếp tục →"}
              </button>
            </div>
          }
        >
          {processForm.step === "DETAIL" ? (
            <div className="space-y-4">
              <div className="bg-secondary/60 rounded-xl p-4 space-y-1.5 text-sm">
                <InfoRow label="Booking" value={modal.payment.bookingId} mono />
                <InfoRow label="Khách" value={modal.payment.customerName ?? "—"} />
                <InfoRow label="Loại" value={PAYMENT_TYPE_LABEL[modal.payment.paymentType]} />
                <InfoRow label="Cần thu" value={formatVND(modal.payment.amount)} mono />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phương thức *</label>
                <select
                  value={processForm.paymentMethod}
                  onChange={(e) => {
                    const method = e.target.value as PaymentMethodApi;
                    setProcessForm((prev) => ({
                      ...prev,
                      paymentMethod: method,
                      receivedAmount: method === "CASH" ? prev.receivedAmount : String(modal.payment.amount),
                    }));
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                >
                  <option value="CASH">Tiền mặt</option>
                  <option value="BANK_TRANSFER">Chuyển khoản</option>
                  <option value="CARD">Thẻ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Ngày thanh toán *</label>
                <input
                  type="date"
                  value={processForm.paymentDate}
                  max={todayDate()}
                  onChange={(e) => setProcessForm((prev) => ({ ...prev, paymentDate: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Số tiền nhận *</label>
                <input
                  type="number"
                  value={processForm.receivedAmount}
                  disabled={processForm.paymentMethod !== "CASH"}
                  onChange={(e) => setProcessForm((prev) => ({ ...prev, receivedAmount: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-accent font-mono ${processForm.paymentMethod !== "CASH" ? "bg-secondary text-muted-foreground cursor-not-allowed" : "bg-input-background"
                    }`}
                />
              </div>
              {(processForm.paymentMethod === "BANK_TRANSFER" || processForm.paymentMethod === "CARD") && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Số tham chiếu *</label>
                  <input
                    value={processForm.referenceNumber}
                    onChange={(e) => setProcessForm((prev) => ({ ...prev, referenceNumber: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              )}
              {processForm.paymentMethod === "CASH" && parseMoney(processForm.receivedAmount) >= modal.payment.amount && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex justify-between text-sm">
                  <span className="text-emerald-800">Tiền thừa trả lại:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {formatVND(parseMoney(processForm.receivedAmount) - modal.payment.amount)}
                  </span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Ghi chú</label>
                <textarea
                  rows={2}
                  value={processForm.note}
                  onChange={(e) => setProcessForm((prev) => ({ ...prev, note: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent resize-none text-sm"
                />
              </div>
              {formError && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{formError}</div>}
            </div>
          ) : (
            <div className="space-y-4">
              {processForm.otpEmail && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
                  Mã OTP đã được gửi đến email <strong>{processForm.otpEmail}</strong>
                  {processForm.otpExpiresInSeconds
                    ? ` và có hiệu lực trong ${Math.floor(processForm.otpExpiresInSeconds / 60)} phút.`
                    : "."}
                </div>
              )}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 space-y-1.5">
                <p className="font-semibold">Xác nhận xử lý thanh toán:</p>
                <InfoRow label="Khách" value={modal.payment.customerName ?? "—"} />
                <InfoRow label="Loại" value={PAYMENT_TYPE_LABEL[modal.payment.paymentType]} />
                <InfoRow label="Phương thức" value={PAYMENT_METHOD_LABEL[processForm.paymentMethod]} />
                <InfoRow label="Số tiền" value={formatVND(modal.payment.amount)} mono />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Mã xác thực 2FA *</label>
                <input
                  value={processForm.inputCode}
                  onChange={(e) => setProcessForm((prev) => ({ ...prev, inputCode: e.target.value }))}
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent text-center text-2xl tracking-widest font-mono"
                />
              </div>
              {formError && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{formError}</div>}
            </div>
          )}
        </ModalShell>
      )}

      {modal?.type === "cancel" && (
        <ModalShell
          title="Hủy thanh toán"
          onClose={() => setModal(null)}
          footer={
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setModal(null)} className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-secondary">
                Đóng
              </button>
              <button
                type="button"
                onClick={() => handleCancelPayment(modal.payment)}
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
              <InfoRow label="Mã TT" value={modal.payment.id} mono />
              <InfoRow label="Khách" value={modal.payment.customerName ?? "—"} />
              <InfoRow label="Loại" value={PAYMENT_TYPE_LABEL[modal.payment.paymentType]} />
              <InfoRow label="Số tiền" value={formatVND(modal.payment.amount)} mono />
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
        <ModalShell title={modal.payment.id} onClose={() => setModal(null)} maxWidth="max-w-md">
          <div className="space-y-1">
            <div className="flex justify-end mb-2">
              <PaymentStatusBadge status={modal.payment.status} />
            </div>
            <InfoRow label="Booking" value={modal.payment.bookingId} mono />
            <InfoRow label="Khách hàng" value={modal.payment.customerName ?? "—"} />
            <InfoRow label="SĐT" value={modal.payment.customerPhone ?? "—"} mono />
            <InfoRow label="Loại TT" value={PAYMENT_TYPE_LABEL[modal.payment.paymentType]} />
            <InfoRow label="Số tiền" value={formatVND(modal.payment.amount)} mono />
            <InfoRow label="Phương thức" value={modal.payment.paymentMethod ? PAYMENT_METHOD_LABEL[modal.payment.paymentMethod] : "—"} />
            <InfoRow label="Ngày TT" value={modal.payment.paymentDate ?? "—"} mono />
            <InfoRow label="Đã nhận" value={modal.payment.receivedAmount != null ? formatVND(modal.payment.receivedAmount) : "—"} mono />
            <InfoRow label="Tiền thừa" value={modal.payment.changeAmount != null ? formatVND(modal.payment.changeAmount) : "—"} mono />
            <InfoRow label="Mã tham chiếu" value={modal.payment.referenceNumber ?? "—"} />
            <InfoRow label="Ngày tạo" value={fmtDateTime(modal.payment.createdAt)} mono />
            <InfoRow label="Ngày xử lý" value={fmtDateTime(modal.payment.processedAt)} mono />
            <InfoRow label="Cập nhật cuối" value={fmtDateTime(modal.payment.lastModifiedAt)} mono />
            {modal.payment.reason && (
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">Lý do hủy:</p>
                <p className="text-sm text-foreground mt-1">{modal.payment.reason}</p>
              </div>
            )}
          </div>
        </ModalShell>
      )}
    </div>
  );
}
