"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Loader2 } from "lucide-react";

const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_ROUTES = ["/dashboard", "/onboarding"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, clinic, _hasHydrated } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Wait for store to hydrate from localStorage to avoid flashes/premature redirects
        if (!_hasHydrated) return;

        const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r));
        const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r));

        if (!isAuthenticated && isProtected) {
            // Not logged in, trying to access protected area → go to login
            router.push("/login");
        } else if (isAuthenticated && AUTH_ROUTES.some(r => pathname.startsWith(r))) {
            // Already logged in, visiting login/register → bounce to dashboard or onboarding
            if (clinic) {
                router.push("/dashboard");
            } else {
                router.push("/onboarding");
            }
        } else {
            setIsReady(true);
        }
    }, [isAuthenticated, clinic, _hasHydrated, pathname, router]);

    if (!isReady && !AUTH_ROUTES.some(r => pathname.startsWith(r))) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
