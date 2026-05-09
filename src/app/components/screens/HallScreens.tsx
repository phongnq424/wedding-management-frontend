import React, { useEffect, useState } from "react";
import {
  Plus, Filter, Eye, Edit, Trash2, X, AlertCircle, Upload, Grid3x3,
} from "lucide-react";
import { Screen } from "../../types";
import { hallService } from "../../services/hallService";
import { HallResponse } from "../../dto/hall.dto";
import { formatVND, StatusBadge } from "../../utils";

interface HallListProps {
  setSelectedHall: (id: string | null) => void;
  setScreen: (s: Screen) => void;
  showPriceModal: boolean;
  setShowPriceModal: (v: boolean) => void;
  selectedHall: string | null;
}

type HallViewModel = {
  id: string;
  name: string;
  type: string;
  minTables: number;
  maxTables: number;
  status: "Active" | "Inactive";
  image?: string;
  lastModified: string;
  basePrice: number;
};

function mapHallToViewModel(hall: HallResponse): HallViewModel {
  return {
    id: hall.id,
    name: hall.name,
    type: hall.hallTypeName,
    minTables: hall.minTables,
    maxTables: hall.maxTables,
    status: hall.status === "ACTIVE" ? "Active" : "Inactive",
    image: hall.hallImage,
    lastModified: hall.lastModifiedAt || "",
    basePrice: hall.basePrice,
  };
}
const SkeletonBlock = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-secondary ${className}`} />
);

const HallListSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="space-y-3">
        <SkeletonBlock className="h-8 w-72" />
        <SkeletonBlock className="h-4 w-96" />
      </div>
      <SkeletonBlock className="h-12 w-40 rounded-xl" />
    </div>

    <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <SkeletonBlock className="h-5 w-5 rounded-full" />
        <SkeletonBlock className="h-5 w-24" />
      </div>

      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-10 rounded-xl" />
        ))}
      </div>
    </div>

    <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
      <div className="bg-secondary px-6 py-4 grid grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-4" />
        ))}
      </div>

      <div className="divide-y divide-border">
        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="px-6 py-4 grid grid-cols-7 gap-4 items-center"
          >
            <div className="flex items-center gap-3">
              <SkeletonBlock className="h-12 w-16 rounded-lg" />
              <SkeletonBlock className="h-4 w-28" />
            </div>
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-4 w-12" />
            <SkeletonBlock className="h-4 w-12" />
            <SkeletonBlock className="h-6 w-20 rounded-full" />
            <SkeletonBlock className="h-4 w-28" />
            <div className="flex justify-center gap-2">
              <SkeletonBlock className="h-8 w-8 rounded-lg" />
              <SkeletonBlock className="h-8 w-8 rounded-lg" />
              <SkeletonBlock className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const HallFormSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="space-y-3">
        <SkeletonBlock className="h-8 w-56" />
        <SkeletonBlock className="h-4 w-80" />
      </div>
      <SkeletonBlock className="h-12 w-32 rounded-xl" />
    </div>

    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm space-y-5">
          <SkeletonBlock className="h-6 w-48" />
          <SkeletonBlock className="h-12 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-4">
            <SkeletonBlock className="h-12 rounded-xl" />
            <SkeletonBlock className="h-12 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SkeletonBlock className="h-12 rounded-xl" />
            <SkeletonBlock className="h-12 rounded-xl" />
          </div>
          <SkeletonBlock className="h-28 w-full rounded-xl" />
        </div>

        <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm space-y-4">
          <SkeletonBlock className="h-6 w-48" />
          <SkeletonBlock className="h-44 w-full rounded-xl" />
          <SkeletonBlock className="h-16 w-full rounded-xl" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm space-y-4">
          <SkeletonBlock className="h-6 w-32" />
          <SkeletonBlock className="aspect-[4/3] w-full rounded-xl" />
          <SkeletonBlock className="h-12 w-full rounded-xl" />
        </div>

        <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm space-y-4">
          <SkeletonBlock className="h-6 w-40" />
          <SkeletonBlock className="h-16 w-full rounded-xl" />
          <SkeletonBlock className="h-12 w-full rounded-xl" />
        </div>

        <SkeletonBlock className="h-12 w-full rounded-xl" />
        <SkeletonBlock className="h-12 w-full rounded-xl" />
      </div>
    </div>
  </div>
);
export const HallListScreen = ({
  setSelectedHall,
  setScreen,
  showPriceModal,
  setShowPriceModal,
  selectedHall,
}: HallListProps) => {
  const [halls, setHalls] = useState<HallViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedHallData = halls.find((h) => h.id === selectedHall);

  async function loadHalls() {
    try {
      setLoading(true);
      setError("");

      const data = await hallService.getAll();

      if (!Array.isArray(data)) {
        throw new Error("Hall API did not return a list");
      }

      setHalls(data.map(mapHallToViewModel));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot load halls");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHalls();
  }, []);

  if (loading) {
    return <HallListSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-destructive">{error}</p>
        <button
          onClick={loadHalls}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-xl"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">Hall Management</h1>
          <p className="text-muted-foreground">Manage wedding reception halls and pricing</p>
        </div>
        <button onClick={() => { setSelectedHall(null); setScreen("hall-form"); }} className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm">
          <Plus className="w-5 h-5" /> Add New Hall
        </button>
      </div>

      <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold">Filters</h3>
        </div>
        <div className="grid grid-cols-5 gap-4">
          <input type="text" placeholder="Hall name" className="px-4 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent/50" />
          <select className="px-4 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent/50">
            <option>All Hall Types</option><option>Premium</option><option>Standard</option><option>Luxury</option>
          </select>
          <input type="number" placeholder="Min tables" className="px-4 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent/50" />
          <input type="number" placeholder="Max tables" className="px-4 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent/50" />
          <select className="px-4 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent/50">
            <option>All Status</option><option>Active</option><option>Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary sticky top-0">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Hall</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Min Tables</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Max Tables</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Last Modified</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {halls.map((hall) => (
                <tr key={hall.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted">
                        <img src={hall.image} alt={hall.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-medium text-foreground">{hall.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{hall.type}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{hall.minTables}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{hall.maxTables}</td>
                  <td className="px-6 py-4"><StatusBadge status={hall.status} /></td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{hall.lastModified}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setSelectedHall(hall.id); setShowPriceModal(true); }} className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors" title="View Price"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => { setSelectedHall(hall.id); setScreen("hall-form"); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                      <button className="p-2 text-destructive hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPriceModal && selectedHall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-card rounded-[24px] shadow-xl border border-border max-w-3xl w-full overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-primary">Pricing Matrix</h2>
                <p className="text-sm text-muted-foreground mt-1">{halls.find((h) => h.id === selectedHall)?.name}</p>
              </div>
              <button onClick={() => setShowPriceModal(false)} className="p-2 hover:bg-secondary rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-secondary">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground border border-border rounded-tl-xl">Shift / Day Type</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-foreground border border-border">Weekday</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-foreground border border-border rounded-tr-xl">Weekend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { shift: "Morning", weekday: 15000000, weekend: 18000000 },
                      { shift: "Afternoon", weekday: 18000000, weekend: 22000000 },
                      { shift: "Evening", weekday: 22000000, weekend: 28000000 },
                    ].map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 font-medium text-foreground border border-border">{row.shift}</td>
                        <td className="px-6 py-4 text-center font-mono text-sm text-muted-foreground border border-border">{formatVND(row.weekday)}</td>
                        <td className="px-6 py-4 text-center font-mono text-sm text-muted-foreground border border-border">{formatVND(row.weekend)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 p-4 bg-secondary/50 rounded-xl">
                <p className="text-sm text-muted-foreground"><strong>Note:</strong> Prices shown are hall prices.</p>
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowPriceModal(false)} className="px-6 py-2.5 border border-border text-foreground rounded-xl hover:bg-secondary transition-all">Close</button>
              <button onClick={() => { setShowPriceModal(false); setScreen("hall-form"); }} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all">Edit Pricing</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface HallFormProps {
  selectedHall: string | null;
  setScreen: (s: Screen) => void;
};

export const HallFormScreen = ({ selectedHall, setScreen }: HallFormProps) => {
  const isEdit = selectedHall !== null;

  const [hall, setHall] = useState<HallViewModel | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHall() {
      if (!selectedHall) return;

      try {
        setLoading(true);
        setError("");

        const data = await hallService.getById(selectedHall);
        setHall(mapHallToViewModel(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Cannot load hall");
      } finally {
        setLoading(false);
      }
    }

    loadHall();
  }, [selectedHall]);

  if (loading) {
    return <div className="p-6">Loading hall...</div>;
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-destructive">{error}</p>
        <button
          onClick={() => setScreen("hall-list")}
          className="px-4 py-2 border border-border rounded-xl"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">{isEdit ? "Edit Hall" : "Add New Hall"}</h1>
          <p className="text-muted-foreground">{isEdit ? `Update details for ${hall?.name}` : "Create a new wedding reception hall"}</p>
        </div>
        <button onClick={() => setScreen("hall-list")} className="px-6 py-3 border border-border text-foreground rounded-xl hover:bg-secondary transition-all">Back to List</button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Hall Name <span className="text-destructive">*</span></label>
                <input type="text" defaultValue={hall?.name} placeholder="e.g., Diamond Hall" className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all" />
                <p className="text-xs text-muted-foreground mt-1">Must be unique</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Hall Type <span className="text-destructive">*</span></label>
                  <select defaultValue={hall?.type} className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all">
                    <option value="">Select type</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Base Price Reference</label>
                  <input type="text" value={formatVND(hall?.basePrice || 0)} disabled className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-muted-foreground cursor-not-allowed" />
                  <p className="text-xs text-muted-foreground mt-1">Based on hall type</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Minimum Tables <span className="text-destructive">*</span></label>
                  <input type="number" defaultValue={hall?.minTables} placeholder="20" className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Maximum Tables <span className="text-destructive">*</span></label>
                  <input type="number" defaultValue={hall?.maxTables} placeholder="50" className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea rows={4} placeholder="Describe the hall..." className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none" defaultValue={hall ? "Elegant hall with crystal chandeliers, premium sound system, and modern LED lighting." : ""} />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-primary">Pricing Matrix</h3>
                <p className="text-sm text-muted-foreground mt-1">Set prices per table for each shift and day type</p>
              </div>
              <Grid3x3 className="w-5 h-5 text-accent" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-secondary">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border border-border rounded-tl-xl">Shift</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-foreground border border-border">Weekday (VND)</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-foreground border border-border rounded-tr-xl">Weekend (VND)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { shift: "Morning (7:00 - 11:00)", weekday: 15000000, weekend: 18000000 },
                    { shift: "Afternoon (12:00 - 16:00)", weekday: 18000000, weekend: 22000000 },
                    { shift: "Evening (17:00 - 22:00)", weekday: 22000000, weekend: 28000000 },
                  ].map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 font-medium text-sm text-foreground border border-border">{row.shift}</td>
                      <td className="px-4 py-3 border border-border">
                        <input type="number" defaultValue={row.weekday} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent text-center font-mono text-sm" />
                      </td>
                      <td className="px-4 py-3 border border-border">
                        <input type="number" defaultValue={row.weekend} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent text-center font-mono text-sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900">All prices must be equal to or greater than the base price ({formatVND(hall?.basePrice || 15000000)})</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">Hall Image</h3>
            <div className="space-y-4">
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-muted border-2 border-dashed border-border flex items-center justify-center">
                {hall?.image ? (
                  <img src={hall.image} alt="Hall preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload</p>
                  </div>
                )}
              </div>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-border rounded-xl hover:bg-secondary transition-all">
                <Upload className="w-4 h-4" /> Upload Image
              </button>
            </div>
          </div>

          <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">Status & Metadata</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={hall?.status === "Active"} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                  <span className="text-sm font-medium">{hall?.status || "Active"}</span>
                </div>
              </div>
              {isEdit && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Last Modified</label>
                  <input type="text" value={hall?.lastModified || ""} disabled className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-muted-foreground cursor-not-allowed" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm font-medium">
              {isEdit ? "Update Hall" : "Create Hall"}
            </button>
            <button onClick={() => setScreen("hall-list")} className="w-full py-3 border border-border text-foreground rounded-xl hover:bg-secondary transition-all font-medium">Cancel</button>
            {isEdit && (
              <button className="w-full py-3 border border-destructive text-destructive rounded-xl hover:bg-red-50 transition-all font-medium">Delete Hall</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
