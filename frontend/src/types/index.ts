// ============================================
// TYPES - Centralized type definitions
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'lawyer' | 'admin';
  phone?: string;
  avatarUrl?: string;
  status?: 'active' | 'closed';
  createdAt: string;
}

export interface LawyerProfile {
  id: string;
  name: string;
  title: string;
  bio: string;
  photoUrl: string;
  credentials: string[];
  practiceAreas: string[];
  yearsExperience: number;
  email: string;
  phone: string;
  address: string;
  firmName?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

export interface Testimonial {
  id: string;
  clientName: string;
  clientTitle: string;
  content: string;
  rating: number;
  avatarUrl?: string;
}

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
}

export interface ConsultationType {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
}

export interface Booking {
  id: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  consultationType: ConsultationType;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reason: string;
  videoUrl?: string;
  videoProvider?: 'zoom' | 'google_meet' | 'jitsi' | string;
  createdAt: string;
}

export interface Case {
  id: string;
  clientId: string;
  clientName?: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'closed';
  caseType: string;
  createdAt: string;
  updatedAt: string;
  documents: Document[];
  timeline: TimelineEvent[];
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
  tag?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'note' | 'document' | 'status' | 'meeting';
}

export interface FAQ {
  id: string;
  category: 'consultations' | 'fees' | 'cases' | 'services';
  question: string;
  answer: string;
}


export interface MessageAttachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  url: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'lawyer';
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: MessageAttachment[];
  deletedAt?: string;
  editedAt?: string;
}

export interface Conversation {
  id: string;
  caseId: string;
  caseTitle: string;
  participants: { id: string; name: string; role: string; avatarUrl?: string }[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Notification {
  id: string;
  type: 'appointment' | 'message' | 'document' | 'case' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface DashboardStats {
  totalClients: number;
  activeCase: number;
  pendingCases: number;
  upcomingAppointments: number;
  pendingDocuments: number;
  appointmentsThisWeek: { day: string; count: number }[];
  monthlyCases?: { month: string; count: number }[];
}

export interface IntakeFormData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    preferredContact: string;
  };
  caseType: string;
  urgency: string;
  description: string;
  additionalInfo: {
    desiredOutcome?: string;
    priorCounsel?: string;
  };
  consent: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
