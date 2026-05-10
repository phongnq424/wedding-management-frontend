import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Save,
  Upload,
} from "lucide-react";

import { Screen } from "../../types";
import { formatVND, StatusBadge } from "../../utils";
import { serviceService } from "../../services/service.service";
import type { ServiceResponse } from "../../dto/service.dto";
import { HallListSkeleton } from "./hall/HallListSkeleton";

type StatusLabel = "Active" | "Inactive";

type ServiceViewModel = ServiceResponse & {
  deleted: boolean;
  statusLabel: StatusLabel;
  lastModified: string;
  lastModifiedDisplay: string;
  descriptionText: string;
  image: string;
};

interface ServiceListProps {
  setSelectedService?: (id: string | null) => void;
  setScreen?: (s: Screen) => void;
}

interface ServiceFormProps {
  selectedService: string | null;
  setScreen: (s: Screen) => void;
}

function formatDateTime(value: string | null | undefined) {
  return value ? value.slice(0, 16).replace("T", " ") : "N/A";
}

function formatNumberWithDots(value: string | number) {
  const raw = String(value).replace(/\D/g, "");

  if (!raw) return "";

  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseDotMoney(value: string) {
  const raw = value.replace(/\./g, "").replace(/\D/g, "");

  return raw ? Number(raw) : 0;
}

function mapServiceToViewModel(item: ServiceResponse): ServiceViewModel {
  return {
    ...item,
    deleted: false,
    statusLabel: item.status === "ACTIVE" ? "Active" : "Inactive",
    lastModified: item.lastModifiedAt ?? "",
    lastModifiedDisplay: formatDateTime(item.lastModifiedAt),
    descriptionText: item.description ?? "",
    image: item.serviceImage ?? "",
  };
}

export const ServiceListScreen = (_props: ServiceListProps) => {
  const [services, setServices] = useState<ServiceViewModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<ServiceViewModel | null>(
    null
  );

  const [serviceFormName, setServiceFormName] = useState("");
  const [serviceFormPrice, setServiceFormPrice] = useState("");
  const [serviceFormDesc, setServiceFormDesc] = useState("");
  const [serviceFormStatus, setServiceFormStatus] = useState(true);
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");

  const [msg, setMsg] = useState<{
    type: "success" | "error" | "warn";
    text: string;
  } | null>(null);

  async function loadServices() {
    try {
      setLoading(true);
      setMsg(null);

      const data = await serviceService.getAll();

      setServices(data.map(mapServiceToViewModel));
    } catch (error) {
      setMsg({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Cannot load services.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  const filtered = useMemo(() => {
    const minPrice = parseDotMoney(priceFrom);
    const maxPrice = parseDotMoney(priceTo);

    return services
      .filter((service) => !service.deleted)
      .filter(
        (service) =>
          search === "" ||
          service.name.toLowerCase().includes(search.toLowerCase())
      )
      .filter((service) => priceFrom === "" || service.price >= minPrice)
      .filter((service) => priceTo === "" || service.price <= maxPrice)
      .filter(
        (service) =>
          statusFilter === "All" || service.statusLabel === statusFilter
      )
      .sort((a, b) => b.lastModified.localeCompare(a.lastModified));
  }, [services, search, priceFrom, priceTo, statusFilter]);

  function resetForm() {
    setEditingService(null);
    setServiceFormName("");
    setServiceFormPrice("");
    setServiceFormDesc("");
    setServiceFormStatus(true);
    setServiceImageFile(null);
    setPreviewImage("");
  }

  function openAddService() {
    resetForm();
    setMsg(null);
    setShowServiceForm(true);
  }

  function openEditService(service: ServiceViewModel) {
    setEditingService(service);
    setServiceFormName(service.name);
    setServiceFormPrice(formatNumberWithDots(service.price));
    setServiceFormDesc(service.descriptionText);
    setServiceFormStatus(service.status === "ACTIVE");
    setServiceImageFile(null);
    setPreviewImage(service.image);
    setMsg(null);
    setShowServiceForm(true);
  }

  function closeForm() {
    setShowServiceForm(false);
    resetForm();
  }

  function handleImageChange(file: File | null) {
    setServiceImageFile(file);

    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      return;
    }

    setPreviewImage(editingService?.image ?? "");
  }

  async function saveService() {
    if (!serviceFormName.trim() || !serviceFormPrice) {
      setMsg({
        type: "error",
        text: "MSG2: Tên dịch vụ và giá dịch vụ không được để trống.",
      });
      return;
    }

    const price = parseDotMoney(serviceFormPrice);

    if (price <= 0) {
      setMsg({
        type: "error",
        text: "MSG13: Giá dịch vụ phải lớn hơn 0.",
      });
      return;
    }

    if (editingService && !editingService.lastModified) {
      setMsg({
        type: "error",
        text: "Không thể cập nhật vì thiếu lastModifiedAt. Vui lòng tải lại trang.",
      });
      return;
    }

    try {
      setSaving(true);
      setMsg(null);

      const payload = {
        name: serviceFormName.trim(),
        price,
        description: serviceFormDesc.trim(),
        status: serviceFormStatus ? ("ACTIVE" as const) : ("INACTIVE" as const),
      };

      if (editingService) {
        await serviceService.update(
          editingService.id,
          payload,
          editingService.lastModified,
          serviceImageFile
        );

        setMsg({
          type: "success",
          text: "MSG17: Dịch vụ được cập nhật thành công.",
        });
      } else {
        await serviceService.create(payload, serviceImageFile);

        setMsg({
          type: "success",
          text: "MSG48: Dịch vụ được tạo thành công.",
        });
      }

      closeForm();
      await loadServices();
    } catch (error) {
      setMsg({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Cannot save service.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function deleteService(id: string) {
    const confirmed = window.confirm("Bạn có chắc muốn xóa dịch vụ này không?");

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setMsg(null);

      await serviceService.remove(id, true);
      await loadServices();

      setMsg({
        type: "success",
        text: "MSG20: Dịch vụ được xóa thành công.",
      });
    } catch (error) {
      setMsg({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Cannot delete service.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <HallListSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">
            Services
          </h1>
          <p className="text-muted-foreground">
            Manage additional wedding services and service pricing
          </p>
        </div>

        <button
          onClick={openAddService}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Service
        </button>
      </div>

      {msg && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border text-sm ${msg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : msg.type === "warn"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
        >
          {msg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}

          {msg.text}

          <button
            onClick={() => setMsg(null)}
            className="ml-auto p-1 hover:opacity-70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-card rounded-[20px] p-5 border border-border shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Service Name
            </label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Price From (VND)
            </label>

            <input
              type="text"
              inputMode="numeric"
              value={priceFrom}
              onChange={(e) =>
                setPriceFrom(formatNumberWithDots(e.target.value))
              }
              placeholder="0"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Price To (VND)
            </label>

            <input
              type="text"
              inputMode="numeric"
              value={priceTo}
              onChange={(e) =>
                setPriceTo(formatNumberWithDots(e.target.value))
              }
              placeholder="∞"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          {filtered.length} result(s) found
        </p>
      </div>

      <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                  Service Name
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                  Last Modified
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {filtered.map((service) => (
                <tr
                  key={service.id}
                  className="hover:bg-secondary/40 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {service.image ? (
                          <img
                            src={service.image}
                            alt={service.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground text-xs">
                            No img
                          </div>
                        )}
                      </div>

                      <span className="font-medium text-foreground">
                        {service.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right font-mono text-sm font-semibold text-foreground">
                    {formatVND(service.price)}
                  </td>

                  <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                    {service.descriptionText}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={service.statusLabel} />
                  </td>

                  <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                    {service.lastModifiedDisplay}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditService(service)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteService(service.id)}
                        disabled={deletingId === service.id}
                        className="p-2 text-destructive hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-muted-foreground"
                  >
                    No services found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showServiceForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-card rounded-[24px] shadow-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
              <h2 className="text-xl font-semibold text-primary">
                {editingService ? "Edit Service" : "Add Service"}
              </h2>

              <button
                onClick={closeForm}
                className="p-2 hover:bg-secondary rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Service Name <span className="text-destructive">*</span>
                </label>

                <input
                  type="text"
                  value={serviceFormName}
                  onChange={(e) => setServiceFormName(e.target.value)}
                  placeholder="e.g., Professional Photography"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Price (VND) <span className="text-destructive">*</span>
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  value={serviceFormPrice}
                  onChange={(e) =>
                    setServiceFormPrice(formatNumberWithDots(e.target.value))
                  }
                  placeholder="15.000.000"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Service Image
                </label>

                {previewImage && (
                  <div className="relative mb-3 h-40 overflow-hidden rounded-xl border border-border bg-muted">
                    <img
                      src={previewImage}
                      alt={serviceFormName || "Service image"}
                      className="h-full w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setServiceImageFile(null);
                        setPreviewImage("");
                      }}
                      className="absolute right-2 top-2 rounded-lg bg-white/90 p-2 shadow-sm hover:bg-white"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                )}

                <label className="block rounded-xl border-2 border-dashed border-border p-5 text-center transition-all hover:border-accent hover:bg-accent/5 cursor-pointer">
                  <Upload className="mx-auto mb-2 h-9 w-9 text-muted-foreground" />

                  <p className="text-sm font-medium text-foreground">
                    Upload one service image
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Only 1 image is allowed. PNG, JPG or WEBP.
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageChange(e.target.files?.[0] ?? null)
                    }
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>

                <textarea
                  rows={3}
                  value={serviceFormDesc}
                  onChange={(e) => setServiceFormDesc(e.target.value)}
                  placeholder="Optional description..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>

              {editingService && (
                <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={serviceFormStatus}
                      onChange={(e) =>
                        setServiceFormStatus(e.target.checked)
                      }
                      className="sr-only peer"
                    />

                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
                  </label>

                  <span className="text-sm font-medium">
                    {serviceFormStatus ? "Active" : "Inactive"}
                  </span>
                </div>
              )}

              {editingService && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                  <strong>Note:</strong> Service price changes apply only to
                  future bookings.
                </div>
              )}

              {msg && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm ${msg.type === "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : msg.type === "warn"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-red-50 text-red-700"
                    }`}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {msg.text}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button
                onClick={closeForm}
                className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-secondary transition-all"
              >
                Cancel
              </button>

              <button
                onClick={saveService}
                disabled={saving}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Compatibility export:
 * Flow chuẩn hiện tại là mở Add/Edit Service bằng modal trong ServiceListScreen,
 * giống DishListScreen. Component này giữ lại để App cũ không lỗi import.
 */
export const ServiceFormScreen = ({ setScreen }: ServiceFormProps) => {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Service form is now handled inside the Service list modal.
      </p>

      <button
        onClick={() => setScreen("service-list")}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl"
      >
        Back to Service List
      </button>
    </div>
  );
};