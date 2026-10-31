import { randomUUID } from "node:crypto";
import { prisma } from "../../src/lib/prisma";
import {
  registerCustomer,
  requestPasswordReset,
  resetPassword,
} from "../../src/modules/auth/auth.service";
import { verifyPassword } from "../../src/modules/auth/password";

async function main() {
  const email = `auth-test-${randomUUID()}@example.com`;
  const user = await registerCustomer({
    email,
    name: "Auth Integration Test",
    password: "InitialPassword!",
  });

  try {
    const reset = await requestPasswordReset(email);
    if (!reset) throw new Error("Reset token was not issued.");

    await resetPassword(reset.token, "UpdatedPassword!");
    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!updatedUser?.passwordHash) throw new Error("Password hash was not stored.");
    if (!(await verifyPassword("UpdatedPassword!", updatedUser.passwordHash))) {
      throw new Error("Updated password could not be verified.");
    }

    let reusedTokenRejected = false;
    try {
      await resetPassword(reset.token, "AnotherPassword!");
    } catch {
      reusedTokenRejected = true;
    }
    if (!reusedTokenRejected) throw new Error("Reset token could be reused.");

    console.log("Authentication integration test passed!");
  } finally {
    await prisma.user.delete({ where: { id: user.id } });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
