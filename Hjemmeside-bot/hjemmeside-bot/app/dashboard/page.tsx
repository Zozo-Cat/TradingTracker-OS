// app/dashboard/page.tsx
"use client";

import { useMemo } from "react";
import { useDummySession } from "@/lib/dummyAuth";

import MentorOverview, { type Mentee } from "../_components/MentorOverview";
import QuickMessage from "../_components/QuickMessage";
import SendTrade from "../_components/SendTrade";

export default function DashboardPage() {
    const { user } = useDummySession();
    const gold = "#D4AF37";

    // ===== Stats (dummy – kan kobles til rigtige data senere) =====
    const winrate = 74;
    const challengeProgress = 63;
    const tradingPlanAdherence = 85;

    const statCards = useMemo(
        () => [
            {
                title: "Winrate",
                value: `${winrate}%`,
                chartColor: gold,
                extra: ["Bedste par: EURUSD", "GBPUSD", "USDJPY"],
            },
            {
                title: "Challenge progress",
                value: `${challengeProgress}%`,
                chartColor: gold,
                extra: ["Challenge: 5% i 30 dage"],
            },
            {
                title: "Tradingplan overholdelse",
                value: `${tradingPlanAdherence}%`,
                chartColor: gold,
                extra: ["Følg SL", "Risk max 2%", "Ingen revenge trading"],
            },
        ],
        [winrate, challengeProgress, tradingPlanAdherence]
    );

    // ===== DEMO-liste (matcher /mentees) =====
    const DEMO_MENTEES: Mentee[] = [
        { id: "m4", name: "Signe K.",  winRate: 91, tradingPlan: ["Kun A‑setup", "Risk 0.5%"] },
        { id: "m1", name: "Amalie N.", winRate: 86, tradingPlan: ["Tag profit ved TP1", "Ingen news‑trades"] },
        { id: "m7", name: "Eva D.",    winRate: 82, tradingPlan: ["Nyheder = sidelinjen"] },
        { id: "m3", name: "Lars Ø.",   winRate: 72, tradingPlan: ["Kun London session", "BE efter 1R"] },
        { id: "m6", name: "Oliver S.", winRate: 64, tradingPlan: ["Breakout kun på H1"] },
        { id: "m5", name: "Noah B.",   winRate: 49, tradingPlan: ["Ingen revenge trades"] },
        { id: "m2", name: "Jonas P.",  winRate: 43, tradingPlan: ["Max 2 samtidige trades"] },
    ];

    // ===== Mentor-overblik (brug user.mentees KUN hvis der er gyldige procenter) =====
    const fromUser: Mentee[] = Array.isArray((user as any)?.mentees)
        ? (user as any).mentees.map((m: any) => {
            // normaliser procent-feltnavne
            const raw =
                typeof m.winRate === "number"
                    ? m.winRate
                    : typeof m.winrate === "number"
                        ? m.winrate
                        : typeof m.performance === "number"
                            ? m.performance
                            : 0;

            const winRate = Math.max(0, Math.min(100, Number(raw) || 0));
            const tradingPlan = Array.isArray(m?.plan?.checklist)
                ? m.plan.checklist.map((c: any) => c.label)
                : [];

            return { id: m.id, name: m.name, winRate, tradingPlan } as Mentee;
        })
        : [];

    // Brug KUN de mentees fra user som har en gyldig procent (>0).
    // Hvis INGEN har >0, så bruger vi demo-listen (så “Topperformere” ikke er tom).
    const validUserMentees = fromUser.filter((m) => (m.winRate ?? 0) > 0);
    const mentees: Mentee[] = validUserMentees.length > 0 ? validUserMentees : DEMO_MENTEES;

    // ===== SendTrade callback =====
    const handleSendTrade = (payload: any) => {
        console.log("[SEND TRADE]", payload);
        // TODO: bind til API/Discord bot når backend er klar
    };

    return (
        <div className="p-4 space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {statCards.map((card, idx) => (
                    <div
                        key={idx}
                        className="bg-neutral-900 rounded-xl p-4 flex flex-col items-center justify-between h-64"
                    >
                        <h2 className="text-lg font-semibold text-white">{card.title}</h2>

                        <div className="flex-1 flex items-center justify-center">
                            <svg width="100" height="100">
                                <circle cx="50" cy="50" r="42" stroke="#3b3838" strokeWidth="6" fill="none" />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="42"
                                    stroke={card.chartColor}
                                    strokeWidth="6"
                                    fill="none"
                                    strokeDasharray={`${(parseInt(card.value) / 100) * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 50 50)"
                                />
                                <text
                                    x="50"
                                    y="54"
                                    textAnchor="middle"
                                    fontSize="18"
                                    fontWeight="700"
                                    fill={card.chartColor}
                                >
                                    {card.value}
                                </text>
                            </svg>
                        </div>

                        <ul className="text-xs text-gray-400 mt-2 text-center">
                            {card.extra.map((line, i) => (
                                <li key={i}>{line}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Mentor overview (kun for leads) */}
            {(user?.isTeamLead || user?.isCommunityLead) && (
                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-white">Mentor‑overblik</h2>
                    <MentorOverview
                        mentees={mentees}
                        perPage={2}                 // 2 ad gangen, klik roterer 1
                        topThreshold={80}
                        supportThreshold={50}
                        titleTop="Topperformere"
                        titleSupport="Brug for støtte"
                        autoRotateMs={10000}        // 10s rotation (kan ændres)
                    />
                </section>
            )}

            {/* Hurtig besked + Send trade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-900 rounded-xl p-4">
                    <h2 className="text-lg font-semibold text-white mb-2">Hurtig besked</h2>
                    <QuickMessage />
                </div>

                <div className="bg-neutral-900 rounded-xl p-4">
                    <h2 className="text-lg font-semibold text-white mb-2">Send trade</h2>
                    <SendTrade onSend={handleSendTrade} />
                </div>
            </div>
        </div>
    );
}
