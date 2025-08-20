import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getSession();
        const accessToken = (session as any)?.discordAccessToken;
        if (!accessToken) {
            return NextResponse.json({ error: "Not authenticated with Discord" }, { status: 401 });
        }

        const res = await fetch("https://discord.com/api/users/@me/guilds", {
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: "no-store",
        });

        if (!res.ok) {
            const txt = await res.text();
            return NextResponse.json({ error: "Failed to fetch guilds", details: txt }, { status: 502 });
        }

        const data = await res.json();
        const guilds = (data as any[]).map(g => ({
            id: g.id,
            name: g.name,
            icon: g.icon ?? null,
            owner: g.owner ?? false,
            permissions: g.permissions ?? null,
        }));

        return NextResponse.json({ guilds });
    } catch (err: any) {
        return NextResponse.json({ error: "Unexpected error", details: err?.message }, { status: 500 });
    }
}
