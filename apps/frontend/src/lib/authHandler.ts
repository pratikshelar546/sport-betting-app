import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions, Session } from "next-auth";
import { server } from "@/utlis/server";
import { JWT } from "next-auth/jwt";

export interface session extends Session {
  user: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    balance?: number;
    id: string;
    token: string;
  };
}

interface user {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  balance?: number;
  id: string;
  token?: string;
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Phone number/Email",
          type: "text",
          placeholder: "Enter your Phone number/Email id",
        },
        password: {
          label: "password",
          type: "password",
          placeholder: "Enter your password",
        },
      },
      async authorize(credentials: any) {
        try {
          const payload = {
            creadntials: credentials.username,
            password: credentials.password,
          };

          const response = await server.post(`/user/login`, payload);
          const data = response.data;
          if (data && data.success && data.user) {
            return {
              ...data.user,
              token: data.token,
            };
          } else {
            return null;
          }
          return null;
        } catch (error: any) {
          console.error("in error", error);
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }): Promise<JWT> => {
      if (user) {
        try {
          token.jwtToken = (user as user)?.token;
        } catch (error: any) {
          console.error("JWT Error:", error.message);
        }
      }
      return token;
    },

    session: async ({ session, token }) => {
      const newSession: session = session as session;

      if (newSession.user) {
        newSession.user.token = token.jwtToken as string;
        newSession.user.id = token.sub as string;
      }

      return newSession!;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production",
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthOptions;
