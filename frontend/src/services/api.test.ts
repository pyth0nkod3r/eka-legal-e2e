/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { api } from "./api";

// Mock fetch globally
global.fetch = vi.fn();

function mockFetchResponse(data: any, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: new Headers({ "content-type": "application/json" }),
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response);
}

// Comprehensive mock API handler
function createMockApiHandler() {
  return vi.fn((url: string, options?: RequestInit) => {
    const endpoint = url.replace(/^.*\/api\/v1/, "");
    const method = options?.method || "GET";

    // Auth endpoints
    if (endpoint === "/auth/login" && method === "POST") {
      const body = JSON.parse(options?.body as string);
      if (body.email === "wrong@example.com") {
        return mockFetchResponse(
          { success: false, message: "Invalid email or password" },
          401
        );
      }
      return mockFetchResponse({
        success: true,
        data: {
          user: {
            id: "user-1",
            email: body.email,
            name: "Test User",
            role: "client",
          },
          token: "fake-jwt-token",
        },
      });
    }

    if (endpoint === "/auth/register" && method === "POST") {
      const body = JSON.parse(options?.body as string);
      if (body.email === "john.doe@email.com") {
        return mockFetchResponse(
          { success: false, message: "Email already registered" },
          400
        );
      }
      return mockFetchResponse({
        success: true,
        data: {
          user: {
            id: "new-user",
            email: body.email,
            name: body.name,
            role: "client",
          },
          token: "fake-jwt-token",
        },
      });
    }

    if (endpoint === "/auth/me" && method === "GET") {
      return mockFetchResponse({
        success: true,
        data: {
          id: "user-1",
          email: "test@example.com",
          name: "Test User",
          role: "client",
        },
      });
    }

    if (endpoint === "/auth/logout" && method === "POST") {
      return mockFetchResponse({ success: true, data: null });
    }

    if (endpoint === "/auth/forgot-password" && method === "POST") {
      return mockFetchResponse({
        success: true,
        message: "Password reset email sent",
      });
    }

    // Public endpoints
    if (endpoint === "/public/lawyer-profile" && method === "GET") {
      return mockFetchResponse({
        success: true,
        data: {
          name: "Attorney Eka",
          credentials: ["JD", "Bar License"],
          experience: "10 years",
        },
      });
    }

    if (endpoint === "/public/services" && method === "GET") {
      return mockFetchResponse({
        success: true,
        data: [
          { id: "1", name: "Legal Consultation", description: "Expert advice" },
        ],
      });
    }

    if (endpoint === "/public/testimonials" && method === "GET") {
      return mockFetchResponse({
        success: true,
        data: [
          { id: "1", name: "Client", rating: 5, comment: "Excellent service" },
        ],
      });
    }

    if (endpoint === "/public/faqs" && method === "GET") {
      return mockFetchResponse({
        success: true,
        data: [{ id: "1", category: "General", question: "Q?", answer: "A." }],
      });
    }

    if (endpoint === "/public/contact" && method === "POST") {
      return mockFetchResponse({ success: true, message: "Message sent" });
    }

    // Booking endpoints
    if (endpoint === "/booking/consultation-types" && method === "GET") {
      return mockFetchResponse({
        success: true,
        data: [
          {
            id: "type-1",
            name: "Initial Consultation",
            duration: 60,
            price: 150,
          },
        ],
      });
    }

    if (endpoint.match(/^\/booking\/available-slots/) && method === "GET") {
      return mockFetchResponse({
        success: true,
        data: ["09:00", "10:00", "14:00", "15:00"],
      });
    }

    if (endpoint === "/booking/bookings" && method === "POST") {
      const body = JSON.parse(options?.body as string);
      if (body.consultationTypeId === "invalid-id") {
        return mockFetchResponse(
          { success: false, message: "Invalid consultation type" },
          400
        );
      }
      return mockFetchResponse({
        success: true,
        data: {
          id: "booking-1",
          status: "pending",
          clientName: body.name,
          ...body,
        },
      });
    }

    if (endpoint === "/booking/bookings" && method === "GET") {
      return mockFetchResponse({
        success: true,
        data: [
          {
            id: "booking-1",
            clientName: "Test Client",
            date: "2024-01-20",
            time: "10:00",
          },
          {
            id: "booking-2",
            clientName: "Another Client",
            date: "2024-01-21",
            time: "14:00",
          },
        ],
      });
    }

    if (endpoint.match(/^\/booking\/bookings\/[^/]+$/) && method === "DELETE") {
      return mockFetchResponse({ success: true, data: null });
    }

    // Cases endpoints
    if (endpoint.match(/^\/cases(\?.*)?$/) && method === "GET") {
      // Handle filtering by status
      const urlObj = new URL(url);
      const statusParam = urlObj.searchParams.get("status");

      const allCases = [
        {
          id: "case-1",
          title: "Test Case",
          status: "active",
          caseType: "Corporate",
          clientId: "user-1",
        },
        {
          id: "case-2",
          title: "Another Case",
          status: "pending",
          caseType: "Family",
          clientId: "user-1",
        },
        {
          id: "case-3",
          title: "Closed Case",
          status: "closed",
          caseType: "Real Estate",
          clientId: "user-1",
        },
      ];

      const filteredCases = statusParam
        ? allCases.filter((c) => c.status === statusParam)
        : allCases;

      return mockFetchResponse({
        success: true,
        data: filteredCases,
      });
    }

    if (endpoint.match(/^\/cases\/[^/]+$/) && method === "GET") {
      const caseId = endpoint.split("/")[2];
      return mockFetchResponse({
        success: true,
        data: {
          id: caseId,
          title: "Test Case",
          status: "active",
          caseType: "Corporate",
          clientId: "user-1",
          documents: [],
        },
      });
    }

    // Documents endpoints
    if (endpoint.match(/^\/cases\/.*\/documents$/) && method === "POST") {
      return mockFetchResponse({
        success: true,
        data: {
          id: "doc-1",
          name: "test.pdf",
          url: "/uploads/test.pdf",
          uploadedAt: new Date().toISOString(),
        },
      });
    }

    if (endpoint.match(/^\/documents\//) && method === "DELETE") {
      return mockFetchResponse({ success: true, data: null });
    }

    if (endpoint.match(/^\/cases\/.*\/documents$/) && method === "GET") {
      return mockFetchResponse({
        success: true,
        data: [{ id: "doc-1", name: "document.pdf", url: "/uploads/doc.pdf" }],
      });
    }

    // Messages endpoints
    if (endpoint === "/messages/conversations" && method === "GET") {
      return mockFetchResponse({
        success: true,
        data: [
          {
            id: "conv-1",
            participants: [{ id: "user-1", name: "User" }],
            lastMessage: "Hi",
          },
          {
            id: "conv-2",
            participants: [{ id: "user-2", name: "Other" }],
            lastMessage: "Hello",
          },
        ],
      });
    }

    if (endpoint.match(/^\/messages\/.*\/messages$/) && method === "GET") {
      return mockFetchResponse({
        success: true,
        data: [
          {
            id: "msg-1",
            content: "Hello",
            senderRole: "client",
            timestamp: new Date().toISOString(),
          },
        ],
      });
    }

    if (endpoint.match(/^\/messages\/.*\/messages$/) && method === "POST") {
      const body = JSON.parse(options?.body as string);
      return mockFetchResponse({
        success: true,
        data: {
          id: "msg-new",
          content: body.content,
          senderRole: "client",
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (endpoint === "/messages/read" && method === "POST") {
      return mockFetchResponse({ success: true, data: null });
    }

    // Notifications endpoints
    if (endpoint === "/notifications" && method === "GET") {
      return mockFetchResponse({
        success: true,
        data: [
          {
            id: "notif-1",
            title: "Notification",
            message: "Test",
            read: false,
            createdAt: new Date().toISOString(),
          },
        ],
      });
    }

    if (endpoint.match(/^\/notifications\/.*\/read$/) && method === "POST") {
      return mockFetchResponse({ success: true, data: null });
    }

    if (endpoint === "/notifications/read-all" && method === "POST") {
      return mockFetchResponse({ success: true, data: null });
    }

    // Dashboard endpoints
    if (endpoint === "/dashboard/client/stats" && method === "GET") {
      return mockFetchResponse({
        success: true,
        data: {
          totalClients: 10,
          activeCase: 5,
          upcomingAppointments: 3,
          pendingDocuments: 2,
        },
      });
    }

    if (endpoint === "/dashboard/lawyer/stats" && method === "GET") {
      return mockFetchResponse({
        success: true,
        data: {
          totalClients: 25,
          activeCase: 12,
          upcomingAppointments: 8,
          pendingDocuments: 5,
        },
      });
    }

    // Intake endpoints
    if (endpoint === "/intake" && method === "POST") {
      return mockFetchResponse({
        success: true,
        data: { caseId: "new-case-1", status: "submitted" },
      });
    }

    if (endpoint === "/intake/draft" && method === "POST") {
      return mockFetchResponse({ success: true, data: { draftId: "draft-1" } });
    }

    if (endpoint === "/intake/draft" && method === "GET") {
      return mockFetchResponse({
        success: true,
        data: { personalInfo: { name: "Test", email: "test@example.com" } },
      });
    }

    // Default fallback
    console.warn(`Unmocked API call: ${method} ${endpoint}`);
    return mockFetchResponse({ success: false, message: "Not mocked" }, 404);
  });
}

describe("API Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Setup comprehensive mock handler
    (global.fetch as any).mockImplementation(createMockApiHandler());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("authService", () => {
    it("should login with valid credentials", async () => {
      const result = await api.auth.login({
        email: "john.doe@email.com",
        password: "password123",
      });

      expect(result.success).toBe(true);
      expect(result.data.user).toBeDefined();
      expect(result.data.token).toBeDefined();
    });

    it("should fail login with invalid credentials", async () => {
      const result = await api.auth.login({
        email: "wrong@example.com",
        password: "wrongpassword",
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Login failed. Please try again.");
    });

    it("should register a new user", async () => {
      const result = await api.auth.register({
        name: "New User",
        email: "newuser@example.com",
        password: "password123",
      });

      expect(result.success).toBe(true);
      expect(result.data.user.email).toBe("newuser@example.com");
      expect(result.data.user.role).toBe("client");
    });

    it("should fail registration with existing email", async () => {
      const result = await api.auth.register({
        name: "Test User",
        email: "john.doe@email.com",
        password: "password123",
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Registration failed. Please try again.");
    });

    it("should get current user", async () => {
      const result = await api.auth.getCurrentUser();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.email).toBeDefined();
    });

    it("should logout successfully", async () => {
      const result = await api.auth.logout();

      expect(result.success).toBe(true);
    });

    it("should handle forgot password", async () => {
      const result = await api.auth.forgotPassword("test@example.com");

      expect(result.success).toBe(true);
      expect(result.message).toBe("Password reset email sent");
    });
  });

  describe("publicService", () => {
    it("should get lawyer profile", async () => {
      const result = await api.public.getLawyerProfile();

      expect(result.success).toBe(true);
      expect(result.data.name).toBeDefined();
      expect(result.data.credentials).toBeDefined();
    });

    it("should get services", async () => {
      const result = await api.public.getServices();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it("should get testimonials", async () => {
      const result = await api.public.getTestimonials();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should get FAQs", async () => {
      const result = await api.public.getFAQs();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data[0]).toHaveProperty("id");
      expect(result.data[0]).toHaveProperty("category");
    });

    it("should submit contact form", async () => {
      const result = await api.public.submitContactForm({
        name: "Test User",
        email: "test@example.com",
        message: "Test message",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("bookingService", () => {
    it("should get consultation types", async () => {
      const result = await api.booking.getConsultationTypes();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data[0]).toHaveProperty("name");
      expect(result.data[0]).toHaveProperty("duration");
      expect(result.data[0]).toHaveProperty("price");
    });

    it("should get available slots for a date", async () => {
      const result = await api.booking.getAvailableSlots("2024-01-15");

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should create a booking", async () => {
      const typesResult = await api.booking.getConsultationTypes();
      const consultationType = typesResult.data[0];

      const result = await api.booking.createBooking({
        consultationTypeId: consultationType.id,
        date: "2024-01-20",
        time: "10:00 AM",
        name: "Test Client",
        email: "test@example.com",
        reason: "Legal consultation",
      });

      expect(result.success).toBe(true);
      expect(result.data.status).toBe("pending");
      expect(result.data.clientName).toBe("Test Client");
    });

    it("should fail booking with invalid consultation type", async () => {
      const result = await api.booking.createBooking({
        consultationTypeId: "invalid-id",
        date: "2024-01-20",
        time: "10:00 AM",
        name: "Test Client",
        email: "test@example.com",
        reason: "Legal consultation",
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to create booking");
    });

    it("should get user bookings", async () => {
      const result = await api.booking.getMyBookings();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should cancel a booking", async () => {
      const result = await api.booking.cancelBooking("booking-1");

      expect(result.success).toBe(true);
    });
  });

  // These tests require authentication and a running backend
  // TODO: Convert to integration tests or properly mock the HTTP client
  describe("caseService", () => {
    it("should get user cases", async () => {
      const result = await api.cases.getMyCases();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should get case by id", async () => {
      const casesResult = await api.cases.getMyCases();
      const firstCase = casesResult.data[0];

      const result = await api.cases.getCaseById(firstCase.id);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(firstCase.id);
    });

    it("should filter cases by status", async () => {
      const result = await api.cases.getCasesByStatus("active");

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      result.data.forEach((c) => {
        expect(c.status).toBe("active");
      });
    });
  });

  // These tests require authentication and a running backend
  // TODO: Convert to integration tests or properly mock the HTTP client
  describe("documentService", () => {
    it("should upload a document", async () => {
      const file = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });

      const result = await api.documents.uploadDocument("case-1", file);

      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
      expect(result.data.url).toContain("test.pdf");
    });

    it("should delete a document", async () => {
      const result = await api.documents.deleteDocument("doc-1");

      expect(result.success).toBe(true);
    });

    it("should get documents by case", async () => {
      const casesResult = await api.cases.getMyCases();
      const firstCase = casesResult.data[0];

      const result = await api.documents.getDocumentsByCase(firstCase.id);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  // These tests require authentication and a running backend
  // TODO: Convert to integration tests or properly mock the HTTP client
  describe("messageService", () => {
    it("should get conversations", async () => {
      const result = await api.messages.getConversations();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should get messages for a conversation", async () => {
      const conversationsResult = await api.messages.getConversations();
      const firstConversation = conversationsResult.data[0];

      const result = await api.messages.getMessages(firstConversation.id);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should send a message", async () => {
      const result = await api.messages.sendMessage(
        "conv-1",
        "Hello, this is a test message"
      );

      expect(result.success).toBe(true);
      expect(result.data.content).toBe("Hello, this is a test message");
      expect(result.data.senderRole).toBe("client");
    });

    it("should mark messages as read", async () => {
      const result = await api.messages.markAsRead(["msg-1", "msg-2"]);

      expect(result.success).toBe(true);
    });
  });

  // These tests require authentication and a running backend
  // TODO: Convert to integration tests or properly mock the HTTP client
  describe("notificationService", () => {
    it("should get notifications", async () => {
      const result = await api.notifications.getNotifications();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should mark notification as read", async () => {
      const result = await api.notifications.markAsRead("notification-1");

      expect(result.success).toBe(true);
    });

    it("should mark all notifications as read", async () => {
      const result = await api.notifications.markAllAsRead();

      expect(result.success).toBe(true);
    });
  });

  // These tests require authentication and a running backend
  // TODO: Convert to integration tests or properly mock the HTTP client
  describe("dashboardService", () => {
    it("should get client stats", async () => {
      const result = await api.dashboard.getClientStats();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("totalClients");
      expect(result.data).toHaveProperty("activeCase");
      expect(result.data).toHaveProperty("upcomingAppointments");
    });

    it("should get lawyer stats", async () => {
      const result = await api.dashboard.getLawyerStats();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("totalClients");
      expect(result.data).toHaveProperty("activeCase");
    });
  });

  // These tests require authentication and a running backend
  // TODO: Convert to integration tests or properly mock the HTTP client
  describe("intakeService", () => {
    it("should submit intake form", async () => {
      const result = await api.intake.submitIntakeForm({
        personalInfo: {
          name: "Test User",
          email: "test@example.com",
          phone: "555-0123",
          preferredContact: "email",
        },
        caseType: "corporate",
        urgency: "medium",
        description:
          "This is a test description for the intake form that needs to be at least 50 characters long.",
        additionalInfo: {},
        consent: true,
      });

      expect(result.success).toBe(true);
      expect(result.data.caseId).toBeDefined();
    });

    it("should save draft", async () => {
      const result = await api.intake.saveDraft({
        personalInfo: {
          name: "Test User",
          email: "test@example.com",
          phone: "",
          preferredContact: "email",
        },
      });

      expect(result.success).toBe(true);
    });

    it("should get draft", async () => {
      const result = await api.intake.getDraft();

      expect(result.success).toBe(true);
    });
  });
});
