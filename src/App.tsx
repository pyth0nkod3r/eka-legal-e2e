import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Book from "./pages/Book";
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/dashboard/Cases";
import Messages from "./pages/dashboard/Messages";
import Documents from "./pages/dashboard/Documents";
import Appointments from "./pages/dashboard/Appointments";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/book" element={<Book />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/cases" element={<Cases />} />
          <Route path="/dashboard/cases/:caseId" element={<Cases />} />
          <Route path="/dashboard/messages" element={<Messages />} />
          <Route path="/dashboard/messages/:conversationId" element={<Messages />} />
          <Route path="/dashboard/documents" element={<Documents />} />
          <Route path="/dashboard/appointments" element={<Appointments />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
