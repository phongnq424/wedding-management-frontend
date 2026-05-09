export type Screen =
  | "login"
  | "dashboard"
  | "hall-list"
  | "hall-form"
  | "hall-type-list"
  | "hall-type-form"
  | "shift-list"
  | "shift-form"
  | "service-list"
  | "service-form"
  | "booking"
  | "booking-availability"
  | "booking-form"
  | "payment"
  | "invoice"
  | "dish-type-list"
  | "dish-type-form"
  | "dish-list"
  | "dish-form"
  | "dish-combo-list"
  | "dish-combo-form"
  | "package-list"
  | "package-form"
  | "menu"
  | "staff"
  | "roles"
  | "reports"
  | "audit"
  | "settings";

export type Role =
  | "Director"
  | "Operations Manager"
  | "Event Manager"
  | "Accountant"
  | "Menu Manager";

export interface PackageServiceItem {
  serviceId: number;
  serviceName: string;
  price: number;
}

export interface PackageBeverageItem {
  beverageId: number;
  beverageName: string;
  allowancePerTable: number;
  unitPrice: number;
}

export interface WeddingPackage {
  id: number;
  packageName: string;
  description: string;
  pricePerTable: number;
  menuComboOptions: number[];
  defaultMenuComboId: number;
  includedServiceList: PackageServiceItem[];
  beverageAllowanceList: PackageBeverageItem[];
  packageBenefitList: string[];
  conditionList: string[];
  status: "Active" | "Inactive";
  deleted: boolean;
  lastModified: string;
}

export interface BeverageItem {
  id: number;
  name: string;
  beverageTypeId: number;
  beverageTypeName: string;
  unitPrice: number;
  status: string;
  deleted: boolean;
  lastModified: string;
}