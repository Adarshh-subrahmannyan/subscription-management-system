import { prisma } from "@/lib/prisma";
import { hashPassword, validatePassword } from "./password";

export type UserRole = "admin" | "staff" | "customer";

export async function registerCustomer(input: {
  email: string;
  name: string;
  password: string;
}) {
  const email = input.email.trim().toLowerCase();
  const passwordError = validatePassword(input.password);
  if (passwordError) throw new Error(passwordError);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("An account with this email already exists.");

  const passwordHash = await hashPassword(input.password);
  return prisma.user.create({
    data: {
      email,
      name: input.name.trim(),
      passwordHash,
      role: "customer",
      customer: {
        create: {
          name: input.name.trim(),
          email,
        },
      },
    },
    select: { id: true, email: true, name: true, role: true },
  });
}

export async function createStaffAccount(
  actorRole: UserRole,
  input: { email: string; name: string; password: string },
) {
  if (actorRole !== "admin") {
    throw new Error("Only admins can create staff accounts.");
  }

  const email = input.email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("An account with this email already exists.");

  return prisma.user.create({
    data: {
      email,
      name: input.name.trim(),
      passwordHash: await hashPassword(input.password),
      role: "staff",
    },
    select: { id: true, email: true, name: true, role: true },
  });
}
