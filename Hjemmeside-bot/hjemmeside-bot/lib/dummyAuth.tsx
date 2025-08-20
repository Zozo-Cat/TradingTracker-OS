// lib/dummyAuth.tsx
"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

/** Typer */
type PercentPair = { day: number; week: number };
type ChecklistItem = { label: string; day: boolean; week: boolean };

type TradingPlan = {
  accountName: string;
  adherence: PercentPair;
  checklist: ChecklistItem[];
};

type Challenge = {
  id: string;
  name: string;
  desc: string;
  progress: PercentPair;
};

type Account = {
  id: string;
  name: string;
  winrate: PercentPair;
};

type TradeToName = {
  id: number;
  symbol: string;
  date: string;
  account?: string;
  entry?: number;
  exit?: number;
  gain?: string;
};

type Mentee = {
  id: string;
  name: string;
  plan: {
    adherence: PercentPair;
    checklist: ChecklistItem[];
  };
};

export type DummyUser = {
  id: string;
  name: string;
  avatar_url?: string;
  plan: "free" | "pro";
  isPro?: boolean;
  isOnTeam?: boolean;
  isTeamLead?: boolean;
  isCommunityLead?: boolean;
  hasTradingPlan?: boolean;

  // Dashboard data
  accounts?: Account[];
  challenges?: Challenge[];
  tradingPlans?: TradingPlan[];
  tradesToName?: TradeToName[];
  mentees?: Mentee[];
};

type Ctx = {
  user: DummyUser | null;
  users: DummyUser[];
  loginAs: (u: DummyUser) => void;
  logout: () => void;
};

const DummyCtx = createContext<Ctx | null>(null);
const LS_KEY = "tt_user";

/** DEMO USERS
 *  Mikkel (PRO): community lead, 3 konti, 2 challenges, tradingplan, 0 trades at navngive, mentor for 2.
 *  Anders (FREE): team lead, 2 konti, 1 challenge, tradingplan, 4 trades at navngive, mentor for 1.
 *  Sofie (FREE): no team, 1 konto, ingen challenge, ingen tradingplan, et par trades at navngive, ingen mentees.
 */
