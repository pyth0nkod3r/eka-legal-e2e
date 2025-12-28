import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navigation';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: January 1, 2024</p>
          </div>

          <Card className="border-border/50">
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none p-8">
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground">
                  Mitchell Legal Consultancy ("we," "our," or "us") is committed to protecting your privacy. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                  when you visit our website or use our legal services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
                <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                <p className="text-muted-foreground mb-4">
                  We may collect personal information that you voluntarily provide, including:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Name, email address, phone number, and mailing address</li>
                  <li>Information about your legal matter or inquiry</li>
                  <li>Documents you upload or share with us</li>
                  <li>Payment and billing information</li>
                  <li>Communication preferences</li>
                </ul>

                <h3 className="text-lg font-medium mb-2 mt-6">Automatically Collected Information</h3>
                <p className="text-muted-foreground">
                  When you access our website, we may automatically collect certain information including 
                  your IP address, browser type, operating system, access times, and pages viewed.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
                <p className="text-muted-foreground mb-4">We use the information we collect to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Provide, maintain, and improve our legal services</li>
                  <li>Process and respond to your inquiries and requests</li>
                  <li>Schedule appointments and manage consultations</li>
                  <li>Communicate with you about your case or our services</li>
                  <li>Comply with legal obligations and professional responsibilities</li>
                  <li>Protect against fraudulent or unauthorized activity</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">4. Attorney-Client Privilege</h2>
                <p className="text-muted-foreground">
                  Information shared with us in the context of an attorney-client relationship is protected 
                  by attorney-client privilege. We take our duty of confidentiality seriously and implement 
                  appropriate safeguards to protect privileged information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">5. Information Sharing</h2>
                <p className="text-muted-foreground mb-4">
                  We do not sell, trade, or rent your personal information. We may share information in 
                  limited circumstances:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>With your explicit consent</li>
                  <li>With service providers who assist in our operations</li>
                  <li>When required by law or court order</li>
                  <li>To protect our rights or the safety of others</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">6. Data Security</h2>
                <p className="text-muted-foreground">
                  We implement industry-standard security measures to protect your information, including 
                  encryption, secure servers, and access controls. However, no method of transmission over 
                  the Internet is 100% secure.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">7. Your Rights</h2>
                <p className="text-muted-foreground mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Access and review your personal information</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your information (subject to legal retention requirements)</li>
                  <li>Opt out of marketing communications</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">8. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have questions about this Privacy Policy or our practices, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium">Mitchell Legal Consultancy</p>
                  <p className="text-muted-foreground">123 Legal Avenue, Suite 500</p>
                  <p className="text-muted-foreground">New York, NY 10001</p>
                  <p className="text-muted-foreground">Email: privacy@mitchelllegal.com</p>
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
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}