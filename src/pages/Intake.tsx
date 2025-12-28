import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Check, Save, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/layout/Navigation';
import { IntakeFormData } from '@/types';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, title: 'Personal Info', description: 'Basic contact details' },
  { id: 2, title: 'Case Type', description: 'Nature of your matter' },
  { id: 3, title: 'Details', description: 'Describe your situation' },
  { id: 4, title: 'Review', description: 'Confirm and submit' },
];

const CASE_TYPES = [
  { value: 'corporate', label: 'Corporate Law' },
  { value: 'estate', label: 'Estate Planning' },
  { value: 'litigation', label: 'Civil Litigation' },
  { value: 'contract', label: 'Contract Law' },
  { value: 'realestate', label: 'Real Estate Law' },
  { value: 'other', label: 'Other' },
];

const URGENCY_LEVELS = [
  { value: 'low', label: 'Not Urgent', description: 'Within 2-4 weeks' },
  { value: 'medium', label: 'Moderate', description: 'Within 1-2 weeks' },
  { value: 'high', label: 'Urgent', description: 'Within a few days' },
  { value: 'critical', label: 'Very Urgent', description: 'Immediate attention needed' },
];

export default function Intake() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<IntakeFormData>>({
    personalInfo: { name: '', email: '', phone: '', preferredContact: 'email' },
    caseType: '',
    urgency: 'medium',
    description: '',
    additionalInfo: {},
    consent: false,
  });

  const updateFormData = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updatePersonalInfo = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo!, [field]: value },
    }));
  };

  const handleSaveDraft = async () => {
    await api.intake.saveDraft(formData);
    toast({ title: 'Draft saved', description: 'Your progress has been saved.' });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const response = await api.intake.submitIntakeForm(formData as IntakeFormData);
    
    if (response.success) {
      toast({
        title: 'Request Submitted',
        description: 'We will contact you within 24 hours.',
      });
      navigate('/dashboard');
    } else {
      toast({
        title: 'Error',
        description: response.message || 'Failed to submit.',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.personalInfo?.name && formData.personalInfo?.email;
      case 2:
        return formData.caseType && formData.urgency;
      case 3:
        return formData.description && formData.description.length >= 50;
      case 4:
        return formData.consent;
      default:
        return false;
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
              Legal Consultation Request
            </h1>
            <p className="text-muted-foreground">
              Complete this form to request a consultation with our attorney
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={cn(
                    'flex flex-col items-center',
                    step.id <= currentStep ? 'text-accent' : 'text-muted-foreground'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-1',
                      step.id < currentStep && 'bg-accent text-accent-foreground',
                      step.id === currentStep && 'bg-accent/20 text-accent border-2 border-accent',
                      step.id > currentStep && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
                  </div>
                  <span className="text-xs hidden sm:block">{step.title}</span>
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Form Card */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
              <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.personalInfo?.name || ''}
                        onChange={(e) => updatePersonalInfo('name', e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.personalInfo?.email || ''}
                        onChange={(e) => updatePersonalInfo('email', e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.personalInfo?.phone || ''}
                        onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact">Preferred Contact Method</Label>
                      <Select
                        value={formData.personalInfo?.preferredContact || 'email'}
                        onValueChange={(v) => updatePersonalInfo('preferredContact', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Case Type */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>What type of legal matter do you need help with? *</Label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {CASE_TYPES.map((type) => (
                        <div
                          key={type.value}
                          onClick={() => updateFormData('caseType', type.value)}
                          className={cn(
                            'p-4 border rounded-lg cursor-pointer transition-all',
                            formData.caseType === type.value
                              ? 'border-accent bg-accent/10'
                              : 'border-border hover:border-accent/50'
                          )}
                        >
                          <span className="font-medium">{type.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>How urgent is your matter? *</Label>
                    <div className="space-y-2">
                      {URGENCY_LEVELS.map((level) => (
                        <div
                          key={level.value}
                          onClick={() => updateFormData('urgency', level.value)}
                          className={cn(
                            'p-4 border rounded-lg cursor-pointer transition-all flex justify-between items-center',
                            formData.urgency === level.value
                              ? 'border-accent bg-accent/10'
                              : 'border-border hover:border-accent/50'
                          )}
                        >
                          <span className="font-medium">{level.label}</span>
                          <span className="text-sm text-muted-foreground">{level.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Details */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Please describe your legal matter *
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      placeholder="Provide a detailed description of your situation, including relevant background information, timeline, and what outcome you're hoping to achieve..."
                      className="min-h-[200px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum 50 characters ({formData.description?.length || 0}/50)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desired-outcome">What outcome are you hoping for?</Label>
                    <Textarea
                      id="desired-outcome"
                      value={formData.additionalInfo?.desiredOutcome || ''}
                      onChange={(e) => updateFormData('additionalInfo', {
                        ...formData.additionalInfo,
                        desiredOutcome: e.target.value,
                      })}
                      placeholder="Describe your ideal resolution..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prior-counsel">Have you consulted with another attorney about this matter?</Label>
                    <Select
                      value={formData.additionalInfo?.priorCounsel || 'no'}
                      onValueChange={(v) => updateFormData('additionalInfo', {
                        ...formData.additionalInfo,
                        priorCounsel: v,
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="current">Currently represented</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Contact Information</h4>
                      <p className="font-medium">{formData.personalInfo?.name}</p>
                      <p className="text-sm text-muted-foreground">{formData.personalInfo?.email}</p>
                      {formData.personalInfo?.phone && (
                        <p className="text-sm text-muted-foreground">{formData.personalInfo.phone}</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Case Type</h4>
                      <p className="font-medium">
                        {CASE_TYPES.find(t => t.value === formData.caseType)?.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Urgency: {URGENCY_LEVELS.find(l => l.value === formData.urgency)?.label}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Description</h4>
                      <p className="text-sm">{formData.description}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border border-warning/50 bg-warning/5 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-warning">Important Notice</p>
                      <p className="text-muted-foreground">
                        Submitting this form does not create an attorney-client relationship. 
                        Your information will be reviewed and we will contact you to discuss your matter.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="consent"
                      checked={formData.consent || false}
                      onCheckedChange={(checked) => updateFormData('consent', checked)}
                    />
                    <Label htmlFor="consent" className="text-sm">
                      I understand and consent to the terms above, and I confirm that the information 
                      provided is accurate to the best of my knowledge.
                    </Label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <div className="flex gap-2">
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  )}
                  <Button variant="ghost" onClick={handleSaveDraft}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                </div>

                {currentStep < STEPS.length ? (
                  <Button
                    variant="gold"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!canProceed()}
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    variant="gold"
                    onClick={handleSubmit}
                    disabled={!canProceed() || loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}