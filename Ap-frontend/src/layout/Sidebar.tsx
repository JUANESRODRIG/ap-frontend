import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    FileUp,
    ChevronLeft,
    Zap,
    User,
} from 'lucide-react';

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const navItems = [
    {
        label: 'Main',
        items: [
            { to: '/', icon: LayoutDashboard, text: 'Dashboard' },
            { to: '/upload', icon: FileUp, text: 'Upload Invoice' },
        ],
    },
];

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Close mobile sidebar on route change
    useEffect(() => {
        if (isMobile) setMobileOpen(false);
    }, [location.pathname, isMobile]);

    const sidebarClasses = [
        'sidebar',
        collapsed && !isMobile ? 'collapsed' : '',
        isMobile && mobileOpen ? 'mobile-open' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <>
            {/* Mobile hamburger button */}
            {isMobile && (
                <button
                    onClick={() => setMobileOpen(true)}
                    style={{
                        position: 'fixed',
                        top: 16,
                        left: 16,
                        zIndex: 150,
                        width: 42,
                        height: 42,
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--glass-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-primary)',
                    }}
                    aria-label="Open menu"
                    id="mobile-menu-toggle"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="3" y1="5" x2="17" y2="5" />
                        <line x1="3" y1="10" x2="17" y2="10" />
                        <line x1="3" y1="15" x2="17" y2="15" />
                    </svg>
                </button>
            )}

            {/* Mobile overlay */}
            <AnimatePresence>
                {isMobile && mobileOpen && (
                    <motion.div
                        className="mobile-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            <aside className={sidebarClasses} id="main-sidebar">
                {/* Header */}
                <div className="sidebar-header">
                    <div className="sidebar-logo-icon">
                        <Zap size={20} />
                    </div>
                    <div className="sidebar-brand">
                        <span className="sidebar-brand-name">AP Intelligence</span>
                        <span className="sidebar-brand-sub">Invoice Platform</span>
                    </div>
                </div>

                {/* Toggle button (desktop only) */}
                {!isMobile && (
                    <button
                        className="sidebar-toggle"
                        onClick={onToggle}
                        aria-label="Toggle sidebar"
                        id="sidebar-toggle-btn"
                    >
                        <ChevronLeft size={16} />
                    </button>
                )}

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {navItems.map((group) => (
                        <div key={group.label}>
                            <div className="sidebar-nav-label">{group.label}</div>
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.to === '/'}
                                    className={({ isActive }) =>
                                        `sidebar-link ${isActive ? 'active' : ''}`
                                    }
                                    id={`nav-${item.text.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                    <span className="sidebar-link-icon">
                                        <item.icon size={20} />
                                    </span>
                                    <span className="sidebar-link-text">{item.text}</span>
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* Footer / User */}
                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar">
                            <User size={18} />
                        </div>
                        <div className="sidebar-user-info">
                            <span className="sidebar-user-name">Admin User</span>
                            <span className="sidebar-user-role">Finance Team</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
