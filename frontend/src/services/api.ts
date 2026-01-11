// ============================================
// API SERVICE - Real API calls to backend
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
import { FAQ } from '@/types';
import { get, post, del, patch, put } from './httpClient';

// ============================================
// AUTH SERVICE
// ============================================
export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await post<ApiResponse<AuthResponse>>('/auth/login', credentials, { auth: false });
      if (response.success && response.data?.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        data: { user: {} as User, token: '' },
        message: 'Login failed. Please try again.',
      };
    }
  },

  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await post<ApiResponse<AuthResponse>>('/auth/register', data, { auth: false });
      if (response.success && response.data?.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response;
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        data: { user: {} as User, token: '' },
        message: 'Registration failed. Please try again.',
      };
    }
  },

  async createAdmin(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await post<ApiResponse<AuthResponse>>('/auth/create-admin', data, { auth: false });
      if (response.success && response.data?.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response;
    } catch (error) {
      console.error('Admin register error:', error);
      return {
        success: false,
        data: { user: {} as User, token: '' },
        message: 'Admin registration failed. Please try again.',
      };
    }
  },

  async logout(): Promise<ApiResponse<null>> {
    try {
      const response = await post<ApiResponse<null>>('/auth/logout', {});
      localStorage.removeItem('token');
      return response;
    } catch (error) {
      // Even if server logout fails, clear local token
      localStorage.removeItem('token');
      return { success: true, data: null };
    }
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await get<ApiResponse<User>>('/auth/me');
      return response;
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        data: {} as User,
        message: 'Failed to get user profile',
      };
    }
  },

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    try {
      return await post<ApiResponse<null>>('/auth/forgot-password', { email }, { auth: false });
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        data: null,
        message: 'Failed to send reset email',
      };
    }
  },

  async resetPassword(token: string, password: string): Promise<ApiResponse<null>> {
    try {
      return await post<ApiResponse<null>>('/auth/reset-password', { token, password }, { auth: false });
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        data: null,
        message: 'Failed to reset password',
      };
    }
  },

  async updateProfile(data: { name?: string; phone?: string; avatarUrl?: string }): Promise<ApiResponse<User>> {
    try {
      return await patch<ApiResponse<User>>('/auth/me', data);
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        data: {} as User,
        message: 'Failed to update profile',
      };
    }
  },

  async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      return await post<ApiResponse<{ avatarUrl: string }>>('/auth/me/avatar', formData, { isFormData: true });
    } catch (error) {
       console.error('Upload avatar error:', error);
       return {
         success: false,
         data: { avatarUrl: '' },
         message: 'Failed to upload avatar',
       };
    }
  },
};

// ============================================
// PUBLIC CONTENT SERVICE
// ============================================
export const publicService = {
  async getLawyerProfile(): Promise<ApiResponse<LawyerProfile>> {
    try {
      return await get<ApiResponse<LawyerProfile>>('/public/lawyer-profile', { auth: false });
    } catch (error) {
      console.error('Get lawyer profile error:', error);
      return {
        success: false,
        data: {} as LawyerProfile,
        message: 'Failed to load lawyer profile',
      };
    }
  },

  async updateLawyerProfile(data: Partial<LawyerProfile>): Promise<ApiResponse<LawyerProfile>> {
     try {
       return await put<ApiResponse<LawyerProfile>>('/public/lawyer-profile', data);
     } catch (error) {
       console.error('Update lawyer profile error:', error);
       return {
         success: false,
         data: {} as LawyerProfile,
         message: 'Failed to update lawyer profile',
       };
     }
   },

  async getServices(): Promise<ApiResponse<Service[]>> {
    try {
      return await get<ApiResponse<Service[]>>('/public/services', { auth: false });
    } catch (error) {
      console.error('Get services error:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to load services',
      };
    }
  },

  async getTestimonials(): Promise<ApiResponse<Testimonial[]>> {
    try {
      return await get<ApiResponse<Testimonial[]>>('/public/testimonials', { auth: false });
    } catch (error) {
      console.error('Get testimonials error:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to load testimonials',
      };
    }
  },

  async getFAQs(): Promise<ApiResponse<FAQ[]>> {
    try {
      return await get<ApiResponse<FAQ[]>>('/public/faqs', { auth: false });
    } catch (error) {
      console.error('Get FAQs error:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to load FAQs',
      };
    }
  },

  async submitContactForm(data: {
    name: string;
    email: string;
    phone?: string;
    message: string;
  }): Promise<ApiResponse<null>> {
    try {
      return await post<ApiResponse<null>>('/public/contact', data, { auth: false });
    } catch (error) {
      console.error('Submit contact form error:', error);
      return {
        success: false,
        data: null,
        message: 'Failed to submit contact form',
      };
    }
  },
};

