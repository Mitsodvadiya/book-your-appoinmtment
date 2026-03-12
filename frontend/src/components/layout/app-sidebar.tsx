"use client";

import {
    LayoutDashboard,
    Hospital,
    UserRound,
    CalendarDays,
    Users,
    Ticket,
    Settings
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Clinics", url: "/dashboard/clinics", icon: Hospital },
    { title: "Doctors", url: "/dashboard/doctors", icon: UserRound },
    { title: "Schedules", url: "/dashboard/schedules", icon: CalendarDays },
    { title: "Patients", url: "/dashboard/patients", icon: Users },
    { title: "Queue", url: "/dashboard/queue", icon: Ticket },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="p-4">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <Ticket className="w-6 h-6 text-primary" />
                    <span className="group-data-[collapsible=icon]:hidden">ClinicToken</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.url}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.url}>
                                            <item.icon className="w-4 h-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
