"use client";

import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { TopHeader } from "@/components/layout/top-header"
import { AuthGuard } from "@/components/auth-guard"
import { useProfile } from "@/modules/auth/hooks/use-auth"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Fetch profile on dashboard load
    useProfile();

    return (
        <AuthGuard>
            <TooltipProvider>
                <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                        <AppSidebar />
                        <div className="flex flex-1 flex-col">
                            <TopHeader />
                            <main className="flex-1 p-6">
                                {children}
                            </main>
                        </div>
                    </div>
                </SidebarProvider>
            </TooltipProvider>
        </AuthGuard>
    )
}
