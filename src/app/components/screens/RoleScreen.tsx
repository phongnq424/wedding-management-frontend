import React, { useEffect, useMemo, useState } from "react";
import { Plus, Save, ShieldCheck, UserCog } from "lucide-react";
import {
    rbacService,
    type PermissionResponse,
    type RoleResponse,
} from "../../services/rbac.service";

type PermissionLevel = "VIEW" | "FULL_ACCESS";

function toMillis(value?: string): number {
    if (!value) return 0;
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? 0 : time;
}

function getPermissionLevel(code: string): PermissionLevel | null {
    if (code.endsWith("_FULL_ACCESS")) return "FULL_ACCESS";
    if (code.endsWith("_VIEW")) return "VIEW";
    return null;
}

function getModuleLabel(module: string) {
    return module
        .split("_")
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ");
}

export const RolesScreen = () => {
    const [roles, setRoles] = useState<RoleResponse[]>([]);
    const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set());

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const selectedRole = useMemo(
        () => roles.find((role) => role.id === selectedRoleId) ?? null,
        [roles, selectedRoleId]
    );

    const permissionByCode = useMemo(() => {
        const map = new Map<string, PermissionResponse>();
        permissions.forEach((permission) => {
            map.set(permission.code, permission);
        });
        return map;
    }, [permissions]);

    const modules = useMemo(() => {
        const grouped = new Map<
            string,
            {
                module: string;
                view?: PermissionResponse;
                fullAccess?: PermissionResponse;
            }
        >();

        permissions.forEach((permission) => {
            const level = getPermissionLevel(permission.code);
            if (!level) return;

            const current = grouped.get(permission.module) ?? {
                module: permission.module,
            };

            if (level === "VIEW") current.view = permission;
            if (level === "FULL_ACCESS") current.fullAccess = permission;

            grouped.set(permission.module, current);
        });

        return Array.from(grouped.values()).sort((a, b) =>
            a.module.localeCompare(b.module)
        );
    }, [permissions]);

    async function loadData() {
        try {
            setIsLoading(true);
            setError(null);

            const [roleData, permissionData] = await Promise.all([
                rbacService.getAllRoles(),
                rbacService.getAllPermissions(),
            ]);

            setRoles(roleData);
            setPermissions(permissionData);

            const firstRole = roleData[0] ?? null;
            if (firstRole) {
                setSelectedRoleId(firstRole.id);
                setSelectedPermissionIds(
                    new Set((firstRole.permissions ?? []).map((permission) => permission.id))
                );
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể tải dữ liệu phân quyền");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    function selectRole(role: RoleResponse) {
        setSelectedRoleId(role.id);
        setSelectedPermissionIds(
            new Set((role.permissions ?? []).map((permission) => permission.id))
        );
        setError(null);
        setSuccessMessage(null);
    }

    function hasPermission(permission?: PermissionResponse) {
        return !!permission && selectedPermissionIds.has(permission.id);
    }

    function togglePermission(permission: PermissionResponse, checked: boolean) {
        setSelectedPermissionIds((prev) => {
            const next = new Set(prev);

            if (checked) {
                next.add(permission.id);

                if (permission.code.endsWith("_FULL_ACCESS")) {
                    const viewCode = permission.code.replace("_FULL_ACCESS", "_VIEW");
                    const viewPermission = permissionByCode.get(viewCode);
                    if (viewPermission) {
                        next.add(viewPermission.id);
                    }
                }
            } else {
                next.delete(permission.id);

                if (permission.code.endsWith("_VIEW")) {
                    const fullAccessCode = permission.code.replace("_VIEW", "_FULL_ACCESS");
                    const fullAccessPermission = permissionByCode.get(fullAccessCode);
                    if (fullAccessPermission) {
                        next.delete(fullAccessPermission.id);
                    }
                }
            }

            return next;
        });
    }

    async function savePermissions() {
        if (!selectedRole) return;

        try {
            setIsSaving(true);
            setError(null);
            setSuccessMessage(null);

            const updatedRole = await rbacService.updateRole(
                selectedRole.id,
                {
                    name: selectedRole.name,
                    description: selectedRole.description,
                    permissionIds: Array.from(selectedPermissionIds),
                },
                toMillis(selectedRole.lastModifiedAt)
            );

            setRoles((prev) =>
                prev.map((role) => (role.id === updatedRole.id ? updatedRole : role))
            );

            setSelectedPermissionIds(
                new Set((updatedRole.permissions ?? []).map((permission) => permission.id))
            );

            setSuccessMessage("Cập nhật quyền thành công");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể cập nhật quyền");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-primary mb-2">
                        Role & Permission Management
                    </h1>
                    <p className="text-muted-foreground">
                        Configure role-based access control with View and Full Access permissions
                    </p>
                </div>

                <button
                    type="button"
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm"
                >
                    <Plus className="w-5 h-5" /> Add New Role
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="p-4 rounded-xl border border-green-200 bg-green-50 text-green-700 text-sm">
                    {successMessage}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
                <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-border">
                        <h3 className="font-semibold text-primary">Roles</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Select a role to configure permissions
                        </p>
                    </div>

                    <div className="p-3 space-y-2">
                        {isLoading ? (
                            <p className="text-sm text-muted-foreground p-3">Loading roles...</p>
                        ) : roles.length === 0 ? (
                            <p className="text-sm text-muted-foreground p-3">No roles found</p>
                        ) : (
                            roles.map((role) => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => selectRole(role)}
                                    className={`w-full p-4 rounded-xl border transition-all text-left ${selectedRoleId === role.id
                                        ? "bg-accent/10 border-accent"
                                        : "bg-background border-border hover:border-accent/50"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <UserCog className="w-5 h-5 text-accent mt-0.5" />
                                        <div>
                                            <p className="font-medium text-foreground">{role.name}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {role.permissionCount ?? role.permissions?.length ?? 0} permissions
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-primary">
                                Permission Matrix{selectedRole ? `: ${selectedRole.name}` : ""}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Each module has only two levels: View and Full Access
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={savePermissions}
                            disabled={!selectedRole || isSaving}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? "Saving..." : "Save Permissions"}
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary sticky top-0">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                        Module
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                                        View
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                                        Full Access
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-border">
                                {modules.map((item) => (
                                    <tr key={item.module} className="hover:bg-secondary/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <ShieldCheck className="w-4 h-4 text-accent" />
                                                <div>
                                                    <p className="font-medium text-foreground">
                                                        {getModuleLabel(item.module)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground font-mono">
                                                        {item.module}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            {item.view ? (
                                                <input
                                                    type="checkbox"
                                                    checked={hasPermission(item.view)}
                                                    onChange={(e) =>
                                                        togglePermission(item.view!, e.target.checked)
                                                    }
                                                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent cursor-pointer"
                                                />
                                            ) : (
                                                <span className="text-xs text-muted-foreground">N/A</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            {item.fullAccess ? (
                                                <input
                                                    type="checkbox"
                                                    checked={hasPermission(item.fullAccess)}
                                                    onChange={(e) =>
                                                        togglePermission(item.fullAccess!, e.target.checked)
                                                    }
                                                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent cursor-pointer"
                                                />
                                            ) : (
                                                <span className="text-xs text-muted-foreground">N/A</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 border-t border-border flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                            Full Access automatically includes View.
                        </p>

                        <button
                            type="button"
                            onClick={loadData}
                            disabled={isLoading || isSaving}
                            className="px-6 py-2.5 border border-border text-foreground rounded-xl hover:bg-secondary transition-all disabled:opacity-50"
                        >
                            Reload
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};