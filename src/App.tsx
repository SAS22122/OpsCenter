import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { MainLayout } from "@/layouts/MainLayout"
import Cockpit from "@/pages/Cockpit"
import AppsOverview from "@/pages/AppsOverview"

import Analytics from "@/pages/Analytics"
import { Toaster } from "@/components/ui/sonner"
import { SettingsPage } from "@/pages/Settings" // Corrected import


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Cockpit />} />
          <Route path="/overview" element={<AppsOverview />} />

          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<SettingsPage />} /> {/* Added Route for SettingsPage */}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
