import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/discord/channels?guildId=ID
 * Returnerer kun tekst/announcement-kanaler + kategori-navn.
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const guildId = searchParams.get("guildId");
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!guildId) return NextResponse.json({ error: "Missing guildId" }, { status: 400 });
    if (!botToken) return NextResponse.json({ error: "Missing DISCORD_BOT_TOKEN" }, { status: 500 });

    const res = await fetch(`https://discord.com/api/guilds/${guildId}/channels`, {
        headers: { Authorization: `Bot ${botToken}` },
        cache: "no-store",
    });

    if (!res.ok) {
        const t = await res.text().catch(() => "");
        return NextResponse.json({ error: "Failed to fetch channels", details: t }, { status: res.status });
    }

    const raw = await res.json(); // array af Discord channels
    type Raw = { id: string; name: string; type: number; parent_id?: string | null };

    const categories = new Map<string, string>(); // id -> category name
    (raw as Raw[]).forEach(c => { if (c.type === 4) categories.set(c.id, c.name); });

    // Text (0) + Announcement (5)
    const channels = (raw as Raw[])
        .filter(c => c.type === 0 || c.type === 5)
        .map(c => ({
            id: c.id,
            name: c.name,
            type: c.type,               // 0=text, 5=announcement
            categoryName: c.parent_id ? categories.get(c.parent_id) ?? null : null,
        }));

    return NextResponse.json({ channels });
}
