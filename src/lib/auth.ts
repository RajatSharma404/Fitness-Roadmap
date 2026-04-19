import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking:
        process.env.ALLOW_DANGEROUS_EMAIL_LINKING === "true",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user = {
          ...(session.user ?? {}),
          id: String(token.id),
          email: (token.email as string | null) ?? null,
          name: (token.name as string | null) ?? null,
          image: (token.picture as string | null) ?? null,
        } as typeof session.user;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      // Check if user needs onboarding
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { goal: true, bodyweight: true },
      });

      // Mark as needing onboarding if goal/bodyweight not set
      if (!dbUser?.goal || !dbUser?.bodyweight) {
        // This will be handled by the client
      }
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
};

export default NextAuth(authOptions);
