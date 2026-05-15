import type { CustomerFormState } from "./BookingForm.types";

type Props = {
    customerForm: CustomerFormState;
    updateCustomerForm: <K extends keyof CustomerFormState>(
        key: K,
        value: CustomerFormState[K]
    ) => void;
};

export function BookingCustomerStep({ customerForm, updateCustomerForm }: Props) {
    return (
        <div className="space-y-5">
            <h3 className="text-lg font-semibold text-primary">Bước 2 · Thông tin khách hàng</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Tên khách hàng *</label>
                    <input
                        value={customerForm.customerName}
                        onChange={(e) => updateCustomerForm("customerName", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Số điện thoại *</label>
                    <input
                        value={customerForm.customerPhone}
                        onChange={(e) => updateCustomerForm("customerPhone", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <input
                        value={customerForm.customerEmail}
                        onChange={(e) => updateCustomerForm("customerEmail", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div className="hidden md:block" />

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Tên cô dâu *</label>
                    <input
                        value={customerForm.brideName}
                        onChange={(e) => updateCustomerForm("brideName", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Tên chú rể *</label>
                    <input
                        value={customerForm.groomName}
                        onChange={(e) => updateCustomerForm("groomName", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Ngày cưới *</label>
                    <input
                        type="date"
                        value={customerForm.weddingDate}
                        onChange={(e) => updateCustomerForm("weddingDate", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Số bàn *</label>
                    <input
                        type="number"
                        min={1}
                        value={customerForm.numberOfTables}
                        onChange={(e) =>
                            updateCustomerForm("numberOfTables", Number(e.target.value) || 0)
                        }
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Bàn dự phòng</label>
                    <input
                        type="number"
                        min={0}
                        value={customerForm.numberOfReserveTables}
                        onChange={(e) =>
                            updateCustomerForm("numberOfReserveTables", Number(e.target.value) || 0)
                        }
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Ghi chú</label>
                    <textarea
                        rows={3}
                        value={customerForm.note}
                        onChange={(e) => updateCustomerForm("note", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>
            </div>
        </div>
    );
}