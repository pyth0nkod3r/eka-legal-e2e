import { Navbar, Footer } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Scale, Building2, ScrollText, FileText, Briefcase, Home, ChevronRight, Star, Phone, Mail, MessageCircle } from 'lucide-react';
import { mockServices, mockTestimonials, mockLawyerProfile } from '@/services/mockData';

const iconMap: Record<string, React.ElementType> = {
  Building2, ScrollText, Scale, FileText, Briefcase, Home,
};

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-gradient min-h-screen flex items-center pt-16">
        <div className="container-wide px-4 md:px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Scale className="h-4 w-4" /> Trusted Legal Excellence
              </div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
                Your Trusted Partner in <span className="text-gradient">Legal Solutions</span>
              </h1>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg">
                With over 15 years of experience, we provide personalized legal counsel that protects your interests and secures your future.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/book">
                  <Button variant="hero" size="xl">
                    Book Free Consultation <ChevronRight className="h-5 w-5" />
                  </Button>
                </Link>
                <a href="#services">
                  <Button variant="hero-outline" size="xl">Our Services</Button>
                </a>
              </div>
              <div className="flex items-center gap-8 mt-12 pt-8 border-t border-primary-foreground/20">
                <div><div className="text-3xl font-bold text-accent">15+</div><div className="text-sm text-primary-foreground/70">Years Experience</div></div>
                <div><div className="text-3xl font-bold text-accent">500+</div><div className="text-sm text-primary-foreground/70">Cases Won</div></div>
                <div><div className="text-3xl font-bold text-accent">98%</div><div className="text-sm text-primary-foreground/70">Client Satisfaction</div></div>
              </div>
            </div>
            <div className="hidden lg:block animate-fade-in delay-300">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 rounded-2xl transform rotate-3"></div>
                <img src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=700&fit=crop" alt="Professional legal office" className="relative rounded-2xl shadow-xl object-cover w-full h-[500px]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="section-padding bg-background">
        <div className="container-wide px-4 md:px-6">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Our Practice Areas</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Comprehensive legal services tailored to protect your interests and achieve your goals.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockServices.map((service, index) => {
              const Icon = iconMap[service.icon] || Scale;
              return (
                <Card key={service.id} className="card-elevated group cursor-pointer animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                      <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{service.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <ChevronRight className="h-3 w-3 text-accent" /> {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section-padding bg-secondary">
        <div className="container-wide px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=600&fit=crop" alt={mockLawyerProfile.name} className="rounded-2xl shadow-lg object-cover w-full h-[500px]" />
            </div>
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">{mockLawyerProfile.name}</h2>
              <p className="text-accent font-medium mb-6">{mockLawyerProfile.title}</p>
              <p className="text-muted-foreground mb-6">{mockLawyerProfile.bio}</p>
              <ul className="space-y-3 mb-8">
                {mockLawyerProfile.credentials.map((cred, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground">
                    <div className="w-2 h-2 rounded-full bg-accent"></div> {cred}
                  </li>
                ))}
              </ul>
              <Link to="/book"><Button variant="gold" size="lg">Schedule a Meeting</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="section-padding bg-background">
        <div className="container-wide px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">What Our Clients Say</h2>
            <p className="text-muted-foreground">Trusted by individuals and businesses alike.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {mockTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">{[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="h-5 w-5 fill-accent text-accent" />)}</div>
                  <p className="text-foreground italic mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <img src={testimonial.avatarUrl} alt={testimonial.clientName} className="w-12 h-12 rounded-full" />
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.clientName}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.clientTitle}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="hero-gradient py-20">
        <div className="container-narrow px-4 md:px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Ready to Get Started?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">Schedule a free consultation today and take the first step toward resolving your legal matters.</p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link to="/book"><Button variant="hero" size="xl">Book Free Consultation</Button></Link>
            <a href="tel:+15559876543"><Button variant="hero-outline" size="xl"><Phone className="h-5 w-5" /> Call Now</Button></a>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-primary-foreground/80">
            <a href="mailto:info@mitchelllegal.com" className="flex items-center gap-2 hover:text-accent"><Mail className="h-5 w-5" /> info@mitchelllegal.com</a>
            <a href="https://wa.me/15559876543" className="flex items-center gap-2 hover:text-accent"><MessageCircle className="h-5 w-5" /> WhatsApp</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
