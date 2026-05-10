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
  ChevronRight,
  Percent,
} from "lucide-react";

import { formatVND, StatusBadge } from "../../utils";
import { MAX_COMBO_DISCOUNT_RATE } from "../../data";

import { dishComboService } from "../../services/dishCombo.service";
import { dishService } from "../../services/dish.service";
import { dishTypeService } from "../../services/dishType.service";

import type {
  DishComboResponse,
  DishComboSlotResponse,
} from "../../dto/dishCombo.dto";
import type { DishResponse } from "../../dto/dish.dto";
import type { DishTypeResponse } from "../../dto/dishType.dto";

import { HallListSkeleton } from "./hall/HallListSkeleton";

type StatusLabel = "Active" | "Inactive";

type DishTypeViewModel = DishTypeResponse & {
  deleted: boolean;
  statusLabel: StatusLabel;
  lastModified: string;
};

type DishViewModel = DishResponse & {
  deleted: boolean;
  statusLabel: StatusLabel;
  lastModified: string;
};

type ComboSlotViewModel = Omit<
  DishComboSlotResponse,
  "isReplaceable" | "displayOrder"
> & {
  slotId: string;
  isReplaceable: boolean;
  displayOrder: number;
  unitPrice: number;
  image: string;
};

type DishComboViewModel = Omit<DishComboResponse, "slots"> & {
  deleted: boolean;
  statusLabel: StatusLabel;
  lastModified: string;
  lastModifiedDisplay: string;
  descriptionText: string;
  slots: ComboSlotViewModel[];
};

type FormSlot = {
  slotId: string;
  dishTypeId: string;
  dishTypeName: string;
  defaultDishId: string;
  defaultDishName: string;
  isReplaceable: boolean;
  displayOrder: number;
  unitPrice: number;
  image: string;
};

function formatDateTime(value: string | null | undefined) {
  return value ? value.slice(0, 16).replace("T", " ") : "N/A";
}

function mapDishTypeToViewModel(item: DishTypeResponse): DishTypeViewModel {
  return {
    ...item,
    deleted: false,
    statusLabel: item.status === "ACTIVE" ? "Active" : "Inactive",
    lastModified: item.lastModifiedAt ?? "",
  };
}

function mapDishToViewModel(item: DishResponse): DishViewModel {
  return {
    ...item,
    deleted: false,
    statusLabel: item.status === "ACTIVE" ? "Active" : "Inactive",
    lastModified: item.lastModifiedAt ?? "",
  };
}

function mapDishComboToViewModel(
  item: DishComboResponse,
  dishes: DishViewModel[]
): DishComboViewModel {
  const slots: ComboSlotViewModel[] = (item.slots ?? [])
    .slice()
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((slot, index) => {
      const dish = dishes.find((d) => d.id === slot.defaultDishId);

      return {
        ...slot,
        slotId: slot.id,
        isReplaceable: slot.isReplaceable ?? false,
        displayOrder: slot.displayOrder ?? index + 1,
        unitPrice: dish?.unitPrice ?? 0,
        image: dish?.dishImage ?? "",
      };
    });

  return {
    ...item,
    deleted: false,
    statusLabel: item.status === "ACTIVE" ? "Active" : "Inactive",
    lastModified: item.lastModifiedAt ?? "",
    lastModifiedDisplay: formatDateTime(item.lastModifiedAt),
    descriptionText: item.description ?? "",
    slots,
  };
}

