'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRegister } from '@/modules/auth/hooks/use-auth';
import { useOnboardingStore } from '@/store/onboarding-store';
import { useAuthStore } from '@/store/auth-store';

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export function StepAccount() {
    const { setStep, setDoctorData } = useOnboardingStore();
    const user = useAuthStore((s) => s.user);
    const registerMutation = useRegister();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        registerMutation.mutate({
            name: values.name,
            email: values.email,
            phone: values.phone,
            password: values.password,
        }, {
            onSuccess: (response) => {
                const { user } = response.data;
                // Tokens already stored in auth store by useRegister hook
                setDoctorData(user.name, user.email);
                toast.success('Account created! Let\'s set up your clinic.');
                setStep(2);
            },
            onError: (error: any) => {
                const msg = error?.data?.error?.[0]?.message
                    || error?.data?.message
                    || 'Registration failed. Please try again.';
                toast.error(msg);
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create your account</CardTitle>
                <CardDescription>
                    Start by setting up your personal professional account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Full Name</label>
                        <Input placeholder="Dr. John Doe" {...form.register('name')} />
                        {form.formState.errors.name && (
                            <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Email</label>
                            <Input placeholder="john@example.com" {...form.register('email')} />
                            {form.formState.errors.email && (
                                <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Phone Number</label>
                            <Input placeholder="+91 98765 43210" {...form.register('phone')} />
                            {form.formState.errors.phone && (
                                <p className="text-sm text-destructive mt-1">{form.formState.errors.phone.message}</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Password</label>
                            <Input type="password" placeholder="••••••••" {...form.register('password')} />
                            {form.formState.errors.password && (
                                <p className="text-sm text-destructive mt-1">{form.formState.errors.password.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Confirm Password</label>
                            <Input type="password" placeholder="••••••••" {...form.register('confirmPassword')} />
                            {form.formState.errors.confirmPassword && (
                                <p className="text-sm text-destructive mt-1">{form.formState.errors.confirmPassword.message}</p>
                            )}
                        </div>
                    </div>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                    >
                        {registerMutation.isPending ? 'Creating Account...' : 'Continue to Clinic Details'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
                <p className="text-sm text-neutral-500">
                    Already have an account? <a href="/login" className="text-primary font-medium hover:underline">Log in</a>
                </p>
            </CardFooter>
        </Card>
    );
}
