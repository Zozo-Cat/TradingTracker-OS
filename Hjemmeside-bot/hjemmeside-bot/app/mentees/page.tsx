// app/mentees/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Mentee } from "@/app/_components/MentorOverview";
import { useDummySession } from "@/lib/dummyAuth";

const gold = "#D4AF37";
const border = "#3b3838";
const cardBg = "#2a2727";

function keyFor(uid?: string) {
    return `tt_starred_mentees_${uid || "anon"}`;
}
function loadStars(uid?: string): string[] {
    try {
        const raw = localStorage.getItem(keyFor(uid));
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr.map(String) : [];
    } catch { return []; }
}
function saveStars(ids: string[], uid?: string) {
    try {
        localStorage.setItem(keyFor(uid), JSON.stringify([...new Set(ids)]));
    } catch {}
}

export default function MenteesPage() {
    const { user } = useDummySession();

    // Dummy data – i produktion hentes fra Supabase
    const mentees: Mentee[] = [
        { id: "m1", name: "Amalie N.", winRate: 86, tradingPlan: ["Tag profit ved TP1", "Ingen news‑trades"] },
        { id: "m2", name: "Jonas P.",   winRate: 43, tradingPlan: ["Max 2 samtidige trades"] },
        { id: "m3", name: "Lars Ø.",    winRate: 72, tradingPlan: ["Kun London session", "BE efter 1R"] },
        { id: "m4", name: "Signe K.",   winRate: 91, tradingPlan: ["Kun A‑setup", "Risk 0.5%"] },
        { id: "m5", name: "Noah B.",    winRate: 49, tradingPlan: ["Ingen revenge trades"] },
        { id: "m6", name: "Oliver S.",  winRate: 64, tradingPlan: ["Breakout kun på H1"] },
        { id: "m7", name: "Eva D.",     winRate: 82, tradingPlan: ["Nyheder = sidelinjen"] },
    ];

    const [view, setView] = useState<"all"|"top"|"support"|"starred">("all");
    const [sortDir, setSortDir] = useState<"desc"|"asc">("desc");
    const [q, setQ] = useState("");

    const [starred, setStarred] = useState<string[]>([]);

    useEffect(() => {
        setStarred(loadStars(user?.id));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const toggleStar = (id: string | number) => {
        const s = String(id);
        setStarred((prev) => {
            const next = prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s];
            saveStars(next, user?.id);
            return next;
        });
    };

    const filtered = useMemo(() => {
        let arr = mentees.slice();

        if (view === "top") arr = arr.filter(m => m.winRate >= 80);
        if (view === "support") arr = arr.filter(m => m.winRate <= 50);
        if (view === "starred") arr = arr.filter(m => starred.includes(String(m.id)));

        if (q.trim()) {
            const qq = q.trim().toLowerCase();
            arr = arr.filter(m => m.name.toLowerCase().includes(qq));
        }

        arr.sort((a,b) => sortDir === "desc" ? (b.winRate - a.winRate) : (a.winRate - b.winRate));
        return arr;
    }, [mentees, view, sortDir, q, starred]);

    // focus via query ?focus=id
    const highlightRef = useRef<string | null>(null);
    useEffect(() => {
        const u = new URL(window.location.href);
        const focus = u.searchParams.get("focus");
        if (focus) {
            highlightRef.current = focus;
            requestAnimationFrame(() => {
                const el = document.querySelector(`[data-mentee-id="${CSS.escape(focus)}"]`);
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    (el as HTMLElement).style.outline = `2px solid ${gold}`;
                    setTimeout(() => ((el as HTMLElement).style.outline = ""), 1500);
                }
            });
        }
    }, []);

    return (
        <div className="mx-auto max-w-6xl px-4 py-6 space-y-4">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-bold" style={{ color: gold }}>Mentees</h1>
                <a href="/dashboard" className="text-sm hover:underline" style={{ color: gold }}>
                    ← Tilbage til dashboard
                </a>
            </header>

            {/* Controls */}
            <div className="flex flex-col md:flex-row md:items-center gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setView("all")}
                        className={`px-3 py-1 rounded border text-sm ${view==="all" ? "" : "opacity-80"}`}
                        style={{ borderColor: gold, color: gold }}
                    >
                        Alle
                    </button>
                    <button
                        onClick={() => setView("top")}
                        className={`px-3 py-1 rounded border text-sm ${view==="top" ? "" : "opacity-80"}`}
                        style={{ borderColor: gold, color: gold }}
                    >
                        Topperformere (≥80%)
                    </button>
                    <button
                        onClick={() => setView("support")}
                        className={`px-3 py-1 rounded border text-sm ${view==="support" ? "" : "opacity-80"}`}
                        style={{ borderColor: gold, color: gold }}
                    >
                        Brug for støtte (≤50%)
                    </button>
                    <button
                        onClick={() => setView("starred")}
                        className={`px-3 py-1 rounded border text-sm ${view==="starred" ? "" : "opacity-80"}`}
                        style={{ borderColor: gold, color: gold }}
                        title="Vis kun stjernemarkerede"
                    >
                        ⭐ Kun stjernede
                    </button>
                </div>

                <div className="flex items-center gap-2 md:ml-auto">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Søg efter navn…"
                        className="rounded-md px-3 py-2 text-sm outline-none border"
                        style={{ background: "#211d1d", color: "#f0f0f0", borderColor: border }}
                    />
                    <select
                        value={sortDir}
                        onChange={(e) => setSortDir(e.target.value as any)}
                        className="rounded-md px-3 py-2 text-sm outline-none border"
                        style={{ background: "#211d1d", color: "#f0f0f0", borderColor: border }}
                    >
                        <option value="desc">Sortér: Høj → Lav</option>
                        <option value="asc">Sortér: Lav → Høj</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="text-sm text-gray-400">Ingen mentees matcher filtrene.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filtered.map((m) => {
                        const isStar = starred.includes(String(m.id));
                        return (
                            <div
                                key={m.id}
                                data-mentee-id={String(m.id)}
                                className="rounded-xl p-3 border"
                                style={{ background: cardBg, borderColor: border }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="font-semibold text-white">{m.name}</div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => toggleStar(m.id)}
                                            className="px-2 py-1 rounded border text-xs hover:bg-white/5"
                                            style={{ borderColor: isStar ? gold : border, color: isStar ? "#000" : gold, background: isStar ? gold : "transparent" }}
                                            title={isStar ? "Fjern stjerne" : "Stjernemarkér"}
                                        >
                                            ⭐
                                        </button>
                                        <span
                                            className="text-xs px-2 py-0.5 rounded border"
                                            style={{ borderColor: gold, color: gold }}
                                            title="Win rate"
                                        >
                      {Math.round(m.winRate)}%
                    </span>
                                    </div>
                                </div>
                                {m.tradingPlan?.length ? (
                                    <ul className="mt-2 text-sm text-gray-300 list-disc list-inside space-y-1">
                                        {m.tradingPlan.slice(0,3).map((r,idx)=><li key={idx}>{r}</li>)}
                                    </ul>
                                ) : (
                                    <div className="mt-2 text-sm text-gray-400">Ingen tradingplan angivet.</div>
                                )}
                                <div className="mt-3 flex items-center justify-end gap-2">
                                    <a
                                        href={`/mentees?focus=${encodeURIComponent(String(m.id))}`}
                                        className="text-xs hover:underline"
                                        style={{ color: gold }}
                                    >
                                        Se noter →
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
