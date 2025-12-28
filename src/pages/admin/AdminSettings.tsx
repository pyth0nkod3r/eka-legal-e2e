import { useState } from 'react';
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

export default function AdminSettings() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [firmSettings, setFirmSettings] = useState({
    firmName: 'Mitchell Legal Consultancy',
    email: 'info@mitchelllegal.com',
    phone: '+1 (555) 987-6543',
    address: '123 Legal Ave, New York, NY 10001',
    website: 'www.mitchelllegal.com',
  });

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
    await new Promise(resolve => setTimeout(resolve, 800));
    setSaving(false);
    toast({
      title: 'Settings saved',
      description: 'Your settings have been updated successfully.',
    });
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
                <div className="grid gap-2">
                  <Label htmlFor="firmName">Firm Name</Label>
                  <Input 
                    id="firmName" 
                    value={firmSettings.firmName}
                    onChange={(e) => setFirmSettings({...firmSettings, firmName: e.target.value})}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={firmSettings.email}
                      onChange={(e) => setFirmSettings({...firmSettings, email: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      value={firmSettings.phone}
                      onChange={(e) => setFirmSettings({...firmSettings, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea 
                    id="address" 
                    value={firmSettings.address}
                    onChange={(e) => setFirmSettings({...firmSettings, address: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    value={firmSettings.website}
                    onChange={(e) => setFirmSettings({...firmSettings, website: e.target.value})}
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
                    onChange={(e) => setBusinessHours({...businessHours, weekdays: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="saturday">Saturday</Label>
                  <Input 
                    id="saturday" 
                    value={businessHours.saturday}
                    onChange={(e) => setBusinessHours({...businessHours, saturday: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sunday">Sunday</Label>
                  <Input 
                    id="sunday" 
                    value={businessHours.sunday}
                    onChange={(e) => setBusinessHours({...businessHours, sunday: e.target.value})}
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
                    onCheckedChange={(checked) => setNotifications({...notifications, emailNewBooking: checked})}
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
                    onCheckedChange={(checked) => setNotifications({...notifications, emailCaseUpdate: checked})}
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
                    onCheckedChange={(checked) => setNotifications({...notifications, emailNewMessage: checked})}
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
                    onCheckedChange={(checked) => setNotifications({...notifications, smsReminders: checked})}
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
