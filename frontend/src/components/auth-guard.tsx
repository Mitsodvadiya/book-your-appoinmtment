"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Check authentication
        if (!isAuthenticated && !pathname.startsWith("/login")) {
            router.push("/login");
        } else if (isAuthenticated && pathname === "/login") {
            router.push("/dashboard");
        } else {
            setIsReady(true);
        }
    }, [isAuthenticated, pathname, router]);

    if (!isReady && !pathname.startsWith("/login")) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
