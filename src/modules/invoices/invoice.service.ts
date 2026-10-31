import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/permissions";

export async function listInvoices(
  role: Role,
  customerId: string | null,
  options?: { page?: number; pageSize?: number; search?: string },
) {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options?.pageSize ?? 20));
  const search = options?.search?.trim();

  const where =
    role === "customer"
      ? { customerId: customerId ?? "__none__" }
      : search
        ? {
            OR: [
              { number: { contains: search } },
              { customer: { name: { contains: search } } },
            ],
          }
        : undefined;

  const [data, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        payments: { select: { id: true, amount: true, paidAt: true, method: true } },
        _count: { select: { lines: true } },
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  return { data, total, page, pageSize };
}

export async function getInvoice(role: Role, customerId: string | null, id: string) {
  const base = role === "customer" ? { id, customerId: customerId ?? "__none__" } : { id };
  return prisma.invoice.findFirst({
    where: base,
    include: {
      customer: true,
      subscription: { include: { plan: true } },
      lines: { include: { product: true } },
      payments: true,
    },
  });
}