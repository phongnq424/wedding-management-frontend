import type { PaymentMethodApi, PaymentStatusApi, PaymentTypeApi } from "../../../dto/payment.dto";
import type { InvoicePaymentStatusApi, InvoiceStatusApi } from "../../../dto/invoice.dto";

export const PAYMENT_TYPE_LABEL: Record<PaymentTypeApi, string> = {
  DEPOSIT: "Đặt cọc",
  PARTIAL_PAYMENT: "Thanh toán một phần",
  FINAL_PAYMENT: "Thanh toán cuối",
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethodApi, string> = {
  CASH: "Tiền mặt",
  BANK_TRANSFER: "Chuyển khoản",
  CARD: "Thẻ",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatusApi, string> = {
  UNPROCESSED: "Chưa xử lý",
  PROCESSED: "Đã xử lý",
  CANCELLED: "Đã hủy",
  REJECTED: "Bị từ chối",
  FAILED: "Thất bại",
};

export const INVOICE_STATUS_LABEL: Record<InvoiceStatusApi, string> = {
  DRAFT: "Bản nháp",
  ISSUED: "Đã phát hành",
  REJECTED: "Bị từ chối",
  CANCELLED: "Đã hủy",
};

export const INVOICE_PAYMENT_STATUS_LABEL: Record<InvoicePaymentStatusApi, string> = {
  UNPAID: "Chưa thanh toán",
  PARTIALLY_PAID: "Thanh toán một phần",
  PAID: "Đã thanh toán",
};

export function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function fmtDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function parseMoney(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

const ONES_VN = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
const TEENS_VN = ["mười", "mười một", "mười hai", "mười ba", "mười bốn", "mười lăm", "mười sáu", "mười bảy", "mười tám", "mười chín"];
const TENS_VN = ["", "", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"];

function twoD(n: number): string {
  if (n < 10) return ONES_VN[n];
  if (n < 20) return TEENS_VN[n - 10];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return TENS_VN[t] + (o > 0 ? (o === 5 ? " lăm" : o === 1 ? " mốt" : ` ${ONES_VN[o]}`) : "");
}

function threeD(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  if (h === 0) return twoD(r);
  return ONES_VN[h] + " trăm" + (r === 0 ? "" : r < 10 ? ` lẻ ${ONES_VN[r]}` : ` ${twoD(r)}`);
}

export function numberToVietnameseWords(value: number): string {
  const n = Math.max(0, Math.round(value));
  if (n === 0) return "Không đồng";
  const ty = Math.floor(n / 1_000_000_000);
  const trieu = Math.floor((n % 1_000_000_000) / 1_000_000);
  const nghin = Math.floor((n % 1_000_000) / 1_000);
  const dong = n % 1_000;
  const parts: string[] = [];
  if (ty > 0) parts.push(`${threeD(ty)} tỷ`);
  if (trieu > 0) parts.push(`${threeD(trieu)} triệu`);
  if (nghin > 0) parts.push(`${threeD(nghin)} nghìn`);
  if (dong > 0) parts.push(threeD(dong));
  const result = parts.join(" ");
  return result.charAt(0).toUpperCase() + result.slice(1) + " đồng";
}