export const DishComboListScreen = () => {
  const [dishCombos, setDishCombos] = useState<DishComboViewModel[]>([]);
  const [dishes, setDishes] = useState<DishViewModel[]>([]);
  const [dishTypes, setDishTypes] = useState<DishTypeViewModel[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [dcSearch, setDcSearch] = useState("");
  const [dcDishName, setDcDishName] = useState("");
  const [dcRateFrom, setDcRateFrom] = useState("");
  const [dcRateTo, setDcRateTo] = useState("");
  const [dcReplaceable, setDcReplaceable] = useState("All");
  const [dcStatus, setDcStatus] = useState("All");

  const [showDcForm, setShowDcForm] = useState(false);
  const [editingDc, setEditingDc] = useState<DishComboViewModel | null>(null);

  const [dcFormName, setDcFormName] = useState("");
  const [dcFormRate, setDcFormRate] = useState("");
  const [dcFormDesc, setDcFormDesc] = useState("");
  const [dcFormStatus, setDcFormStatus] = useState(true);
  const [dcFormSlots, setDcFormSlots] = useState<FormSlot[]>([]);

  const [dcMsg, setDcMsg] = useState<{
    type: "success" | "error" | "warn";
    text: string;
  } | null>(null);

  const [expandedCombo, setExpandedCombo] = useState<string | null>(null);
  const [dcPage, setDcPage] = useState(1);

  const PAGE_SIZE = 20;

  async function fetchData() {
    try {
      setLoading(true);
      setDcMsg(null);

      const [comboData, dishData, dishTypeData] = await Promise.all([
        dishComboService.getAll(),
        dishService.getAll(),
        dishTypeService.getAll(),
      ]);

      const dishViewModels = dishData.map(mapDishToViewModel);

      setDishes(dishViewModels);
      setDishTypes(dishTypeData.map(mapDishTypeToViewModel));
      setDishCombos(
        comboData.map((combo) =>
          mapDishComboToViewModel(combo, dishViewModels)
        )
      );
    } catch (error) {
      setDcMsg({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Cannot load dish combos.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setDcPage(1);
  }, [dcSearch, dcDishName, dcRateFrom, dcRateTo, dcReplaceable, dcStatus]);

  const activeDishTypes = useMemo(() => {
    return dishTypes.filter(
      (dishType) => !dishType.deleted && dishType.status === "ACTIVE"
    );
  }, [dishTypes]);

  const activeDishes = useMemo(() => {
    return dishes.filter((dish) => !dish.deleted && dish.status === "ACTIVE");
  }, [dishes]);

  const filtered = useMemo(() => {
    return dishCombos
      .filter((combo) => !combo.deleted)
      .filter(
        (combo) =>
          dcSearch === "" ||
          combo.name.toLowerCase().includes(dcSearch.toLowerCase())
      )
      .filter(
        (combo) =>
          dcDishName === "" ||
          combo.slots.some((slot) =>
            slot.defaultDishName.toLowerCase().includes(dcDishName.toLowerCase())
          )
      )
      .filter(
        (combo) =>
          dcRateFrom === "" || combo.comboDiscountRate >= Number(dcRateFrom)
      )
      .filter(
        (combo) => dcRateTo === "" || combo.comboDiscountRate <= Number(dcRateTo)
      )
      .filter(
        (combo) =>
          dcReplaceable === "All" ||
          (dcReplaceable === "Yes"
            ? combo.slots.some((slot) => slot.isReplaceable)
            : combo.slots.every((slot) => !slot.isReplaceable))
      )
      .filter(
        (combo) => dcStatus === "All" || combo.statusLabel === dcStatus
      )
      .sort((a, b) => b.lastModified.localeCompare(a.lastModified));
  }, [
    dishCombos,
    dcSearch,
    dcDishName,
    dcRateFrom,
    dcRateTo,
    dcReplaceable,
    dcStatus,
  ]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (dcPage - 1) * PAGE_SIZE,
    dcPage * PAGE_SIZE
  );

  const addSlot = () => {
    const newSlot: FormSlot = {
      slotId: crypto.randomUUID(),
      dishTypeId: "",
      dishTypeName: "",
      defaultDishId: "",
      defaultDishName: "",
      isReplaceable: false,
      displayOrder: dcFormSlots.length + 1,
      unitPrice: 0,
      image: "",
    };

    setDcFormSlots((prev) => [...prev, newSlot]);
  };

  const removeSlot = (slotId: string) => {
    setDcFormSlots((prev) =>
      prev
        .filter((slot) => slot.slotId !== slotId)
        .map((slot, index) => ({
          ...slot,
          displayOrder: index + 1,
        }))
    );
  };

  const updateSlot = (
    slotId: string,
    field: "dishTypeId" | "defaultDishId" | "isReplaceable",
    value: string | boolean
  ) => {
    setDcFormSlots((prev) =>
      prev.map((slot) => {
        if (slot.slotId !== slotId) return slot;

        if (field === "dishTypeId") {
          const dishTypeId = String(value);
          const selectedType = dishTypes.find((type) => type.id === dishTypeId);

          return {
            ...slot,
            dishTypeId,
            dishTypeName: selectedType?.name ?? "",
            defaultDishId: "",
            defaultDishName: "",
            unitPrice: 0,
            image: "",
          };
        }

        if (field === "defaultDishId") {
          const defaultDishId = String(value);
          const selectedDish = activeDishes.find(
            (dish) => dish.id === defaultDishId
          );

          return {
            ...slot,
            defaultDishId,
            defaultDishName: selectedDish?.name ?? "",
            unitPrice: selectedDish?.unitPrice ?? 0,
            image: selectedDish?.dishImage ?? "",
          };
        }

        return {
          ...slot,
          isReplaceable: Boolean(value),
        };
      })
    );
  };

  const estOriginal = dcFormSlots.reduce(
    (sum, slot) => sum + slot.unitPrice,
    0
  );

  const estCombo = dcFormRate
    ? estOriginal * (1 - Number(dcFormRate) / 100)
    : 0;

  const openAddDc = () => {
    setEditingDc(null);
    setDcFormName("");
    setDcFormRate("");
    setDcFormDesc("");
    setDcFormStatus(true);
    setDcFormSlots([]);
    setDcMsg(null);
    setShowDcForm(true);
  };

  const openEditDc = (combo: DishComboViewModel) => {
    setEditingDc(combo);
    setDcFormName(combo.name);
    setDcFormRate(String(combo.comboDiscountRate));
    setDcFormDesc(combo.descriptionText);
    setDcFormStatus(combo.status === "ACTIVE");

    setDcFormSlots(
      combo.slots.map((slot) => ({
        slotId: slot.slotId,
        dishTypeId: slot.dishTypeId,
        dishTypeName: slot.dishTypeName,
        defaultDishId: slot.defaultDishId,
        defaultDishName: slot.defaultDishName,
        isReplaceable: slot.isReplaceable,
        displayOrder: slot.displayOrder,
        unitPrice: slot.unitPrice,
        image: slot.image,
      }))
    );

    setDcMsg(null);
    setShowDcForm(true);
  };

  const saveDc = async () => {
    if (!dcFormName.trim() || !dcFormRate || dcFormSlots.length === 0) {
      setDcMsg({
        type: "error",
        text: "MSG2: Combo name, discount rate and at least one slot are required.",
      });
      return;
    }

    const rate = Number(dcFormRate);

    if (Number.isNaN(rate)) {
      setDcMsg({
        type: "error",
        text: "MSG13: Discount rate must be a valid number.",
      });
      return;
    }

    if (rate <= 0) {
      setDcMsg({
        type: "error",
        text: "MSG13: Discount rate must be greater than 0.",
      });
      return;
    }

    if (rate >= MAX_COMBO_DISCOUNT_RATE) {
      setDcMsg({
        type: "warn",
        text: `MSG74: Discount rate must be less than ${MAX_COMBO_DISCOUNT_RATE}%.`,
      });
      return;
    }

    const validSlots = dcFormSlots.filter(
      (slot) => slot.dishTypeId !== "" && slot.defaultDishId !== ""
    );

    if (validSlots.length < 2) {
      setDcMsg({
        type: "error",
        text: "MSG47: Combo must contain at least 2 dishes.",
      });
      return;
    }

    const duplicateDishIds = validSlots
      .map((slot) => slot.defaultDishId)
      .filter((id, index, arr) => arr.indexOf(id) !== index);

    if (duplicateDishIds.length > 0) {
      setDcMsg({
        type: "warn",
        text: "MSG73: A dish cannot appear more than once in the same combo.",
      });
      return;
    }

    try {
      setSaving(true);
      setDcMsg(null);

      const payload = {
        name: dcFormName.trim(),
        comboDiscountRate: rate,
        description: dcFormDesc.trim(),
        status: dcFormStatus ? ("ACTIVE" as const) : ("INACTIVE" as const),
        comboSlotList: validSlots.map((slot, index) => ({
          dishTypeId: slot.dishTypeId,
          defaultDishId: slot.defaultDishId,
          isReplaceable: slot.isReplaceable,
          displayOrder: index + 1,
        })),
      };

      if (editingDc) {
        await dishComboService.update(
          editingDc.id,
          payload,
          editingDc.lastModified
        );

        setDcMsg({
          type: "success",
          text: "MSG17: Combo món ăn được cập nhật thành công.",
        });
      } else {
        await dishComboService.create(payload);

        setDcMsg({
          type: "success",
          text: "MSG48: Combo món ăn được tạo thành công.",
        });
      }

      setShowDcForm(false);
      await fetchData();
    } catch (error) {
      setDcMsg({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Cannot save dish combo.",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteDc = async (id: string) => {
    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa combo món ăn này không?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setDcMsg(null);

      await dishComboService.remove(id, true);
      await fetchData();

      setDcMsg({
        type: "success",
        text: "MSG20: Combo món ăn được xóa thành công.",
      });
    } catch (error) {
      setDcMsg({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Cannot delete dish combo.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <HallListSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">
            Dish Combos
          </h1>
          <p className="text-muted-foreground">
            Manage dish combo packages with slot-based configuration
          </p>
        </div>

        <button
          onClick={openAddDc}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Combo
        </button>
      </div>

      {dcMsg && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border text-sm ${dcMsg.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : dcMsg.type === "warn"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-red-50 border-red-200 text-red-800"
            }`}
        >
          {dcMsg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}

          {dcMsg.text}

          <button
            onClick={() => setDcMsg(null)}
            className="ml-auto p-1 hover:opacity-70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Combos",
            value: dishCombos.filter((combo) => !combo.deleted).length,
            color: "text-primary",
          },
          {
            label: "Active",
            value: dishCombos.filter(
              (combo) => !combo.deleted && combo.status === "ACTIVE"
            ).length,
            color: "text-emerald-700",
          },
          {
            label: "Inactive",
            value: dishCombos.filter(
              (combo) => !combo.deleted && combo.status === "INACTIVE"
            ).length,
            color: "text-muted-foreground",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-[16px] p-5 border border-border shadow-sm"
          >
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className={`text-2xl font-semibold ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-[20px] p-5 border border-border shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Combo Name
            </label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={dcSearch}
                onChange={(e) => setDcSearch(e.target.value)}
                placeholder="Search combo name..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Dish Name
            </label>

            <input
              type="text"
              value={dcDishName}
              onChange={(e) => setDcDishName(e.target.value)}
              placeholder="e.g., Gà quay"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Discount % From–To
            </label>

            <div className="flex gap-1">
              <input
                type="number"
                value={dcRateFrom}
                onChange={(e) => setDcRateFrom(e.target.value)}
                placeholder="0"
                className="w-full px-2 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 font-mono"
              />

              <span className="self-center text-muted-foreground text-xs">
                –
              </span>

              <input
                type="number"
                value={dcRateTo}
                onChange={(e) => setDcRateTo(e.target.value)}
                placeholder="25"
                className="w-full px-2 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Replaceable
            </label>

            <select
              value={dcReplaceable}
              onChange={(e) => setDcReplaceable(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="All">All</option>
              <option value="Yes">Has Replaceable</option>
              <option value="No">None Replaceable</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Status
            </label>

            <select
              value={dcStatus}
              onChange={(e) => setDcStatus(e.target.value)}
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
                  Combo Name
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide">
                  Discount %
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                  Slot Summary
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide">
                  Slots
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide">
                  Replaceable
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
              {paginated.map((combo) => {
                const replaceableCount = combo.slots.filter(
                  (slot) => slot.isReplaceable
                ).length;

                return (
                  <React.Fragment key={combo.id}>
                    <tr className="hover:bg-secondary/40 transition-colors">
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            setExpandedCombo(
                              expandedCombo === combo.id ? null : combo.id
                            )
                          }
                          className="flex items-center gap-2 font-medium text-foreground hover:text-accent transition-colors text-left"
                        >
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${expandedCombo === combo.id ? "rotate-90" : ""
                              }`}
                          />
                          {combo.name}
                        </button>

                        {combo.descriptionText && (
                          <p className="text-xs text-muted-foreground mt-0.5 ml-6 truncate max-w-xs">
                            {combo.descriptionText}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold">
                          <Percent className="w-3 h-3" />
                          {combo.comboDiscountRate}%
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        <div className="space-y-0.5">
                          {combo.slots.slice(0, 3).map((slot) => (
                            <p key={slot.slotId}>
                              <span className="text-foreground font-medium">
                                {slot.dishTypeName}:
                              </span>{" "}
                              {slot.defaultDishName}
                            </p>
                          ))}

                          {combo.slots.length > 3 && (
                            <p className="text-accent">
                              +{combo.slots.length - 3} more
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center font-mono text-sm font-semibold">
                        {combo.numberOfSlots ?? combo.slots.length}
                      </td>

                      <td className="px-6 py-4 text-center font-mono text-sm">
                        {replaceableCount}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={combo.statusLabel} />
                      </td>

                      <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                        {combo.lastModifiedDisplay}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditDc(combo)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => deleteDc(combo.id)}
                            disabled={deletingId === combo.id}
                            className="p-2 text-destructive hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expandedCombo === combo.id && (
                      <tr className="bg-secondary/30">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                            {combo.slots.map((slot) => (
                              <div
                                key={slot.slotId}
                                className="bg-card rounded-xl p-3 border border-border"
                              >
                                <div className="h-20 w-full overflow-hidden rounded-lg bg-muted mb-2">
                                  {slot.image ? (
                                    <img
                                      src={slot.image}
                                      alt={slot.defaultDishName}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                      No img
                                    </div>
                                  )}
                                </div>

                                <p className="text-xs text-muted-foreground mb-1">
                                  #{slot.displayOrder} · {slot.dishTypeName}
                                </p>

                                <p className="text-sm font-medium text-foreground leading-tight">
                                  {slot.defaultDishName}
                                </p>

                                <p className="text-xs font-mono text-accent mt-1">
                                  {formatVND(slot.unitPrice)}
                                </p>

                                {slot.isReplaceable && (
                                  <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                                    Replaceable
                                  </span>
                                )}
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
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-sm text-muted-foreground"
                  >
                    No combos found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-secondary/30">
            <p className="text-sm text-muted-foreground">
              Page {dcPage} of {totalPages} ({filtered.length} results)
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={dcPage === 1}
                onClick={() => setDcPage(dcPage - 1)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-card text-sm disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setDcPage(page)}
                    className={`px-4 py-2 rounded-lg text-sm ${page === dcPage
                      ? "bg-primary text-primary-foreground"
                      : "border border-border hover:bg-card"
                      }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                disabled={dcPage === totalPages}
                onClick={() => setDcPage(dcPage + 1)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-card text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showDcForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-[24px] shadow-xl border border-border w-full max-w-3xl max-h-[92vh] flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-semibold text-primary">
                {editingDc ? "Edit Combo" : "Add Dish Combo"}
              </h2>

              <button
                onClick={() => setShowDcForm(false)}
                className="p-2 hover:bg-secondary rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Combo Name <span className="text-destructive">*</span>
                  </label>

                  <input
                    type="text"
                    value={dcFormName}
                    onChange={(e) => setDcFormName(e.target.value)}
                    placeholder="e.g., Combo Cưới Cao Cấp"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Discount Rate (%){" "}
                    <span className="text-destructive">*</span>
                  </label>

                  <input
                    type="number"
                    value={dcFormRate}
                    onChange={(e) => setDcFormRate(e.target.value)}
                    placeholder={`1–${MAX_COMBO_DISCOUNT_RATE - 1}`}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent font-mono"
                  />

                  <p className="text-xs text-muted-foreground mt-1">
                    Max: {MAX_COMBO_DISCOUNT_RATE - 1}%
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>

                <textarea
                  rows={2}
                  value={dcFormDesc}
                  onChange={(e) => setDcFormDesc(e.target.value)}
                  placeholder="Optional description..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>

              {editingDc && (
                <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dcFormStatus}
                      onChange={(e) => setDcFormStatus(e.target.checked)}
                      className="sr-only peer"
                    />

                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
                  </label>

                  <span className="text-sm font-medium">
                    {dcFormStatus ? "Active" : "Inactive"}
                  </span>
                </div>
              )}

              {dcFormRate && estOriginal > 0 && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-accent/5 border border-accent/20 rounded-xl">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Est. Original Price/Table
                    </p>
                    <p className="text-base font-semibold text-foreground font-mono">
                      {formatVND(estOriginal)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Est. Combo Price/Table
                    </p>
                    <p className="text-base font-semibold text-accent font-mono">
                      {formatVND(estCombo)}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-foreground">
                    Combo Slots <span className="text-destructive">*</span>
                  </label>

                  <button
                    onClick={addSlot}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-accent text-accent rounded-lg text-xs hover:bg-accent/5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Slot
                  </button>
                </div>

                {dcFormSlots.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground">
                    No slots added yet. Click "Add Slot" to begin.
                  </div>
                )}

                <div className="space-y-3">
                  {dcFormSlots.map((slot, index) => {
                    const dishesForType = activeDishes.filter(
                      (dish) =>
                        slot.dishTypeId !== "" &&
                        dish.dishTypeId === slot.dishTypeId
                    );

                    const selectedDish = activeDishes.find(
                      (dish) => dish.id === slot.defaultDishId
                    );

                    return (
                      <div
                        key={slot.slotId}
                        className="border border-border rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Slot {index + 1}
                          </span>

                          <button
                            onClick={() => removeSlot(slot.slotId)}
                            className="p-1 text-destructive hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                              Dish Type
                            </label>

                            <select
                              value={slot.dishTypeId}
                              onChange={(e) =>
                                updateSlot(
                                  slot.slotId,
                                  "dishTypeId",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                            >
                              <option value="">Select type</option>

                              {activeDishTypes.map((dishType) => (
                                <option key={dishType.id} value={dishType.id}>
                                  {dishType.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                              Default Dish
                            </label>

                            <select
                              value={slot.defaultDishId}
                              disabled={slot.dishTypeId === ""}
                              onChange={(e) =>
                                updateSlot(
                                  slot.slotId,
                                  "defaultDishId",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50"
                            >
                              <option value="">Select dish</option>

                              {dishesForType.map((dish) => (
                                <option key={dish.id} value={dish.id}>
                                  {dish.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="block text-xs font-medium text-muted-foreground">
                              Replaceable
                            </label>

                            <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={slot.isReplaceable}
                                onChange={(e) =>
                                  updateSlot(
                                    slot.slotId,
                                    "isReplaceable",
                                    e.target.checked
                                  )
                                }
                                className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                              />

                              <span className="text-sm">
                                {slot.isReplaceable ? "Yes" : "No"}
                              </span>
                            </label>
                          </div>
                        </div>

                        {selectedDish && (
                          <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3">
                            <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                              {selectedDish.dishImage ? (
                                <img
                                  src={selectedDish.dishImage}
                                  alt={selectedDish.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                  No img
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {selectedDish.name}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {selectedDish.dishTypeName}
                              </p>

                              <p className="mt-1 font-mono text-xs font-semibold text-accent">
                                {formatVND(selectedDish.unitPrice)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {dcMsg && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm ${dcMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : dcMsg.type === "warn"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-red-50 text-red-700"
                    }`}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {dcMsg.text}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setShowDcForm(false)}
                className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-secondary transition-all"
              >
                Cancel
              </button>

              <button
                onClick={saveDc}
                disabled={saving}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Combo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};