const DEMO_USERS: DummyUser[] = [
  {
    id: "u1",
    name: "Mikkel H.",
    avatar_url: "/images/default-avatar.png",
    plan: "pro",
    isPro: true,
    isOnTeam: true,
    isTeamLead: false,
    isCommunityLead: true,
    hasTradingPlan: true,
    accounts: [
      { id: "acc-m-1", name: "FTMO #1", winrate: { day: 68, week: 64 } },
      { id: "acc-m-2", name: "IC Markets", winrate: { day: 61, week: 59 } },
      { id: "acc-m-3", name: "Crypto Perp", winrate: { day: 54, week: 57 } },
    ],
    challenges: [
      { id: "ch-m-1", name: "August Challenge", desc: "20 trades · max DD 5%", progress: { day: 60, week: 58 } },
      { id: "ch-m-2", name: "Risk Discipline", desc: "Max 1% pr. trade", progress: { day: 76, week: 71 } },
    ],
    tradingPlans: [
      {
        accountName: "FTMO #1",
        adherence: { day: 84, week: 79 },
        checklist: [
          { label: "Risk ≤ 1%", day: true, week: true },
          { label: "Kun A‑setups", day: true, week: true },
          { label: "Ingen revenge", day: false, week: true },
        ],
      },
    ],
    tradesToName: [], // alle navngivet
    mentees: [
      {
        id: "m1",
        name: "Jonas",
        plan: {
          adherence: { day: 72, week: 65 },
          checklist: [
            { label: "Risk ≤ 1%", day: true, week: true },
            { label: "Kun A‑setups", day: false, week: true },
            { label: "Max 3 trades/dag", day: true, week: false },
          ],
        },
      },
      {
        id: "m2",
        name: "Sara",
        plan: {
          adherence: { day: 58, week: 62 },
          checklist: [
            { label: "Risk ≤ 1%", day: true, week: true },
            { label: "Kun A‑setups", day: true, week: false },
            { label: "Ingen revenge", day: false, week: false },
          ],
        },
      },
    ],
  },
  {
    id: "u2",
    name: "Anders K.",
    avatar_url: "/images/default-avatar.png",
    plan: "free",
    isPro: false,
    isOnTeam: true,
    isTeamLead: true,
    isCommunityLead: false,
    hasTradingPlan: true,
    accounts: [
      { id: "acc-a-1", name: "Personal", winrate: { day: 51, week: 55 } },
      { id: "acc-a-2", name: "Prop Eval", winrate: { day: 63, week: 60 } },
    ],
    challenges: [
      { id: "ch-a-1", name: "September Grind", desc: "Min. 5 A‑setups/uge", progress: { day: 40, week: 52 } },
    ],
    tradingPlans: [
      {
        accountName: "Personal",
        adherence: { day: 61, week: 58 },
        checklist: [
          { label: "Risk ≤ 1%", day: true, week: true },
          { label: "Kun A‑setups", day: true, week: false },
          { label: "Ingen revenge", day: false, week: false },
        ],
      },
    ],
    tradesToName: [
      { id: 401, symbol: "EURUSD", date: "2025-08-11", account: "Personal", entry: 1.0912, exit: 1.0930, gain: "+18 pips" },
      { id: 402, symbol: "GBPUSD", date: "2025-08-12", account: "Prop Eval", entry: 1.2740, exit: 1.2705, gain: "-35 pips" },
      { id: 403, symbol: "XAUUSD", date: "2025-08-12", account: "Personal", entry: 2411.5, exit: 2417.0, gain: "+5.5" },
      { id: 404, symbol: "BTCUSD", date: "2025-08-13", account: "Prop Eval", entry: 61250, exit: 60700, gain: "-550" },
    ],
    mentees: [
      {
        id: "m3",
        name: "Emil",
        plan: {
          adherence: { day: 66, week: 61 },
          checklist: [
            { label: "Risk ≤ 1%", day: true, week: true },
            { label: "Kun A‑setups", day: false, week: true },
            { label: "Ingen revenge", day: true, week: false },
          ],
        },
      },
    ],
  },
  {
    id: "u3",
    name: "Sofie L.",
    avatar_url: "/images/default-avatar.png",
    plan: "free",
    isPro: false,
    isOnTeam: false,
    isTeamLead: false,
    isCommunityLead: false,
    hasTradingPlan: false,
    accounts: [{ id: "acc-s-1", name: "Demo", winrate: { day: 42, week: 48 } }],
    challenges: [], // ingen
    tradingPlans: [], // ingen
    tradesToName: [
      { id: 501, symbol: "EURUSD", date: "2025-08-10", account: "Demo", entry: 1.0960, exit: 1.0950, gain: "-10 pips" },
      { id: 502, symbol: "ETHUSD", date: "2025-08-12", account: "Demo", entry: 2880, exit: 2920, gain: "+40" },
    ],
    mentees: [], // ingen
  },
];

/** Provider */
export function DummyAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DummyUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Hent evt. tidligere valgt bruger
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setMounted(true);
  }, []);

  const loginAs = (u: DummyUser) => {
    setUser(u);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(u));
    } catch {}
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(LS_KEY);
    } catch {}
  };

  const value = useMemo<Ctx>(() => ({ user, users: DEMO_USERS, loginAs, logout }), [user]);

  if (!mounted) return null; // undgå hydration mismatch

  return <DummyCtx.Provider value={value}>{children}</DummyCtx.Provider>;
}

/** Hook */
export function useDummySession() {
  const ctx = useContext(DummyCtx);
  if (!ctx) throw new Error("useDummySession must be used within DummyAuthProvider");
  return ctx;
}
