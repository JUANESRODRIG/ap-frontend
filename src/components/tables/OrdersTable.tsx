import { useState, useMemo } from "react";
import { FileText, Filter, Send } from "lucide-react";
import { useTheme } from "../../lib/ThemeContext";

interface Invoice {
  invoice_id: number;
  invoice_number: string;
  vendor_id: string;
  status: string;
  invoice_total: number;
  category?: string;
}

interface Props {
  invoices: Invoice[];
}

function getStatusClass(status: string) {
  const norm = status?.toLowerCase() || "";
  if (norm.includes("approved")) return "status-approved-purple";
  if (norm.includes("ready")) return "status-ready-blue";
  if (norm.includes("exception") || norm.includes("rejected")) return "status-exception-red";
  if (norm.includes("parked")) return "status-parked-orange";
  if (norm.includes("processing") || norm.includes("pending")) return "status-processing-grey";
  return "";
}

function formatCurrency(val: any) {
  const num = Number(val);
  if (isNaN(num)) return "$0.00";
  return new Intl.NumberFormat("en-US", { 
    style: "currency", 
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function OrdersTable({ invoices }: Props) {
  const [showFilters, setShowFilters] = useState(false);
  const [vendorFilter, setVendorFilter] = useState("All Vendors");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [valueFilter, setValueFilter] = useState("All Amounts");
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const hasFilters = vendorFilter !== "All Vendors" || statusFilter !== "All Statuses" || categoryFilter !== "All Categories" || valueFilter !== "All Amounts";

  const uniqueVendors = useMemo(() => ["All Vendors", ...Array.from(new Set(invoices.map(i => i.vendor_id)))], [invoices]);
  const uniqueStatuses = useMemo(() => ["All Statuses", ...Array.from(new Set(invoices.map(i => i.status)))], [invoices]);
  const uniqueCategories = useMemo(() => ["All Categories", ...Array.from(new Set(invoices.map(i => i.category || "Uncategorized")))], [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const vMatch = vendorFilter === "All Vendors" || inv.vendor_id === vendorFilter;
      const sMatch = statusFilter === "All Statuses" || inv.status === statusFilter;
      const cMatch = categoryFilter === "All Categories" || (inv.category || "Uncategorized") === categoryFilter;
      
      let vMatchAmt = true;
      const total = Number(inv.invoice_total || 0);
      if (valueFilter === "< $1,000") vMatchAmt = total < 1000;
      else if (valueFilter === "$1,000 - $5,000") vMatchAmt = total >= 1000 && total <= 5000;
      else if (valueFilter === "> $5,000") vMatchAmt = total > 5000;

      return vMatch && sMatch && cMatch && vMatchAmt;
    });
  }, [invoices, vendorFilter, statusFilter, categoryFilter, valueFilter]);

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
      transition: "background var(--transition-base), border var(--transition-base)"
    }}>
      <div className="table-header" style={{ marginBottom: showFilters ? "20px" : "24px" }}>
        <h3 className="table-title" style={{ color: "var(--text-primary)", fontSize: "1.2rem" }}>Recent Invoices</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          {hasFilters && (
            <button 
              className="table-header-action"
              style={{ 
                background: "var(--accent-primary, #7c3aed)",
                border: "none",
                color: "white",
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
              <Send size={16} />
              Send in bulk
            </button>
          )}
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
              fontWeight: 600
            }}
          >
            <Filter size={16} />
            Filters
          </button>
          <button 
            className="table-header-action"
            style={{ 
              background: btnBg,
              border: `1px solid ${btnBorder}`,
              color: btnColor,
              padding: "8px 16px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.85rem",
              fontWeight: 600
            }}
          >
            <FileText size={16} />
            View All
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filter-section" style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
          gap: "20px", 
          padding: "20px", 
          background: "var(--bg-surface-elevated)", 
          borderRadius: "12px",
          marginBottom: "24px",
          border: "1px solid var(--border-subtle)",
          transition: "background var(--transition-base), border var(--transition-base)"
        }}>
          <div className="filter-group">
            <label style={{ display: "block", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>Vendor</label>
            <select 
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              style={{ width: "100%", background: "var(--bg-base)", border: "1px solid var(--border-default)", color: "var(--text-primary)", padding: "10px", borderRadius: "8px", fontSize: "0.9rem", transition: "all var(--transition-base)" }}
            >
              {uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label style={{ display: "block", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "100%", background: "var(--bg-base)", border: "1px solid var(--border-default)", color: "var(--text-primary)", padding: "10px", borderRadius: "8px", fontSize: "0.9rem", transition: "all var(--transition-base)" }}
            >
              {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label style={{ display: "block", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>Category</label>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: "100%", background: "var(--bg-base)", border: "1px solid var(--border-default)", color: "var(--text-primary)", padding: "10px", borderRadius: "8px", fontSize: "0.9rem", transition: "all var(--transition-base)" }}
            >
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label style={{ display: "block", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>Amount</label>
            <select 
              value={valueFilter}
              onChange={(e) => setValueFilter(e.target.value)}
              style={{ width: "100%", background: "var(--bg-base)", border: "1px solid var(--border-default)", color: "var(--text-primary)", padding: "10px", borderRadius: "8px", fontSize: "0.9rem", transition: "all var(--transition-base)" }}
            >
              <option value="All Amounts">All Amounts</option>
              <option value="< $1,000">&lt; $1,000</option>
              <option value="$1,000 - $5,000">$1,000 - $5,000</option>
              <option value="> $5,000">&gt; $5,000</option>
            </select>
          </div>
        </div>
      )}

      <div style={{ overflowX: "auto", maxHeight: "500px", overflowY: "auto" }}>
        <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--bg-card)" }}>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <th style={{ textAlign: "left", padding: "16px", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>ID</th>
              <th style={{ textAlign: "left", padding: "16px", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>Invoice Number</th>
              <th style={{ textAlign: "left", padding: "16px", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>Vendor</th>
              <th style={{ textAlign: "left", padding: "16px", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>Category</th>
              <th style={{ textAlign: "left", padding: "16px", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>Status</th>
              <th style={{ textAlign: "left", padding: "16px", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>Total Amount</th>
              <th style={{ textAlign: "right", padding: "16px", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredInvoices.map((inv) => (
              <tr key={inv.invoice_id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "16px", color: "var(--text-secondary)", fontWeight: 500 }}>#{inv.invoice_id}</td>
                <td style={{ padding: "16px", color: "var(--text-secondary)" }}>{inv.invoice_number}</td>
                <td style={{ padding: "16px", color: "var(--text-secondary)" }}>{inv.vendor_id}</td>
                <td style={{ padding: "16px", color: "var(--text-secondary)" }}>{inv.category || "General"}</td>
                <td style={{ padding: "16px" }}>
                  <span className={`status-badge-new ${getStatusClass(inv.status)}`}>
                    {inv.status || "Unknown"}
                  </span>
                </td>
                <td style={{ padding: "16px", color: "var(--text-primary)", fontWeight: 600 }}>{formatCurrency(inv.invoice_total)}</td>
                <td style={{ padding: "16px", textAlign: "right" }}>
                  <button style={{ 
                    background: "rgba(16, 185, 129, 0.1)", 
                    color: "#10b981", 
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <Send size={12} />
                    Send
                  </button>
                </td>
              </tr>
            ))}

            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
                  No invoices found matching the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .status-badge-new {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-block;
          min-width: 80px;
          text-align: center;
        }
        .status-approved-purple {
          background: rgba(139, 92, 246, 0.15);
          color: #a78bfa;
          border: 1px solid rgba(139, 92, 246, 0.3);
        }
        .status-exception-red {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .status-parked-orange {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        .status-ready-blue {
          background: rgba(14, 165, 233, 0.15);
          color: #38bdf8;
          border: 1px solid rgba(14, 165, 233, 0.3);
        }
        .status-processing-grey {
          background: rgba(107, 114, 128, 0.15);
          color: #9ca3af;
          border: 1px solid rgba(107, 114, 128, 0.3);
        }
      `}</style>
    </div>
  );
}

export default OrdersTable;