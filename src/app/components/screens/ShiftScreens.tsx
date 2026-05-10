import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Filter,
  Clock,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Save,
} from "lucide-react";

import { Screen } from "../../types";
import { StatusBadge } from "../../utils";
import { shiftService } from "../../services/shift.service";
import type { ShiftResponse } from "../../dto/shift.dto";
import { HallListSkeleton } from "./hall/HallListSkeleton";

type StatusLabel = "Active" | "Inactive";

type ShiftViewModel = ShiftResponse & {
  deleted: boolean;
  statusLabel: StatusLabel;
  lastModified: string;
  lastModifiedDisplay: string;
};

interface ShiftListProps {
  setSelectedShift?: (id: string | null) => void;
  setScreen?: (s: Screen) => void;
}

interface ShiftFormProps {
  selectedShift: string | null;
  setScreen: (s: Screen) => void;
}

function formatDateTime(value: string | null | undefined) {
  return value ? value.slice(0, 16).replace("T", " ") : "N/A";
}

function toInputTime(value: string | null | undefined) {
  if (!value) return "";
  return value.slice(0, 5);
}

function normalizeTime(value: string) {
  return value.length === 5 ? `${value}:00` : value;
}

function getDurationText(startTime: string, endTime: string) {
  if (!startTime || !endTime) return "N/A";

  const [startHour, startMin] = toInputTime(startTime).split(":").map(Number);
  const [endHour, endMin] = toInputTime(endTime).split(":").map(Number);

  const startTotal = startHour * 60 + startMin;
  const endTotal = endHour * 60 + endMin;

  if (endTotal <= startTotal) return "Invalid";

  const durationMinutes = endTotal - startTotal;
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function mapShiftToViewModel(item: ShiftResponse): ShiftViewModel {
  return {
    ...item,
    deleted: false,
    statusLabel: item.status === "ACTIVE" ? "Active" : "Inactive",
    lastModified: item.lastModifiedAt ?? "",
    lastModifiedDisplay: formatDateTime(item.lastModifiedAt),
  };
}

export const ShiftListScreen = (_props: ShiftListProps) => {
  const [shifts, setShifts] = useState<ShiftViewModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [shiftName, setShiftName] = useState("");
  const [startTimeFrom, setStartTimeFrom] = useState("00:00");
  const [endTimeTo, setEndTimeTo] = useState("23:59");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showShiftForm, setShowShiftForm] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftViewModel | null>(null);

  const [shiftFormName, setShiftFormName] = useState("");
  const [shiftFormStartTime, setShiftFormStartTime] = useState("00:00");
  const [shiftFormEndTime, setShiftFormEndTime] = useState("23:59");
  const [shiftFormStatus, setShiftFormStatus] = useState(true);

  const [msg, setMsg] = useState<{
    type: "success" | "error" | "warn";
    text: string;
  } | null>(null);

  async function loadShifts() {
    try {
      setLoading(true);
      setMsg(null);

      const data = await shiftService.getAll();
      setShifts(data.map(mapShiftToViewModel));
    } catch (error) {
      setMsg({
        type: "error",
        text: error instanceof Error ? error.message : "Cannot load shifts.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadShifts();
  }, []);

  const filtered = useMemo(() => {
    return shifts
      .filter((shift) => !shift.deleted)
      .filter(
        (shift) =>
          shiftName === "" ||
          shift.name.toLowerCase().includes(shiftName.toLowerCase())
      )
      .filter((shift) => toInputTime(shift.startTime) >= startTimeFrom)
      .filter((shift) => toInputTime(shift.endTime) <= endTimeTo)
      .filter(
        (shift) =>
          statusFilter === "All" || shift.statusLabel === statusFilter
      )
      .sort((a, b) => b.lastModified.localeCompare(a.lastModified));
  }, [shifts, shiftName, startTimeFrom, endTimeTo, statusFilter]);

  function resetForm() {
    setEditingShift(null);
    setShiftFormName("");
    setShiftFormStartTime("00:00");
    setShiftFormEndTime("23:59");
    setShiftFormStatus(true);
  }

  function openAddShift() {
    resetForm();
    setMsg(null);
    setShowShiftForm(true);
  }

  function openEditShift(shift: ShiftViewModel) {
    setEditingShift(shift);
    setShiftFormName(shift.name);
    setShiftFormStartTime(toInputTime(shift.startTime));
    setShiftFormEndTime(toInputTime(shift.endTime));
    setShiftFormStatus(shift.status === "ACTIVE");
    setMsg(null);
    setShowShiftForm(true);
  }

  function closeForm() {
    setShowShiftForm(false);
    resetForm();
  }

  function resetFilters() {
    setShiftName("");
    setStartTimeFrom("00:00");
    setEndTimeTo("23:59");
    setStatusFilter("All");
  }

  async function saveShift() {
    if (!shiftFormName.trim() || !shiftFormStartTime || !shiftFormEndTime) {
      setMsg({
        type: "error",
        text: "MSG2: Tên ca, thời gian bắt đầu và thời gian kết thúc không được để trống.",
      });
      return;
    }

    if (shiftFormStartTime >= shiftFormEndTime) {
      setMsg({
        type: "error",
        text: "MSG13: Thời gian kết thúc phải sau thời gian bắt đầu.",
      });
      return;
    }

    if (editingShift && !editingShift.lastModified) {
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
        name: shiftFormName.trim(),
        startTime: normalizeTime(shiftFormStartTime),
        endTime: normalizeTime(shiftFormEndTime),
        status: shiftFormStatus ? ("ACTIVE" as const) : ("INACTIVE" as const),
      };

      if (editingShift) {
        await shiftService.update(
          editingShift.id,
          payload,
          editingShift.lastModified
        );

        setMsg({
          type: "success",
          text: "MSG17: Ca được cập nhật thành công.",
        });
      } else {
        await shiftService.create(payload);

        setMsg({
          type: "success",
          text: "MSG48: Ca được tạo thành công.",
        });
      }

      closeForm();
      await loadShifts();
    } catch (error) {
      setMsg({
        type: "error",
        text: error instanceof Error ? error.message : "Cannot save shift.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function deleteShift(id: string) {
    const confirmed = window.confirm("Bạn có chắc muốn xóa ca này không?");
    if (!confirmed) return;

    try {
      setDeletingId(id);
      setMsg(null);

      await shiftService.remove(id, true);
      await loadShifts();

      setMsg({
        type: "success",
        text: "MSG20: Ca được xóa thành công.",
      });
    } catch (error) {
      setMsg({
        type: "error",
        text: error instanceof Error ? error.message : "Cannot delete shift.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <HallListSkeleton />;
  }

  const formDurationText =
    shiftFormStartTime && shiftFormEndTime
      ? getDurationText(shiftFormStartTime, shiftFormEndTime)
      : "N/A";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">
            Shift Management
          </h1>
          <p className="text-muted-foreground">
            Manage wedding event shifts and time slots
          </p>
        </div>

        <button
          onClick={openAddShift}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add New Shift
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

      <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Filters</h3>
          </div>

          <button
            onClick={resetFilters}
            className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Shift Name
            </label>

            <input
              type="text"
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              placeholder="Search by shift name..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Start Time From
            </label>

            <input
              type="time"
              value={startTimeFrom}
              onChange={(e) => setStartTimeFrom(e.target.value || "00:00")}
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              End Time To
            </label>

            <input
              type="time"
              value={endTimeTo}
              onChange={(e) => setEndTimeTo(e.target.value || "23:59")}
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            >
              <option value="All">All Status</option>
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
            <thead>
              <tr className="bg-secondary border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                  Shift Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                  Start Time
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                  End Time
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                  Duration
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                  Last Modified
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-primary">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((shift, index) => (
                <tr
                  key={shift.id}
                  className={`border-b border-border hover:bg-secondary/50 transition-colors ${index % 2 === 0 ? "bg-card" : "bg-secondary/20"
                    }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-accent" />
                      </div>

                      <span className="font-medium text-foreground">
                        {shift.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-mono text-sm">
                      {toInputTime(shift.startTime)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-mono text-sm">
                      {toInputTime(shift.endTime)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">
                      {getDurationText(shift.startTime, shift.endTime)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={shift.statusLabel} />
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground font-mono">
                      {shift.lastModifiedDisplay}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditShift(shift)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors group"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                      </button>

                      <button
                        onClick={() => deleteShift(shift.id)}
                        disabled={deletingId === shift.id}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors group disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-muted-foreground"
                  >
                    No shifts found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 bg-secondary/30 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing <strong>{filtered.length}</strong> / {shifts.length} shifts
          </p>

          <div className="flex gap-2">
            <button className="px-4 py-2 border border-border rounded-lg hover:bg-card transition-colors text-sm">
              Previous
            </button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm">
              1
            </button>
            <button className="px-4 py-2 border border-border rounded-lg hover:bg-card transition-colors text-sm">
              Next
            </button>
          </div>
        </div>
      </div>

      {showShiftForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-card rounded-[24px] shadow-xl border border-border w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary">
                {editingShift ? "Edit Shift" : "Add New Shift"}
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
                  Shift Name <span className="text-destructive">*</span>
                </label>

                <input
                  type="text"
                  value={shiftFormName}
                  onChange={(e) => setShiftFormName(e.target.value)}
                  placeholder="e.g., Morning Shift"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Start Time <span className="text-destructive">*</span>
                  </label>

                  <input
                    type="time"
                    value={shiftFormStartTime}
                    onChange={(e) =>
                      setShiftFormStartTime(e.target.value || "00:00")
                    }
                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    End Time <span className="text-destructive">*</span>
                  </label>

                  <input
                    type="time"
                    value={shiftFormEndTime}
                    onChange={(e) =>
                      setShiftFormEndTime(e.target.value || "23:59")
                    }
                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all font-mono"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-secondary border border-border">
                <p className="text-xs text-muted-foreground mb-1">
                  Calculated Duration
                </p>

                <p
                  className={`text-lg font-semibold font-mono ${formDurationText === "Invalid"
                      ? "text-destructive"
                      : "text-primary"
                    }`}
                >
                  {formDurationText}
                </p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shiftFormStatus}
                    onChange={(e) => setShiftFormStatus(e.target.checked)}
                    className="sr-only peer"
                  />

                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
                </label>

                <span className="text-sm font-medium">
                  {shiftFormStatus ? "Active" : "Inactive"}
                </span>
              </div>

              {editingShift && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Last Modified
                  </label>

                  <input
                    type="text"
                    value={editingShift.lastModifiedDisplay}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />

                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Shift Overlap Validation
                    </p>

                    <p className="text-xs text-blue-800">
                      Backend will validate time conflicts, duplicate names, and
                      safe update/delete rules.
                    </p>
                  </div>
                </div>
              </div>

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
                onClick={saveShift}
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
 * Shift add/edit is now handled by modal inside ShiftListScreen.
 */
export const ShiftFormScreen = ({ setScreen }: ShiftFormProps) => {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Shift form is now handled inside the Shift list modal.
      </p>

      <button
        onClick={() => setScreen("shift-list")}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl"
      >
        Back to Shift List
      </button>
    </div>
  );
};