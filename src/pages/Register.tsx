import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, Eye, EyeOff, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { register } = useAuth();

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
    const result = await register(formData.name, formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      toast({ title: 'Account created!', description: 'Welcome to Eka Legal Consultancy.' });
      // Navigation is handled by PublicRoute redirect
    } else {
      toast({ title: 'Registration failed', description: result.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center gap-2 mb-4">
            <Scale className="h-10 w-10 text-accent" />
          </Link>
          <CardTitle className="font-serif text-2xl">Create Account</CardTitle>
          <CardDescription>Join our client portal to manage your cases</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="space-y-1 mt-2">
                {passwordChecks.map((check, i) => (
                  <div key={i} className={`text-xs flex items-center gap-2 ${check.valid ? 'text-success' : 'text-muted-foreground'}`}>
                    <Check className={`h-3 w-3 ${check.valid ? 'opacity-100' : 'opacity-30'}`} /> {check.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required />
            </div>
            <Button type="submit" className="w-full" variant="gold" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            Already have an account? <Link to="/login" className="text-accent hover:underline font-medium">Sign in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
