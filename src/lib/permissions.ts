export type Role = "admin" | "staff" | "customer";

const permissions: Record<Role, readonly string[]> = {
  admin: ["*"],
  staff: ["customers:read", "products:read", "subscriptions:read"],
  customer: ["portal:read"],
};

export function hasPermission(role: Role, permission: string) {
  return permissions[role].includes("*") || permissions[role].includes(permission);
}

export function canAccessCustomerData(
  role: Role,
  actorCustomerId: string | null,
  requestedCustomerId: string,
) {
  return role !== "customer" || actorCustomerId === requestedCustomerId;
}
