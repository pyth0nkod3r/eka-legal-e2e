import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { API_BASE_URL } from '@/services/config';
import { useAuth } from '@/contexts/AuthContext';
import { LawyerProfile } from '@/types';

const getAvatarUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

export default function AdminSettings() {
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lawyerProfile, setLawyerProfile] = useState<LawyerProfile | null>(null);
  const [firmSettings, setFirmSettings] = useState({
    firmName: 'Eka Legal Consultancy',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    const loadData = async () => {
      const profileRes = await api.public.getLawyerProfile();
      
      if (profileRes.success && profileRes.data) {
        setLawyerProfile(profileRes.data);
        setFirmSettings({
          firmName: profileRes.data.firmName || 'Eka Legal Consultancy',
          email: profileRes.data.email || '',
          phone: profileRes.data.phone || '',
          address: profileRes.data.address || '',
        });
      }
    };
    loadData();
  }, []);

  const [businessHours, setBusinessHours] = useState({
    weekdays: '9:00 AM - 6:00 PM',
    saturday: 'By Appointment',
    sunday: 'Closed',
  });

  const [notifications, setNotifications] = useState({
    emailNewBooking: true,
    emailCaseUpdate: true,
    emailNewMessage: true,
    smsReminders: false,
  });

  const handleSave = async () => {
    setSaving(true);
    
    // Update lawyer profile (Firm settings)
    const res = await api.public.updateLawyerProfile({
      firmName: firmSettings.firmName,
      email: firmSettings.email,
      phone: firmSettings.phone,
      address: firmSettings.address,
    });

    setSaving(false);
    
    if (res.success) {
      toast({
        title: 'Settings saved',
        description: 'Firm profile has been updated successfully.',
      });
    } else {
      toast({
        title: 'Update failed',
        description: res.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await api.auth.uploadAvatar(file);
    
    if (res.success && res.data?.avatarUrl) {
      // Refresh user in AuthContext so header updates
      await refreshUser();
      toast({
        title: "Photo updated",
        description: "Your profile photo has been updated."
      });
    } else {
      toast({
        title: "Upload failed",
        description: res.message || "Failed to upload photo",
        variant: "destructive"
      });
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your firm and account settings</p>
        </div>

        <Tabs defaultValue="firm" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="firm">Firm Profile</TabsTrigger>
            <TabsTrigger value="hours">Business Hours</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="firm">
            <Card>
              <CardHeader>
                <CardTitle>Firm Information</CardTitle>
                <CardDescription>Update your firm's public information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6 mb-6">
                  <img 
                    src={getAvatarUrl(user?.avatarUrl) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firmSettings.firmName}`} 
                    alt="Logo" 
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <Button variant="outline" onClick={handleAvatarClick}>Change Logo</Button>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="firmName">Firm Name</Label>
                  <Input
                    id="firmName"
                    value={firmSettings.firmName}
                    readOnly
                    className="bg-muted text-muted-foreground"
                    onChange={(e) => setFirmSettings({ ...firmSettings, firmName: e.target.value })}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={firmSettings.email}
                      onChange={(e) => setFirmSettings({ ...firmSettings, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={firmSettings.phone}
                      onChange={(e) => setFirmSettings({ ...firmSettings, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={firmSettings.address}
                    onChange={(e) => setFirmSettings({ ...firmSettings, address: e.target.value })}
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button variant="gold" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
                <CardDescription>Set your availability for client bookings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="weekdays">Monday - Friday</Label>
                  <Input
                    id="weekdays"
                    value={businessHours.weekdays}
                    onChange={(e) => setBusinessHours({ ...businessHours, weekdays: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="saturday">Saturday</Label>
                  <Input
                    id="saturday"
                    value={businessHours.saturday}
                    onChange={(e) => setBusinessHours({ ...businessHours, saturday: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sunday">Sunday</Label>
                  <Input
                    id="sunday"
                    value={businessHours.sunday}
                    onChange={(e) => setBusinessHours({ ...businessHours, sunday: e.target.value })}
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button variant="gold" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">New Booking Alerts</div>
                    <div className="text-sm text-muted-foreground">Email when a new booking is made</div>
                  </div>
                  <Switch
                    checked={notifications.emailNewBooking}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailNewBooking: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Case Updates</div>
                    <div className="text-sm text-muted-foreground">Email when case status changes</div>
                  </div>
                  <Switch
                    checked={notifications.emailCaseUpdate}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailCaseUpdate: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">New Messages</div>
                    <div className="text-sm text-muted-foreground">Email when you receive a message</div>
                  </div>
                  <Switch
                    checked={notifications.emailNewMessage}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailNewMessage: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">SMS Reminders</div>
                    <div className="text-sm text-muted-foreground">Text reminders for appointments</div>
                  </div>
                  <Switch
                    checked={notifications.smsReminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, smsReminders: checked })}
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button variant="gold" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>Manage your subscription and payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-6 text-center">
                  <p className="text-muted-foreground">Billing management coming soon.</p>
                  <p className="text-sm text-muted-foreground mt-2">Contact support for billing inquiries.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
