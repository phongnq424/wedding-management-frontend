import { weddingPackageService } from "../services/weddingPackage.service";
import { dishComboService } from "../services/dishCombo.service";
import { dishService } from "../services/dish.service";
import { serviceService } from "../services/service.service";
import { beverageService } from "../services/beverage.service";
import { hallTypeService } from "../services/hallTypeService";
import { shiftService } from "../services/shift.service";

import type { WeddingPackageResponse } from "../dto/weddingPackage.dto";
import type { DishComboResponse } from "../dto/dishCombo.dto";
import type { DishResponse } from "../dto/dish.dto";
import type { ServiceResponse } from "../dto/service.dto";
import type { BeverageResponse } from "../dto/beverage.dto";
import type { HallTypeResponse } from "../dto/hallType.dto";
import type { ShiftResponse } from "../dto/shift.dto";

import { createTimedResource, type CacheLoadOptions, type TimedResource } from "./resourceCache";

export const REFERENCE_CACHE_TTL_MS = 10_000;

const weddingPackagesResource = createTimedResource<WeddingPackageResponse[]>({
  key: "wedding-packages",
  ttlMs: REFERENCE_CACHE_TTL_MS,
});

const dishCombosResource = createTimedResource<DishComboResponse[]>({
  key: "dish-combos",
  ttlMs: REFERENCE_CACHE_TTL_MS,
});

const dishesResource = createTimedResource<DishResponse[]>({
  key: "dishes",
  ttlMs: REFERENCE_CACHE_TTL_MS,
});

const servicesResource = createTimedResource<ServiceResponse[]>({
  key: "services",
  ttlMs: REFERENCE_CACHE_TTL_MS,
});

const beveragesResource = createTimedResource<BeverageResponse[]>({
  key: "beverages",
  ttlMs: REFERENCE_CACHE_TTL_MS,
});

const hallTypesResource = createTimedResource<HallTypeResponse[]>({
  key: "hall-types",
  ttlMs: REFERENCE_CACHE_TTL_MS,
});

const shiftsResource = createTimedResource<ShiftResponse[]>({
  key: "shifts",
  ttlMs: REFERENCE_CACHE_TTL_MS,
});

const packageDetailResources = new Map<string, TimedResource<WeddingPackageResponse>>();

function getPackageDetailResource(packageId: string) {
  const existing = packageDetailResources.get(packageId);
  if (existing) return existing;

  const created = createTimedResource<WeddingPackageResponse>({
    key: `wedding-package-detail:${packageId}`,
    ttlMs: REFERENCE_CACHE_TTL_MS,
  });

  packageDetailResources.set(packageId, created);
  return created;
}

export const packageReferenceCache = {
  getPackages: () => weddingPackagesResource.getData(),
  getDishCombos: () => dishCombosResource.getData(),
  getDishes: () => dishesResource.getData(),
  getServices: () => servicesResource.getData(),
  getBeverages: () => beveragesResource.getData(),
  getHallTypes: () => hallTypesResource.getData(),
  getShifts: () => shiftsResource.getData(),
};

export function loadWeddingPackages(options?: CacheLoadOptions) {
  return weddingPackagesResource.load(() => weddingPackageService.getAll(), options);
}

export function loadWeddingPackageDetail(packageId: string, options?: CacheLoadOptions) {
  return getPackageDetailResource(packageId).load(
    () => weddingPackageService.getById(packageId),
    options
  );
}

export function loadDishCombos(options?: CacheLoadOptions) {
  return dishCombosResource.load(() => dishComboService.getAll(), options);
}

export function loadDishes(options?: CacheLoadOptions) {
  return dishesResource.load(() => dishService.getAll(), options);
}

export function loadServices(options?: CacheLoadOptions) {
  return servicesResource.load(() => serviceService.getAll(), options);
}

export function loadBeverages(options?: CacheLoadOptions) {
  return beveragesResource.load(() => beverageService.getAll(), options);
}

export function loadHallTypes(options?: CacheLoadOptions) {
  return hallTypesResource.load(() => hallTypeService.getAll(), options);
}

export function loadShifts(options?: CacheLoadOptions) {
  return shiftsResource.load(() => shiftService.getAll(), options);
}

export function setCachedWeddingPackages(data: WeddingPackageResponse[]) {
  weddingPackagesResource.setData(data);
}

export function invalidateWeddingPackages(packageId?: string) {
  weddingPackagesResource.invalidate();

  if (packageId) {
    packageDetailResources.get(packageId)?.invalidate();
  }
}

export function invalidateWeddingPackageDetail(packageId: string) {
  packageDetailResources.get(packageId)?.invalidate();
}

export function removeCachedWeddingPackageDetail(packageId: string) {
  packageDetailResources.delete(packageId);
  weddingPackagesResource.invalidate();
}

export function invalidateDishCombos() {
  dishCombosResource.invalidate();
  weddingPackagesResource.invalidate();
}

export function invalidateDishes() {
  dishesResource.invalidate();
  weddingPackagesResource.invalidate();
}

export function invalidateServices() {
  servicesResource.invalidate();
  weddingPackagesResource.invalidate();
}

export function invalidateBeverages() {
  beveragesResource.invalidate();
  weddingPackagesResource.invalidate();
}

export function invalidateHallTypes() {
  hallTypesResource.invalidate();
  weddingPackagesResource.invalidate();
}

export function invalidateShifts() {
  shiftsResource.invalidate();
  weddingPackagesResource.invalidate();
}

export function invalidateAllPackageReferenceData() {
  weddingPackagesResource.invalidate();
  dishCombosResource.invalidate();
  dishesResource.invalidate();
  servicesResource.invalidate();
  beveragesResource.invalidate();
  hallTypesResource.invalidate();
  shiftsResource.invalidate();

  packageDetailResources.forEach((resource) => resource.invalidate());
}
