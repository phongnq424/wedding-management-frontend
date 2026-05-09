import React, { useState } from "react";
import { Plus, Filter, Edit, Trash2, AlertCircle, Upload, Search, RefreshCw, Eye, X, Save } from "lucide-react";
import { Screen } from "../../types";
import { SERVICES } from "../../data";
import { formatVND, StatusBadge } from "../../utils";

interface ServiceListProps {
  setSelectedService: (id: number | null) => void;
  setScreen: (s: Screen) => void;
}

export const ServiceListScreen = ({ setSelectedService, setScreen }: ServiceListProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = SERVICES.filter((s) => {
    if (statusFilter !== "All" && s.status !== statusFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">Quản lý Dịch vụ</h1>
          <p className="text-muted-foreground">Quản lý các dịch vụ tiệc cưới bổ sung</p>
        </div>
        <button onClick={() => { setSelectedService(null); setScreen("service-form"); }} className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm">
          <Plus className="w-5 h-5" /> Thêm dịch vụ
        </button>
      </div>

      <div className="bg-card rounded-[20px] p-5 border border-border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên dịch vụ..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
            <option value="All">Tất cả trạng thái</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{filtered.length} dịch vụ</p>
      </div>

      <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">Dịch vụ</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide">Giá</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">Mô tả</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">Trạng thái</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">Cập nhật</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((service) => (
                <tr key={service.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-medium text-foreground">{service.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm font-semibold text-accent">{formatVND(service.price)}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">{service.description}</td>
                  <td className="px-6 py-4"><StatusBadge status={service.status} /></td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{service.lastModified}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setSelectedService(service.id); setScreen("service-form"); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa"><Edit className="w-4 h-4" /></button>
                      <button className="p-2 text-destructive hover:bg-red-50 rounded-lg transition-colors" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">Không tìm thấy dịch vụ nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Hiển thị <strong>{filtered.length}</strong> / {SERVICES.length} dịch vụ</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-border rounded-lg hover:bg-card transition-colors text-sm">Trước</button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm">1</button>
          <button className="px-4 py-2 border border-border rounded-lg hover:bg-card transition-colors text-sm">Sau</button>
        </div>
      </div>
    </div>
  );
};

interface ServiceFormProps {
  selectedService: number | null;
  setScreen: (s: Screen) => void;
}

export const ServiceFormScreen = ({ selectedService, setScreen }: ServiceFormProps) => {
  const isEdit = selectedService !== null;
  const service = isEdit ? SERVICES.find((s) => s.id === selectedService) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">{isEdit ? "Edit Service" : "Add New Service"}</h1>
          <p className="text-muted-foreground">{isEdit ? `Update details for ${service?.name}` : "Create a new wedding service"}</p>
        </div>
        <button onClick={() => setScreen("service-list")} className="px-6 py-3 border border-border text-foreground rounded-xl hover:bg-secondary transition-all">Back to List</button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">Service Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Service Name <span className="text-destructive">*</span></label>
                <input type="text" defaultValue={service?.name} placeholder="e.g., Professional Photography" className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Price (VND) <span className="text-destructive">*</span></label>
                <input type="number" defaultValue={service?.price} placeholder="15000000" className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description <span className="text-destructive">*</span></label>
                <textarea rows={5} defaultValue={service?.description} placeholder="Describe what's included in this service package..." className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">Service Image</h3>
            {isEdit && service?.image && (
              <div className="relative rounded-xl overflow-hidden border border-border mb-4">
                <img src={service.image} alt={service.name} className="w-full h-64 object-cover" />
                <button className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm"><Trash2 className="w-4 h-4 text-destructive" /></button>
              </div>
            )}
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent hover:bg-accent/5 transition-all cursor-pointer">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (max. 5MB)</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">Status & Metadata</h3>
            <div className="space-y-4">
              {isEdit && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                  <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={service?.status === "Active"} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                    <span className="text-sm font-medium">{service?.status || "Active"}</span>
                  </div>
                </div>
              )}
              {isEdit && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Last Modified</label>
                  <input type="text" value={service?.lastModified || ""} disabled className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-muted-foreground cursor-not-allowed" />
                </div>
              )}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs text-blue-900"><strong>Tip:</strong> Use high-quality images to showcase your services professionally.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm font-medium">{isEdit ? "Update Service" : "Create Service"}</button>
            <button onClick={() => setScreen("service-list")} className="w-full py-3 border border-border text-foreground rounded-xl hover:bg-secondary transition-all font-medium">Cancel</button>
            {isEdit && <button className="w-full py-3 border border-destructive text-destructive rounded-xl hover:bg-red-50 transition-all font-medium">Delete Service</button>}
          </div>
        </div>
      </div>
    </div>
  );
};