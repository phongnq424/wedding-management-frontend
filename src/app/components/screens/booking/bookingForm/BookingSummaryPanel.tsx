import { formatVND } from "../../../../utils";

type Props = {
    summaryHallName: string;
    summaryDate: string;
    summaryShiftName: string;
    summaryHallFee: number;
    numberOfTables: number;
    bookingMode: "PACKAGE" | "MANUAL";
    foodAmount: number;
    serviceAmount: number;
    beverageAmount: number;
    packageIncludedServiceAmount: number;
    packageIncludedBeverageAmount: number;
    bookingAmount: number;
    effectiveDepositAmount: number;
    remainingAmount: number;
};

export function BookingSummaryPanel({
    summaryHallName,
    summaryDate,
    summaryShiftName,
    summaryHallFee,
    numberOfTables,
    bookingMode,
    foodAmount,
    serviceAmount,
    beverageAmount,
    packageIncludedServiceAmount,
    packageIncludedBeverageAmount,
    bookingAmount,
    effectiveDepositAmount,
    remainingAmount,
}: Props) {
    return (
        <div className="bg-card rounded-[20px] p-5 border border-border shadow-sm sticky top-24">
            <h3 className="text-sm font-semibold text-primary mb-4">Tóm tắt booking</h3>

            <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Sảnh</span>
                    <span className="text-foreground font-medium text-right">{summaryHallName}</span>
                </div>

                <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Ngày</span>
                    <span className="text-foreground font-mono">{summaryDate}</span>
                </div>

                <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Ca</span>
                    <span className="text-foreground">{summaryShiftName}</span>
                </div>

                <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Số bàn</span>
                    <span className="text-foreground">{numberOfTables}</span>
                </div>

                <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Hình thức</span>
                    <span className="text-foreground">
                        {bookingMode === "PACKAGE" ? "Gói tiệc" : "Tự chọn"}
                    </span>
                </div>

                <div className="border-t border-border pt-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Chi tiết chi phí
                    </p>

                    <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Tiền sảnh</span>
                        <span className="font-mono text-foreground">{formatVND(summaryHallFee)}</span>
                    </div>

                    <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Đồ ăn / thực đơn</span>
                        <span className="font-mono text-foreground">{formatVND(foodAmount)}</span>
                    </div>

                    <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Dịch vụ</span>
                        <span className="font-mono text-foreground">{formatVND(serviceAmount)}</span>
                    </div>

                    {bookingMode === "PACKAGE" && packageIncludedServiceAmount > 0 && (
                        <div className="flex justify-between gap-3 pl-3 text-xs">
                            <span className="text-muted-foreground">Dịch vụ đã bao gồm trong gói</span>
                            <span className="font-mono text-muted-foreground">
                                {formatVND(packageIncludedServiceAmount)}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Thức uống ước tính</span>
                        <span className="font-mono text-foreground">{formatVND(beverageAmount)}</span>
                    </div>

                    {bookingMode === "PACKAGE" && packageIncludedBeverageAmount > 0 && (
                        <div className="flex justify-between gap-3 pl-3 text-xs">
                            <span className="text-muted-foreground">Hạn mức thức uống trong gói</span>
                            <span className="font-mono text-muted-foreground">
                                {formatVND(packageIncludedBeverageAmount)}
                            </span>
                        </div>
                    )}
                </div>

                <div className="border-t border-border pt-3 flex justify-between gap-3 font-semibold">
                    <span className="text-foreground">Tổng</span>
                    <span className="font-mono text-accent">{formatVND(bookingAmount)}</span>
                </div>

                <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Cọc</span>
                    <span className="font-mono text-emerald-600">
                        {formatVND(effectiveDepositAmount)}
                    </span>
                </div>

                <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Còn lại</span>
                    <span className="font-mono text-rose-600">{formatVND(remainingAmount)}</span>
                </div>
            </div>
        </div>
    );
}