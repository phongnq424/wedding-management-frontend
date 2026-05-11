import React from "react";
import { AlertCircle, CheckCircle2, FileText, Search } from "lucide-react";
import type { PaymentStatusApi } from "../../../dto/payment.dto";
import type { InvoicePaymentStatusApi, InvoiceStatusApi } from "../../../dto/invoice.dto";
import {
  INVOICE_PAYMENT_STATUS_LABEL,
  INVOICE_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
} from "./finance.utils";

export function ActionBtn({
  onClick,
  title,
  colorClass,
  children,
  disabled,
}: {
  onClick?: () => void;
  title: string;
  colorClass: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-1.5 rounded-lg transition-colors ${
        disabled ? "opacity-30 cursor-not-allowed" : colorClass
      }`}
    >
      {children}
    </button>
  );
}

export function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-center gap-4 py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold text-foreground text-right ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export function Toast({ toast }: { toast: { msg: string; type: "success" | "error" } | null }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed top-20 right-6 z-[80] px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
        toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
      }`}
    >
      {toast.msg}
    </div>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatusApi }) {
  const map: Record<PaymentStatusApi, string> = {
    UNPROCESSED: "bg-gray-100 text-gray-700 border-gray-200",
    PROCESSED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
    REJECTED: "bg-orange-100 text-orange-700 border-orange-200",
    FAILED: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${map[status]}`}>
      {PAYMENT_STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatusApi }) {
  const map: Record<InvoiceStatusApi, string> = {
    DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
    ISSUED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    REJECTED: "bg-orange-100 text-orange-700 border-orange-200",
    CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${map[status]}`}>
      {INVOICE_STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function InvoicePaymentStatusBadge({ status }: { status: InvoicePaymentStatusApi }) {
  const map: Record<InvoicePaymentStatusApi, string> = {
    UNPAID: "bg-rose-100 text-rose-700",
    PARTIALLY_PAID: "bg-amber-100 text-amber-700",
    PAID: "bg-emerald-100 text-emerald-700",
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[status]}`}>
      {INVOICE_PAYMENT_STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function LoadingTable({ columns = 8 }: { columns?: number }) {
  return (
    <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
      <div className="p-5 animate-pulse space-y-3">
        {Array.from({ length: 7 }).map((_, row) => (
          <div key={row} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }).map((__, col) => (
              <div key={col} className="h-8 rounded bg-secondary" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon = "search",
}: {
  title: string;
  description: string;
  icon?: "search" | "error" | "invoice" | "success";
}) {
  const Icon = icon === "error" ? AlertCircle : icon === "invoice" ? FileText : icon === "success" ? CheckCircle2 : Search;
  return (
    <div className="bg-card rounded-[20px] border border-border p-16 flex flex-col items-center gap-3 text-center">
      <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
        <Icon className="w-7 h-7 text-muted-foreground" />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

export function ModalShell({
  title,
  children,
  footer,
  onClose,
  maxWidth = "max-w-lg",
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  maxWidth?: string;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`bg-card rounded-[24px] w-full ${maxWidth} max-h-[90vh] shadow-2xl border border-border overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-4 flex-shrink-0">
          <h2 className="text-lg font-semibold text-primary">{title}</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
            <span className="sr-only">Đóng</span>×
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-border flex-shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
