import React, { useState } from "react";
import { Plus, Search, Edit, Trash2, AlertCircle, CheckCircle2, X, Save } from "lucide-react";
import { StatusBadge } from "../../utils";

type DishType = {
  id: number; name: string; description: string; status: string; deleted: boolean; lastModified: string;
};

interface Props {
  dishTypes: DishType[];
  setDishTypes: React.Dispatch<React.SetStateAction<DishType[]>>;
}

export const DishTypeListScreen = ({ dishTypes, setDishTypes }: Props) => {
  const [dtSearch, setDtSearch] = useState("");
  const [dtStatus, setDtStatus] = useState("All");
  const [showDtForm, setShowDtForm] = useState(false);
  const [editingDt, setEditingDt] = useState<DishType | null>(null);
  const [dtFormName, setDtFormName] = useState("");
  const [dtFormDesc, setDtFormDesc] = useState("");
  const [dtFormStatus, setDtFormStatus] = useState(true);
  const [dtMsg, setDtMsg] = useState<{ type: "success" | "error" | "warn"; text: string } | null>(null);

  const filtered = dishTypes
    .filter((d) => !d.deleted)
    .filter((d) => dtSearch === "" || d.name.toLowerCase().includes(dtSearch.toLowerCase()))
    .filter((d) => dtStatus === "All" || d.status === dtStatus)
    .sort((a, b) => b.lastModified.localeCompare(a.lastModified));

  const openAdd = () => {
    setEditingDt(null); setDtFormName(""); setDtFormDesc(""); setDtFormStatus(true); setDtMsg(null); setShowDtForm(true);
  };

  const openEdit = (dt: DishType) => {
    setEditingDt(dt); setDtFormName(dt.name); setDtFormDesc(dt.description); setDtFormStatus(dt.status === "Active"); setDtMsg(null); setShowDtForm(true);
  };

  const saveDt = () => {
    if (!dtFormName.trim()) { setDtMsg({ type: "error", text: "MSG 2: Dish type name is required." }); return; }
    const dup = dishTypes.find((d) => d.name.toLowerCase() === dtFormName.trim().toLowerCase() && !d.deleted && (!editingDt || d.id !== editingDt.id));
    if (dup) { setDtMsg({ type: "warn", text: "MSG 49: Dish type name already exists." }); return; }
    const now = new Date().toISOString();
    if (editingDt) {
      setDishTypes(dishTypes.map((d) => d.id === editingDt.id ? { ...d, name: dtFormName.trim(), description: dtFormDesc, status: dtFormStatus ? "Active" : "Inactive", lastModified: now } : d));
      setDtMsg({ type: "success", text: "MSG 17: Dish type updated successfully." });
    } else {
      const newId = Math.max(0, ...dishTypes.map((d) => d.id)) + 1;
      setDishTypes([...dishTypes, { id: newId, name: dtFormName.trim(), description: dtFormDesc, status: "Active", deleted: false, lastModified: now }]);
      setDtMsg({ type: "success", text: "Dish type created successfully." });
    }
    setShowDtForm(false);
  };

  const deleteDt = (id: number) => setDishTypes(dishTypes.map((d) => d.id === id ? { ...d, deleted: true } : d));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">Dish Types</h1>
          <p className="text-muted-foreground">Manage dish type categories used across all menus</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm">
          <Plus className="w-5 h-5" /> Add Dish Type
        </button>
      </div>

      {dtMsg && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm ${dtMsg.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : dtMsg.type === "warn" ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          {dtMsg.type === "success" ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          {dtMsg.text}
          <button onClick={() => setDtMsg(null)} className="ml-auto p-1 hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="bg-card rounded-[20px] p-5 border border-border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Dish Type Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={dtSearch} onChange={(e) => setDtSearch(e.target.value)} placeholder="Search by name..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
            <select value={dtStatus} onChange={(e) => setDtStatus(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
              <option value="All">All</option><option value="Active">Active</option><option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{filtered.length} result(s) found</p>
      </div>

      <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">Description</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">Last Modified</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((dt) => (
              <tr key={dt.id} className="hover:bg-secondary/40 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{dt.name}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground max-w-sm truncate">{dt.description}</td>
                <td className="px-6 py-4"><StatusBadge status={dt.status} /></td>
                <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{dt.lastModified.slice(0, 16).replace("T", " ")}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => openEdit(dt)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => deleteDt(dt.id)} className="p-2 text-destructive hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">No dish types found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showDtForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-card rounded-[24px] shadow-xl border border-border w-full max-w-lg">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary">{editingDt ? "Edit Dish Type" : "Add Dish Type"}</h2>
              <button onClick={() => setShowDtForm(false)} className="p-2 hover:bg-secondary rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Dish Type Name <span className="text-destructive">*</span></label>
                <input type="text" value={dtFormName} onChange={(e) => setDtFormName(e.target.value)} placeholder="e.g., Khai vị" className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea rows={3} value={dtFormDesc} onChange={(e) => setDtFormDesc(e.target.value)} placeholder="Optional description..." className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent resize-none" />
              </div>
              {editingDt && (
                <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={dtFormStatus} onChange={(e) => setDtFormStatus(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
                  </label>
                  <span className="text-sm font-medium">{dtFormStatus ? "Active" : "Inactive"}</span>
                </div>
              )}
              {dtMsg && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${dtMsg.type === "error" || dtMsg.type === "warn" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{dtMsg.text}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowDtForm(false)} className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-secondary transition-all">Cancel</button>
              <button onClick={saveDt} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 transition-all flex items-center gap-2">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
