// ============================================
// MOCK DATA - All mock data centralized here
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
  Document,
  Message,
  Conversation,
  Notification,
  DashboardStats,
} from '@/types';

// Helper to generate dates
const getDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

const getTimestamp = (daysFromNow: number, hours: number = 10): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
};

// ============================================
// USERS
// ============================================
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'john.doe@email.com',
    name: 'John Doe',
    role: 'client',
    phone: '+1 (555) 123-4567',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'lawyer-1',
    email: 'sarah.mitchell@lawfirm.com',
    name: 'Sarah Mitchell, Esq.',
    role: 'lawyer',
    phone: '+1 (555) 987-6543',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    createdAt: '2023-06-01T10:00:00Z',
  },
];

export const mockCurrentUser: User = mockUsers[0];
export const mockLawyerUser: User = mockUsers[1];

// ============================================
// LAWYER PROFILE
// ============================================
export const mockLawyerProfile: LawyerProfile = {
  id: 'lawyer-1',
  name: 'Sarah Mitchell, Esq.',
  title: 'Principal Attorney & Founder',
  bio: 'With over 15 years of distinguished experience in corporate law, estate planning, and civil litigation, Sarah Mitchell has built a reputation for delivering exceptional legal counsel with a personal touch. She founded Mitchell Legal Consultancy with a vision to provide accessible, high-quality legal services to individuals and businesses alike.',
  photoUrl: '/lawyer-profile.jpg',
  credentials: [
    'J.D., Harvard Law School',
    'Licensed in New York & California',
    'Member, American Bar Association',
    'Certified Mediator',
  ],
  practiceAreas: [
    'Corporate Law',
    'Estate Planning',
    'Civil Litigation',
    'Contract Law',
    'Business Formation',
  ],
  yearsExperience: 15,
  email: 'sarah.mitchell@lawfirm.com',
  phone: '+1 (555) 987-6543',
};

// ============================================
// SERVICES
// ============================================
export const mockServices: Service[] = [
  {
    id: 'service-1',
    title: 'Corporate Law',
    description: 'Comprehensive legal support for businesses of all sizes, from startups to established corporations.',
    icon: 'Building2',
    features: [
      'Business formation & structuring',
      'Mergers & acquisitions',
      'Corporate governance',
      'Regulatory compliance',
    ],
  },
  {
    id: 'service-2',
    title: 'Estate Planning',
    description: 'Protect your legacy and ensure your wishes are honored with comprehensive estate planning services.',
    icon: 'ScrollText',
    features: [
      'Wills & trusts',
      'Power of attorney',
      'Asset protection',
      'Probate administration',
    ],
  },
  {
    id: 'service-3',
    title: 'Civil Litigation',
    description: 'Strategic advocacy for civil disputes with a track record of favorable outcomes.',
    icon: 'Scale',
    features: [
      'Commercial disputes',
      'Personal injury',
      'Property disputes',
      'Contract enforcement',
    ],
  },
  {
    id: 'service-4',
    title: 'Contract Law',
    description: 'Expert contract drafting, review, and negotiation to protect your interests.',
    icon: 'FileText',
    features: [
      'Contract drafting',
      'Review & negotiation',
      'Breach of contract',
      'Employment agreements',
    ],
  },
  {
    id: 'service-5',
    title: 'Business Consultation',
    description: 'Strategic legal advice to help your business navigate complex challenges and opportunities.',
    icon: 'Briefcase',
    features: [
      'Risk assessment',
      'Strategic planning',
      'Compliance review',
      'Dispute prevention',
    ],
  },
  {
    id: 'service-6',
    title: 'Real Estate Law',
    description: 'Full-service real estate legal support for residential and commercial transactions.',
    icon: 'Home',
    features: [
      'Purchase agreements',
      'Title examination',
      'Lease negotiations',
      'Zoning matters',
    ],
  },
];

