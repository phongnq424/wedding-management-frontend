import React from "react";

export const formatVND = (amount: number): string =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

export const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    Active: "bg-green-100 text-green-800 border-green-200",
    Inactive: "bg-gray-100 text-gray-800 border-gray-200",
    Pending: "bg-amber-100 text-amber-800 border-amber-200",
    Confirmed: "bg-green-100 text-green-800 border-green-200",
    Cancelled: "bg-red-100 text-red-800 border-red-200",
    Completed: "bg-blue-100 text-blue-800 border-blue-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status] || colors.Inactive}`}>
      {status}
    </span>
  );
};
