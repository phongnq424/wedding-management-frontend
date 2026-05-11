import type { PaymentResponse } from "../../../dto/payment.dto";
import type { InvoiceResponse } from "../../../dto/invoice.dto";

export type ToastState = {
  msg: string;
  type: "success" | "error";
} | null;

export type PaymentModalMode =
  | { type: "view"; payment: PaymentResponse }
  | { type: "create" }
  | { type: "edit"; payment: PaymentResponse }
  | { type: "process"; payment: PaymentResponse }
  | { type: "cancel"; payment: PaymentResponse }
  | null;

export type InvoiceModalMode =
  | { type: "view"; invoice: InvoiceResponse }
  | { type: "create" }
  | { type: "edit"; invoice: InvoiceResponse }
  | { type: "generate"; invoice: InvoiceResponse }
  | { type: "cancel"; invoice: InvoiceResponse }
  | null;
