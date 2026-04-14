import { Search, Bell, Settings, Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "../lib/ThemeContext";

interface Props {
    sidebarCollapsed: boolean;
    title: string;
    onMobileMenuToggle?: () => void;
}

function Topbar({ sidebarCollapsed, title, onMobileMenuToggle }: Props) {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className={`topbar ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
            <div className="topbar-left">
                {/* Mobile hamburger menu */}
                {onMobileMenuToggle && (
                    <button 
                        className="topbar-icon-btn topbar-mobile-menu"
                        onClick={onMobileMenuToggle}
                        aria-label="Open menu"
                    >
                        <Menu />
                    </button>
                )}
                <h2 className="topbar-title">{title}</h2>
            </div>

            <div className="topbar-right">
                {/* Search */}
                <div className="topbar-search">
                    <Search />
                    <span className="topbar-search-text">Search invoices...</span>
                    <span className="topbar-search-shortcut">⌘K</span>
                </div>

                {/* Notification bell */}
                <button className="topbar-icon-btn" aria-label="Notifications">
                    <Bell />
                    <span className="notification-dot" />
                </button>

                {/* Theme Toggle */}
                <button
                    className="topbar-icon-btn"
                    onClick={toggleTheme}
                    aria-label="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Settings */}
                <button className="topbar-icon-btn" aria-label="Settings">
                    <Settings />
                </button>
            </div>
        </header>
    );
}

export default Topbar;
