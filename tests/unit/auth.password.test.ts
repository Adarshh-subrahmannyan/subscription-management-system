import {
  createPasswordResetToken,
  hashPasswordResetToken,
  hashPassword,
  validatePassword,
  verifyPassword,
} from "../../src/modules/auth/password";

if (validatePassword("weak") === null) {
  throw new Error("Weak password was accepted.");
}

async function main() {
  const password = "StrongPassword!";
  const hash = await hashPassword(password);
  if (!(await verifyPassword(password, hash))) {
    throw new Error("Password verification failed.");
  }
  if (await verifyPassword("WrongPassword!", hash)) {
    throw new Error("Incorrect password was accepted.");
  }

  const token = createPasswordResetToken();
  if (
    token.length < 32 ||
    hashPasswordResetToken(token) === hashPasswordResetToken(createPasswordResetToken())
  ) {
    throw new Error("Reset token hashing failed.");
  }

  console.log("Authentication password test passed!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
