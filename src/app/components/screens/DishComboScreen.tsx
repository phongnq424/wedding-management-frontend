import React, { useState } from "react";
import {
  Plus, Search, Edit, Trash2, AlertCircle, CheckCircle2, X, Save, ChevronRight, Percent,
} from "lucide-react";
import { formatVND, StatusBadge } from "../../utils";
import { MAX_COMBO_DISCOUNT_RATE } from "../../data";

type DishType = { id: number; name: string; description: string; status: string; deleted: boolean; lastModified: string };
type Dish = { id: number; name: string; dishTypeId: number; dishTypeName: string; unitPrice: number; description: string; status: string; deleted: boolean; lastModified: string };
type ComboSlot = { slotId: number; dishTypeId: number; dishTypeName: string; defaultDishId: number; defaultDishName: string; isReplaceable: boolean; displayOrder: number; unitPrice: number };
type DishCombo = { id: number; name: string; comboDiscountRate: number; description: string; status: string; deleted: boolean; lastModified: string; slots: ComboSlot[] };
type FormSlot = { slotId: number; dishTypeId: number | ""; dishTypeName: string; defaultDishId: number | ""; defaultDishName: string; isReplaceable: boolean; displayOrder: number; unitPrice: number };

interface Props {
  dishCombos: DishCombo[];
  setDishCombos: React.Dispatch<React.SetStateAction<DishCombo[]>>;
  dishes: Dish[];
  dishTypes: DishType[];
}

