'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchClient } from '@/lib/fetch-client';
import { useOnboardingStore } from '@/store/onboarding-store';
import { useAuthStore } from '@/store/auth-store';

export function StepClinic() {
    const { setStep, setClinicId } = useOnboardingStore();
    const setClinic = useAuthStore((s) => s.setClinic);

    const [form, setForm] = useState({
        name: '',
        city: '',
        address: '',
        phone: '',
        description: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const e: Record<string, string> = {};
        if (form.name.length < 2) e.name = 'Clinic name must be at least 2 characters';
        if (form.city.length < 2) e.city = 'City is required';
        if (form.address.length < 5) e.address = 'Full address is required';
        if (form.phone.length < 10) e.phone = 'Clinic phone number must be at least 10 digits';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const createClinicMutation = useMutation({
        mutationFn: async () => {
            const response = await fetchClient('/clinics', {
                method: 'POST',
                body: JSON.stringify({
                    name: form.name,
                    city: form.city,
                    address: form.address,
                    phone: form.phone,
                    description: form.description || undefined,
                    email: 'clinic@example.com',
                    state: 'Default State',
                    country: 'India',
                }),
            });
            return response;
        },
        onSuccess: (response) => {
            const clinic = response.data;
            setClinicId(clinic.id);
            // Store clinic data in auth store so routing knows clinic exists
            setClinic(clinic);
            toast.success('Clinic registered successfully!');
            setStep(3);
        },
        onError: (error: any) => {
            const msg = error?.data?.message || 'Failed to create clinic.';
            toast.error(msg);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        createClinicMutation.mutate();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Register your Clinic</CardTitle>
                <CardDescription>
                    Tell us about your medical practice or clinic.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Clinic Name</label>
                        <Input
                            placeholder="City Care Hospital"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        />
                        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">City</label>
                            <Input
                                placeholder="Mumbai"
                                value={form.city}
                                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                            />
                            {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Clinic Phone</label>
                            <Input
                                placeholder="+91 99999 88888"
                                value={form.phone}
                                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                            />
                            {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Full Address</label>
                        <Input
                            placeholder="123 Health Street, Near Medical Square"
                            value={form.address}
                            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                        />
                        {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Description (Optional)</label>
                        <Textarea
                            placeholder="Write a brief overview of your clinic..."
                            className="resize-none"
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        />
                    </div>
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setStep(1)}
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={createClinicMutation.isPending}
                        >
                            {createClinicMutation.isPending ? 'Registering...' : 'Continue to Profile'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
