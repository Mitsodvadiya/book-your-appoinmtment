'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchClient } from '@/lib/fetch-client';
import { useOnboardingStore } from '@/store/onboarding-store';

const DAYS = [
    { label: 'Sunday', value: '0' },
    { label: 'Monday', value: '1' },
    { label: 'Tuesday', value: '2' },
    { label: 'Wednesday', value: '3' },
    { label: 'Thursday', value: '4' },
    { label: 'Friday', value: '5' },
    { label: 'Saturday', value: '6' },
];

export function StepSchedule() {
    const { setStep, doctorId, clinicId } = useOnboardingStore();
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        dayOfWeek: '1',
        startTime: '09:00',
        endTime: '17:00',
    });

    // Fetch existing schedules
    const { data: schedulesResponse, isLoading } = useQuery({
        queryKey: ['schedules', doctorId],
        queryFn: () => fetchClient(`/doctors/${doctorId}/schedules`),
        enabled: !!doctorId,
    });

    const schedules = schedulesResponse?.data || [];

    const addScheduleMutation = useMutation({
        mutationFn: async () => {
            if (!clinicId) throw new Error('Missing clinic ID');

            return fetchClient(`/doctors/${doctorId}/schedules`, {
                method: 'POST',
                body: JSON.stringify({
                    clinicId,
                    dayOfWeek: Number(form.dayOfWeek),
                    startTime: form.startTime,
                    endTime: form.endTime,
                    isActive: true,
                }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules', doctorId] });
            toast.success('Schedule added!');
        },
        onError: (error: any) => {
            console.error('Add schedule error:', error);
            toast.error(error?.data?.message || 'Failed to add schedule.');
        }
    });

    const deleteScheduleMutation = useMutation({
        mutationFn: (id: string) => fetchClient(`/schedules/${id}`, { method: 'DELETE' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules', doctorId] });
            toast.success('Schedule removed');
        }
    });

    const handleAddSlot = (e: React.FormEvent) => {
        e.preventDefault();
        if (form.startTime >= form.endTime) {
            toast.error('End time must be after start time.');
            return;
        }
        addScheduleMutation.mutate();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Set Availability</CardTitle>
                <CardDescription>
                    Define your weekly working hours. Add at least one slot to continue.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddSlot} className="space-y-4 mb-8 p-4 border rounded-lg bg-neutral-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Day</label>
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                value={form.dayOfWeek}
                                onChange={e => setForm(f => ({ ...f, dayOfWeek: e.target.value }))}
                            >
                                {DAYS.map(day => (
                                    <option key={day.value} value={day.value}>{day.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Start</label>
                            <Input
                                type="time"
                                value={form.startTime}
                                onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">End</label>
                            <Input
                                type="time"
                                value={form.endTime}
                                onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        variant="secondary"
                        className="w-full flex items-center gap-2"
                        disabled={addScheduleMutation.isPending}
                    >
                        <Plus size={16} />
                        {addScheduleMutation.isPending ? 'Adding...' : 'Add Time Slot'}
                    </Button>
                </form>

                <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Current Schedule</h4>
                    {isLoading ? (
                        <div className="py-4 text-center text-sm text-neutral-400">Loading schedules...</div>
                    ) : schedules.length === 0 ? (
                        <div className="py-8 text-center text-sm text-neutral-400 border-2 border-dashed rounded-lg">
                            No slots added yet.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {schedules.map((s: any) => (
                                <div key={s.id} className="flex items-center justify-between p-3 border rounded-md bg-white">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 text-primary rounded-full">
                                            <Clock size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{DAYS.find(d => d.value === s.dayOfWeek.toString())?.label}</p>
                                            <p className="text-xs text-neutral-500">
                                                {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} –{' '}
                                                {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => deleteScheduleMutation.mutate(s.id)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-4 pt-8">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(3)}>
                        Back
                    </Button>
                    <Button
                        type="button"
                        className="flex-1"
                        disabled={schedules.length === 0}
                        onClick={() => setStep(5)}
                    >
                        Finish Onboarding
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
