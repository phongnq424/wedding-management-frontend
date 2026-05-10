import type { Dispatch, SetStateAction } from "react";
import type { HallPricingFormRow } from "./hall.types";
import { formatVND } from "../../../utils";

type Props = {
    pricingRows: HallPricingFormRow[];
    setPricingRows: Dispatch<SetStateAction<HallPricingFormRow[]>>;
};

function formatPriceInput(value: number | undefined | null) {
    if (value === undefined || value === null) return "";

    return formatVND(value)
        .replace("₫", "")
        .trim();
}

function parsePriceInput(value: string) {
    const raw = value.replace(/[^\d]/g, "");
    return Number(raw || 0);
}

export function HallPricingMatrixInput({
    pricingRows,
    setPricingRows,
}: Props) {
    const rows = [
        { label: "Morning (7:00 - 11:00)", timeSlot: "MORNING" as const },
        { label: "Afternoon (12:00 - 16:00)", timeSlot: "AFTERNOON" as const },
        { label: "Evening (17:00 - 22:00)", timeSlot: "EVENING" as const },
    ];

    function updatePrice(
        timeSlot: HallPricingFormRow["timeSlot"],
        dayType: HallPricingFormRow["dayType"],
        price: number
    ) {
        setPricingRows((prev) =>
            prev.map((row) =>
                row.timeSlot === timeSlot && row.dayType === dayType
                    ? { ...row, price }
                    : row
            )
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-secondary">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border border-border rounded-tl-xl">
                            Shift
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-foreground border border-border">
                            Weekday (VND)
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-foreground border border-border rounded-tr-xl">
                            Weekend (VND)
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {rows.map((row) => {
                        const weekday = pricingRows.find(
                            (p) => p.timeSlot === row.timeSlot && p.dayType === "WEEKDAY"
                        );

                        const weekend = pricingRows.find(
                            (p) => p.timeSlot === row.timeSlot && p.dayType === "WEEKEND"
                        );

                        return (
                            <tr key={row.timeSlot}>
                                <td className="px-4 py-3 font-medium text-sm text-foreground border border-border">
                                    {row.label}
                                </td>

                                <td className="px-4 py-3 border border-border">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={formatPriceInput(weekday?.price)}
                                            onChange={(e) =>
                                                updatePrice(
                                                    row.timeSlot,
                                                    "WEEKDAY",
                                                    parsePriceInput(e.target.value)
                                                )
                                            }
                                            className="w-full px-3 py-2 pr-12 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent text-center font-mono text-sm"
                                        />

                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                            VND
                                        </span>
                                    </div>
                                </td>

                                <td className="px-4 py-3 border border-border">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={formatPriceInput(weekend?.price)}
                                            onChange={(e) =>
                                                updatePrice(
                                                    row.timeSlot,
                                                    "WEEKEND",
                                                    parsePriceInput(e.target.value)
                                                )
                                            }
                                            className="w-full px-3 py-2 pr-12 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent text-center font-mono text-sm"
                                        />

                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                            VND
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}