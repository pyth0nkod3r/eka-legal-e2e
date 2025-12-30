import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { ConsultationType, TimeSlot } from '@/types';

interface AddAppointmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function AddAppointmentModal({ open, onOpenChange, onSuccess }: AddAppointmentModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [consultationTypeId, setConsultationTypeId] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [reason, setReason] = useState('');
    const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([]);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingTypes, setLoadingTypes] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            api.booking.getConsultationTypes().then((res) => {
                if (res.success) {
                    setConsultationTypes(res.data);
                }
                setLoadingTypes(false);
            });
        }
    }, [open]);

    useEffect(() => {
        if (date) {
            api.booking.getAvailableSlots(date).then((res) => {
                if (res.success) {
                    setTimeSlots(res.data.filter((slot) => slot.available));
                }
            });
        }
    }, [date]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await api.booking.createBooking({
            consultationTypeId,
            date,
            time,
            name,
            email,
            reason,
        });

        if (result.success) {
            toast({ title: 'Success', description: 'Appointment created successfully!' });
            setName('');
            setEmail('');
            setConsultationTypeId('');
            setDate('');
            setTime('');
            setReason('');
            onOpenChange(false);
            onSuccess?.();
        } else {
            toast({ title: 'Error', description: result.message || 'Failed to create appointment', variant: 'destructive' });
        }

        setLoading(false);
    };

    // Get minimum date (today)
    const today = new Date().toISOString().split('T')[0];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Appointment</DialogTitle>
                    <DialogDescription>
                        Schedule a new consultation appointment.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Client Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Client Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="consultationType">Consultation Type</Label>
                            <Select value={consultationTypeId} onValueChange={setConsultationTypeId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingTypes ? 'Loading...' : 'Select type'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {consultationTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id}>
                                            {type.name} ({type.duration} min - ${type.price})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    min={today}
                                    value={date}
                                    onChange={(e) => {
                                        setDate(e.target.value);
                                        setTime(''); // Reset time when date changes
                                    }}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="time">Time</Label>
                                <Select value={time} onValueChange={setTime} required disabled={!date}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={date ? 'Select time' : 'Select date first'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timeSlots.map((slot) => (
                                            <SelectItem key={slot.id} value={slot.time}>
                                                {slot.time}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Reason for Consultation</Label>
                            <Textarea
                                id="reason"
                                placeholder="Brief description of what you'd like to discuss..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={2}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="gold" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Appointment'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
