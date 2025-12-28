import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MessageCircle, Phone, Mail } from 'lucide-react';
import { api } from '@/services/api';
import { Navbar } from '@/components/layout/Navigation';
import { cn } from '@/lib/utils';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    api.public.getFAQs().then(res => {
      if (res.success) setFaqs(res.data);
      setLoading(false);
    });
  }, []);

  const categories = ['all', ...new Set(faqs.map(f => f.category))];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="py-12 px-4 bg-primary/5">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground mb-8">
              Find answers to common questions about our legal services and consultation process.
            </p>

            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions..."
                className="pl-12 h-12"
              />
            </div>
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                  className="capitalize"
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* FAQ List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredFaqs.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="bg-card border rounded-lg px-6"
                  >
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-medium">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    No questions found matching your search.
                  </p>
                  <Button variant="outline" onClick={() => { setSearch(''); setActiveCategory('all'); }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-12 px-4 bg-primary/5">
          <div className="max-w-4xl mx-auto">
            <Card className="border-accent/20">
              <CardHeader className="text-center">
                <CardTitle className="font-serif text-2xl">Still Have Questions?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center mb-6">
                  Our team is here to help. Reach out through any of these channels.
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Link to="/book">
                    <div className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-accent transition-colors">
                      <MessageCircle className="h-8 w-8 text-accent mb-2" />
                      <span className="font-medium">Book Consultation</span>
                      <span className="text-sm text-muted-foreground">Schedule a call</span>
                    </div>
                  </Link>
                  <a href="tel:+14035609464">
                    <div className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-accent transition-colors">
                      <Phone className="h-8 w-8 text-accent mb-2" />
                      <span className="font-medium">Call Us</span>
                      <span className="text-sm text-muted-foreground">+1 (403) 560-9464</span>
                    </div>
                  </a>
                  <a href="mailto:contact@eka-legal.com">
                    <div className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-accent transition-colors">
                      <Mail className="h-8 w-8 text-accent mb-2" />
                      <span className="font-medium">Email</span>
                      <span className="text-sm text-muted-foreground">contact@eka-legal.com</span>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-card">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Eka Legal Consultancy. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
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