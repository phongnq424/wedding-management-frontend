export type WeddingPackageStatusApi = "ACTIVE" | "INACTIVE";

export type PackageConditionTypeApi =
    | "MIN_TABLES"
    | "MAX_TABLES"
    | "HALL_TYPE"
    | "SHIFT"
    | "CUSTOM";

export type WeddingPackageBenefitItemTypeApi =
    | "DISH"
    | "SERVICE"
    | "BEVERAGE";

export type WeddingPackageServiceItemDTO = {
    id?: string | null;
    serviceId: string;
    serviceName?: string | null;
    quantity: number;
    note?: string | null;
};

export type WeddingPackageBeverageAllowanceDTO = {
    id?: string | null;
    beverageId: string;
    beverageName?: string | null;
    allowanceQuantity: number;
    note?: string | null;
};

export type WeddingPackageBenefitDTO = {
    id?: string | null;

    itemType: WeddingPackageBenefitItemTypeApi;
    itemId: string;
    itemName?: string | null;

    quantity: number;

    unitValue?: number | null;
    totalValue?: number | null;
    customerPayAmount?: number | null;

    note?: string | null;
    displayOrder?: number | null;
};

export type WeddingPackageConditionDTO = {
    id?: string | null;
    conditionType: PackageConditionTypeApi;
    hallTypeId?: string | null;
    hallTypeName?: string | null;
    shiftId?: string | null;
    shiftName?: string | null;
    numericValue?: number | null;
    conditionValue?: string | null;
    displayOrder?: number | null;
};

export type WeddingPackageRequestPayload = {
    packageName: string;
    description?: string;
    menuComboOptions?: string[];
    defaultMenuComboId?: string | null;
    includedServiceList?: WeddingPackageServiceItemDTO[];
    beverageAllowanceList?: WeddingPackageBeverageAllowanceDTO[];
    packageBenefitList?: WeddingPackageBenefitDTO[];
    conditionList?: WeddingPackageConditionDTO[];
    status?: WeddingPackageStatusApi;
};

export type WeddingPackageResponse = {
    id: string;
    packageName: string;
    description: string | null;

    defaultMenuComboId: string | null;
    defaultMenuComboName: string | null;

    menuComboOptions: string[];
    menuComboNames: string[];

    includedServiceList: WeddingPackageServiceItemDTO[];
    beverageAllowanceList: WeddingPackageBeverageAllowanceDTO[];

    /**
     * Quà tặng thêm cho khách.
     * customerPayAmount = 0.
     */
    packageBenefitList: WeddingPackageBenefitDTO[];

    conditionList: WeddingPackageConditionDTO[];

    menuComboSummary: string | null;
    serviceSummary: string | null;
    beverageAllowanceSummary: string | null;
    benefitSummary: string | null;
    conditionSummary: string | null;

    numberOfMenuCombos: number | null;
    numberOfIncludedServices: number | null;
    numberOfBeverageAllowances: number | null;
    numberOfBenefits: number | null;

    estimatedOriginalMenuComboPrice: number | null;
    estimatedDiscountedMenuComboPrice: number | null;

    includedServiceTotal: number | null;
    beverageAllowanceTotal: number | null;

    originalPackageTotal: number | null;
    estimatedPackageTotal: number | null;

    menuDiscountSavingsAmount: number | null;
    estimatedSavingsAmount: number | null;
    estimatedSavingsRate: number | null;

    status: WeddingPackageStatusApi;
    lastModifiedAt: string | null;
    lastModifiedBy: string | null;
};

export type PageResponse<T> = {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
};