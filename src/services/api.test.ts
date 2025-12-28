import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from './api';

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authService', () => {
    it('should login with valid credentials', async () => {
      const result = await api.auth.login({
        email: 'client@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.data.user).toBeDefined();
      expect(result.data.token).toBeDefined();
    });

    it('should fail login with invalid credentials', async () => {
      const result = await api.auth.login({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid email or password');
    });

    it('should register a new user', async () => {
      const result = await api.auth.register({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.data.user.email).toBe('newuser@example.com');
      expect(result.data.user.role).toBe('client');
    });

    it('should fail registration with existing email', async () => {
      const result = await api.auth.register({
        name: 'Test User',
        email: 'client@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Email already registered');
    });

    it('should get current user', async () => {
      const result = await api.auth.getCurrentUser();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.email).toBeDefined();
    });

    it('should logout successfully', async () => {
      const result = await api.auth.logout();

      expect(result.success).toBe(true);
    });

    it('should handle forgot password', async () => {
      const result = await api.auth.forgotPassword('test@example.com');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Password reset email sent');
    });
  });

  describe('publicService', () => {
    it('should get lawyer profile', async () => {
      const result = await api.public.getLawyerProfile();

      expect(result.success).toBe(true);
      expect(result.data.name).toBeDefined();
      expect(result.data.credentials).toBeDefined();
    });

    it('should get services', async () => {
      const result = await api.public.getServices();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should get testimonials', async () => {
      const result = await api.public.getTestimonials();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should get FAQs', async () => {
      const result = await api.public.getFAQs();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('category');
    });

    it('should submit contact form', async () => {
      const result = await api.public.submitContactForm({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('bookingService', () => {
    it('should get consultation types', async () => {
      const result = await api.booking.getConsultationTypes();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data[0]).toHaveProperty('name');
      expect(result.data[0]).toHaveProperty('duration');
      expect(result.data[0]).toHaveProperty('price');
    });

    it('should get available slots for a date', async () => {
      const result = await api.booking.getAvailableSlots('2024-01-15');

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should create a booking', async () => {
      const typesResult = await api.booking.getConsultationTypes();
      const consultationType = typesResult.data[0];

      const result = await api.booking.createBooking({
        consultationTypeId: consultationType.id,
        date: '2024-01-20',
        time: '10:00 AM',
        name: 'Test Client',
        email: 'test@example.com',
        reason: 'Legal consultation',
      });

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('pending');
      expect(result.data.clientName).toBe('Test Client');
    });

    it('should fail booking with invalid consultation type', async () => {
      const result = await api.booking.createBooking({
        consultationTypeId: 'invalid-id',
        date: '2024-01-20',
        time: '10:00 AM',
        name: 'Test Client',
        email: 'test@example.com',
        reason: 'Legal consultation',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid consultation type');
    });

    it('should get user bookings', async () => {
      const result = await api.booking.getMyBookings();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should cancel a booking', async () => {
      const result = await api.booking.cancelBooking('booking-1');

      expect(result.success).toBe(true);
    });
  });

  describe('caseService', () => {
    it('should get user cases', async () => {
      const result = await api.cases.getMyCases();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should get case by id', async () => {
      const casesResult = await api.cases.getMyCases();
      const firstCase = casesResult.data[0];

      const result = await api.cases.getCaseById(firstCase.id);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(firstCase.id);
    });

    it('should filter cases by status', async () => {
      const result = await api.cases.getCasesByStatus('active');

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      result.data.forEach((c) => {
        expect(c.status).toBe('active');
      });
    });
  });

  describe('documentService', () => {
    it('should upload a document', async () => {
      const file = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });

      const result = await api.documents.uploadDocument('case-1', file);

      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
      expect(result.data.url).toContain('test.pdf');
    });

    it('should delete a document', async () => {
      const result = await api.documents.deleteDocument('doc-1');

      expect(result.success).toBe(true);
    });

    it('should get documents by case', async () => {
      const casesResult = await api.cases.getMyCases();
      const firstCase = casesResult.data[0];

      const result = await api.documents.getDocumentsByCase(firstCase.id);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('messageService', () => {
    it('should get conversations', async () => {
      const result = await api.messages.getConversations();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should get messages for a conversation', async () => {
      const conversationsResult = await api.messages.getConversations();
      const firstConversation = conversationsResult.data[0];

      const result = await api.messages.getMessages(firstConversation.id);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should send a message', async () => {
      const result = await api.messages.sendMessage('conv-1', 'Hello, this is a test message');

      expect(result.success).toBe(true);
      expect(result.data.content).toBe('Hello, this is a test message');
      expect(result.data.senderRole).toBe('client');
    });

    it('should mark messages as read', async () => {
      const result = await api.messages.markAsRead(['msg-1', 'msg-2']);

      expect(result.success).toBe(true);
    });
  });

  describe('notificationService', () => {
    it('should get notifications', async () => {
      const result = await api.notifications.getNotifications();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should mark notification as read', async () => {
      const result = await api.notifications.markAsRead('notification-1');

      expect(result.success).toBe(true);
    });

    it('should mark all notifications as read', async () => {
      const result = await api.notifications.markAllAsRead();

      expect(result.success).toBe(true);
    });
  });

  describe('dashboardService', () => {
    it('should get client stats', async () => {
      const result = await api.dashboard.getClientStats();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('totalClients');
      expect(result.data).toHaveProperty('activeCase');
      expect(result.data).toHaveProperty('upcomingAppointments');
    });

    it('should get lawyer stats', async () => {
      const result = await api.dashboard.getLawyerStats();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('totalClients');
      expect(result.data).toHaveProperty('activeCase');
    });
  });

  describe('intakeService', () => {
    it('should submit intake form', async () => {
      const result = await api.intake.submitIntakeForm({
        personalInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '555-0123',
          preferredContact: 'email',
        },
        caseType: 'corporate',
        urgency: 'medium',
        description: 'This is a test description for the intake form that needs to be at least 50 characters long.',
        additionalInfo: {},
        consent: true,
      });

      expect(result.success).toBe(true);
      expect(result.data.caseId).toBeDefined();
    });

    it('should save draft', async () => {
      const result = await api.intake.saveDraft({
        personalInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '',
          preferredContact: 'email',
        },
      });

      expect(result.success).toBe(true);
    });

    it('should get draft', async () => {
      const result = await api.intake.getDraft();

      expect(result.success).toBe(true);
    });
  });
});
