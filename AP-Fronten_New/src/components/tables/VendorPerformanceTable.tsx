import { useState, useMemo } from "react";
import { Filter } from "lucide-react";
import { useTheme } from "../../lib/ThemeContext";

interface Vendor {
    vendor_id: string;
    vendor_name: string;
    issues: number;
    issue_value: number;
    price_variance: number;
    missing_gr: number;
    po_mismatch: number;
}

function VendorPerformanceTable({ vendors }: { vendors: Vendor[] }) {
    const [showFilters, setShowFilters] = useState(false);
    const [riskFilter, setRiskFilter] = useState("All Risk Levels");
    const { theme } = useTheme();
    const isDark = theme === "dark";

    function getRiskLevel(issues: number) {
        if (issues >= 4) return "Critical";
        if (issues >= 3) return "Medium";
        return "Low";
    }

    const processedVendors = useMemo(() => {
        return vendors.map(v => ({
            ...v,
            risk: getRiskLevel(v.issues)
        })).filter(v => {
            return riskFilter === "All Risk Levels" || v.risk === riskFilter;
        });
    }, [vendors, riskFilter]);

    function formatCurrency(val: number) {
        return new Intl.NumberFormat("en-US", { 
            style: "currency", 
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(val || 0);
    }

    // Theme-aware button colors
    const btnBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(139, 92, 246, 0.06)";
    const filterActiveBg = isDark ? "rgba(139, 92, 246, 0.2)" : "rgba(139, 92, 246, 0.15)";
    const btnColor = isDark ? "#a78bfa" : "#7c3aed";
    const btnBorder = isDark ? "rgba(139, 92, 246, 0.3)" : "rgba(139, 92, 246, 0.25)";

    return (
        <div className="table-container animate-fade-in-up" style={{ 
            animationDelay: "0.2s", 
            background: "var(--bg-card)", 
            border: "1px solid var(--border-subtle)",
            padding: "24px",
            borderRadius: "16px",
            transition: "background var(--transition-base), border var(--transition-base)"
        }}>
            <div className="table-header" style={{ marginBottom: showFilters ? "20px" : "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 className="table-title" style={{ color: "var(--text-primary)", fontSize: "1.2rem", margin: 0 }}>Vendor Performance</h3>
                <button 
                    className={`table-header-action ${showFilters ? 'active' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                    style={{ 
                        background: showFilters ? filterActiveBg : btnBg,
                        border: `1px solid ${btnBorder}`,
                        color: btnColor,
                        padding: "8px 16px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s"
                    }}
                >
                    <Filter size={16} />
                    Filters
                </button>
            </div>

            {showFilters && (
                <div className="filter-section" style={{ 
                    padding: "20px", 
                    background: "var(--bg-surface-elevated)", 
                    borderRadius: "12px",
                    marginBottom: "30px",
                    border: "1px solid var(--border-subtle)",
                    transition: "background var(--transition-base), border var(--transition-base)"
                }}>
                    <div className="filter-group">
                        <label style={{ display: "block", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>Risk Level</label>
                        <select 
                            value={riskFilter}
                            onChange={(e) => setRiskFilter(e.target.value)}
                            style={{ 
                                width: "100%", 
                                background: "var(--bg-base)", 
                                border: "1px solid var(--border-default)", 
                                color: "var(--text-primary)", 
                                padding: "10px", 
                                borderRadius: "8px", 
                                fontSize: "0.9rem",
                                outline: "none",
                                transition: "all var(--transition-base)"
                            }}
                        >
                            <option value="All Risk Levels">All Risk Levels</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="Critical">Critical</option>
                        </select>
                    </div>
                </div>
            )}

            <div style={{ overflowX: "auto" }}>
                <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                            <th style={{ textAlign: "left", padding: "16px", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>Vendor</th>
                            <th style={{ textAlign: "left", padding: "16px", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>Total Issues</th>
                            <th style={{ textAlign: "left", padding: "16px", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>Issue Value</th>
                            <th style={{ textAlign: "left", padding: "16px", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>Price Variance</th>
                            <th style={{ textAlign: "left", padding: "16px", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>Missing GR</th>
                            <th style={{ textAlign: "left", padding: "16px", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>PO Mismatch</th>
                            <th style={{ textAlign: "right", padding: "16px", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>Risk</th>
                        </tr>
                    </thead>

                    <tbody>
                        {processedVendors.map((v) => {
                            let badgeClass = "vendor-risk-low";
                            if (v.risk === "Critical") badgeClass = "vendor-risk-high";
                            if (v.risk === "Medium") badgeClass = "vendor-risk-medium";

                            return (
                                <tr key={v.vendor_id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                    <td style={{ padding: "16px", color: "var(--text-secondary)", fontWeight: 500 }}>{v.vendor_name}</td>
                                    <td style={{ padding: "16px", color: "var(--text-secondary)" }}>{v.issues}</td>
                                    <td style={{ padding: "16px", color: "var(--text-secondary)" }}>{formatCurrency(v.issue_value)}</td>
                                    <td style={{ padding: "16px", color: "var(--text-secondary)" }}>{v.price_variance}</td>
                                    <td style={{ padding: "16px", color: "var(--text-secondary)" }}>{v.missing_gr}</td>
                                    <td style={{ padding: "16px", color: "var(--text-secondary)" }}>{v.po_mismatch}</td>
                                    <td style={{ padding: "16px", textAlign: "right" }}>
                                        <span className={`risk-badge-new ${badgeClass}`}>
                                            {v.risk}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}

                        {processedVendors.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
                                    No vendor performance data found matching the current filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
                .risk-badge-new {
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    display: inline-block;
                    min-width: 70px;
                    text-align: center;
                }
                .vendor-risk-low {
                    background: rgba(16, 185, 129, 0.1);
                    color: #10b981;
                    border: 1px solid rgba(16, 185, 129, 0.2);
                }
                .vendor-risk-medium {
                    background: rgba(245, 158, 11, 0.15);
                    color: #fbbf24;
                    border: 1px solid rgba(245, 158, 11, 0.3);
                }
                .vendor-risk-high {
                    background: rgba(239, 68, 68, 0.15);
                    color: #f87171;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                }
            `}</style>
        </div>
    );
}

export default VendorPerformanceTable;
