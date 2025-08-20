// app/api/discord/test-send/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const channelId = String(body.channelId || "").trim();
        const text =
            typeof body.text === "string" && body.text.trim().length > 0
                ? body.text.trim()
                : "🚨 Test advarsel fra Trading Tracker 🚨";

        if (!channelId) {
            return NextResponse.json({ error: "Mangler channelId" }, { status: 400 });
        }

        const token = process.env.DISCORD_BOT_TOKEN;
        if (!token) {
            return NextResponse.json(
                { error: "Server mangler DISCORD_BOT_TOKEN i env" },
                { status: 500 }
            );
        }

        const r = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
            method: "POST",
            headers: {
                Authorization: `Bot ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: text }),
        });

        if (!r.ok) {
            const errText = await r.text();
            return NextResponse.json(
                { error: `Discord API fejl: ${r.status} ${r.statusText} – ${errText}` },
                { status: r.status }
            );
        }

        const data = await r.json();
        return NextResponse.json({ ok: true, message: data });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Uventet fejl" }, { status: 500 });
    }
}
