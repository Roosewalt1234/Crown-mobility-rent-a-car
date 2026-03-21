import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Chatbot } from './components/Chatbot';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChatsPage } from './pages/ChatsPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';
import { ManageVehiclesPage } from './pages/ManageVehiclesPage';
import { AppLayout } from './components/AppLayout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'sonner';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-[#2e7d32] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <div className="min-h-screen bg-black text-white selection:bg-[#D4AF37] selection:text-black">
          <Navbar />
          <HomePage />
          <Footer />
          <Chatbot />
        </div>
      } />
      
      <Route path="/auth" element={<AuthPage />} />

      {/* Protected App Routes */}
      <Route path="/app" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="chats" element={<ChatsPage />} />
        <Route path="chats/ai" element={<ChatsPage mode="ai" />} />
        <Route path="chats/manual" element={<ChatsPage mode="manual" />} />
        <Route path="vehicles" element={<ManageVehiclesPage />} />
        <Route path="knowledge-base" element={<KnowledgeBasePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </Router>
    </AuthProvider>
  );
}