// ============================================
// BOOKING SERVICE
// ============================================
export const bookingService = {
  async getConsultationTypes(): Promise<ApiResponse<ConsultationType[]>> {
    try {
      return await get<ApiResponse<ConsultationType[]>>('/booking/consultation-types', { auth: false });
    } catch (error) {
      console.error('Get consultation types error:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to load consultation types',
      };
    }
  },

  async getAvailableSlots(date: string): Promise<ApiResponse<TimeSlot[]>> {
    try {
      return await get<ApiResponse<TimeSlot[]>>('/booking/available-slots', {
        auth: false,
        params: { date }
      });
    } catch (error) {
      console.error('Get available slots error:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to load available slots',
      };
    }
  },

  async createBooking(data: {
    consultationTypeId: string;
    date: string;
    time: string;
    name: string;
    email: string;
    reason: string;
  }): Promise<ApiResponse<Booking>> {
    try {
      return await post<ApiResponse<Booking>>('/booking/bookings', data, { auth: false });
    } catch (error) {
      console.error('Create booking error:', error);
      return {
        success: false,
        data: {} as Booking,
        message: 'Failed to create booking',
      };
    }
  },

  async getMyBookings(): Promise<ApiResponse<Booking[]>> {
    try {
      return await get<ApiResponse<Booking[]>>('/booking/bookings');
    } catch (error) {
      console.error('Get my bookings error:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to load bookings',
      };
    }
  },

  async cancelBooking(bookingId: string): Promise<ApiResponse<null>> {
    try {
      return await del<ApiResponse<null>>(`/booking/bookings/${bookingId}`);
    } catch (error) {
      console.error('Cancel booking error:', error);
      return {
        success: false,
        data: null,
        message: 'Failed to cancel booking',
      };
    }
  },

  async updateBookingStatus(
    bookingId: string,
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  ): Promise<ApiResponse<Booking>> {
    try {
      return await patch<ApiResponse<Booking>>(`/booking/bookings/${bookingId}`, { status });
    } catch (error) {
      console.error('Update booking status error:', error);
      return {
        success: false,
        data: null,
        message: 'Failed to cancel booking',
      };
    }
  },

  async getWeeklyAppointments(): Promise<ApiResponse<Booking[]>> {
    try {
      return await get<ApiResponse<Booking[]>>('/booking/appointments-week');
    } catch (error) {
      console.error('Get weekly appointments error:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to load weekly appointments',
      };
    }
  },
};