// ============================================
// TESTIMONIALS
// ============================================
export const mockTestimonials: Testimonial[] = [
  {
    id: 'testimonial-1',
    clientName: 'Michael Thompson',
    clientTitle: 'CEO, TechStart Inc.',
    content: 'Sarah guided us through a complex merger with exceptional skill and attention to detail. Her strategic approach saved us both time and money. I couldn\'t recommend her services more highly.',
    rating: 5,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
  },
  {
    id: 'testimonial-2',
    clientName: 'Emily Rodriguez',
    clientTitle: 'Small Business Owner',
    content: 'The estate planning process was explained clearly and handled with great sensitivity. Sarah made what could have been an overwhelming experience feel manageable and secure.',
    rating: 5,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
  },
  {
    id: 'testimonial-3',
    clientName: 'David Chen',
    clientTitle: 'Real Estate Investor',
    content: 'Outstanding legal representation in my property dispute. Sarah\'s expertise in civil litigation was evident from day one, and her dedication to my case was unwavering.',
    rating: 5,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
  },
  {
    id: 'testimonial-4',
    clientName: 'Jennifer Walsh',
    clientTitle: 'Startup Founder',
    content: 'From incorporation to investor agreements, Sarah has been our go-to legal advisor. Her business acumen combined with legal expertise is truly rare.',
    rating: 5,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jennifer',
  },
];

// ============================================
// CONSULTATION TYPES
// ============================================
export const mockConsultationTypes: ConsultationType[] = [
  {
    id: 'consult-1',
    name: 'Initial Consultation',
    duration: 30,
    price: 0,
    description: 'Free 30-minute consultation to discuss your legal needs and how we can help.',
  },
  {
    id: 'consult-2',
    name: 'Standard Consultation',
    duration: 60,
    price: 250,
    description: 'One-hour in-depth consultation for detailed case analysis and legal advice.',
  },
  {
    id: 'consult-3',
    name: 'Extended Consultation',
    duration: 90,
    price: 350,
    description: '90-minute comprehensive session for complex legal matters requiring detailed discussion.',
  },
];

// ============================================
// TIME SLOTS
// ============================================
export const generateTimeSlots = (date: string): TimeSlot[] => {
  const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
  return times.map((time, index) => ({
    id: `slot-${date}-${index}`,
    date,
    time,
    available: Math.random() > 0.3, // 70% availability
  }));
};

export const mockTimeSlots: TimeSlot[] = [
  ...generateTimeSlots(getDate(1)),
  ...generateTimeSlots(getDate(2)),
  ...generateTimeSlots(getDate(3)),
  ...generateTimeSlots(getDate(4)),
  ...generateTimeSlots(getDate(5)),
];

// ============================================
// BOOKINGS
// ============================================
export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    clientId: 'user-1',
    clientName: 'John Doe',
    clientEmail: 'john.doe@email.com',
    consultationType: mockConsultationTypes[1],
    date: getDate(2),
    time: '10:00',
    status: 'confirmed',
    reason: 'Need advice on business contract review',
    createdAt: getTimestamp(-2),
  },
  {
    id: 'booking-2',
    clientId: 'user-1',
    clientName: 'John Doe',
    clientEmail: 'john.doe@email.com',
    consultationType: mockConsultationTypes[0],
    date: getDate(-5),
    time: '14:00',
    status: 'completed',
    reason: 'Initial consultation about estate planning',
    createdAt: getTimestamp(-10),
  },
];

