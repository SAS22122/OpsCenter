import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { MainLayout } from "@/layouts/MainLayout"
import Cockpit from "@/pages/Cockpit"
import AppsOverview from "@/pages/AppsOverview"
import Analytics from "@/pages/Analytics"
import { SettingsPage } from "@/pages/Settings"
import Profile from "@/pages/Profile"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider, useAuth } from "@/stores/AuthContext"

// Protected Route Wrapper
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen w-screen items-center justify-center bg-slate-50">Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Area */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Cockpit />} />
              <Route path="/overview" element={<AppsOverview />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
