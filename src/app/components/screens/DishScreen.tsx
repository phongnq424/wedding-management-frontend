import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Save,
} from "lucide-react";
import { formatVND, StatusBadge } from "../../utils";
import { dishService } from "../../services/dish.service";
import { dishTypeService } from "../../services/dishType.service";
import { DishResponse } from "../../dto/dish.dto";
import { DishTypeResponse } from "../../dto/dishType.dto";
import { HallListSkeleton } from "./hall/HallListSkeleton";

type DishType = {
  id: string;
  name: string;
  description: string;
  status: string;
  deleted: boolean;
  lastModified: string;
};

type Dish = {
  id: string;
  name: string;
  dishTypeId: string;
  dishTypeName: string;
  unitPrice: number;
  image: string;
  description: string;
  status: string;
  deleted: boolean;
  lastModified: string;
};

function mapDishTypeToViewModel(item: DishTypeResponse): DishType {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? "",
    status: item.status === "ACTIVE" ? "Active" : "Inactive",
    deleted: false,
    lastModified: item.lastModifiedAt,
  };
}

function mapDishToViewModel(item: DishResponse): Dish {
  return {
    id: item.id,
    name: item.name,
    dishTypeId: item.dishTypeId,
    dishTypeName: item.dishTypeName,
    unitPrice: item.unitPrice,
    image: item.dishImage ?? "",
    description: item.description ?? "",
    status: item.status === "ACTIVE" ? "Active" : "Inactive",
    deleted: false,
    lastModified: item.lastModifiedAt,
  };
}

