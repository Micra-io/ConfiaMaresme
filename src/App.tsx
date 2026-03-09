import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { DemoModeProvider } from "@/hooks/useDemoMode";
import '@/i18n';
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import ReviewPromptWrapper from "@/components/ReviewPromptWrapper";
import DemoSwitcher from "@/components/DemoSwitcher";
import Index from "./pages/Index";
import TradesmanProfile from "./pages/TradesmanProfile";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ClaimProfile from "./pages/ClaimProfile";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DemoModeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <SEOHead />
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/tradesman/:id" element={<TradesmanProfile />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/claim" element={<ClaimProfile />} />
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                      <AdminRoute>
                        <Admin />
                      </AdminRoute>
                    } />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
              <DemoSwitcher />
              <ReviewPromptWrapper />
            </BrowserRouter>
          </TooltipProvider>
        </DemoModeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
