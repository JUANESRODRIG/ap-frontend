import { useState, useMemo } from "react";
import { Filter, FileSpreadsheet } from "lucide-react";

interface Invoice {
  invoice_id: number;
  invoice_number: string;
  vendor_id: string;
  status: string;
  invoice_total: number;
  category?: string;
  invoice_date?: string;
  confidence?: string | number;
  Confidence?: string | number;
}

interface Props {
  invoices: Invoice[];
}

function getStatusClass(status: string) {
  const norm = status?.toLowerCase() || "";
  if (norm.includes("approved")) return "status-approved-purple";
  if (norm.includes("ready")) return "status-ready-blue";
  if (norm.includes("exception") || norm.includes("rejected")) return "status-exception-red";
  if (norm.includes("parked") || norm.includes("review") || norm.includes("pending")) return "status-parked-orange";
  if (norm.includes("processing") || norm.includes("manual")) return "status-processing-grey";
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

function getConfidenceColor(confidence: string) {
  const norm = Math.abs(parseInt(confidence) || 0);
  if (norm >= 90) return "#22c55e"; // Green
  if (norm >= 70) return "#f59e0b"; // Orange
  return "#ef4444"; // Red
}

function getConfidenceValue(confidenceVal: string | number | undefined, defaultVal: number) {
  if (confidenceVal === undefined || confidenceVal === null) return defaultVal;
  let val = typeof confidenceVal === 'number' ? confidenceVal : parseFloat(confidenceVal);
  if (isNaN(val)) return defaultVal;
  if (val <= 1) val = val * 100;
  return Math.round(val);
}

function NonPoTable({ invoices }: Props) {
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [confidenceFilter, setConfidenceFilter] = useState("All Confidence Levels");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [valueFilter, setValueFilter] = useState("All Amounts");
  
  const [sortBy, setSortBy] = useState<"Net Value" | "Confidence" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const uniqueCategories = useMemo(() => ["All Categories", ...Array.from(new Set(invoices.map(i => i.category || "Uncategorized")))], [invoices]);
  const confidenceLevels = ["All Confidence Levels", "High (≥90%)", "Medium (70-89%)", "Low (<70%)"];

  const handleSort = (column: "Net Value" | "Confidence") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const filteredInvoices = useMemo(() => {
    const filtered = invoices.filter(inv => {
      const cMatch = categoryFilter === "All Categories" || (inv.category || "Uncategorized") === categoryFilter;
      
      let confMatch = true;
      const rawConf = inv.Confidence !== undefined ? inv.Confidence : inv.confidence;
      const confVal = getConfidenceValue(rawConf, 85); // Mock fallback to 85 if null
      if (confidenceFilter === "High (≥90%)") confMatch = confVal >= 90;
      if (confidenceFilter === "Medium (70-89%)") confMatch = confVal >= 70 && confVal < 90;
      if (confidenceFilter === "Low (<70%)") confMatch = confVal < 70;

      let vMatchAmt = true;
      const total = Number(inv.invoice_total || 0);
      if (valueFilter === "< $1,000") vMatchAmt = total < 1000;
      else if (valueFilter === "$1,000 - $5,000") vMatchAmt = total >= 1000 && total <= 5000;
      else if (valueFilter === "> $5,000") vMatchAmt = total > 5000;

      const isPending = confVal < 88 ? "Pending Review" : "Auto-Approved";
      const renderStatus = inv.status !== "Processing" && inv.status !== "Unknown" ? inv.status : isPending;
      const sMatch = statusFilter === "All Statuses" || String(renderStatus).toLowerCase().includes(statusFilter.toLowerCase()) || String(inv.status).toLowerCase() === statusFilter.toLowerCase();

      return cMatch && confMatch && vMatchAmt && sMatch;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (!sortBy) return 0;
      
      let valA = 0;
      let valB = 0;

      if (sortBy === "Net Value") {
        valA = Number(a.invoice_total || 0);
        valB = Number(b.invoice_total || 0);
      } else if (sortBy === "Confidence") {
        const rawConfA = a.Confidence !== undefined ? a.Confidence : a.confidence;
        valA = getConfidenceValue(rawConfA, 0);
        const rawConfB = b.Confidence !== undefined ? b.Confidence : b.confidence;
        valB = getConfidenceValue(rawConfB, 0);
      }
      
      if (sortOrder === "asc") return valA - valB;
      return valB - valA;
    });

    return sorted;
  }, [invoices, categoryFilter, confidenceFilter, statusFilter, valueFilter, sortBy, sortOrder]);

  return (
    <div className="table-container animate-fade-in-up" style={{ 
      marginTop: "24px",
      transition: "transform var(--transition-fast), box-shadow var(--transition-fast), border var(--transition-base)"
    }}>
      <div className="table-header" style={{ padding: "0 0 20px 0", borderBottom: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <h3 style={{ color: "var(--text-primary)", fontSize: "1.2rem", fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
            <FileSpreadsheet size={20} color="var(--accent-primary)" />
            Non-PO Invoices - Detailed View
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Review GL assignments and confidence scores for all Non-PO invoices</p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>
              <Filter size={16} /> Filters
            </div>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "6px 30px 6px 12px", borderRadius: "6px", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600 }}
            >
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "6px 30px 6px 12px", borderRadius: "6px", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600 }}
            >
              <option value="All Statuses">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
            <select 
              value={valueFilter}
              onChange={(e) => setValueFilter(e.target.value)}
              style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "6px 30px 6px 12px", borderRadius: "6px", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600 }}
            >
              <option value="All Amounts">All Amounts</option>
              <option value="< $1,000">&lt; $1,000</option>
              <option value="$1,000 - $5,000">$1,000 - $5,000</option>
              <option value="> $5,000">&gt; $5,000</option>
            </select>
            <select 
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value)}
              style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "6px 30px 6px 12px", borderRadius: "6px", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600 }}
            >
              {confidenceLevels.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </div>
        </div>
      </div>

      <div style={{ overflowX: "auto", maxHeight: "600px", overflowY: "auto" }}>
        <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "1100px" }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--bg-surface-elevated)" }}>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <th style={{ textAlign: "left", padding: "14px 24px", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>ID</th>
              <th style={{ textAlign: "left", padding: "14px", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Emission Date</th>
              <th style={{ textAlign: "left", padding: "14px", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Vendor</th>
              <th style={{ textAlign: "left", padding: "14px", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</th>
              <th style={{ textAlign: "left", padding: "14px", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>GL Account</th>
              <th style={{ textAlign: "left", padding: "14px", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>GL Description</th>
              <th style={{ textAlign: "left", padding: "14px", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
              <th 
                onClick={() => handleSort("Net Value")}
                style={{ textAlign: "right", padding: "14px", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer" }}>
                Net Value {sortBy === "Net Value" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
              <th 
                onClick={() => handleSort("Confidence")}
                style={{ textAlign: "right", padding: "14px 24px", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer" }}>
                Confidence {sortBy === "Confidence" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredInvoices.map((inv, i) => {
              // Mock Fallbacks for missing Supabase fields according to Design 
              // Using index 'i' to vary data deterministically if missing
              const mockCreationDate = inv.invoice_date || `2024-08-${String(10 + (i%20)).padStart(2, '0')}`;
              const mockCategory = inv.category || ((i % 2 === 0) ? "Utilities" : "Professional Services");
              const mockGlAccount = `6${(i % 5) + 1}00-0${(i % 3) + 1}1`;
              const mockGlDesc = mockCategory.toLowerCase();
              const rawConf = inv.Confidence !== undefined ? inv.Confidence : inv.confidence;
              const confVal = getConfidenceValue(rawConf, 85 + (i % 15));
              const displayConf = `${confVal}%`;
              const confColor = getConfidenceColor(displayConf);
              
              const isPending = confVal < 88 ? "Pending Review" : "Auto-Approved";
              const renderStatus = inv.status !== "Processing" && inv.status !== "Unknown" ? inv.status : isPending;

              return (
                <tr key={inv.invoice_id || i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "14px 24px", color: "var(--text-primary)", fontWeight: 500, fontSize: "0.85rem" }}>{inv.invoice_number || `#${inv.invoice_id}`}</td>
                  <td style={{ padding: "14px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>{mockCreationDate}</td>
                  <td style={{ padding: "14px", color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 500 }}>{inv.vendor_id || "Unknown Vendor"}</td>
                  <td style={{ padding: "14px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>{mockCategory}</td>
                  <td style={{ padding: "14px", color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "monospace" }}>{mockGlAccount}</td>
                  <td style={{ padding: "14px", color: "var(--text-secondary)", fontSize: "0.85rem", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mockGlDesc}</td>
                  <td style={{ padding: "14px" }}>
                    <span className={`status-badge-new ${getStatusClass(renderStatus)}`} style={{ textTransform: "capitalize" }}>
                      {renderStatus}
                    </span>
                  </td>
                  <td style={{ padding: "14px", color: "var(--text-primary)", fontWeight: 600, fontSize: "0.85rem", textAlign: "right", whiteSpace: "nowrap" }}>{formatCurrency(inv.invoice_total)}</td>
                  <td style={{ padding: "14px 24px", textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                      <div style={{ width: "16px", height: "4px", borderRadius: "2px", background: confColor }}></div>
                      <span style={{ color: confColor, fontWeight: 700, fontSize: "0.85rem" }}>{displayConf}</span>
                    </div>
                  </td>
                </tr>
              )
            })}

            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
                  No non-PO invoices found matching the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ padding: "16px 24px", fontSize: "0.75rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)" }}>
        * Invoices with &gt;90% confidence in GL auto-assignment are automatically approved. Lower scores require manual review.
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
          text-transform: capitalize;
        }
        .status-approved-purple {
          background: rgba(139, 92, 246, 0.15);
          color: #a78bfa;
          border: 1px solid rgba(139, 92, 246, 0.3);
        }
        .status-ready-blue {
          background: rgba(14, 165, 233, 0.15);
          color: #38bdf8;
          border: 1px solid rgba(14, 165, 233, 0.3);
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
        .status-processing-grey {
          background: rgba(107, 114, 128, 0.15);
          color: #9ca3af;
          border: 1px solid rgba(107, 114, 128, 0.3);
        }
      `}</style>
    </div>
  );
}

export default NonPoTable;
