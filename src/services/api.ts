// ============================================
// MOCK API SERVICE - Centralized API calls
// ============================================

import {
  User,
  LawyerProfile,
  Service,
  Testimonial,
  TimeSlot,
  ConsultationType,
  Booking,
  Case,
  Message,
  Conversation,
  Notification,
  DashboardStats,
  ApiResponse,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  IntakeFormData,
} from '@/types';

import {
  mockUsers,
  mockCurrentUser,
  mockLawyerProfile,
  mockServices,
  mockTestimonials,
  mockTimeSlots,
  mockConsultationTypes,
  mockBookings,
  mockCases,
  mockMessages,
  mockConversations,
  mockNotifications,
  mockClientDashboardStats,
  mockLawyerDashboardStats,
  mockFAQs,
} from './mockData';

// Simulate network delay
const delay = (ms: number = 500): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ============================================
// AUTH SERVICE
// ============================================
export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    await delay(800);
    
    const user = mockUsers.find((u) => u.email === credentials.email);
    if (user && credentials.password === 'password123') {
      return {
        success: true,
        data: {
          user,
          token: 'mock-jwt-token-' + Date.now(),
        },
      };
    }
    
    return {
      success: false,
      data: { user: {} as User, token: '' },
      message: 'Invalid email or password',
    };
  },

  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    await delay(800);
    
    const existingUser = mockUsers.find((u) => u.email === data.email);
    if (existingUser) {
      return {
        success: false,
        data: { user: {} as User, token: '' },
        message: 'Email already registered',
      };
    }

    const newUser: User = {
      id: 'user-' + Date.now(),
      email: data.email,
      name: data.name,
      role: 'client',
      phone: data.phone,
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: {
        user: newUser,
        token: 'mock-jwt-token-' + Date.now(),
      },
    };
  },

  async logout(): Promise<ApiResponse<null>> {
    await delay(300);
    return { success: true, data: null };
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    await delay(300);
    return { success: true, data: mockCurrentUser };
  },

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    await delay(800);
    return {
      success: true,
      data: null,
      message: 'Password reset email sent',
    };
  },

  async resetPassword(token: string, password: string): Promise<ApiResponse<null>> {
    await delay(800);
    return {
      success: true,
      data: null,
      message: 'Password reset successful',
    };
  },
};

// ============================================
// PUBLIC CONTENT SERVICE
// ============================================
export const publicService = {
  async getLawyerProfile(): Promise<ApiResponse<LawyerProfile>> {
    await delay(300);
    return { success: true, data: mockLawyerProfile };
  },

  async getServices(): Promise<ApiResponse<Service[]>> {
    await delay(300);
    return { success: true, data: mockServices };
  },

  async getTestimonials(): Promise<ApiResponse<Testimonial[]>> {
    await delay(300);
    return { success: true, data: mockTestimonials };
  },

  async getFAQs(): Promise<ApiResponse<typeof mockFAQs>> {
    await delay(300);
    return { success: true, data: mockFAQs };
  },

  async submitContactForm(data: {
    name: string;
    email: string;
    phone?: string;
    message: string;
  }): Promise<ApiResponse<null>> {
    await delay(800);
    console.log('Contact form submitted:', data);
    return {
      success: true,
      data: null,
      message: 'Thank you for your message. We will get back to you soon.',
    };
  },
};

