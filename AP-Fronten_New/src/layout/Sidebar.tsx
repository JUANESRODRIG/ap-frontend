import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Upload,
    ChevronLeft,
    User,
    Zap,
    FileText,
} from "lucide-react";

interface Props {
    collapsed: boolean;
    onToggle: () => void;
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { label: "Upload Invoice", icon: Upload, path: "/upload" },
    { label: "Upload Contract", icon: FileText, path: "/upload-contract" },
];

function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: Props) {
    const location = useLocation();

    const handleNavClick = () => {
        // Close mobile sidebar when navigating
        if (onMobileClose) onMobileClose();
    };

    return (
        <>
            {/* Mobile backdrop */}
            {mobileOpen && (
                <div 
                    className="mobile-sidebar-backdrop"
                    onClick={onMobileClose}
                />
            )}

            <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <Zap />
                    </div>
                    <div className="sidebar-logo-text">
                        <h1>AP Intelligence</h1>
                        <span>Invoice Platform</span>
                    </div>

                    <button
                        className="sidebar-toggle"
                        onClick={onToggle}
                        aria-label="Toggle sidebar"
                    >
                        <ChevronLeft />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    <div className="sidebar-section-label">Main</div>

                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                                onClick={handleNavClick}
                            >
                                <Icon />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User profile */}
                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">
                        <User />
                    </div>
                    <div className="sidebar-user-info">
                        <span className="user-name">Admin User</span>
                        <span className="user-role">Finance Team</span>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
