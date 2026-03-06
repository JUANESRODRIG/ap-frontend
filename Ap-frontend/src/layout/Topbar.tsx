import { useLocation } from 'react-router-dom';
import { Search, Bell, Settings } from 'lucide-react';

interface TopbarProps {
    sidebarCollapsed: boolean;
}

const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/upload': 'Upload Invoice',
};

const Topbar = ({ sidebarCollapsed }: TopbarProps) => {
    const location = useLocation();
    const title = pageTitles[location.pathname] || 'AP Intelligence';

    return (
        <header
            className={`topbar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
            id="main-topbar"
        >
            <h2 className="topbar-title">{title}</h2>

            <div className="topbar-actions">
                <div className="topbar-search" id="topbar-search">
                    <Search size={16} />
                    <input type="text" placeholder="Search invoices..." />
                    <span className="topbar-search-shortcut">⌘K</span>
                </div>

                <button className="topbar-icon-btn" aria-label="Notifications" id="notifications-btn">
                    <Bell size={20} />
                    <span className="topbar-badge" />
                </button>

                <button className="topbar-icon-btn" aria-label="Settings" id="settings-btn">
                    <Settings size={20} />
                </button>
            </div>
        </header>
    );
};

export default Topbar;
