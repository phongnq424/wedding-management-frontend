import { X } from "lucide-react";
import { formatVND } from "../../../utils";
import type { HallViewModel } from "./hall.types";
import { buildPricingRows } from "./hall.utils";

type Props = {
    open: boolean;
    hall: HallViewModel | undefined;
    onClose: () => void;
    onEdit: () => void;
};

export function HallPricingModal({ open, hall, onClose, onEdit }: Props) {
    if (!open || !hall) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-card rounded-[24px] shadow-xl border border-border max-w-3xl w-full overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-primary">
                            Pricing Matrix
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">{hall.name}</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-secondary">
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground border border-border rounded-tl-xl">
                                        Shift / Day Type
                                    </th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-foreground border border-border">
                                        Weekday
                                    </th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-foreground border border-border rounded-tr-xl">
                                        Weekend
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {buildPricingRows(hall.pricings).map((row) => (
                                    <tr key={row.shift}>
                                        <td className="px-6 py-4 font-medium text-foreground border border-border">
                                            {row.shift}
                                        </td>

                                        <td className="px-6 py-4 text-center font-mono text-sm text-muted-foreground border border-border">
                                            {formatVND(row.weekday)}
                                        </td>

                                        <td className="px-6 py-4 text-center font-mono text-sm text-muted-foreground border border-border">
                                            {formatVND(row.weekend)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-6 border-t border-border flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 border border-border rounded-xl hover:bg-secondary transition-all"
                    >
                        Close
                    </button>

                    <button
                        onClick={onEdit}
                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all"
                    >
                        Edit Pricing
                    </button>
                </div>
            </div>
        </div>
    );
}