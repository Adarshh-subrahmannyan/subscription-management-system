import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "./prisma";
import { verifyPassword } from "@/modules/auth/password";
import type { Role } from "./permissions";

function isRole(value: string): value is Role {
  return value === "admin" || value === "staff" || value === "customer";
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { customer: { select: { id: true } } },
        });

        if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
          return null;
        }

        if (!isRole(user.role)) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          customerId: user.customer?.id ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.customerId = user.customerId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role ?? "customer";
        session.user.customerId = token.customerId ?? null;
      }
      return session;
    },
  },
};
