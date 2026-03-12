'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchClient } from '@/lib/fetch-client';
import { useOnboardingStore } from '@/store/onboarding-store';
import { useAuthStore } from '@/store/auth-store';

const SPECIALIZATIONS = [
    'General Physician',
    'Dentist',
    'Dermatologist',
    'Cardiologist',
    'Pediatrician',
    'Orthopedic',
    'ENT Specialist',
    'Gynecologist',
    'Other',
];

export function StepDoctor() {
    const { setStep, clinicId, setDoctorId } = useOnboardingStore();
    const user = useAuthStore((s) => s.user);

    const [form, setForm] = useState({
        specialization: '',
        consultationDuration: '15',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.specialization) e.specialization = 'Please select your specialization';
        const dur = Number(form.consultationDuration);
        if (isNaN(dur) || dur <= 0) e.consultationDuration = 'Duration must be a positive number';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const createProfileMutation = useMutation({
        mutationFn: async () => {
            if (!clinicId) throw new Error('Missing clinic ID');
            if (!user) throw new Error('Not authenticated');

            const response = await fetchClient(`/clinics/${clinicId}/doctors`, {
                method: 'POST',
                body: JSON.stringify({
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    specialization: form.specialization,
                    consultationDuration: Number(form.consultationDuration),
                    maxTokensPerDay: 50,
                }),
            });
            return response;
        },
        onSuccess: (response) => {
            setDoctorId(response.data.id);
            toast.success('Doctor profile created!');
            setStep(4);
        },
        onError: (error: any) => {
            toast.error(error?.data?.message || 'Failed to create profile.');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        if (!clinicId) {
            toast.error('Clinic ID is missing. Please go back to step 2.');
            return;
        }
        createProfileMutation.mutate();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Professional Profile</CardTitle>
                <CardDescription>
                    Complete your profile as the primary doctor of this clinic.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="bg-neutral-50 p-4 rounded-lg mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-neutral-900">{user?.name}</p>
                        <p className="text-xs text-neutral-500">{user?.email}</p>
                    </div>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Verified
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Specialization</label>
                        <select
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            value={form.specialization}
                            onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))}
                        >
                            <option value="">Select your specialization</option>
                            {SPECIALIZATIONS.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        {errors.specialization && <p className="text-sm text-destructive mt-1">{errors.specialization}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">Consultation Duration (Minutes)</label>
                        <Input
                            type="number"
                            min="5"
                            max="120"
                            value={form.consultationDuration}
                            onChange={e => setForm(f => ({ ...f, consultationDuration: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Average time spent per patient.</p>
                        {errors.consultationDuration && <p className="text-sm text-destructive mt-1">{errors.consultationDuration}</p>}
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
                            Back
                        </Button>
                        <Button type="submit" className="flex-1" disabled={createProfileMutation.isPending}>
                            {createProfileMutation.isPending ? 'Saving...' : 'Continue to Schedule'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
