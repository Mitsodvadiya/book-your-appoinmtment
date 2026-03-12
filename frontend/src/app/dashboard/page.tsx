"use client";

import { useAuthStore } from "@/store/auth-store";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Ticket,
    UserRound,
    Users,
    Activity,
    Building2,
    CalendarCheck
} from "lucide-react";

export default function DashboardPage() {
    const { user, clinic } = useAuthStore();

    const stats = [
        {
            title: "Today's Tokens",
            value: "24",
            description: "+4 from yesterday",
            icon: Ticket,
            color: "text-blue-600",
        },
        {
            title: "Active Doctors",
            value: "12",
            description: "Currently on duty",
            icon: UserRound,
            color: "text-green-600",
        },
        {
            title: "Patients Today",
            value: "48",
            description: "12 new registrations",
            icon: Users,
            color: "text-purple-600",
        },
        {
            title: "Queue Status",
            value: "Healthy",
            description: "Avg wait: 15 mins",
            icon: Activity,
            color: "text-orange-600",
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Welcome back, {user?.name || "Doctor"}. Here is what's happening today at {clinic?.name || "your clinic"}.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                <Card className="border-l-4 border-l-primary">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            Clinic Overview
                        </CardTitle>
                        <CardDescription>
                            Main clinic details as seen by patients
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {clinic ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase">Clinic Name</p>
                                    <p className="text-sm font-semibold">{clinic.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase">Location</p>
                                    <p className="text-sm font-semibold">{clinic.city}, {clinic.state}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase">Contact</p>
                                    <p className="text-sm font-semibold">{clinic.phone}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase">Email</p>
                                    <p className="text-sm font-semibold">{clinic.email}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No clinic associated with your account yet.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarCheck className="w-5 h-5 text-blue-500" />
                            Recent Activity
                        </CardTitle>
                        <CardDescription>
                            Latest updates in the last 24 hours
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                <p className="text-sm">Patient <strong>Rahul S.</strong> completed check-in</p>
                                <span className="ml-auto text-xs text-muted-foreground">2m ago</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                <p className="text-sm">New appointment booked by <strong>Anita K.</strong></p>
                                <span className="ml-auto text-xs text-muted-foreground">15m ago</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-orange-500" />
                                <p className="text-sm">Dr. Sharma updated schedule for Monday</p>
                                <span className="ml-auto text-xs text-muted-foreground">1h ago</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
