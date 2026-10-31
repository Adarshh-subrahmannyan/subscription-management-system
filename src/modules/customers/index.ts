import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/permissions";

export type CustomerInput = {
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  active?: boolean;
};

function assertStaffOrAdmin(role: Role) {
  if (role !== "admin" && role !== "staff") {
    throw new Error("Admin or staff access required.");
  }
}

export function validateCustomerInput(input: CustomerInput) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (name.length < 2) throw new Error("Customer name must be at least 2 characters.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Customer email must be valid.");
  }
  if (input.phone !== undefined && input.phone !== null && input.phone.trim().length > 30) {
    throw new Error("Customer phone must be 30 characters or fewer.");
  }
  if (input.address !== undefined && input.address !== null && input.address.trim().length > 500) {
    throw new Error("Customer address must be 500 characters or fewer.");
  }

  return {
    name,
    email,
    phone: input.phone?.trim() || null,
    address: input.address?.trim() || null,
    active: input.active ?? true,
  };
}

export async function createCustomer(role: Role, input: CustomerInput) {
  assertStaffOrAdmin(role);
  const data = validateCustomerInput(input);
  const existing = await prisma.customer.findFirst({ where: { email: data.email } });
  if (existing) throw new Error("A customer with this email already exists.");

  return prisma.customer.create({ data });
}

export async function listCustomers(
  role: Role,
  customerId: string | null,
  options?: { page?: number; pageSize?: number; search?: string },
) {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options?.pageSize ?? 20));
  const search = options?.search?.trim();
  const where =
    role === "customer"
      ? { id: customerId ?? "__none__" }
      : search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : undefined;

  return prisma.customer.findMany({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: "desc" },
  });
}

export async function getCustomer(
  role: Role,
  actorCustomerId: string | null,
  customerId: string,
) {
  if (role === "customer" && actorCustomerId !== customerId) return null;
  return prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      subscriptions: { orderBy: { createdAt: "desc" }, take: 10 },
      invoices: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
}

export async function updateCustomer(
  role: Role,
  actorCustomerId: string | null,
  customerId: string,
  input: CustomerInput,
) {
  if (role === "customer" && actorCustomerId !== customerId) {
    throw new Error("You can only update your own customer profile.");
  }
  if (role !== "customer" && role !== "admin" && role !== "staff") {
    throw new Error("Authentication required.");
  }

  const data = validateCustomerInput(input);
  const existing = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!existing) throw new Error("Customer not found.");
  if (role === "customer") data.active = existing.active;

  const duplicate = await prisma.customer.findFirst({
    where: { email: data.email, NOT: { id: customerId } },
  });
  if (duplicate) throw new Error("A customer with this email already exists.");

  return prisma.$transaction(async (transaction) => {
    const updated = await transaction.customer.update({
      where: { id: customerId },
      data,
    });
    if (existing.userId) {
      await transaction.user.update({
        where: { id: existing.userId },
        data: { email: data.email, name: data.name },
      });
    }
    return updated;
  });
}

export async function deactivateCustomer(
  role: Role,
  customerId: string,
) {
  assertStaffOrAdmin(role);
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw new Error("Customer not found.");
  return prisma.customer.update({
    where: { id: customerId },
    data: { active: false },
  });
}
