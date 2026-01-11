import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, Eye, EyeOff, Check, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminRegister() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  // Using context to update user state after registration
  const { logout } = useAuth();

  const passwordChecks = [
    { label: 'At least 8 characters', valid: formData.password.length >= 8 },
    { label: 'Contains a number', valid: /\d/.test(formData.password) },
    { label: 'Contains uppercase', valid: /[A-Z]/.test(formData.password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (!passwordChecks.every(check => check.valid)) {
      toast({ title: 'Error', description: 'Please meet all password requirements', variant: 'destructive' });
      return;
    }
    setLoading(true);
    
    // Ensure clean state before registering
    await logout();

    const result = await api.auth.createAdmin({
      name: formData.name, 
      email: formData.email, 
      password: formData.password
    });
    
    setLoading(false);

    if (result.success) {
      toast({ title: 'Admin Account created!', description: 'You will be redirected shortly.' });
      // Force reload to pick up the new token and user state handled by PublicRoute or AuthContext
      window.location.href = '/admin';
    } else {
      toast({ title: 'Registration failed', description: result.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-scale-in border-neutral-700 bg-neutral-800 text-white">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center gap-2 mb-4">
            <Scale className="h-10 w-10 text-gold-500" />
          </Link>
          <CardTitle className="font-serif text-2xl text-gold-400 flex items-center justify-center gap-2">
            <ShieldAlert className="h-6 w-6" /> Admin Setup
          </CardTitle>
          <CardDescription className="text-neutral-400">Create an administrative account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-neutral-300">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Admin User" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                required 
                className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-300">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@example.com" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                required 
                className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-300">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  value={formData.password} 
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                  required 
                  className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="space-y-1 mt-2">
                {passwordChecks.map((check, i) => (
                  <div key={i} className={`text-xs flex items-center gap-2 ${check.valid ? 'text-green-500' : 'text-neutral-500'}`}>
                    <Check className={`h-3 w-3 ${check.valid ? 'opacity-100' : 'opacity-30'}`} /> {check.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-neutral-300">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                value={formData.confirmPassword} 
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} 
                required 
                className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
              />
            </div>
            <Button type="submit" className="w-full bg-gold-500 hover:bg-gold-600 text-black border-none" disabled={loading}>
              {loading ? 'Creating admin...' : 'Create Admin Account'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
             <Link to="/login" className="text-gold-400 hover:underline font-medium">Back to Login</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