// ============================================
// CASES
// ============================================
export const mockCases: Case[] = [
  {
    id: 'case-1',
    clientId: 'user-1',
    title: 'Business Contract Review',
    description: 'Review and negotiation of supplier contracts for client\'s retail business.',
    status: 'active',
    caseType: 'Contract Law',
    createdAt: getTimestamp(-30),
    updatedAt: getTimestamp(-1),
    documents: [
      {
        id: 'doc-1',
        name: 'Supplier_Agreement_Draft.pdf',
        type: 'application/pdf',
        size: 245000,
        uploadedAt: getTimestamp(-25),
        uploadedBy: 'John Doe',
        url: '/documents/supplier-agreement.pdf',
      },
      {
        id: 'doc-2',
        name: 'Business_License.pdf',
        type: 'application/pdf',
        size: 125000,
        uploadedAt: getTimestamp(-28),
        uploadedBy: 'John Doe',
        url: '/documents/business-license.pdf',
      },
    ],
    timeline: [
      {
        id: 'event-1',
        date: getTimestamp(-30),
        title: 'Case Opened',
        description: 'Initial case file created after consultation.',
        type: 'status',
      },
      {
        id: 'event-2',
        date: getTimestamp(-25),
        title: 'Documents Received',
        description: 'Client uploaded supplier agreement draft for review.',
        type: 'document',
      },
      {
        id: 'event-3',
        date: getTimestamp(-15),
        title: 'Review Complete',
        description: 'Identified 3 key areas requiring amendment. Recommendations prepared.',
        type: 'note',
      },
      {
        id: 'event-4',
        date: getTimestamp(-5),
        title: 'Client Meeting',
        description: 'Discussed recommendations with client. Moving to negotiation phase.',
        type: 'meeting',
      },
    ],
  },
  {
    id: 'case-2',
    clientId: 'user-1',
    title: 'Estate Planning - Will Preparation',
    description: 'Comprehensive estate planning including will, trust, and power of attorney.',
    status: 'pending',
    caseType: 'Estate Planning',
    createdAt: getTimestamp(-5),
    updatedAt: getTimestamp(-1),
    documents: [],
    timeline: [
      {
        id: 'event-5',
        date: getTimestamp(-5),
        title: 'Case Opened',
        description: 'Estate planning consultation completed. Will preparation initiated.',
        type: 'status',
      },
    ],
  },
  {
    id: 'case-3',
    clientId: 'user-1',
    title: 'Property Dispute Resolution',
    description: 'Boundary dispute with neighboring property owner.',
    status: 'closed',
    caseType: 'Civil Litigation',
    createdAt: getTimestamp(-120),
    updatedAt: getTimestamp(-30),
    documents: [
      {
        id: 'doc-3',
        name: 'Settlement_Agreement.pdf',
        type: 'application/pdf',
        size: 180000,
        uploadedAt: getTimestamp(-30),
        uploadedBy: 'Sarah Mitchell',
        url: '/documents/settlement.pdf',
      },
    ],
    timeline: [
      {
        id: 'event-6',
        date: getTimestamp(-120),
        title: 'Case Opened',
        description: 'Property dispute case initiated.',
        type: 'status',
      },
      {
        id: 'event-7',
        date: getTimestamp(-60),
        title: 'Mediation Scheduled',
        description: 'Both parties agreed to mediation process.',
        type: 'meeting',
      },
      {
        id: 'event-8',
        date: getTimestamp(-30),
        title: 'Settlement Reached',
        description: 'Favorable settlement agreement reached. Case closed successfully.',
        type: 'status',
      },
    ],
  },
];

// ============================================
// MESSAGES & CONVERSATIONS
// ============================================
export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    caseId: 'case-1',
    caseTitle: 'Business Contract Review',
    participants: [
      { id: 'user-1', name: 'John Doe', role: 'client' },
      { id: 'lawyer-1', name: 'Sarah Mitchell', role: 'lawyer' },
    ],
    lastMessage: 'I\'ve reviewed the amendments and everything looks good.',
    lastMessageAt: getTimestamp(-1, 14),
    unreadCount: 2,
  },
  {
    id: 'conv-2',
    caseId: 'case-2',
    caseTitle: 'Estate Planning - Will Preparation',
    participants: [
      { id: 'user-1', name: 'John Doe', role: 'client' },
      { id: 'lawyer-1', name: 'Sarah Mitchell', role: 'lawyer' },
    ],
    lastMessage: 'Please upload the requested documents when you have a moment.',
    lastMessageAt: getTimestamp(-2, 11),
    unreadCount: 0,
  },
];

export const mockMessages: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      senderId: 'lawyer-1',
      senderName: 'Sarah Mitchell',
      senderRole: 'lawyer',
      content: 'Good morning, John. I\'ve completed my initial review of the supplier agreement. There are a few areas we should discuss.',
      timestamp: getTimestamp(-3, 9),
      read: true,
    },
    {
      id: 'msg-2',
      senderId: 'user-1',
      senderName: 'John Doe',
      senderRole: 'client',
      content: 'Thank you, Sarah. What are the main concerns you\'ve identified?',
      timestamp: getTimestamp(-3, 10),
      read: true,
    },
    {
      id: 'msg-3',
      senderId: 'lawyer-1',
      senderName: 'Sarah Mitchell',
      senderRole: 'lawyer',
      content: 'The liability clauses in Section 7 need significant revision. Also, the termination terms are heavily weighted in favor of the supplier. I\'ll prepare a detailed memo with my recommendations.',
      timestamp: getTimestamp(-3, 10),
      read: true,
    },
    {
      id: 'msg-4',
      senderId: 'user-1',
      senderName: 'John Doe',
      senderRole: 'client',
      content: 'That would be very helpful. When can I expect the memo?',
      timestamp: getTimestamp(-2, 14),
      read: true,
    },
    {
      id: 'msg-5',
      senderId: 'lawyer-1',
      senderName: 'Sarah Mitchell',
      senderRole: 'lawyer',
      content: 'I\'ll have it ready by tomorrow afternoon. I\'ve also drafted proposed amendments for your review.',
      timestamp: getTimestamp(-2, 15),
      read: true,
    },
    {
      id: 'msg-6',
      senderId: 'user-1',
      senderName: 'John Doe',
      senderRole: 'client',
      content: 'I\'ve reviewed the amendments and everything looks good. Should we proceed with sending them to the supplier?',
      timestamp: getTimestamp(-1, 14),
      read: false,
    },
  ],
  'conv-2': [
    {
      id: 'msg-7',
      senderId: 'lawyer-1',
      senderName: 'Sarah Mitchell',
      senderRole: 'lawyer',
      content: 'Hello John, thank you for our meeting yesterday. As discussed, I\'ll need a few documents to proceed with your estate planning.',
      timestamp: getTimestamp(-3, 10),
      read: true,
    },
    {
      id: 'msg-8',
      senderId: 'lawyer-1',
      senderName: 'Sarah Mitchell',
      senderRole: 'lawyer',
      content: 'Please upload the requested documents when you have a moment. The list includes: property deeds, investment account statements, and life insurance policies.',
      timestamp: getTimestamp(-2, 11),
      read: true,
    },
  ],
};

