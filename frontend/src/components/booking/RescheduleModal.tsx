import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { api } from "@/services/api";
import { Booking } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

interface RescheduleModalProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const TIME_SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

export default function RescheduleModal({
  booking,
  open,
  onOpenChange,
  onSuccess,
}: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    booking ? new Date(booking.date) : new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string>(booking?.time || "10:00");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  if (!booking) return null;

  const handleReschedule = async () => {
    if (!selectedDate) {
      toast({ title: "Select a date", description: "Please select a date for your appointment.", variant: "destructive" });
      return;
    }

    const formattedDate = selectedDate.toISOString().split("T")[0];
    setSubmitting(true);

    try {
      const res = await api.booking.rescheduleBooking(booking.id, formattedDate, selectedTime);
      if (res.success) {
        toast({
          title: "Appointment Rescheduled",
          description: `Successfully rescheduled to ${formattedDate} at ${selectedTime}`,
        });
        onOpenChange(false);
        onSuccess();
      } else {
        toast({
          title: "Reschedule Failed",
          description: res.message || "Failed to reschedule appointment",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <CalendarIcon className="h-5 w-5 text-gold" />
            Reschedule Appointment
          </DialogTitle>
          <DialogDescription>
            Choose a new date and time for consultation with {booking.clientName} ({booking.consultationType.name}).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Select New Date
            </label>
            <div className="border rounded-lg p-2 flex justify-center bg-card">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-1">
              <Clock className="h-4 w-4 text-gold" /> Select Time Slot
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((time) => {
                const [h, m] = time.split(":");
                const hour = parseInt(h);
                const ampm = hour >= 12 ? "PM" : "AM";
                const displayHour = hour % 12 || 12;
                const displayTime = `${displayHour}:${m} ${ampm}`;

                return (
                  <Button
                    key={time}
                    type="button"
                    variant={selectedTime === time ? "gold" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setSelectedTime(time)}
                  >
                    {displayTime}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="gold" onClick={handleReschedule} disabled={submitting}>
            {submitting ? "Rescheduling..." : "Confirm Reschedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
