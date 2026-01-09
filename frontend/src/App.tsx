import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, PublicRoute } from "@/components/ProtectedRoute";
import { ScrollToHash } from "@/components/ScrollToHash";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Book from "./pages/Book";
import Intake from "./pages/Intake";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/dashboard/Cases";
import CaseDetail from "./pages/dashboard/CaseDetail";
import Messages from "./pages/dashboard/Messages";
import Documents from "./pages/dashboard/Documents";
import Appointments from "./pages/dashboard/Appointments";
import Settings from "./pages/dashboard/Settings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClients from "./pages/admin/AdminClients";
import AdminCases from "./pages/admin/AdminCases";
import AdminCalendar from "./pages/admin/AdminCalendar";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToHash />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/book" element={<Book />} />
            <Route path="/intake" element={<Intake />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Protected Client Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute requiredRole="client"><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/cases" element={<ProtectedRoute requiredRole="client"><Cases /></ProtectedRoute>} />
            <Route path="/dashboard/cases/:caseId" element={<ProtectedRoute requiredRole="client"><CaseDetail /></ProtectedRoute>} />
            <Route path="/dashboard/messages" element={<ProtectedRoute requiredRole="client"><Messages /></ProtectedRoute>} />
            <Route path="/dashboard/messages/:conversationId" element={<ProtectedRoute requiredRole="client"><Messages /></ProtectedRoute>} />
            <Route path="/dashboard/documents" element={<ProtectedRoute requiredRole="client"><Documents /></ProtectedRoute>} />
            <Route path="/dashboard/appointments" element={<ProtectedRoute requiredRole="client"><Appointments /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute requiredRole="client"><Settings /></ProtectedRoute>} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/clients" element={<ProtectedRoute requiredRole="admin"><AdminClients /></ProtectedRoute>} />
            <Route path="/admin/cases" element={<ProtectedRoute requiredRole="admin"><AdminCases /></ProtectedRoute>} />
            <Route path="/admin/calendar" element={<ProtectedRoute requiredRole="admin"><AdminCalendar /></ProtectedRoute>} />
            <Route path="/admin/messages" element={<ProtectedRoute requiredRole="admin"><AdminMessages /></ProtectedRoute>} />
            <Route path="/admin/documents" element={<ProtectedRoute requiredRole="admin"><AdminDocuments /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
