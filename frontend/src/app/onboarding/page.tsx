'use client';

import { useEffect } from 'react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { useAuthStore } from '@/store/auth-store';
import { StepAccount } from './step-account';
import { StepClinic } from './step-clinic';
import { StepDoctor } from './step-doctor';
import { StepSchedule } from './step-schedule';
import { StepComplete } from './step-complete';
import { AuthGuard } from '@/components/auth-guard';

const STEP_LABELS = ['Account', 'Clinic', 'Doctor', 'Schedule', 'Done'];

export default function OnboardingPage() {
    return (
        <AuthGuard>
            <OnboardingContent />
        </AuthGuard>
    );
}

function OnboardingContent() {
    const { currentStep, setStep } = useOnboardingStore();
    const { isAuthenticated } = useAuthStore();

    // If user is already authenticated (just registered or existing session),
    // skip Step 1 (account creation) and start from Step 2 (clinic creation)
    useEffect(() => {
        if (isAuthenticated && currentStep === 1) {
            setStep(2);
        }
    }, [isAuthenticated, currentStep, setStep]);

    const renderStep = () => {
        switch (currentStep) {
            case 2:
                return <StepClinic />;
            case 3:
                return <StepDoctor />;
            case 4:
                return <StepSchedule />;
            case 5:
                return <StepComplete />;
            default:
                // Not authenticated → show account creation
                return <StepAccount />;
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Progress Bar — only show steps 2-5 when authenticated */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        {[2, 3, 4, 5].map((step, idx) => (
                            <div
                                key={step}
                                className="flex flex-col items-center gap-1"
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${currentStep >= step
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-white text-neutral-400 border border-neutral-200'
                                        }`}
                                >
                                    {idx + 1}
                                </div>
                                <span className="text-[10px] text-neutral-400 hidden md:block">
                                    {STEP_LABELS[idx + 1]}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="h-1 bg-neutral-200 rounded-full relative">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${((currentStep - 2) / 3) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Step Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {renderStep()}
                </div>
            </div>
        </div>
    );
}
