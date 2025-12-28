import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/layout/Navigation';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const response = await api.auth.forgotPassword(email);
    
    if (response.success) {
      setSent(true);
      toast({
        title: 'Email sent',
        description: 'Check your inbox for password reset instructions.',
      });
    } else {
      toast({
        title: 'Error',
        description: response.message || 'Something went wrong.',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-md mx-auto">
          <Link to="/login" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>

          <Card className="border-border/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                {sent ? (
                  <CheckCircle className="h-6 w-6 text-success" />
                ) : (
                  <Mail className="h-6 w-6 text-accent" />
                )}
              </div>
              <CardTitle className="font-serif text-2xl">
                {sent ? 'Check Your Email' : 'Forgot Password'}
              </CardTitle>
              <CardDescription>
                {sent
                  ? 'We\'ve sent password reset instructions to your email address.'
                  : 'Enter your email address and we\'ll send you a link to reset your password.'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {sent ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Didn't receive the email? Check your spam folder or{' '}
                    <button
                      onClick={() => setSent(false)}
                      className="text-accent hover:underline"
                    >
                      try again
                    </button>
                  </p>
                  <Link to="/login">
                    <Button variant="outline" className="w-full">
                      Return to Login
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="gold"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}