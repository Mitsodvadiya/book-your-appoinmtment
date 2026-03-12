'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useOnboardingStore } from '@/store/onboarding-store';

export function StepComplete() {
    const router = useRouter();
    const { resetOnboarding } = useOnboardingStore();

    const handleFinish = () => {
        resetOnboarding();
        router.push('/dashboard');
    };

    return (
        <Card className="text-center overflow-hidden">
            <div className="h-24 bg-primary flex items-center justify-center">
                <div className="bg-white rounded-full p-2 text-primary animate-bounce">
                    <CheckCircle2 size={40} />
                </div>
            </div>
            <CardHeader className="pt-8">
                <CardTitle className="text-2xl">Onboarding Complete!</CardTitle>
                <CardDescription>
                    Your clinic and profile have been successfully set up.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-neutral-600 mb-6">
                    You can now access your dashboard to manage appointments,
                    view patient queues, and update your information.
                </p>
                <div className="bg-neutral-50 p-4 rounded-lg flex flex-col gap-2 text-left">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-neutral-500">Clinic Status:</span>
                        <span className="text-green-600 font-bold uppercase tracking-widest">Active</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-neutral-500">Doctor Profile:</span>
                        <span className="text-green-600 font-bold uppercase tracking-widest">Ready</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-neutral-500">Schedule:</span>
                        <span className="text-green-600 font-bold uppercase tracking-widest">Configured</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleFinish} className="w-full text-lg h-12">
                    Go to Dashboard
                </Button>
            </CardFooter>
        </Card>
    );
}
