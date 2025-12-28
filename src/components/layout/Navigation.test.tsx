import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/dom';
import { render } from '@/test/test-utils';
import { Navbar, Footer } from './Navigation';

describe('Navbar Component', () => {
  it('renders the logo and brand name', () => {
    render(<Navbar />);

    expect(screen.getByText('Eka Legal')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Navbar />);

    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Testimonials')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    render(<Navbar />);

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders book consultation button', () => {
    render(<Navbar />);

    expect(screen.getByRole('button', { name: /book consultation/i })).toBeInTheDocument();
  });

  it('has correct link to login page', () => {
    render(<Navbar />);

    const signInLink = screen.getByRole('link', { name: /sign in/i });
    expect(signInLink).toHaveAttribute('href', '/login');
  });

  it('has correct link to booking page', () => {
    render(<Navbar />);

    const bookLink = screen.getByRole('link', { name: /book consultation/i });
    expect(bookLink).toHaveAttribute('href', '/book');
  });
});

describe('Footer Component', () => {
  it('renders the logo and brand name', () => {
    render(<Footer />);

    expect(screen.getByText('Eka Legal')).toBeInTheDocument();
  });

  it('renders practice areas section', () => {
    render(<Footer />);

    expect(screen.getByText('Practice Areas')).toBeInTheDocument();
    expect(screen.getByText('Corporate Law')).toBeInTheDocument();
    expect(screen.getByText('Estate Planning')).toBeInTheDocument();
    expect(screen.getByText('Civil Litigation')).toBeInTheDocument();
    expect(screen.getByText('Contract Law')).toBeInTheDocument();
  });

  it('renders contact information', () => {
    render(<Footer />);

    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('555 4 Ave SW, Calgary, AB T2P 3E7, Canada')).toBeInTheDocument();
    expect(screen.getByText('+1 (403) 560-9464')).toBeInTheDocument();
    expect(screen.getByText('info@eka-legal.com')).toBeInTheDocument();
  });

  it('renders hours section', () => {
    render(<Footer />);

    expect(screen.getByText('Hours')).toBeInTheDocument();
    expect(screen.getByText('Mon-Fri: 9AM - 6PM')).toBeInTheDocument();
    expect(screen.getByText('Saturday: By Appointment')).toBeInTheDocument();
    expect(screen.getByText('Sunday: Closed')).toBeInTheDocument();
  });

  it('renders copyright text', () => {
    render(<Footer />);

    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} Eka Legal Consultancy`, 'i'))).toBeInTheDocument();
  });

  it('renders privacy policy link', () => {
    render(<Footer />);

    const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });

  it('renders terms of service link', () => {
    render(<Footer />);

    const termsLink = screen.getByRole('link', { name: /terms of service/i });
    expect(termsLink).toHaveAttribute('href', '/terms');
  });
});
