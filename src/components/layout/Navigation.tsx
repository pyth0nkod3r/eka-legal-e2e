import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Scale, Phone, Mail, MapPin, Clock, Facebook, Linkedin, Twitter } from 'lucide-react';

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container-wide flex items-center justify-between h-16 px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <Scale className="h-8 w-8 text-accent" />
          <span className="font-serif text-xl font-semibold text-foreground">Eka Legal</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#services" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">Services</a>
          <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">About</a>
          <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">Testimonials</a>
          <Link to="/faq" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">FAQ</Link>
          <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">Contact</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link to="/book">
            <Button variant="gold" size="sm">Book Consultation</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container-wide px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Scale className="h-8 w-8 text-accent" />
              <span className="font-serif text-xl font-semibold">Eka Legal</span>
            </div>
            <p className="text-primary-foreground/70 text-sm">
              Providing exceptional legal services with a personal touch since 2009.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Practice Areas</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><a href="#" className="hover:text-accent transition-colors">Corporate Law</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Estate Planning</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Civil Litigation</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Contract Law</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Intellectual Property</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Personal Injury</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Immigration</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> 555 4 Ave SW, Calgary, AB T2P 3E7, Canada</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent" /> +1 (403) 560-9464</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent" /> info@eka-legal.com</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Hours</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-accent" /> Mon-Fri: 9AM - 6PM</li>
              <li>Saturday: By Appointment</li>
              <li>Sunday: Closed</li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-primary-foreground/70 hover:text-accent"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-primary-foreground/70 hover:text-accent"><Linkedin className="h-5 w-5" /></a>
              <a href="#" className="text-primary-foreground/70 hover:text-accent"><Twitter className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">© {new Date().getFullYear()} Eka Legal Consultancy. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-primary-foreground/60">
            <Link to="/privacy" className="hover:text-accent">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-accent">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
