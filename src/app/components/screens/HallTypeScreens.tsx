import React from "react";
import { Plus, Filter, Search, Edit, Trash2, Layers, DollarSign, Building2, AlertCircle } from "lucide-react";
import { Screen } from "../../types";
import { HALL_TYPES, HALLS } from "../../data";
import { formatVND, StatusBadge } from "../../utils";

interface HallTypeListProps {
  setSelectedHallType: (id: number | null) => void;
  setScreen: (s: Screen) => void;
}

export const HallTypeListScreen = ({ setSelectedHallType, setScreen }: HallTypeListProps) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-primary mb-2">Hall Type Management</h1>
        <p className="text-muted-foreground">Define and manage hall types with base pricing</p>
      </div>
      <button onClick={() => { setSelectedHallType(null); setScreen("hall-type-form"); }} className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm">
        <Plus className="w-5 h-5" /> Add Hall Type
      </button>
    </div>

    <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input type="text" placeholder="Search by hall type name..." className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent/50" />
          </div>
        </div>
        <input type="number" placeholder="Min Base Price" className="px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent/50 w-48" />
        <select className="px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent/50">
          <option>All Status</option><option>Active</option><option>Inactive</option>
        </select>
        <button className="flex items-center gap-2 px-6 py-3 border border-border rounded-xl hover:bg-secondary transition-all">
          <Filter className="w-5 h-5" /> Filter
        </button>
      </div>
    </div>

    <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary sticky top-0">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Hall Type Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Base Price</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Description</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Last Modified</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {HALL_TYPES.map((type) => (
              <tr key={type.id} className="hover:bg-secondary/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-accent" />
                    </div>
                    <span className="font-semibold text-foreground">{type.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4"><span className="font-mono text-sm font-medium text-foreground">{formatVND(type.basePrice)}</span></td>
                <td className="px-6 py-4"><p className="text-sm text-muted-foreground max-w-md line-clamp-2">{type.description}</p></td>
                <td className="px-6 py-4"><StatusBadge status={type.status} /></td>
                <td className="px-6 py-4"><span className="text-sm text-muted-foreground">{type.lastModified}</span></td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => { setSelectedHallType(type.id); setScreen("hall-type-form"); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-6">
      <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center"><Layers className="w-6 h-6 text-green-600" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Active Types</p>
            <p className="text-2xl font-semibold text-foreground">{HALL_TYPES.filter((t) => t.status === "Active").length}</p>
          </div>
        </div>
      </div>
      <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center"><DollarSign className="w-6 h-6 text-accent" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Avg Base Price</p>
            <p className="text-2xl font-semibold text-foreground font-mono">{formatVND(HALL_TYPES.reduce((acc, t) => acc + t.basePrice, 0) / HALL_TYPES.length)}</p>
          </div>
        </div>
      </div>
      <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center"><Building2 className="w-6 h-6 text-blue-600" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Total Halls</p>
            <p className="text-2xl font-semibold text-foreground">{HALLS.length}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface HallTypeFormProps {
  selectedHallType: number | null;
  setScreen: (s: Screen) => void;
}

export const HallTypeFormScreen = ({ selectedHallType, setScreen }: HallTypeFormProps) => {
  const isEdit = selectedHallType !== null;
  const hallType = isEdit ? HALL_TYPES.find((t) => t.id === selectedHallType) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">{isEdit ? "Edit Hall Type" : "Add New Hall Type"}</h1>
          <p className="text-muted-foreground">{isEdit ? `Update details for ${hallType?.name}` : "Create a new hall type category"}</p>
        </div>
        <button onClick={() => setScreen("hall-type-list")} className="px-6 py-3 border border-border text-foreground rounded-xl hover:bg-secondary transition-all">Back to List</button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">Hall Type Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Hall Type Name <span className="text-destructive">*</span></label>
                <input type="text" defaultValue={hallType?.name} placeholder="e.g., Premium" className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all" />
                <p className="text-xs text-muted-foreground mt-1">Must be unique and descriptive</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Base Price (VND) <span className="text-destructive">*</span></label>
                <input type="number" defaultValue={hallType?.basePrice} placeholder="15000000" className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all font-mono" />
                <p className="text-xs text-muted-foreground mt-1">Minimum price per table for this hall type</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea rows={5} defaultValue={hallType?.description} placeholder="Describe the hall type features..." className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none" />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">Base Price Guidelines</p>
                <p className="text-xs text-blue-800">The base price sets the minimum pricing floor for all halls of this type.</p>
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
                      <input type="checkbox" defaultChecked={hallType?.status === "Active"} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                    <span className="text-sm font-medium">{hallType?.status || "Active"}</span>
                  </div>
                </div>
              )}
              {isEdit && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Last Modified</label>
                  <input type="text" value={hallType?.lastModified || ""} disabled className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-muted-foreground cursor-not-allowed" />
                </div>
              )}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-900"><strong>Important:</strong> Changing the base price will affect all halls using this type.</p>
              </div>
            </div>
          </div>

          {isEdit && (
            <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
              <h3 className="text-lg font-semibold text-primary mb-4">Halls Using This Type</h3>
              <div className="space-y-2">
                {HALLS.filter((h) => h.type === hallType?.name).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No halls are using this type</p>
                ) : (
                  HALLS.filter((h) => h.type === hallType?.name).map((hall) => (
                    <div key={hall.id} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                      <Building2 className="w-4 h-4 text-accent flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground flex-1">{hall.name}</span>
                      <StatusBadge status={hall.status} />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm font-medium">
              {isEdit ? "Update Hall Type" : "Create Hall Type"}
            </button>
            <button onClick={() => setScreen("hall-type-list")} className="w-full py-3 border border-border text-foreground rounded-xl hover:bg-secondary transition-all font-medium">Cancel</button>
            {isEdit && HALLS.filter((h) => h.type === hallType?.name).length === 0 && (
              <button className="w-full py-3 border border-destructive text-destructive rounded-xl hover:bg-red-50 transition-all font-medium">Delete Hall Type</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