// ============================================
// NOTIFICATIONS
// ============================================
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'appointment',
    title: 'Upcoming Consultation',
    message: `You have a consultation scheduled for ${getDate(2)} at 10:00 AM`,
    read: false,
    createdAt: getTimestamp(-1),
    link: '/dashboard/appointments',
  },
  {
    id: 'notif-2',
    type: 'message',
    title: 'New Message',
    message: 'Sarah Mitchell sent you a message regarding your contract review case.',
    read: false,
    createdAt: getTimestamp(-1, 14),
    link: '/dashboard/messages',
  },
  {
    id: 'notif-3',
    type: 'document',
    title: 'Document Request',
    message: 'Please upload the required documents for your estate planning case.',
    read: true,
    createdAt: getTimestamp(-2),
    link: '/dashboard/documents',
  },
  {
    id: 'notif-4',
    type: 'case',
    title: 'Case Update',
    message: 'Your property dispute case has been marked as resolved.',
    read: true,
    createdAt: getTimestamp(-30),
    link: '/dashboard/cases/case-3',
  },
];

// ============================================
// DASHBOARD STATS
// ============================================
export const mockClientDashboardStats: DashboardStats = {
  totalClients: 1,
  activeCase: 2,
  upcomingAppointments: 1,
  pendingDocuments: 3,
  appointmentsThisWeek: [
    { day: 'Mon', count: 0 },
    { day: 'Tue', count: 1 },
    { day: 'Wed', count: 0 },
    { day: 'Thu', count: 0 },
    { day: 'Fri', count: 0 },
  ],
};

export const mockLawyerDashboardStats: DashboardStats = {
  totalClients: 24,
  activeCase: 12,
  upcomingAppointments: 8,
  pendingDocuments: 5,
  appointmentsThisWeek: [
    { day: 'Mon', count: 2 },
    { day: 'Tue', count: 3 },
    { day: 'Wed', count: 1 },
    { day: 'Thu', count: 2 },
    { day: 'Fri', count: 4 },
  ],
};

// ============================================
// FAQ DATA
// ============================================
export const mockFAQs = [
  {
    question: 'What should I bring to my first consultation?',
    answer: 'Please bring any relevant documents related to your legal matter, identification, and a list of questions you\'d like to discuss. This helps us make the most of our time together.',
  },
  {
    question: 'How are your fees structured?',
    answer: 'We offer a free 30-minute initial consultation. After that, fees vary depending on the nature and complexity of your case. We provide transparent fee estimates before beginning any work.',
  },
  {
    question: 'How long does it typically take to resolve a case?',
    answer: 'Case duration varies significantly depending on the type of legal matter. Simple contract reviews may take days, while litigation can take months or years. We\'ll provide realistic timelines during your consultation.',
  },
  {
    question: 'Do you offer virtual consultations?',
    answer: 'Yes, we offer both in-person and virtual consultations via video conference. This allows us to serve clients regardless of their location.',
  },
  {
    question: 'What areas of law do you specialize in?',
    answer: 'Our primary practice areas include corporate law, estate planning, civil litigation, contract law, business consultation, and real estate law.',
  },
];
