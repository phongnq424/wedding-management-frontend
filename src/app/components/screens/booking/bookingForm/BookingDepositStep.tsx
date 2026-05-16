import { formatVND } from "../../../../utils";

type Props = {
    bookingAmount: number;
    recommendedDeposit: number;
    remainingAmount: number;
};

export function BookingDepositStep({
    bookingAmount,
    recommendedDeposit,
    remainingAmount,
}: Props) {
    const depositPercent =
        bookingAmount > 0 ? Math.round((recommendedDeposit / bookingAmount) * 100) : 0;

    return (
        <div className="space-y-5">
            <h3 className="text-lg font-semibold text-primary">
                Bước 4 · Xác nhận Đặt cọc
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Tổng giá trị booking
                    </label>
                    <input
                        readOnly
                        value={formatVND(bookingAmount)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-secondary font-mono text-foreground"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Tỷ lệ đặt cọc
                    </label>
                    <input
                        readOnly
                        value={`${depositPercent}% tổng giá trị booking`}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-secondary font-medium text-foreground"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Hệ thống tự tính đặt cọc theo tỷ lệ quy định, không cho chỉnh thủ công.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Số tiền đặt cọc bắt buộc
                    </label>
                    <input
                        readOnly
                        value={formatVND(recommendedDeposit)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-secondary font-mono text-accent font-semibold"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Số tiền còn lại
                    </label>
                    <input
                        readOnly
                        value={formatVND(remainingAmount)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-secondary font-mono text-foreground"
                    />
                </div>
            </div>
        </div>
    );
}