// ============================================
// CASE SERVICE
// ============================================
export const caseService = {
  async getMyCases(): Promise<ApiResponse<Case[]>> {
    try {
      return await get<ApiResponse<Case[]>>('/cases');
    } catch (error) {
      console.error('Get my cases error:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to load cases',
      };
    }
  },

  async getCaseById(caseId: string): Promise<ApiResponse<Case | undefined>> {
    try {
      return await get<ApiResponse<Case>>(`/cases/${caseId}`);
    } catch (error) {
      console.error('Get case by ID error:', error);
      return {
        success: false,
        data: undefined,
        message: 'Failed to load case',
      };
    }
  },

  async getCasesByStatus(
    status: 'pending' | 'active' | 'closed'
  ): Promise<ApiResponse<Case[]>> {
    try {
      return await get<ApiResponse<Case[]>>('/cases', { params: { status } });
    } catch (error) {
      console.error('Get cases by status error:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to load cases',
      };
    }
  },

  async updateCaseStatus(
    caseId: string,
    status: 'pending' | 'active' | 'closed'
  ): Promise<ApiResponse<Case>> {
    try {
      return await patch<ApiResponse<Case>>(`/cases/${caseId}`, { status });
    } catch (error) {
      console.error('Update case status error:', error);
      return {
        success: false,
        data: {} as Case,
        message: 'Failed to update case status',
      };
    }
  },

  async createCase(data: {
    clientId: string;
    title: string;
    description: string;
    caseType: string;
  }): Promise<ApiResponse<Case>> {
    try {
      return await post<ApiResponse<Case>>('/cases', data);
    } catch (error) {
      console.error('Create case error:', error);
      return {
        success: false,
        data: {} as Case,
        message: 'Failed to create case',
      };
    }
  },

  async getCasesByClient(clientId: string): Promise<ApiResponse<Case[]>> {
    try {
      return await get<ApiResponse<Case[]>>('/cases', { params: { client_id: clientId } });
    } catch (error) {
      console.error('Get cases by client error:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to load cases',
      };
    }
  },
};

// ============================================
// CLIENT SERVICE (Admin)
// ============================================
export const clientsService = {
  async getAll(): Promise<ApiResponse<User[]>> {
    try {
      return await get<ApiResponse<User[]>>('/clients');
    } catch (error) {
      console.error('Get clients error:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to load clients',
      };
    }
  },

  async createClient(data: {
    name: string;
    email: string;
    phone?: string;
  }): Promise<ApiResponse<User>> {
    try {
      return await post<ApiResponse<User>>('/clients', data);
    } catch (error) {
      console.error('Create client error:', error);
      return {
        success: false,
        data: {} as User,
        message: 'Failed to create client',
      };
    }
  },

  async getById(clientId: string): Promise<ApiResponse<User>> {
    try {
      return await get<ApiResponse<User>>(`/clients/${clientId}`);
    } catch (error) {
      console.error('Get client error:', error);
      return {
        success: false,
        data: {} as User,
        message: 'Failed to load client',
      };
    }
  },

  async updateClientStatus(
    clientId: string,
    status: 'active' | 'closed'
  ): Promise<ApiResponse<User>> {
    try {
      return await patch<ApiResponse<User>>(`/clients/${clientId}`, { status });
    } catch (error) {
      console.error('Update client status error:', error);
      return {
        success: false,
        data: {} as User,
        message: 'Failed to update client status',
      };
    }
  },

  async search(query: string): Promise<ApiResponse<User[]>> {
    try {
      return await get<ApiResponse<User[]>>('/clients/search', { params: { q: query } });
    } catch (error) {
      console.error('Search clients error:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to search clients',
      };
    }
  },
};

