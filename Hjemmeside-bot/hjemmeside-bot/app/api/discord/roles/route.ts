import { NextRequest, NextResponse } from "next/server";

/**
 * Minimal stub:
 * - Returnér tom liste hvis du ikke har en Discord-klient sat op endnu.
 * - Når du er klar, byt body’en ud med rigtige kald til Discord (GET /guilds/{guild.id}/roles).
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const guildId = searchParams.get("guildId");
    if (!guildId) return NextResponse.json({ error: "guildId required" }, { status: 400 });

    // TODO: Erstat med "rigtige" roller fra Discord
    const mock = [
        { id: "everyone", name: "@everyone" },
        { id: "traders", name: "@Traders" },
        { id: "admins", name: "@Admins" },
    ];

    return NextResponse.json({ roles: mock });
}
