import { prisma } from "@/lib/prisma";
import {
  createPasswordResetToken,
  hashPassword,
  hashPasswordResetToken,
  validatePassword,
} from "./password";

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

const DEFAULT_RESET_TOKEN_TTL_MINUTES = 60;

function resetTokenTtlMinutes() {
  const configured = Number(process.env.AUTH_RESET_TOKEN_TTL_MINUTES);
  return Number.isInteger(configured) && configured > 0
    ? configured
    : DEFAULT_RESET_TOKEN_TTL_MINUTES;
}

export async function requestPasswordReset(emailInput: string) {
  const email = emailInput.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // Keep the result indistinguishable for known and unknown addresses.
  if (!user || !user.passwordHash) return null;

  const token = createPasswordResetToken();
  const expiresAt = new Date(Date.now() + resetTokenTtlMinutes() * 60_000);

  await prisma.$transaction([
    prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashPasswordResetToken(token),
        expiresAt,
      },
    }),
  ]);

  return { token, expiresAt };
}

export async function resetPassword(token: string, password: string) {
  if (!token.trim()) throw new Error("Reset token is required.");
  const passwordError = validatePassword(password);
  if (passwordError) throw new Error(passwordError);

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashPasswordResetToken(token) },
  });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date()) {
    throw new Error("Reset token is invalid or expired.");
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.updateMany({
      where: {
        userId: resetToken.userId,
        usedAt: null,
        id: { not: resetToken.id },
      },
      data: { usedAt: new Date() },
    }),
  ]);
}
