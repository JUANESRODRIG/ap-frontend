import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./layout/Sidebar";
import Topbar from "./layout/Topbar";
import Dashboard from "./pages/Dashboard";
import UploadInvoice from "./pages/UploadInvoice";

/* Maps route paths to page titles */
const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/upload": "Upload Invoice",
};

function AppContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || "Dashboard";

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />

      <div className={`main-wrapper ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <Topbar sidebarCollapsed={sidebarCollapsed} title={pageTitle} />

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

import { ThemeProvider } from "./lib/ThemeContext";

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