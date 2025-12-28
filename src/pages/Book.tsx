import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Scale, ChevronLeft, ChevronRight, Clock, Video, MapPin, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockConsultationTypes } from '@/services/mockData';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';

const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

export default function Book() {
  const [step, setStep] = useState(1);
  const [consultationType, setConsultationType] = useState('');
  const [meetingType, setMeetingType] = useState<'online' | 'in-person'>('online');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const { toast } = useToast();

  const selectedConsultation = mockConsultationTypes.find(c => c.id === consultationType);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !consultationType) return;

    setLoading(true);
    const response = await api.booking.createBooking({
      consultationTypeId: consultationType,
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      name: formData.name,
      email: formData.email,
      reason: formData.reason,
    });
    setLoading(false);

    if (response.success) {
      setBookingComplete(true);
    } else {
      toast({ title: 'Booking failed', description: response.message, variant: 'destructive' });
    }
  };

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center animate-scale-in">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-6">Your consultation has been scheduled. We've sent a confirmation email with all the details.</p>
            <div className="bg-secondary rounded-lg p-4 mb-6 text-left">
              <div className="text-sm text-muted-foreground mb-1">Appointment Details</div>
              <div className="font-medium">{selectedConsultation?.name}</div>
              <div className="text-sm text-muted-foreground">{selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}</div>
              <div className="text-sm text-muted-foreground capitalize">{meetingType} meeting</div>
            </div>
            <div className="flex gap-3">
              <Link to="/" className="flex-1"><Button variant="outline" className="w-full">Back to Home</Button></Link>
              <Link to="/dashboard" className="flex-1"><Button variant="gold" className="w-full">Go to Dashboard</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container-wide flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <Scale className="h-8 w-8 text-accent" />
            <span className="font-serif text-xl font-semibold">Eka Legal</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium", step >= 1 ? "bg-accent text-accent-foreground" : "bg-muted")}>1</span>
            <div className="w-8 h-0.5 bg-muted" />
            <span className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium", step >= 2 ? "bg-accent text-accent-foreground" : "bg-muted")}>2</span>
            <div className="w-8 h-0.5 bg-muted" />
            <span className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium", step >= 3 ? "bg-accent text-accent-foreground" : "bg-muted")}>3</span>
          </div>
        </div>
      </header>

      <main className="container-narrow py-12 px-4">
        {/* Step 1: Select Consultation Type */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Book a Consultation</h1>
              <p className="text-muted-foreground">Select the type of consultation you need</p>
            </div>
            <div className="grid gap-4 mb-8">
              {mockConsultationTypes.map((type) => (
                <Card key={type.id} className={cn("cursor-pointer transition-all", consultationType === type.id ? "ring-2 ring-accent" : "hover:shadow-md")} onClick={() => setConsultationType(type.id)}>
                  <CardContent className="p-6 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-foreground">{type.name}</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {type.duration} min</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">{type.price === 0 ? 'Free' : `$${type.price}`}</div>
                      {consultationType === type.id && <Check className="h-5 w-5 text-accent mt-2 ml-auto" />}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mb-8">
              <Label className="text-base mb-3 block">Meeting Preference</Label>
              <div className="grid grid-cols-2 gap-4">
                <Card className={cn("cursor-pointer transition-all", meetingType === 'online' ? "ring-2 ring-accent" : "")} onClick={() => setMeetingType('online')}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Video className="h-5 w-5 text-accent" />
                    <div>
                      <div className="font-medium">Online</div>
                      <div className="text-xs text-muted-foreground">Video conference</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className={cn("cursor-pointer transition-all", meetingType === 'in-person' ? "ring-2 ring-accent" : "")} onClick={() => setMeetingType('in-person')}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-accent" />
                    <div>
                      <div className="font-medium">In-Person</div>
                      <div className="text-xs text-muted-foreground">Office visit</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <Button variant="gold" size="lg" className="w-full" disabled={!consultationType} onClick={() => setStep(2)}>
              Continue <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && (
          <div className="animate-fade-in">
            <Button variant="ghost" onClick={() => setStep(1)} className="mb-4"><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Select Date & Time</h1>
              <p className="text-muted-foreground">Choose your preferred appointment slot</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-4">
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6} className="pointer-events-auto" />
                </CardContent>
              </Card>
              <div>
                <Label className="text-base mb-3 block">Available Times {selectedDate && `for ${selectedDate.toLocaleDateString()}`}</Label>
                {selectedDate ? (
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((time) => {
                      const available = Math.random() > 0.3;
                      return (
                        <Button key={time} variant={selectedTime === time ? "gold" : "outline"} className={cn(!available && "opacity-50 cursor-not-allowed")} disabled={!available} onClick={() => setSelectedTime(time)}>
                          {time}
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">Please select a date first</div>
                )}
              </div>
            </div>
            <Button variant="gold" size="lg" className="w-full mt-8" disabled={!selectedDate || !selectedTime} onClick={() => setStep(3)}>
              Continue <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Step 3: Your Details */}
        {step === 3 && (
          <div className="animate-fade-in">
            <Button variant="ghost" onClick={() => setStep(2)} className="mb-4"><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Your Details</h1>
              <p className="text-muted-foreground">Please provide your contact information</p>
            </div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Brief Description of Your Legal Matter *</Label>
                  <Textarea id="reason" rows={4} value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Please briefly describe what you'd like to discuss..." required />
                </div>
              </CardContent>
            </Card>
            <Card className="mt-4">
              <CardHeader className="pb-2"><CardTitle className="text-base">Booking Summary</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Consultation:</span><span>{selectedConsultation?.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date:</span><span>{selectedDate?.toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Time:</span><span>{selectedTime}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span className="capitalize">{meetingType}</span></div>
                <div className="flex justify-between font-semibold pt-2 border-t"><span>Total:</span><span>{selectedConsultation?.price === 0 ? 'Free' : `$${selectedConsultation?.price}`}</span></div>
              </CardContent>
            </Card>
            <Button variant="gold" size="lg" className="w-full mt-6" disabled={!formData.name || !formData.email || !formData.reason || loading} onClick={handleSubmit}>
              {loading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
