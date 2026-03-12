"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Ticket, Loader2, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const forgotMutation = useMutation({
        mutationFn: (email: string) => authService.forgotPassword(email),
        onSuccess: () => {
            setIsSubmitted(true);
            toast.success("Reset link sent if account exists");
        },
        onError: (error: any) => {
            toast.error(error.message || "Something went wrong");
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        forgotMutation.mutate(email);
    };

    if (isSubmitted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
                <Card className="w-full max-w-md border-t-4 border-t-primary shadow-lg text-center">
                    <CardHeader>
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Mail className="w-10 h-10 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
                        <CardDescription>
                            We&apos;ve sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Link href="/login" className="w-full">
                            <Button variant="outline" className="w-full">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to login
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md border-t-4 border-t-primary shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-2">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Ticket className="w-10 h-10 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
                    <CardDescription>
                        No worries, we&apos;ll send you reset instructions.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@clinic.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={forgotMutation.isPending}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 pt-2">
                        <Button type="submit" className="w-full" disabled={forgotMutation.isPending}>
                            {forgotMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : "Reset Password"}
                        </Button>
                        <Link href="/login" className="text-sm font-medium text-primary hover:underline flex items-center justify-center">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to login
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
