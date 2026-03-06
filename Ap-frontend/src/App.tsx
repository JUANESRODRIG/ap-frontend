import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Topbar from './layout/Topbar';
import Dashboard from './pages/Dashboard';
import UploadInvoice from './pages/UploadInvoice';

function App() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <Router>
            <div className="app-layout">
                <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed((prev) => !prev)}
                />
                <div
                    className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
                >
                    <Topbar sidebarCollapsed={sidebarCollapsed} />
                    <div className="page-content">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/upload" element={<UploadInvoice />} />
                        </Routes>
                    </div>
                </div>
            </div>
        </Router>
    );
}

export default App;
