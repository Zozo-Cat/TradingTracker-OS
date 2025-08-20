import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Body: { guildIds: string[] }
 * Return: { present: string[], absent: string[] }
 *
 * Vi kalder /guilds/{id}. 200 => botten er i guild'en, 403/404 => ikke.
 */
export async function POST(req: Request) {
    try {
        const botToken = process.env.DISCORD_BOT_TOKEN;
        if (!botToken) {
            return NextResponse.json({ error: "Missing DISCORD_BOT_TOKEN" }, { status: 500 });
        }

        const body = await req.json().catch(() => ({}));
        const guildIds: string[] = Array.isArray(body?.guildIds) ? body.guildIds : [];
        if (!guildIds.length) {
            return NextResponse.json({ error: "guildIds required" }, { status: 400 });
        }

        const present: string[] = [];
        const absent: string[] = [];

        for (const gid of guildIds) {
            const res = await fetch(`https://discord.com/api/guilds/${gid}`, {
                headers: { Authorization: `Bot ${botToken}` },
                cache: "no-store",
            });
            if (res.ok) present.push(gid);
            else absent.push(gid);
        }

        return NextResponse.json({ present, absent });
    } catch (err: any) {
        return NextResponse.json({ error: "Unexpected error", details: err?.message }, { status: 500 });
    }
}
