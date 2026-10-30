import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { CopilotPage } from './pages/Copilot';
import { WorkflowsPage } from './pages/Workflows';
import { DocumentsPage } from './pages/Documents';
import { AnalyticsPage } from './pages/Analytics';
import { AuditLogsPage } from './pages/AuditLogs';
import { SettingsPage } from './pages/Settings';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        Initializing enterprise session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Derive breadcrumbs based on pathname
  const pathMap: Record<string, string[]> = {
    '/dashboard': ['Enterprise Suite', 'Executive Overview'],
    '/copilot': ['Enterprise Suite', 'AI Command Copilot'],
    '/workflows': ['Enterprise Suite', 'Automated Workflows'],
    '/documents': ['Enterprise Suite', 'Document Intelligence'],
    '/analytics': ['Enterprise Suite', 'Operational Analytics'],
    '/audit': ['Security & Compliance', 'Immutable Audit Ledger'],
    '/settings': ['Enterprise Suite', 'Organization Settings'],
  };

  const breadcrumbs = pathMap[location.pathname] || ['Enterprise Suite', 'Command Center'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      <Navbar breadcrumbs={breadcrumbs} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        Loading...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedLayout>
                <DashboardPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/copilot"
            element={
              <ProtectedLayout>
                <CopilotPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/workflows"
            element={
              <ProtectedLayout>
                <WorkflowsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedLayout>
                <DocumentsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedLayout>
                <AnalyticsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/audit"
            element={
              <ProtectedLayout>
                <AuditLogsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedLayout>
                <SettingsPage />
              </ProtectedLayout>
            }
          />
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