// ============================================
// BOOKING SERVICE
// ============================================
export const bookingService = {
  async getConsultationTypes(): Promise<ApiResponse<ConsultationType[]>> {
    await delay(300);
    return { success: true, data: mockConsultationTypes };
  },

  async getAvailableSlots(date: string): Promise<ApiResponse<TimeSlot[]>> {
    await delay(400);
    const slots = mockTimeSlots.filter((slot) => slot.date === date);
    return { success: true, data: slots };
  },

  async createBooking(data: {
    consultationTypeId: string;
    date: string;
    time: string;
    name: string;
    email: string;
    reason: string;
  }): Promise<ApiResponse<Booking>> {
    await delay(800);

    const consultationType = mockConsultationTypes.find(
      (c) => c.id === data.consultationTypeId
    );

    if (!consultationType) {
      return {
        success: false,
        data: {} as Booking,
        message: 'Invalid consultation type',
      };
    }

    const newBooking: Booking = {
      id: 'booking-' + Date.now(),
      clientId: mockCurrentUser.id,
      clientName: data.name,
      clientEmail: data.email,
      consultationType,
      date: data.date,
      time: data.time,
      status: 'pending',
      reason: data.reason,
      createdAt: new Date().toISOString(),
    };

    return { success: true, data: newBooking };
  },

  async getMyBookings(): Promise<ApiResponse<Booking[]>> {
    await delay(400);
    return { success: true, data: mockBookings };
  },

  async cancelBooking(bookingId: string): Promise<ApiResponse<null>> {
    await delay(500);
    return { success: true, data: null, message: 'Booking cancelled' };
  },
};

// ============================================
// CASE SERVICE
// ============================================
export const caseService = {
  async getMyCases(): Promise<ApiResponse<Case[]>> {
    await delay(400);
    return { success: true, data: mockCases };
  },

  async getCaseById(caseId: string): Promise<ApiResponse<Case | undefined>> {
    await delay(300);
    const caseData = mockCases.find((c) => c.id === caseId);
    return { success: true, data: caseData };
  },

  async getCasesByStatus(
    status: 'pending' | 'active' | 'closed'
  ): Promise<ApiResponse<Case[]>> {
    await delay(400);
    const cases = mockCases.filter((c) => c.status === status);
    return { success: true, data: cases };
  },
};

// ============================================
// DOCUMENT SERVICE
// ============================================
export const documentService = {
  async uploadDocument(
    caseId: string,
    file: File
  ): Promise<ApiResponse<{ id: string; url: string }>> {
    await delay(1500); // Simulate upload time

    return {
      success: true,
      data: {
        id: 'doc-' + Date.now(),
        url: `/documents/${file.name}`,
      },
    };
  },

  async deleteDocument(documentId: string): Promise<ApiResponse<null>> {
    await delay(500);
    return { success: true, data: null };
  },

  async getDocumentsByCase(caseId: string): Promise<ApiResponse<Case['documents']>> {
    await delay(400);
    const caseData = mockCases.find((c) => c.id === caseId);
    return { success: true, data: caseData?.documents || [] };
  },
};

// ============================================
// MESSAGE SERVICE
// ============================================
export const messageService = {
  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    await delay(400);
    return { success: true, data: mockConversations };
  },

  async getMessages(conversationId: string): Promise<ApiResponse<Message[]>> {
    await delay(300);
    const messages = mockMessages[conversationId] || [];
    return { success: true, data: messages };
  },

  async sendMessage(
    conversationId: string,
    content: string,
    attachments?: File[]
  ): Promise<ApiResponse<Message>> {
    await delay(500);

    const newMessage: Message = {
      id: 'msg-' + Date.now(),
      senderId: mockCurrentUser.id,
      senderName: mockCurrentUser.name,
      senderRole: 'client',
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };

    return { success: true, data: newMessage };
  },

  async markAsRead(messageIds: string[]): Promise<ApiResponse<null>> {
    await delay(200);
    return { success: true, data: null };
  },
};

// ============================================
// NOTIFICATION SERVICE
// ============================================
export const notificationService = {
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    await delay(300);
    return { success: true, data: mockNotifications };
  },

  async markAsRead(notificationId: string): Promise<ApiResponse<null>> {
    await delay(200);
    return { success: true, data: null };
  },

  async markAllAsRead(): Promise<ApiResponse<null>> {
    await delay(300);
    return { success: true, data: null };
  },
};