export const DishComboListScreen = ({ dishCombos, setDishCombos, dishes, dishTypes }: Props) => {
  const [dcSearch, setDcSearch] = useState("");
  const [dcDishName, setDcDishName] = useState("");
  const [dcRateFrom, setDcRateFrom] = useState("");
  const [dcRateTo, setDcRateTo] = useState("");
  const [dcReplaceable, setDcReplaceable] = useState("All");
  const [dcStatus, setDcStatus] = useState("All");
  const [showDcForm, setShowDcForm] = useState(false);
  const [editingDc, setEditingDc] = useState<DishCombo | null>(null);
  const [dcFormName, setDcFormName] = useState("");
  const [dcFormRate, setDcFormRate] = useState("");
  const [dcFormDesc, setDcFormDesc] = useState("");
  const [dcFormStatus, setDcFormStatus] = useState(true);
  const [dcFormSlots, setDcFormSlots] = useState<FormSlot[]>([]);
  const [dcMsg, setDcMsg] = useState<{ type: "success" | "error" | "warn"; text: string } | null>(null);
  const [expandedCombo, setExpandedCombo] = useState<number | null>(null);
  const [dcPage, setDcPage] = useState(1);
  const PAGE_SIZE = 20;

  const activeDishTypes = dishTypes.filter((d) => !d.deleted && d.status === "Active");
  const activeDishes = dishes.filter((d) => !d.deleted && d.status === "Active");

  const filtered = dishCombos
    .filter((c) => !c.deleted)
    .filter((c) => dcSearch === "" || c.name.toLowerCase().includes(dcSearch.toLowerCase()))
    .filter((c) => dcDishName === "" || c.slots.some((s) => s.defaultDishName.toLowerCase().includes(dcDishName.toLowerCase())))
    .filter((c) => dcRateFrom === "" || c.comboDiscountRate >= Number(dcRateFrom))
    .filter((c) => dcRateTo === "" || c.comboDiscountRate <= Number(dcRateTo))
    .filter((c) => dcReplaceable === "All" || (dcReplaceable === "Yes" ? c.slots.some((s) => s.isReplaceable) : c.slots.every((s) => !s.isReplaceable)))
    .filter((c) => dcStatus === "All" || c.status === dcStatus)
    .sort((a, b) => b.lastModified.localeCompare(a.lastModified));

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((dcPage - 1) * PAGE_SIZE, dcPage * PAGE_SIZE);

  const addSlot = () => {
    const newSlot: FormSlot = { slotId: Date.now(), dishTypeId: "", dishTypeName: "", defaultDishId: "", defaultDishName: "", isReplaceable: false, displayOrder: dcFormSlots.length + 1, unitPrice: 0 };
    setDcFormSlots([...dcFormSlots, newSlot]);
  };

  const removeSlot = (slotId: number) => setDcFormSlots(dcFormSlots.filter((s) => s.slotId !== slotId));

  const updateSlot = (slotId: number, field: string, value: number | boolean) => {
    setDcFormSlots(dcFormSlots.map((s) => {
      if (s.slotId !== slotId) return s;
      if (field === "dishTypeId") {
        const newTypeId = value as number | "";
        return {
          ...s,
          dishTypeId: newTypeId,
          dishTypeName: dishTypes.find((t) => t.id === Number(value))?.name || "",
          defaultDishId: "" as const,
          defaultDishName: "",
          unitPrice: 0,
        };
      }
      if (field === "defaultDishId") {
        const d = activeDishes.find((d) => d.id === Number(value));
        return {
          ...s,
          defaultDishId: value as number,
          defaultDishName: d?.name || "",
          unitPrice: d?.unitPrice || 0,
        };
      }
      // isReplaceable
      return { ...s, isReplaceable: value as boolean };
    }));
  };

  const estOriginal = dcFormSlots.reduce((s, sl) => s + sl.unitPrice, 0);
  const estCombo = dcFormRate ? estOriginal * (1 - Number(dcFormRate) / 100) : 0;

  const openAddDc = () => {
    setEditingDc(null); setDcFormName(""); setDcFormRate(""); setDcFormDesc(""); setDcFormStatus(true); setDcFormSlots([]);
    setDcMsg(null); setShowDcForm(true);
  };
  const openEditDc = (c: DishCombo) => {
    setEditingDc(c); setDcFormName(c.name); setDcFormRate(String(c.comboDiscountRate)); setDcFormDesc(c.description); setDcFormStatus(c.status === "Active");
    setDcFormSlots(c.slots.map((s) => ({ ...s })));
    setDcMsg(null); setShowDcForm(true);
  };

  const saveDc = () => {
    if (!dcFormName.trim() || !dcFormRate || dcFormSlots.length === 0) { setDcMsg({ type: "error", text: "MSG 2: Combo name, discount rate and at least one slot are required." }); return; }
    const rate = Number(dcFormRate);
    if (rate <= 0) { setDcMsg({ type: "error", text: "MSG 13: Discount rate must be greater than 0." }); return; }
    if (rate >= MAX_COMBO_DISCOUNT_RATE) { setDcMsg({ type: "warn", text: `MSG 74: Discount rate must be less than ${MAX_COMBO_DISCOUNT_RATE}%.` }); return; }
    const validSlots = dcFormSlots.filter((s) => s.dishTypeId !== "" && s.defaultDishId !== "");
    if (validSlots.length < 2) { setDcMsg({ type: "error", text: "MSG 47: Combo must contain at least 2 dishes." }); return; }
    const dupName = dishCombos.find((c) => c.name.toLowerCase() === dcFormName.trim().toLowerCase() && !c.deleted && (!editingDc || c.id !== editingDc.id));
    if (dupName) { setDcMsg({ type: "warn", text: "MSG 49: Combo name already exists." }); return; }
    const newDishIds = new Set(validSlots.map((s) => s.defaultDishId));
    const dup = dishCombos.find((c) => !c.deleted && (!editingDc || c.id !== editingDc.id) && c.slots.length === validSlots.length && c.slots.every((s) => newDishIds.has(s.defaultDishId)));
    if (dup) { setDcMsg({ type: "warn", text: "MSG 73: A combo with this exact dish list already exists." }); return; }
    const now = new Date().toISOString();
    const finalSlots: ComboSlot[] = validSlots.map((s, i) => ({
      slotId: s.slotId,
      dishTypeId: s.dishTypeId as number,
      dishTypeName: s.dishTypeName,
      defaultDishId: s.defaultDishId as number,
      defaultDishName: s.defaultDishName,
      isReplaceable: s.isReplaceable,
      displayOrder: i + 1,
      unitPrice: s.unitPrice,
    }));
    if (editingDc) {
      setDishCombos(dishCombos.map((c) => c.id === editingDc.id ? { ...c, name: dcFormName.trim(), comboDiscountRate: rate, description: dcFormDesc, status: dcFormStatus ? "Active" : "Inactive", lastModified: now, slots: finalSlots } : c));
    } else {
      const newId = Math.max(0, ...dishCombos.map((c) => c.id)) + 1;
      setDishCombos([...dishCombos, { id: newId, name: dcFormName.trim(), comboDiscountRate: rate, description: dcFormDesc, status: "Active", deleted: false, lastModified: now, slots: finalSlots }]);
    }
    setShowDcForm(false);
  };

  const deleteDc = (id: number) => setDishCombos(dishCombos.map((c) => c.id === id ? { ...c, deleted: true } : c));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">Dish Combos</h1>
          <p className="text-muted-foreground">Manage dish combo packages with slot-based configuration</p>
        </div>
        <button onClick={openAddDc} className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm">
          <Plus className="w-5 h-5" /> Add Combo
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Combos", value: dishCombos.filter((c) => !c.deleted).length, color: "text-primary" },
          { label: "Active", value: dishCombos.filter((c) => !c.deleted && c.status === "Active").length, color: "text-emerald-700" },
          { label: "Inactive", value: dishCombos.filter((c) => !c.deleted && c.status === "Inactive").length, color: "text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-[16px] p-5 border border-border shadow-sm">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-[20px] p-5 border border-border shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Combo Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={dcSearch} onChange={(e) => setDcSearch(e.target.value)} placeholder="Search combo name..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Dish Name</label>
            <input type="text" value={dcDishName} onChange={(e) => setDcDishName(e.target.value)} placeholder="e.g., Gà quay" className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Discount % From–To</label>
            <div className="flex gap-1">
              <input type="number" value={dcRateFrom} onChange={(e) => setDcRateFrom(e.target.value)} placeholder="0" className="w-full px-2 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 font-mono" />
              <span className="self-center text-muted-foreground text-xs">–</span>
              <input type="number" value={dcRateTo} onChange={(e) => setDcRateTo(e.target.value)} placeholder="25" className="w-full px-2 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Replaceable</label>
            <select value={dcReplaceable} onChange={(e) => setDcReplaceable(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
              <option value="All">All</option><option value="Yes">Has Replaceable</option><option value="No">None Replaceable</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
            <select value={dcStatus} onChange={(e) => setDcStatus(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
              <option value="All">All</option><option value="Active">Active</option><option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{filtered.length} result(s) found</p>
      </div>

      <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">Combo Name</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide">Discount %</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">Slot Summary</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide">Slots</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide">Replaceable</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">Last Modified</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.map((combo) => {
                const replaceableCount = combo.slots.filter((s) => s.isReplaceable).length;
                return (
                  <React.Fragment key={combo.id}>
                    <tr className="hover:bg-secondary/40 transition-colors">
                      <td className="px-6 py-4">
                        <button onClick={() => setExpandedCombo(expandedCombo === combo.id ? null : combo.id)} className="flex items-center gap-2 font-medium text-foreground hover:text-accent transition-colors text-left">
                          <ChevronRight className={`w-4 h-4 transition-transform ${expandedCombo === combo.id ? "rotate-90" : ""}`} />
                          {combo.name}
                        </button>
                        {combo.description && <p className="text-xs text-muted-foreground mt-0.5 ml-6 truncate max-w-xs">{combo.description}</p>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold">
                          <Percent className="w-3 h-3" />{combo.comboDiscountRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        <div className="space-y-0.5">
                          {combo.slots.slice(0, 3).map((s) => (
                            <p key={s.slotId}><span className="text-foreground font-medium">{s.dishTypeName}:</span> {s.defaultDishName}</p>
                          ))}
                          {combo.slots.length > 3 && <p className="text-accent">+{combo.slots.length - 3} more</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-sm font-semibold">{combo.slots.length}</td>
                      <td className="px-6 py-4 text-center font-mono text-sm">{replaceableCount}</td>
                      <td className="px-6 py-4"><StatusBadge status={combo.status} /></td>
                      <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{combo.lastModified.slice(0, 16).replace("T", " ")}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditDc(combo)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => deleteDc(combo.id)} className="p-2 text-destructive hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                    {expandedCombo === combo.id && (
                      <tr className="bg-secondary/30">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                            {combo.slots.map((s) => (
                              <div key={s.slotId} className="bg-card rounded-xl p-3 border border-border">
                                <p className="text-xs text-muted-foreground mb-1">#{s.displayOrder} · {s.dishTypeName}</p>
                                <p className="text-sm font-medium text-foreground leading-tight">{s.defaultDishName}</p>
                                <p className="text-xs font-mono text-accent mt-1">{formatVND(s.unitPrice)}</p>
                                {s.isReplaceable && <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700">Replaceable</span>}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-sm text-muted-foreground">No combos found matching the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-secondary/30">
            <p className="text-sm text-muted-foreground">Page {dcPage} of {totalPages} ({filtered.length} results)</p>
            <div className="flex items-center gap-2">
              <button disabled={dcPage === 1} onClick={() => setDcPage(dcPage - 1)} className="px-4 py-2 border border-border rounded-lg hover:bg-card text-sm disabled:opacity-40">Previous</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setDcPage(p)} className={`px-4 py-2 rounded-lg text-sm ${p === dcPage ? "bg-primary text-primary-foreground" : "border border-border hover:bg-card"}`}>{p}</button>
              ))}
              <button disabled={dcPage === totalPages} onClick={() => setDcPage(dcPage + 1)} className="px-4 py-2 border border-border rounded-lg hover:bg-card text-sm disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {showDcForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-[24px] shadow-xl border border-border w-full max-w-3xl max-h-[92vh] flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-semibold text-primary">{editingDc ? "Edit Combo" : "Add Dish Combo"}</h2>
              <button onClick={() => setShowDcForm(false)} className="p-2 hover:bg-secondary rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Combo Name <span className="text-destructive">*</span></label>
                  <input type="text" value={dcFormName} onChange={(e) => setDcFormName(e.target.value)} placeholder="e.g., Combo Cưới Cao Cấp" className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Discount Rate (%) <span className="text-destructive">*</span></label>
                  <input type="number" value={dcFormRate} onChange={(e) => setDcFormRate(e.target.value)} placeholder={`1–${MAX_COMBO_DISCOUNT_RATE - 1}`} className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent font-mono" />
                  <p className="text-xs text-muted-foreground mt-1">Max: {MAX_COMBO_DISCOUNT_RATE - 1}%</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea rows={2} value={dcFormDesc} onChange={(e) => setDcFormDesc(e.target.value)} placeholder="Optional description..." className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent resize-none" />
              </div>

              {editingDc && (
                <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={dcFormStatus} onChange={(e) => setDcFormStatus(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
                  </label>
                  <span className="text-sm font-medium">{dcFormStatus ? "Active" : "Inactive"}</span>
                </div>
              )}

              {dcFormRate && estOriginal > 0 && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-accent/5 border border-accent/20 rounded-xl">
                  <div>
                    <p className="text-xs text-muted-foreground">Est. Original Price/Table</p>
                    <p className="text-base font-semibold text-foreground font-mono">{formatVND(estOriginal)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Est. Combo Price/Table</p>
                    <p className="text-base font-semibold text-accent font-mono">{formatVND(estCombo)}</p>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-foreground">Combo Slots <span className="text-destructive">*</span></label>
                  <button onClick={addSlot} className="flex items-center gap-1.5 px-3 py-1.5 border border-accent text-accent rounded-lg text-xs hover:bg-accent/5 transition-all">
                    <Plus className="w-3.5 h-3.5" /> Add Slot
                  </button>
                </div>
                {dcFormSlots.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground">No slots added yet. Click "Add Slot" to begin.</div>
                )}
                <div className="space-y-3">
                  {dcFormSlots.map((slot, idx) => {
                    const dishesForType = activeDishes.filter((d) => slot.dishTypeId !== "" && d.dishTypeId === slot.dishTypeId);
                    return (
                      <div key={slot.slotId} className="border border-border rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Slot {idx + 1}</span>
                          <button onClick={() => removeSlot(slot.slotId)} className="p-1 text-destructive hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Dish Type</label>
                            <select value={slot.dishTypeId} onChange={(e) => updateSlot(slot.slotId, "dishTypeId", Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
                              <option value="">Select type</option>
                              {activeDishTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Default Dish</label>
                            <select value={slot.defaultDishId} disabled={slot.dishTypeId === ""} onChange={(e) => updateSlot(slot.slotId, "defaultDishId", Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50">
                              <option value="">Select dish</option>
                              {dishesForType.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="block text-xs font-medium text-muted-foreground">Replaceable</label>
                            <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                              <input type="checkbox" checked={slot.isReplaceable} onChange={(e) => updateSlot(slot.slotId, "isReplaceable", e.target.checked)} className="w-4 h-4 rounded border-border text-accent focus:ring-accent" />
                              <span className="text-sm">{slot.isReplaceable ? "Yes" : "No"}</span>
                            </label>
                          </div>
                        </div>
                        {slot.unitPrice > 0 && (
                          <p className="text-xs text-muted-foreground font-mono">Unit price: {formatVND(slot.unitPrice)}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {dcMsg && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${dcMsg.type === "success" ? "bg-emerald-50 text-emerald-700" : dcMsg.type === "warn" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{dcMsg.text}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3 flex-shrink-0">
              <button onClick={() => setShowDcForm(false)} className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-secondary transition-all">Cancel</button>
              <button onClick={saveDc} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 transition-all flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Combo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
