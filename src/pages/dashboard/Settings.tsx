import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { User } from '@/types';

export default function Settings() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    caseUpdates: true,
    appointmentReminders: true,
    messageNotifications: true,
    marketingEmails: false,
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  useEffect(() => {
    api.auth.getCurrentUser().then(res => {
      if (res.success) {
        setUser(res.data);
        setProfile({
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone || '',
        });
      }
      setLoading(false);
    });
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setSaving(false);
    toast({
      title: 'Profile updated',
      description: 'Your profile has been saved successfully.',
    });
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaving(false);
    toast({
      title: 'Preferences saved',
      description: 'Your notification preferences have been updated.',
    });
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your new passwords match.',
        variant: 'destructive',
      });
      return;
    }
    if (passwords.new.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters.',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setSaving(false);
    setPasswords({ current: '', new: '', confirm: '' });
    toast({
      title: 'Password changed',
      description: 'Your password has been updated successfully.',
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <img 
                    src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} 
                    alt="Avatar" 
                    className="w-20 h-20 rounded-full"
                  />
                  <Button variant="outline">Change Photo</Button>
                </div>
                
                <Separator />
                
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={profile.name} 
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={profile.email} 
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel"
                      value={profile.phone} 
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="gold" onClick={handleSaveProfile} disabled={saving}>
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
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Email Updates</div>
                      <div className="text-sm text-muted-foreground">Receive updates via email</div>
                    </div>
                    <Switch 
                      checked={notifications.emailUpdates}
                      onCheckedChange={(checked) => setNotifications({...notifications, emailUpdates: checked})}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Case Updates</div>
                      <div className="text-sm text-muted-foreground">Get notified when your case status changes</div>
                    </div>
                    <Switch 
                      checked={notifications.caseUpdates}
                      onCheckedChange={(checked) => setNotifications({...notifications, caseUpdates: checked})}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Appointment Reminders</div>
                      <div className="text-sm text-muted-foreground">Receive reminders before appointments</div>
                    </div>
                    <Switch 
                      checked={notifications.appointmentReminders}
                      onCheckedChange={(checked) => setNotifications({...notifications, appointmentReminders: checked})}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Message Notifications</div>
                      <div className="text-sm text-muted-foreground">Get notified of new messages</div>
                    </div>
                    <Switch 
                      checked={notifications.messageNotifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, messageNotifications: checked})}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Marketing Emails</div>
                      <div className="text-sm text-muted-foreground">Receive news and promotional content</div>
                    </div>
                    <Switch 
                      checked={notifications.marketingEmails}
                      onCheckedChange={(checked) => setNotifications({...notifications, marketingEmails: checked})}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="gold" onClick={handleSaveNotifications} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input 
                    id="current-password" 
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    variant="gold" 
                    onClick={handleChangePassword} 
                    disabled={saving || !passwords.current || !passwords.new || !passwords.confirm}
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible account actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Delete Account</div>
                    <div className="text-sm text-muted-foreground">Permanently delete your account and all data</div>
                  </div>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