// ============================================
// DOCUMENT SERVICE
// ============================================
export const documentService = {
  async uploadDocument(
    caseId: string,
    file: File,
    tag?: string
  ): Promise<ApiResponse<{ id: string; url: string; tag?: string }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (tag) {
        formData.append('tag', tag);
      }
      return await post<ApiResponse<{ id: string; url: string; tag?: string }>>(
        `/cases/${caseId}/documents`,
        formData,
        { isFormData: true }
      );
    } catch (error) {
      console.error('Upload document error:', error);
      return {
        success: false,
        data: { id: '', url: '' },
        message: 'Failed to upload document',
      };
    }
  },

  async deleteDocument(documentId: string): Promise<ApiResponse<null>> {
    try {
      return await del<ApiResponse<null>>(`/documents/${documentId}`);
    } catch (error) {
      console.error('Delete document error:', error);
      return {
        success: false,
        data: null,
        message: 'Failed to delete document',
      };
    }
  },

  async getDocumentsByCase(caseId: string): Promise<ApiResponse<Case['documents']>> {
    try {
      return await get<ApiResponse<Case['documents']>>(`/cases/${caseId}/documents`);
    } catch (error) {
      console.error('Get documents by case error:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to load documents',
      };
    }
  },

  /**
   * Get the URL for document content (for download/preview).
   * This URL requires authentication via the Authorization header.
   */
  getDocumentContentUrl(documentId: string): string {
    const { API_URL } = require('./config');
    return `${API_URL}/documents/${documentId}/content`;
  },

  /**
   * Download a document by fetching its content and triggering a browser download.
   */
  async downloadDocument(documentId: string, filename: string): Promise<void> {
    try {
      const { API_URL } = require('./config');
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/documents/${documentId}/content`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download document error:', error);
      throw error;
    }
  },

  /**
   * Get document content as a blob for preview.
   */
  async getDocumentContent(documentId: string): Promise<Blob | null> {
    try {
      const { API_URL } = require('./config');
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/documents/${documentId}/content`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get document content');
      }

      return await response.blob();
    } catch (error) {
      console.error('Get document content error:', error);
      return null;
    }
  },
};

// ============================================
// MESSAGE SERVICE
// ============================================
export const messageService = {
  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    try {
      return await get<ApiResponse<Conversation[]>>('/messages/conversations');
    } catch (error) {
      console.error('Get conversations error:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to load conversations',
      };
    }
  },

  async createConversation(clientId: string, caseId?: string): Promise<ApiResponse<Conversation>> {
    try {
      return await post<ApiResponse<Conversation>>('/messages/conversations', { clientId, caseId });
    } catch (error) {
      console.error('Create conversation error:', error);
      return {
        success: false,
        data: {} as Conversation,
        message: 'Failed to create conversation',
      };
    }
  },

  async getMessages(conversationId: string): Promise<ApiResponse<Message[]>> {
    try {
      return await get<ApiResponse<Message[]>>(`/messages/conversations/${conversationId}/messages`);
    } catch (error) {
      console.error('Get messages error:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to load messages',
      };
    }
  },

  async sendMessage(
    conversationId: string,
    content: string,
    _attachments?: File[]
  ): Promise<ApiResponse<Message>> {
    try {
      return await post<ApiResponse<Message>>(
        `/messages/conversations/${conversationId}/messages`,
        { content }
      );
    } catch (error) {
      console.error('Send message error:', error);
      return {
        success: false,
        data: {} as Message,
        message: 'Failed to send message',
      };
    }
  },

  async markAsRead(messageIds: string[]): Promise<ApiResponse<null>> {
    try {
      return await post<ApiResponse<null>>('/messages/read', { messageIds });
    } catch (error) {
      console.error('Mark as read error:', error);
      return {
        success: false,
        data: null,
        message: 'Failed to mark messages as read',
      };
    }
  },

  async getUnreadCount(): Promise<ApiResponse<{ unreadCount: number }>> {
    try {
      return await get<ApiResponse<{ unreadCount: number }>>('/messages/unread-count');
    } catch (error) {
      console.error('Get messages unread count error:', error);
      return {
        success: false,
        data: { unreadCount: 0 },
        message: 'Failed to get unread count',
      };
    }
  },

  async markConversationRead(conversationId: string): Promise<ApiResponse<{ unreadCount: number }>> {
    try {
      return await post<ApiResponse<{ unreadCount: number }>>(`/messages/conversations/${conversationId}/read`, {});
    } catch (error) {
      console.error('Mark conversation as read error:', error);
      return {
        success: false,
        data: { unreadCount: 0 },
        message: 'Failed to mark conversation as read',
      };
    }
  },

  async markAllConversationsRead(): Promise<ApiResponse<{ unreadCount: number }>> {
    try {
      return await post<ApiResponse<{ unreadCount: number }>>('/messages/read-all', {});
    } catch (error) {
      console.error('Mark all conversations as read error:', error);
      return {
        success: false,
        data: { unreadCount: 0 },
        message: 'Failed to mark all conversations as read',
      };
    }
  },
};

