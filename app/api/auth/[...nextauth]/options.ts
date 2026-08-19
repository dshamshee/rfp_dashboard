import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema/user";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password");
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();

        try {
          const [existingUser] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, normalizedEmail))
            .limit(1);

          if (!existingUser) {
            throw new Error("Invalid email or password");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            existingUser.password
          );

          if (!isPasswordCorrect) {
            throw new Error("Invalid email or password");
          }

          return {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            role: existingUser.role,
          };
        } catch (error: any) {
          throw new Error(error?.message || "Authentication failed");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) {
          throw new Error("Google account email missing.");
        }
        const normalizedEmail = user.email.toLowerCase().trim();
        const [existingUser] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, normalizedEmail))
          .limit(1);

        if (!existingUser) {
          throw new Error("Access denied. No admin account found with this Google email.");
        }
        return true;
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google") {
          if (user.email) {
            const normalizedEmail = user.email.toLowerCase().trim();
            const [existingUser] = await db
              .select()
              .from(usersTable)
              .where(eq(usersTable.email, normalizedEmail))
              .limit(1);

            if (existingUser) {
              token.id = existingUser.id;
              token.role = existingUser.role;
              token.name = existingUser.name;
            }
          }
        } else {
          token.id = user.id;
          token.role = user.role;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET || "rfp_dashboard_secret_key_2026",
};

export async function GetServerSessionHere() {
  return await getServerSession(authOptions);
}