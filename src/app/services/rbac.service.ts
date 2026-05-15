import { apiRequest } from "../api/client";

export type PermissionStatus = "ACTIVE" | "INACTIVE";
export type RoleStatus = "ACTIVE" | "INACTIVE";

export interface PermissionResponse {
    id: string;
    name: string;
    description?: string;
    code: string;
    module: string;
    status: PermissionStatus;
    lastModifiedAt?: string;
    lastModifiedBy?: string;
}

export interface RoleResponse {
    id: string;
    name: string;
    description?: string;
    status: RoleStatus;
    permissions: PermissionResponse[];
    permissionCount: number;
    lastModifiedAt?: string;
    lastModifiedBy?: string;
}

export interface RoleRequest {
    name: string;
    description?: string;
    permissionIds: string[];
}

export const rbacService = {
    getAllRoles() {
        return apiRequest<RoleResponse[]>("/roles", {
            method: "GET",
            auth: true,
        });
    },

    getRoleById(roleId: string) {
        return apiRequest<RoleResponse>(`/roles/${roleId}`, {
            method: "GET",
            auth: true,
        });
    },

    updateRole(roleId: string, request: RoleRequest, lastModifiedAt: number) {
        return apiRequest<RoleResponse>(`/roles/${roleId}?lastModifiedAt=${lastModifiedAt}`, {
            method: "PUT",
            body: JSON.stringify(request),
            auth: true,
        });
    },

    getAllPermissions() {
        return apiRequest<PermissionResponse[]>("/permissions", {
            method: "GET",
            auth: true,
        });
    },
};