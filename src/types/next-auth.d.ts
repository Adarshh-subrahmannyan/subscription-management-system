import "next-auth";
import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/permissions";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role: Role;
    customerId: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      customerId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    customerId?: string | null;
  }
}
