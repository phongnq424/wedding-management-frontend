import { formatVND } from "../../../utils";
import type { InvoiceLineSnapshotResponse } from "../../../dto/invoice.dto";
import { numberToVietnameseWords } from "./finance.utils";

const itemTypeClass: Record<string, string> = {
  HALL: "bg-primary/10 text-primary",
  SERVICE: "bg-blue-50 text-blue-700",
  DISH: "bg-amber-50 text-amber-700",
  BEVERAGE: "bg-emerald-50 text-emerald-700",
  BENEFIT: "bg-purple-50 text-purple-700",
  DISCOUNT: "bg-rose-50 text-rose-700",
  CUSTOM: "bg-gray-100 text-gray-700",
};

const itemTypeLabel: Record<string, string> = {
  HALL: "Sảnh",
  SERVICE: "Dịch vụ",
  DISH: "Món ăn",
  BEVERAGE: "Thức uống",
  BENEFIT: "Quà tặng",
  DISCOUNT: "Giảm giá",
  CUSTOM: "Khác",
};

export function InvoiceLineTable({ lines }: { lines: InvoiceLineSnapshotResponse[] }) {
  const normalizedLines = [...(lines ?? [])].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
  );

  const subtotal = normalizedLines.reduce((sum, item) => sum + (item.lineAmount ?? 0), 0);
  const tax = normalizedLines.reduce((sum, item) => sum + (item.taxAmount ?? 0), 0);
  const grandTotal = subtotal + tax;

  const groupedRates = Array.from(
    new Set(normalizedLines.map((item) => item.taxRate ?? 0))
  ).sort((a, b) => b - a);

  return (
    <div className="space-y-5">
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              {["STT", "Tên hàng hóa / dịch vụ", "ĐVT", "SL", "Đơn giá", "Thành tiền", "TS%", "Tiền thuế"].map((h, i) => (
                <th
                  key={h}
                  className={`px-3 py-3 text-xs font-semibold whitespace-nowrap ${
                    i === 0 || i === 2 || i === 3 || i === 6
                      ? "text-center"
                      : i >= 4
                        ? "text-right"
                        : "text-left"
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {normalizedLines.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Chưa có dòng hóa đơn.
                </td>
              </tr>
            ) : (
              normalizedLines.map((item, index) => (
                <tr key={item.id ?? `${item.itemType}-${index}`} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-3 py-2.5 text-center text-sm text-muted-foreground">{index + 1}</td>
                  <td className="px-3 py-2.5 min-w-[260px]">
                    <p className="text-sm text-foreground leading-snug">{item.itemName}</p>
                    <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${itemTypeClass[item.itemType] ?? itemTypeClass.CUSTOM}`}>
                      {itemTypeLabel[item.itemType] ?? item.itemType}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center text-sm text-muted-foreground">Đơn vị</td>
                  <td className="px-3 py-2.5 text-center text-sm font-mono">{(item.quantity ?? 0).toLocaleString("vi-VN")}</td>
                  <td className="px-3 py-2.5 text-right text-sm font-mono">{formatVND(item.unitPrice ?? 0)}</td>
                  <td className="px-3 py-2.5 text-right text-sm font-mono font-semibold">{formatVND(item.lineAmount ?? 0)}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      {item.taxRate ?? 0}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-sm font-mono text-muted-foreground">{formatVND(item.taxAmount ?? 0)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 border border-border rounded-xl overflow-hidden text-sm">
          <div className="bg-secondary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tổng hợp thuế GTGT
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/50 text-xs text-muted-foreground">
                <th className="px-3 py-2 text-left">Thuế suất</th>
                <th className="px-3 py-2 text-right">Doanh thu chưa thuế</th>
                <th className="px-3 py-2 text-right">Tiền thuế GTGT</th>
                <th className="px-3 py-2 text-right">Tổng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {groupedRates.map((rate) => {
                const rows = normalizedLines.filter((item) => (item.taxRate ?? 0) === rate);
                const sub = rows.reduce((sum, item) => sum + (item.lineAmount ?? 0), 0);
                const tx = rows.reduce((sum, item) => sum + (item.taxAmount ?? 0), 0);

                return (
                  <tr key={rate}>
                    <td className="px-3 py-2">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                        {rate}%
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{formatVND(sub)}</td>
                    <td className="px-3 py-2 text-right font-mono text-blue-600">{formatVND(tx)}</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold">{formatVND(sub + tx)}</td>
                  </tr>
                );
              })}
              <tr className="bg-primary/5 font-bold">
                <td className="px-3 py-2 text-sm">Tổng cộng</td>
                <td className="px-3 py-2 text-right font-mono">{formatVND(subtotal)}</td>
                <td className="px-3 py-2 text-right font-mono text-accent">{formatVND(tax)}</td>
                <td className="px-3 py-2 text-right font-mono text-primary">{formatVND(grandTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="lg:col-span-2 border-2 border-primary/30 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 p-4 flex flex-col justify-between">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Tổng tiền hàng:</span>
              <span className="font-mono">{formatVND(subtotal)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Thuế GTGT:</span>
              <span className="font-mono text-accent">{formatVND(tax)}</span>
            </div>
            <div className="flex justify-between gap-3 pt-2 border-t-2 border-primary/20">
              <span className="font-bold text-primary text-base">TỔNG THANH TOÁN:</span>
              <span className="font-mono font-bold text-xl text-primary">{formatVND(grandTotal)}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-dashed border-primary/20">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Viết bằng chữ:</p>
            <p className="text-xs italic text-foreground leading-relaxed font-medium">
              {numberToVietnameseWords(grandTotal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
