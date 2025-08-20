// components/Providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { DummyAuthProvider } from "@/lib/dummyAuth";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <DummyAuthProvider>
                {children}
            </DummyAuthProvider>
        </SessionProvider>
    );
}