// ============================================
// DASHBOARD SERVICE
// ============================================
export const dashboardService = {
  async getClientStats(): Promise<ApiResponse<DashboardStats>> {
    await delay(400);
    return { success: true, data: mockClientDashboardStats };
  },

  async getLawyerStats(): Promise<ApiResponse<DashboardStats>> {
    await delay(400);
    return { success: true, data: mockLawyerDashboardStats };
  },
};

// ============================================
// INTAKE FORM SERVICE
// ============================================
export const intakeService = {
  async submitIntakeForm(data: IntakeFormData): Promise<ApiResponse<{ caseId: string }>> {
    await delay(1000);
    console.log('Intake form submitted:', data);
    return {
      success: true,
      data: { caseId: 'case-' + Date.now() },
      message: 'Your consultation request has been submitted successfully.',
    };
  },

  async saveDraft(data: Partial<IntakeFormData>): Promise<ApiResponse<null>> {
    await delay(300);
    console.log('Draft saved:', data);
    return { success: true, data: null };
  },

  async getDraft(): Promise<ApiResponse<Partial<IntakeFormData> | null>> {
    await delay(300);
    return { success: true, data: null };
  },
};

// ============================================
// EMAIL SERVICE (Mocked)
// ============================================
export const emailService = {
  async sendWelcomeEmail(email: string, name: string): Promise<ApiResponse<null>> {
    await delay(500);
    console.log(`[EMAIL] Welcome email sent to ${email} for ${name}`);
    return { success: true, data: null, message: 'Welcome email sent' };
  },

  async sendLoginNotification(email: string, name: string): Promise<ApiResponse<null>> {
    await delay(200);
    console.log(`[EMAIL] Login notification sent to ${email} for ${name}`);
    return { success: true, data: null, message: 'Login notification sent' };
  },

  async sendBookingConfirmation(data: {
    email: string;
    name: string;
    date: string;
    time: string;
    consultationType: string;
  }): Promise<ApiResponse<null>> {
    await delay(500);
    console.log(`[EMAIL] Booking confirmation sent to ${data.email}:`, data);
    return { success: true, data: null, message: 'Booking confirmation sent' };
  },

  async sendAppointmentReminder(data: {
    email: string;
    name: string;
    date: string;
    time: string;
  }): Promise<ApiResponse<null>> {
    await delay(300);
    console.log(`[EMAIL] Appointment reminder sent to ${data.email}:`, data);
    return { success: true, data: null, message: 'Reminder sent' };
  },

  async sendCaseUpdate(data: {
    email: string;
    name: string;
    caseTitle: string;
    update: string;
  }): Promise<ApiResponse<null>> {
    await delay(400);
    console.log(`[EMAIL] Case update sent to ${data.email}:`, data);
    return { success: true, data: null, message: 'Case update sent' };
  },

  async sendPasswordResetEmail(email: string): Promise<ApiResponse<null>> {
    await delay(500);
    console.log(`[EMAIL] Password reset email sent to ${email}`);
    return { success: true, data: null, message: 'Password reset email sent' };
  },

  async sendNewMessageNotification(data: {
    email: string;
    name: string;
    senderName: string;
    preview: string;
  }): Promise<ApiResponse<null>> {
    await delay(300);
    console.log(`[EMAIL] New message notification sent to ${data.email}:`, data);
    return { success: true, data: null, message: 'Message notification sent' };
  },

  async sendDocumentUploadNotification(data: {
    email: string;
    name: string;
    documentName: string;
    caseTitle: string;
  }): Promise<ApiResponse<null>> {
    await delay(300);
    console.log(`[EMAIL] Document upload notification sent to ${data.email}:`, data);
    return { success: true, data: null, message: 'Document notification sent' };
  },
};

// Export all services
export const api = {
  auth: authService,
  public: publicService,
  booking: bookingService,
  cases: caseService,
  documents: documentService,
  messages: messageService,
  notifications: notificationService,
  dashboard: dashboardService,
  intake: intakeService,
  email: emailService,
};

export default api;