// ============================================
// NOTIFICATION SERVICE
// ============================================
export const notificationService = {
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    try {
      return await get<ApiResponse<Notification[]>>('/notifications');
    } catch (error) {
      console.error('Get notifications error:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to load notifications',
      };
    }
  },

  async getUnreadCount(): Promise<ApiResponse<{ unreadCount: number }>> {
    try {
      return await get<ApiResponse<{ unreadCount: number }>>('/notifications/unread-count');
    } catch (error) {
      console.error('Get unread count error:', error);
      return {
        success: false,
        data: { unreadCount: 0 },
        message: 'Failed to get unread count',
      };
    }
  },

  async markAsRead(notificationId: string): Promise<ApiResponse<{ unreadCount: number }>> {
    try {
      return await post<ApiResponse<{ unreadCount: number }>>(`/notifications/${notificationId}/read`, {});
    } catch (error) {
      console.error('Mark notification as read error:', error);
      return {
        success: false,
        data: { unreadCount: 0 },
        message: 'Failed to mark notification as read',
      };
    }
  },

  async markAllAsRead(): Promise<ApiResponse<{ unreadCount: number }>> {
    try {
      return await post<ApiResponse<{ unreadCount: number }>>('/notifications/read-all', {});
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      return {
        success: false,
        data: { unreadCount: 0 },
        message: 'Failed to mark all notifications as read',
      };
    }
  },
};

// ============================================
// DASHBOARD SERVICE
// ============================================
export const dashboardService = {
  async getClientStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      return await get<ApiResponse<DashboardStats>>('/dashboard/client/stats');
    } catch (error) {
      console.error('Get client stats error:', error);
      return {
        success: false,
        data: {} as DashboardStats,
        message: 'Failed to load dashboard stats',
      };
    }
  },

  async getLawyerStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      return await get<ApiResponse<DashboardStats>>('/dashboard/lawyer/stats');
    } catch (error) {
      console.error('Get lawyer stats error:', error);
      return {
        success: false,
        data: {} as DashboardStats,
        message: 'Failed to load dashboard stats',
      };
    }
  },
};

// ============================================
// INTAKE FORM SERVICE
// ============================================
export const intakeService = {
  async submitIntakeForm(data: IntakeFormData): Promise<ApiResponse<{ caseId: string }>> {
    try {
      return await post<ApiResponse<{ caseId: string }>>('/intake', data, { auth: false });
    } catch (error) {
      console.error('Submit intake form error:', error);
      return {
        success: false,
        data: { caseId: '' },
        message: 'Failed to submit intake form',
      };
    }
  },

  async saveDraft(data: Partial<IntakeFormData>): Promise<ApiResponse<null>> {
    try {
      return await post<ApiResponse<null>>('/intake/draft', data);
    } catch (error) {
      console.error('Save draft error:', error);
      return {
        success: false,
        data: null,
        message: 'Failed to save draft',
      };
    }
  },

  async getDraft(): Promise<ApiResponse<Partial<IntakeFormData> | null>> {
    try {
      return await get<ApiResponse<Partial<IntakeFormData> | null>>('/intake/draft');
    } catch (error) {
      console.error('Get draft error:', error);
      return {
        success: false,
        data: null,
        message: 'Failed to load draft',
      };
    }
  },
};

// Export all services
export const api = {
  auth: authService,
  public: publicService,
  booking: bookingService,
  cases: caseService,
  clients: clientsService,
  documents: documentService,
  messages: messageService,
  notifications: notificationService,
  dashboard: dashboardService,
  intake: intakeService,
};

export default api;
