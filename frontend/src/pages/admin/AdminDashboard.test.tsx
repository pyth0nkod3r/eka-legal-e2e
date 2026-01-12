import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AdminDashboard from './AdminDashboard';
import { api } from '@/services/api';
import { BrowserRouter } from 'react-router';

// Mock API
vi.mock('@/services/api', () => ({
  api: {
    dashboard: {
      getLawyerStats: vi.fn(),
    },
    cases: {
      getMyCases: vi.fn(),
      updateCaseStatus: vi.fn(),
    },
    booking: {
      getMyBookings: vi.fn(),
      updateBookingStatus: vi.fn(),
    },
  },
}));

// Mock AdminLayout to avoid context issues
vi.mock('@/components/layout/AdminLayout', () => ({
  default: ({ children }: any) => <div data-testid="admin-layout">{children}</div>,
}));

// Mock Recharts to avoid rendering issues in JSDOM
vi.mock('recharts', async () => {
  const OriginalValid = await vi.importActual('recharts');
  return {
    ...OriginalValid,
    ResponsiveContainer: ({ children }: any) => <div className="recharts-responsive-container">{children}</div>,
  };
});

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard with stats and correct chart titles', async () => {
    // Mock successful responses
    (api.dashboard.getLawyerStats as any).mockResolvedValue({
      success: true,
      data: {
        totalClients: 10,
        activeCase: 5,
        pendingCases: 2,
        upcomingAppointments: 3,
        pendingDocuments: 1,
        appointmentsThisWeek: [
          { day: 'Mon', count: 1 },
          { day: 'Tue', count: 2 },
          { day: 'Wed', count: 0 },
          { day: 'Thu', count: 0 },
          { day: 'Fri', count: 0 },
          { day: 'Sat', count: 0 },
          { day: 'Sun', count: 0 },
        ],
        monthlyCases: [
           { month: 'Jan', count: 5 },
           { month: 'Feb', count: 8 },
        ]
      },
    });

    (api.cases.getMyCases as any).mockResolvedValue({
      success: true,
      data: [],
    });

    (api.booking.getMyBookings as any).mockResolvedValue({
      success: true,
      data: [],
    });

    render(
      <BrowserRouter>
          <AdminDashboard />
      </BrowserRouter>
    );

    // Wait for stats to load (wait for "Active Cases" text which is in the stats card and chart title)
    // The "Active Cases" text appears in the Stats Card ("Active Cases") and Chart Title ("Active Cases").
    // We want to ensure it replaced "Revenue Trend".
    
    await waitFor(() => {
      // Check for chart title
      // We can look for the card title specifically if needed, but getAllByText is fine
      expect(screen.getAllByText('Active Cases').length).toBeGreaterThan(0);
    });

    // Verify "Revenue Trend" is NOT present
    expect(screen.queryByText('Revenue Trend')).not.toBeInTheDocument();
    
    // Verify "Weekly Appointments" is present
    expect(screen.getByText('Weekly Appointments')).toBeInTheDocument();
  });
});