export const DishListScreen = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [dishTypes, setDishTypes] = useState<DishType[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [dSearch, setDSearch] = useState("");
  const [dTypeFilter, setDTypeFilter] = useState("All");
  const [dStatus, setDStatus] = useState("All");
  const [dPriceFrom, setDPriceFrom] = useState("");
  const [dPriceTo, setDPriceTo] = useState("");

  const [showDishForm, setShowDishForm] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dishFormName, setDishFormName] = useState("");
  const [dishFormTypeId, setDishFormTypeId] = useState("");
  const [dishFormPrice, setDishFormPrice] = useState("");
  const [dishFormDesc, setDishFormDesc] = useState("");
  const [dishFormStatus, setDishFormStatus] = useState(true);
  const [dishImageFile, setDishImageFile] = useState<File | null>(null);

  const [dishMsg, setDishMsg] = useState<{
    type: "success" | "error" | "warn";
    text: string;
  } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setDishMsg(null);

      const [dishData, dishTypeData] = await Promise.all([
        dishService.getAll(),
        dishTypeService.getAll(),
      ]);

      setDishes(dishData.map(mapDishToViewModel));
      setDishTypes(dishTypeData.map(mapDishTypeToViewModel));
    } catch (error) {
      setDishMsg({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Cannot load dishes.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeDishTypes = useMemo(() => {
    return dishTypes.filter(
      (dishType) => !dishType.deleted && dishType.status === "Active"
    );
  }, [dishTypes]);

  const filtered = useMemo(() => {
    return dishes
      .filter((dish) => !dish.deleted)
      .filter(
        (dish) =>
          dSearch === "" ||
          dish.name.toLowerCase().includes(dSearch.toLowerCase())
      )
      .filter(
        (dish) =>
          dTypeFilter === "All" || dish.dishTypeId === dTypeFilter
      )
      .filter((dish) => dStatus === "All" || dish.status === dStatus)
      .filter(
        (dish) =>
          dPriceFrom === "" || dish.unitPrice >= Number(dPriceFrom)
      )
      .filter(
        (dish) =>
          dPriceTo === "" || dish.unitPrice <= Number(dPriceTo)
      )
      .sort((a, b) => b.lastModified.localeCompare(a.lastModified));
  }, [dishes, dSearch, dTypeFilter, dStatus, dPriceFrom, dPriceTo]);

  const openAddDish = () => {
    setEditingDish(null);
    setDishFormName("");
    setDishFormTypeId("");
    setDishFormPrice("");
    setDishFormDesc("");
    setDishFormStatus(true);
    setDishImageFile(null);
    setDishMsg(null);
    setShowDishForm(true);
  };

  const openEditDish = (dish: Dish) => {
    setEditingDish(dish);
    setDishFormName(dish.name);
    setDishFormTypeId(dish.dishTypeId);
    setDishFormPrice(String(dish.unitPrice));
    setDishFormDesc(dish.description);
    setDishFormStatus(dish.status === "Active");
    setDishImageFile(null);
    setDishMsg(null);
    setShowDishForm(true);
  };

  const saveDish = async () => {
    if (!dishFormName.trim() || dishFormTypeId === "" || !dishFormPrice) {
      setDishMsg({
        type: "error",
        text: "MSG 2: Dish name, type and price are required.",
      });
      return;
    }

    const price = Number(dishFormPrice);

    if (price <= 0) {
      setDishMsg({
        type: "error",
        text: "MSG 13: Price must be greater than 0.",
      });
      return;
    }

    try {
      setSaving(true);
      setDishMsg(null);

      const payload = {
        name: dishFormName.trim(),
        dishTypeId: dishFormTypeId,
        unitPrice: price,
        description: dishFormDesc.trim(),
        status: dishFormStatus ? ("ACTIVE" as const) : ("INACTIVE" as const),
      };

      if (editingDish) {
        const updated = await dishService.update(
          editingDish.id,
          payload,
          editingDish.lastModified,
          dishImageFile
        );

        setDishes((prev) =>
          prev.map((item) =>
            item.id === editingDish.id
              ? mapDishToViewModel(updated)
              : item
          )
        );

        setDishMsg({
          type: "success",
          text: "MSG17: Món ăn được cập nhật thành công.",
        });
      } else {
        await dishService.create(payload, dishImageFile);

        setDishMsg({
          type: "success",
          text: "MSG48: Món ăn được tạo thành công.",
        });
      }

      setShowDishForm(false);
      await fetchData();
    } catch (error) {
      setDishMsg({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Cannot save dish.",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteDish = async (id: string) => {
    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa món ăn này không?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setDishMsg(null);

      await dishService.remove(id, true);

      setDishes((prev) => prev.filter((item) => item.id !== id));

      setDishMsg({
        type: "success",
        text: "MSG20: Món ăn được xóa thành công.",
      });
    } catch (error) {
      setDishMsg({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Cannot delete dish.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <HallListSkeleton />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">
            Dishes
          </h1>
          <p className="text-muted-foreground">
            Manage individual dishes available in menus and combos
          </p>
        </div>
        <button
          onClick={openAddDish}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" /> Add Dish
        </button>
      </div>

      {dishMsg && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border text-sm ${dishMsg.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : dishMsg.type === "warn"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-red-50 border-red-200 text-red-800"
            }`}
        >
          {dishMsg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          {dishMsg.text}
          <button
            onClick={() => setDishMsg(null)}
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
              Dish Name
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={dSearch}
                onChange={(e) => setDSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Dish Type
            </label>
            <select
              value={dTypeFilter}
              onChange={(e) => setDTypeFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="All">All Types</option>
              {dishTypes
                .filter((type) => !type.deleted)
                .map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Price From (VND)
            </label>
            <input
              type="number"
              value={dPriceFrom}
              onChange={(e) => setDPriceFrom(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Price To (VND)
            </label>
            <input
              type="number"
              value={dPriceTo}
              onChange={(e) => setDPriceTo(e.target.value)}
              placeholder="∞"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Status
            </label>
            <select
              value={dStatus}
              onChange={(e) => setDStatus(e.target.value)}
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
                  Dish Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                  Type
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide">
                  Unit Price
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
              {filtered.map((dish) => (
                <tr
                  key={dish.id}
                  className="hover:bg-secondary/40 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {dish.image ? (
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground text-xs">
                            No img
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-foreground">
                        {dish.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-accent/15 text-accent">
                      {dish.dishTypeName}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right font-mono text-sm font-semibold text-foreground">
                    {formatVND(dish.unitPrice)}
                  </td>

                  <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                    {dish.description}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={dish.status} />
                  </td>

                  <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                    {dish.lastModified
                      .slice(0, 16)
                      .replace("T", " ")}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditDish(dish)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteDish(dish.id)}
                        disabled={deletingId === dish.id}
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
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-muted-foreground"
                  >
                    No dishes found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDishForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-card rounded-[24px] shadow-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
              <h2 className="text-xl font-semibold text-primary">
                {editingDish ? "Edit Dish" : "Add Dish"}
              </h2>
              <button
                onClick={() => setShowDishForm(false)}
                className="p-2 hover:bg-secondary rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Dish Name{" "}
                  <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={dishFormName}
                  onChange={(e) =>
                    setDishFormName(e.target.value)
                  }
                  placeholder="e.g., Gỏi cuốn tôm thịt"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Dish Type{" "}
                  <span className="text-destructive">*</span>
                </label>
                <select
                  value={dishFormTypeId}
                  onChange={(e) =>
                    setDishFormTypeId(e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Select type</option>
                  {activeDishTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Unit Price (VND){" "}
                  <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  value={dishFormPrice}
                  onChange={(e) =>
                    setDishFormPrice(e.target.value)
                  }
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Dish Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setDishImageFile(
                      e.target.files?.[0] ?? null
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={dishFormDesc}
                  onChange={(e) =>
                    setDishFormDesc(e.target.value)
                  }
                  placeholder="Optional description..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>

              {editingDish && (
                <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dishFormStatus}
                      onChange={(e) =>
                        setDishFormStatus(e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
                  </label>
                  <span className="text-sm font-medium">
                    {dishFormStatus ? "Active" : "Inactive"}
                  </span>
                </div>
              )}

              {editingDish && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                  <strong>Note:</strong> Price changes apply only
                  to future unconfirmed bookings.
                </div>
              )}

              {dishMsg && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm ${dishMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                    }`}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {dishMsg.text}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => setShowDishForm(false)}
                className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-secondary transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveDish}
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