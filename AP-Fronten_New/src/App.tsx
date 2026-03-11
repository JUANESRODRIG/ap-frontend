import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./layout/Sidebar";
import Topbar from "./layout/Topbar";
import Dashboard from "./pages/Dashboard";
import UploadInvoice from "./pages/UploadInvoice";
import { ThemeProvider } from "./lib/ThemeContext";

/* Maps route paths to page titles */
const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/upload": "Upload Invoice",
};

function AppContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || "Dashboard";

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className={`main-wrapper ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <Topbar
          sidebarCollapsed={sidebarCollapsed}
          title={pageTitle}
          onMobileMenuToggle={() => setMobileOpen((prev) => !prev)}
        />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadInvoice />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Router>
  );
}

export default App;