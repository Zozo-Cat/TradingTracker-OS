// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./db";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),

    providers: [
        // Discord-login (identify + guilds). Vi tvinger ny consent med prompt=consent
        DiscordProvider({
            clientId: process.env.AUTH_DISCORD_ID as string,
            clientSecret: process.env.AUTH_DISCORD_SECRET as string,
            authorization: {
                params: {
                    scope: "identify guilds",
                    prompt: "consent", // <— vigtigt: tvinger Discord til at vise godkendelse igen
                },
            },
        }),

        // Lokal email + kodeord (uændret)
        Credentials({
            name: "Email & Kodeord",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Kodeord", type: "password" },
            },
            async authorize(credentials) {
                const email = credentials?.email?.toLowerCase().trim();
                const password = credentials?.password ?? "";
                if (!email || !password) return null;

                const user = await prisma.user.findUnique({
                    where: { email },
                    select: { id: true, email: true, name: true, passwordHash: true },
                });
                if (!user?.passwordHash) return null;

                const ok = await bcrypt.compare(password, user.passwordHash);
                if (!ok) return null;

                return { id: user.id, email: user.email, name: user.name ?? undefined };
            },
        }),
    ],

    session: { strategy: "jwt" },
    secret: process.env.AUTH_SECRET,

    callbacks: {
        async jwt({ token, account }) {
            if (account?.provider === "discord" && account.access_token) {
                (token as any).discordAccessToken = account.access_token;
            }
            (token as any).discordUserId = token.sub;
            return token;
        },
        async session({ session, token }) {
            (session as any).discordAccessToken = (token as any).discordAccessToken ?? null;
            (session as any).discordUserId = (token as any).discordUserId ?? null;
            if (session.user && token.sub) (session.user as any).id = token.sub;
            return session;
        },
    },
};

export function getSession() {
    return getServerSession(authOptions);
}
