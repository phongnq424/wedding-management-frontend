import { formatVND } from "../../../../utils";

type Props = {
    bookingAmount: number;
    recommendedDeposit: number;
    depositAmount: number;
    setDepositAmount: React.Dispatch<React.SetStateAction<number>>;
    remainingAmount: number;
};

export function BookingDepositStep({
    bookingAmount,
    recommendedDeposit,
    depositAmount,
    setDepositAmount,
    remainingAmount,
}: Props) {
    return (
        <div className="space-y-5">
            <h3 className="text-lg font-semibold text-primary">Bước 4 · Xác nhận Đặt cọc</h3>

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
                        Số tiền đặt cọc *
                    </label>
                    <input
                        type="number"
                        min={recommendedDeposit}
                        value={depositAmount}
                        onChange={(e) => {
                            const value = Number(e.target.value) || 0;
                            setDepositAmount(Math.max(value, recommendedDeposit));
                        }}
                        onBlur={() => {
                            setDepositAmount((prev) => Math.max(prev || 0, recommendedDeposit));
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Bắt buộc đặt cọc tối thiểu 30% ={" "}
                        <span className="font-mono font-semibold text-accent">
                            {formatVND(recommendedDeposit)}
                        </span>
                    </p>
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