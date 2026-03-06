import { motion } from 'framer-motion';
import {
    FileText,
    TrendingUp,
    Clock,
    CheckCircle,
    ArrowUpRight,
} from 'lucide-react';

const stats = [
    {
        label: 'Total Invoices',
        value: '1,284',
        trend: '+12.5%',
        trendDir: 'up' as const,
        icon: FileText,
    },
    {
        label: 'Amount Processed',
        value: '€842K',
        trend: '+8.2%',
        trendDir: 'up' as const,
        icon: TrendingUp,
    },
    {
        label: 'Pending Review',
        value: '23',
        trend: '-3.1%',
        trendDir: 'down' as const,
        icon: Clock,
    },
    {
        label: 'Approved Today',
        value: '47',
        trend: '+18.7%',
        trendDir: 'up' as const,
        icon: CheckCircle,
    },
];

const recentInvoices = [
    { id: 'INV-2024-0847', vendor: 'Acme Corporation', amount: '€12,450.00', date: 'Mar 06, 2026', status: 'processed' },
    { id: 'INV-2024-0846', vendor: 'Global Supplies Ltd', amount: '€8,230.50', date: 'Mar 05, 2026', status: 'pending' },
    { id: 'INV-2024-0845', vendor: 'TechParts GmbH', amount: '€3,120.00', date: 'Mar 05, 2026', status: 'processed' },
    { id: 'INV-2024-0844', vendor: 'Nordic Logistics', amount: '€15,780.00', date: 'Mar 04, 2026', status: 'pending' },
    { id: 'INV-2024-0843', vendor: 'Benelux Traders', amount: '€6,940.25', date: 'Mar 04, 2026', status: 'rejected' },
    { id: 'INV-2024-0842', vendor: 'FastPack Services', amount: '€2,310.00', date: 'Mar 03, 2026', status: 'processed' },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Dashboard = () => {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Welcome banner */}
            <motion.div className="dashboard-welcome" variants={itemVariants}>
                <div className="dashboard-welcome-content">
                    <h1>Welcome back, Admin 👋</h1>
                    <p>
                        Here's what's happening with your invoices today. You have{' '}
                        <strong style={{ color: 'var(--primary-light)' }}>23 invoices</strong> awaiting review.
                    </p>
                </div>
            </motion.div>

            {/* Stats grid */}
            <motion.div className="stats-grid" variants={itemVariants}>
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        className="stat-card glass-card"
                        variants={itemVariants}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        custom={index}
                    >
                        <div className="stat-card-header">
                            <div className="stat-icon">
                                <stat.icon size={22} />
                            </div>
                            <span className={`stat-trend ${stat.trendDir}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Recent activity */}
            <motion.div className="dashboard-section" variants={itemVariants}>
                <div className="dashboard-section-header">
                    <h3 className="dashboard-section-title">Recent Invoices</h3>
                    <button className="dashboard-section-action" id="view-all-invoices">
                        View All <ArrowUpRight size={14} style={{ marginLeft: 4 }} />
                    </button>
                </div>

                <div className="glass-card" style={{ overflow: 'hidden' }}>
                    <table className="activity-table" id="invoices-table">
                        <thead>
                            <tr>
                                <th>Invoice ID</th>
                                <th>Vendor</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentInvoices.map((inv) => (
                                <tr key={inv.id}>
                                    <td>{inv.id}</td>
                                    <td>{inv.vendor}</td>
                                    <td style={{ fontWeight: 600 }}>{inv.amount}</td>
                                    <td>{inv.date}</td>
                                    <td>
                                        <span className={`status-badge ${inv.status}`}>
                                            <span className="status-dot" />
                                            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
