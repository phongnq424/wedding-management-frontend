import React from "react";
import { Plus, Filter, Clock, Edit, Trash2, AlertCircle } from "lucide-react";
import { Screen } from "../../types";
import { SHIFTS } from "../../data";
import { StatusBadge } from "../../utils";

interface ShiftListProps {
  setSelectedShift: (id: number | null) => void;
  setScreen: (s: Screen) => void;
}

export const ShiftListScreen = ({ setSelectedShift, setScreen }: ShiftListProps) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-primary mb-2">Shift Management</h1>
        <p className="text-muted-foreground">Manage wedding event shifts and time slots</p>
      </div>
      <button onClick={() => { setSelectedShift(null); setScreen("shift-form"); }} className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm">
        <Plus className="w-5 h-5" /> Add New Shift
      </button>
    </div>

    <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
      <div className="flex items-center gap-3 mb-4"><Filter className="w-5 h-5 text-muted-foreground" /><h3 className="font-semibold">Filters</h3></div>
      <div className="grid grid-cols-4 gap-4">
        <input type="text" placeholder="Search by shift name..." className="px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all" />
        <input type="time" className="px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all font-mono" />
        <input type="time" className="px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all font-mono" />
        <select className="px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all">
          <option value="">All Status</option><option value="Active">Active</option><option value="Inactive">Inactive</option>
        </select>
      </div>
    </div>

    <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary border-b border-border">
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Shift Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Start Time</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">End Time</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Duration</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Last Modified</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {SHIFTS.map((shift, index) => {
              const [startHour, startMin] = shift.startTime.split(":").map(Number);
              const [endHour, endMin] = shift.endTime.split(":").map(Number);
              const durationHours = endHour - startHour + (endMin - startMin) / 60;
              return (
                <tr key={shift.id} className={`border-b border-border hover:bg-secondary/50 transition-colors ${index % 2 === 0 ? "bg-card" : "bg-secondary/20"}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0"><Clock className="w-5 h-5 text-accent" /></div>
                      <span className="font-medium text-foreground">{shift.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="font-mono text-sm">{shift.startTime}</span></td>
                  <td className="px-6 py-4"><span className="font-mono text-sm">{shift.endTime}</span></td>
                  <td className="px-6 py-4"><span className="text-sm text-muted-foreground">{durationHours.toFixed(1)}h</span></td>
                  <td className="px-6 py-4"><StatusBadge status={shift.status} /></td>
                  <td className="px-6 py-4"><span className="text-sm text-muted-foreground">{shift.lastModified}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setSelectedShift(shift.id); setScreen("shift-form"); }} className="p-2 hover:bg-secondary rounded-lg transition-colors group" title="Edit">
                        <Edit className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                      </button>
                      <button className="p-2 hover:bg-secondary rounded-lg transition-colors group" title="Delete">
                        <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-6 py-4 bg-secondary/30 border-t border-border">
        <p className="text-sm text-muted-foreground">Showing <strong>{SHIFTS.length}</strong> shifts</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-border rounded-lg hover:bg-card transition-colors text-sm">Previous</button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm">1</button>
          <button className="px-4 py-2 border border-border rounded-lg hover:bg-card transition-colors text-sm">Next</button>
        </div>
      </div>
    </div>
  </div>
);

interface ShiftFormProps {
  selectedShift: number | null;
  setScreen: (s: Screen) => void;
}

export const ShiftFormScreen = ({ selectedShift, setScreen }: ShiftFormProps) => {
  const isEdit = selectedShift !== null;
  const shift = isEdit ? SHIFTS.find((s) => s.id === selectedShift) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">{isEdit ? "Edit Shift" : "Add New Shift"}</h1>
          <p className="text-muted-foreground">{isEdit ? `Update details for ${shift?.name}` : "Create a new event shift"}</p>
        </div>
        <button onClick={() => setScreen("shift-list")} className="px-6 py-3 border border-border text-foreground rounded-xl hover:bg-secondary transition-all">Back to List</button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">Shift Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Shift Name <span className="text-destructive">*</span></label>
                <input type="text" defaultValue={shift?.name} placeholder="e.g., Morning Shift" className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all" />
                <p className="text-xs text-muted-foreground mt-1">Descriptive name for the shift</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Start Time <span className="text-destructive">*</span></label>
                  <input type="time" defaultValue={shift?.startTime} className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all font-mono" />
                  <p className="text-xs text-muted-foreground mt-1">24-hour format</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">End Time <span className="text-destructive">*</span></label>
                  <input type="time" defaultValue={shift?.endTime} className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all font-mono" />
                  <p className="text-xs text-muted-foreground mt-1">24-hour format</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">Shift Overlap Validation</p>
                <p className="text-xs text-blue-800">The system will automatically check for time overlaps with existing shifts.</p>
              </div>
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
                      <input type="checkbox" defaultChecked={shift?.status === "Active"} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                    <span className="text-sm font-medium">{shift?.status || "Active"}</span>
                  </div>
                </div>
              )}
              {isEdit && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Last Modified</label>
                  <input type="text" value={shift?.lastModified || ""} disabled className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-muted-foreground cursor-not-allowed" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm font-medium">{isEdit ? "Update Shift" : "Create Shift"}</button>
            <button onClick={() => setScreen("shift-list")} className="w-full py-3 border border-border text-foreground rounded-xl hover:bg-secondary transition-all font-medium">Cancel</button>
            {isEdit && <button className="w-full py-3 border border-destructive text-destructive rounded-xl hover:bg-red-50 transition-all font-medium">Delete Shift</button>}
          </div>
        </div>
      </div>
    </div>
  );
};
