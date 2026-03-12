"use client";

import { useState, useEffect } from "react";
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
    CheckCircle2,
    XCircle
} from "lucide-react";
import apiClient from "@/services/api-client";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
    const [clinics, setClinics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchClinics() {
            try {
                const response = await apiClient.get("/clinics");
                setClinics(response.data.data || []);
            } catch (err: any) {
                console.error("Failed to fetch clinics:", err);
                setError(err.message || "Failed to connect to backend");
            } finally {
                setLoading(false);
            }
        }

        fetchClinics();
    }, []);

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
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    Welcome back to your clinic management portal.
                </p>
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
                <Card>
                    <CardHeader>
                        <CardTitle>System Connectivity</CardTitle>
                        <CardDescription>
                            Verifying connection with backend API
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Backend Status:</span>
                            {loading ? (
                                <Badge variant="outline">Connecting...</Badge>
                            ) : error ? (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                    <XCircle className="w-3 h-3" /> Offline
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-200 bg-green-50">
                                    <CheckCircle2 className="w-3 h-3" /> Online
                                </Badge>
                            )}
                        </div>
                        {error && (
                            <p className="mt-2 text-xs text-destructive">Error: {error}. Is the backend running at {process.env.NEXT_PUBLIC_API_URL}?</p>
                        )}
                        {!loading && !error && (
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-2">Connected Clinics ({clinics.length}):</p>
                                <ul className="text-sm space-y-1">
                                    {clinics.slice(0, 3).map((clinic: any) => (
                                        <li key={clinic.id} className="text-muted-foreground">• {clinic.name}</li>
                                    ))}
                                    {clinics.length > 3 && <li className="text-muted-foreground text-xs italic">...and {clinics.length - 3} more</li>}
                                    {clinics.length === 0 && <li className="text-muted-foreground italic text-xs">No clinics found in database.</li>}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
