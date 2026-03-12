"use client";

import { useState, Suspense } from "react";
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
import { Ticket, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const resetMutation = useMutation({
        mutationFn: (data: { token: string; password?: string }) => authService.resetPassword(data),
        onSuccess: () => {
            setIsSuccess(true);
            toast.success("Password reset successfully!");
        },
        onError: (error: any) => {
            toast.error(error.message || "Invalid or expired token");
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (!token) {
            toast.error("Reset token is missing");
            return;
        }

        resetMutation.mutate({ token, password });
    };

    if (isSuccess) {
        return (
            <Card className="w-full max-w-md border-t-4 border-t-primary shadow-lg text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-green-100 rounded-full">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Password Reset!</CardTitle>
                    <CardDescription>
                        Your password has been successfully updated. You can now login with your new password.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Link href="/login" className="w-full">
                        <Button className="w-full">
                            Sign In
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md border-t-4 border-t-primary shadow-lg">
            <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-2">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <Ticket className="w-10 h-10 text-primary" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
                <CardDescription>
                    Please enter your new password below.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={resetMutation.isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={resetMutation.isPending}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 pt-2">
                    <Button type="submit" className="w-full" disabled={resetMutation.isPending || !token}>
                        {resetMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Resetting...
                            </>
                        ) : "Reset Password"}
                    </Button>
                    {!token && (
                        <p className="text-xs text-destructive text-center">
                            Invalid reset link. Please request a new one.
                        </p>
                    )}
                </CardFooter>
            </form>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Suspense fallback={<Loader2 className="animate-spin" />}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
