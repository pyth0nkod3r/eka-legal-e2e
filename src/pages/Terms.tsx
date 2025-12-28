import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navigation';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: January 1, 2024</p>
          </div>

          <Card className="border-border/50">
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none p-8">
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">1. Agreement to Terms</h2>
                <p className="text-muted-foreground">
                  By accessing or using the Mitchell Legal Consultancy website and services, you agree to be 
                  bound by these Terms of Service. If you do not agree to these terms, please do not use our 
                  services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">2. Legal Services Disclaimer</h2>
                <p className="text-muted-foreground mb-4">
                  <strong>Important:</strong> The information provided on this website is for general 
                  informational purposes only and does not constitute legal advice. No attorney-client 
                  relationship is formed by:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Viewing this website or its content</li>
                  <li>Submitting an inquiry or contact form</li>
                  <li>Scheduling a consultation</li>
                  <li>Communicating with our office before a formal engagement</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  An attorney-client relationship is only established through a signed engagement letter 
                  or retainer agreement.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">3. Use of Services</h2>
                <p className="text-muted-foreground mb-4">You agree to use our services only for lawful purposes and in accordance with these Terms. You agree not to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Provide false or misleading information</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use our services for any fraudulent or illegal purpose</li>
                  <li>Interfere with the proper functioning of our website</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">4. Appointment and Consultation Terms</h2>
                <p className="text-muted-foreground mb-4">When booking consultations through our platform:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Free initial consultations are limited to 30 minutes</li>
                  <li>Cancellations must be made at least 24 hours in advance</li>
                  <li>Fees for paid consultations are non-refundable for no-shows</li>
                  <li>We reserve the right to decline representation for any reason</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">5. Intellectual Property</h2>
                <p className="text-muted-foreground">
                  All content on this website, including text, graphics, logos, and software, is the property 
                  of Mitchell Legal Consultancy and is protected by intellectual property laws. You may not 
                  reproduce, distribute, or create derivative works without our written permission.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">6. Confidentiality</h2>
                <p className="text-muted-foreground">
                  We are committed to maintaining the confidentiality of all information shared with us. 
                  However, please be aware that email and online communications may not be fully secure. 
                  Do not send sensitive information via unsecured channels until an attorney-client 
                  relationship has been established.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">7. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  To the fullest extent permitted by law, Mitchell Legal Consultancy shall not be liable 
                  for any indirect, incidental, special, consequential, or punitive damages arising from 
                  your use of our website or services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">8. Governing Law</h2>
                <p className="text-muted-foreground">
                  These Terms shall be governed by and construed in accordance with the laws of the State 
                  of New York, without regard to its conflict of law provisions.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">9. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify these Terms at any time. Changes will be effective 
                  immediately upon posting to this website. Your continued use of our services constitutes 
                  acceptance of any modified terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">10. Contact Information</h2>
                <p className="text-muted-foreground">
                  For questions about these Terms, please contact us:
                </p>
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium">Mitchell Legal Consultancy</p>
                  <p className="text-muted-foreground">123 Legal Avenue, Suite 500</p>
                  <p className="text-muted-foreground">New York, NY 10001</p>
                  <p className="text-muted-foreground">Email: legal@mitchelllegal.com</p>
                  <p className="text-muted-foreground">Phone: +1 (555) 987-6543</p>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="py-8 px-4 border-t bg-card">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Mitchell Legal Consultancy. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}