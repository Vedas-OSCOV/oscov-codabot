import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID || "",
            clientSecret: process.env.GITHUB_SECRET || "",
        }),
        CredentialsProvider({
            id: 'admin-login',
            name: 'Admin Login',
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const adminUser = process.env.ADMIN_USERNAME;
                const adminPass = process.env.ADMIN_PASSWORD;

                if (credentials?.username === adminUser && credentials?.password === adminPass) {
                    const user = await prisma.user.upsert({
                        where: { email: 'admin@oscov.com' },
                        update: { role: 'ADMIN' },
                        create: {
                            email: 'admin@oscov.com',
                            name: 'Admin',
                            role: 'ADMIN',
                            username: 'admin'
                        }
                    });
                    return user;
                }
                return null;
            }
        })
    ],
    session: {
        strategy: 'jwt' // Switching to JWT to support CredentialsProvider easily
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            // Update token if session is updated (e.g. score changes)
            if (trigger === "update" && session) {
                return { ...token, ...session.user };
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as any;
            }
            return session;
        },
    },
};
