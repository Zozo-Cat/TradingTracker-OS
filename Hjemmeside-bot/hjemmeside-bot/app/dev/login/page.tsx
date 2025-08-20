// app/dev/login/page.tsx
"use client";

import Link from "next/link";
import { useDummySession } from "@/lib/dummyAuth";

export default function DevLoginPage() {
    const { users, loginAs } = useDummySession();

    return (
        <div
            className="mx-auto max-w-3xl p-6 space-y-6"
            style={{ color: "#f0f0f0", background: "#211d1d", minHeight: "calc(100vh - 80px)" }}
        >
            <h1 className="text-2xl font-semibold" style={{ color: "#D4AF37" }}>
                Vælg demo-bruger
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {users.map((u) => (
                    <button
                        key={u.id}
                        onClick={() => loginAs(u)}
                        className="rounded-lg p-4 text-left"
                        style={{ background: "#2a2727" }}
                    >
                        <div className="text-lg font-medium" style={{ color: "#D4AF37" }}>
                            {u.name}
                        </div>
                        <div className="text-sm text-gray-300">{u.isPro ? "Pro" : "Gratis"}</div>
                    </button>
                ))}
            </div>

            <div className="pt-2">
                <Link href="/dashboard" className="underline" style={{ color: "#D4AF37" }}>
                    Gå til dashboard →
                </Link>
            </div>
        </div>
    );
}
