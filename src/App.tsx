import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/book" element={<Book />} />
          <Route path="/intake" element={<Intake />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/cases" element={<Cases />} />
          <Route path="/dashboard/cases/:caseId" element={<CaseDetail />} />
          <Route path="/dashboard/messages" element={<Messages />} />
          <Route path="/dashboard/messages/:conversationId" element={<Messages />} />
          <Route path="/dashboard/documents" element={<Documents />} />
          <Route path="/dashboard/appointments" element={<Appointments />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/clients" element={<AdminClients />} />
          <Route path="/admin/cases" element={<AdminCases />} />
          <Route path="/admin/calendar" element={<AdminCalendar />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/admin/documents" element={<AdminDocuments />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
