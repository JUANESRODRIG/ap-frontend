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
  confidence?: string;
}

interface Props {
  invoices: Invoice[];
}

function getStatusClass(status: string) {
  const norm = status?.toLowerCase() || "";
  if (norm.includes("approved")) return "status-approved-purple";
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

function getConfidenceValue(confidenceStr: string | undefined, defaultVal: number) {
  if (!confidenceStr) return defaultVal;
  return parseInt(confidenceStr) || defaultVal;
}

function NonPoTable({ invoices }: Props) {
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [confidenceFilter, setConfidenceFilter] = useState("All Confidence Levels");

  const uniqueCategories = useMemo(() => ["All Categories", ...Array.from(new Set(invoices.map(i => i.category || "Uncategorized")))], [invoices]);
  const confidenceLevels = ["All Confidence Levels", "High (≥90%)", "Medium (70-89%)", "Low (<70%)"];

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const cMatch = categoryFilter === "All Categories" || (inv.category || "Uncategorized") === categoryFilter;
      
      let confMatch = true;
      const confVal = getConfidenceValue(inv.confidence, 85); // Mock fallback to 85 if null
      if (confidenceFilter === "High (≥90%)") confMatch = confVal >= 90;
      if (confidenceFilter === "Medium (70-89%)") confMatch = confVal >= 70 && confVal < 90;
      if (confidenceFilter === "Low (<70%)") confMatch = confVal < 70;

      return cMatch && confMatch;
    });
  }, [invoices, categoryFilter, confidenceFilter]);

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

      <div style={{ overflowX: "auto" }}>
        <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "1100px" }}>
          <thead>
            <tr style={{ background: "var(--bg-surface-elevated)", borderBottom: "1px solid var(--border-subtle)" }}>
              <th style={{ textAlign: "left", padding: "14px 24px", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>ID</th>
              <th style={{ textAlign: "left", padding: "14px", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Creation Date</th>
              <th style={{ textAlign: "left", padding: "14px", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Due</th>
              <th style={{ textAlign: "left", padding: "14px", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Vendor</th>
              <th style={{ textAlign: "left", padding: "14px", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</th>
              <th style={{ textAlign: "left", padding: "14px", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>GL Account</th>
              <th style={{ textAlign: "left", padding: "14px", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>GL Description</th>
              <th style={{ textAlign: "left", padding: "14px", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
              <th style={{ textAlign: "right", padding: "14px", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Net Value</th>
              <th style={{ textAlign: "right", padding: "14px 24px", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Confidence</th>
            </tr>
          </thead>

          <tbody>
            {filteredInvoices.slice(0, 15).map((inv, i) => {
              // Mock Fallbacks for missing Supabase fields according to Design 
              // Using index 'i' to vary data deterministically if missing
              const mockCreationDate = inv.invoice_date || `2024-08-${String(10 + (i%20)).padStart(2, '0')}`;
              const mockDueDate = `2024-09-${String(10 + (i%20)).padStart(2, '0')}`;
              const mockCategory = inv.category || ((i % 2 === 0) ? "Utilities" : "Professional Services");
              const mockGlAccount = `6${(i % 5) + 1}00-0${(i % 3) + 1}1`;
              const mockGlDesc = mockCategory.toLowerCase();
              const confVal = getConfidenceValue(inv.confidence, 85 + (i % 15));
              const displayConf = `${confVal}%`;
              const confColor = getConfidenceColor(displayConf);
              
              const isPending = confVal < 88 ? "Pending Review" : "Auto-Approved";
              const renderStatus = inv.status !== "Processing" && inv.status !== "Unknown" ? inv.status : isPending;

              return (
                <tr key={inv.invoice_id || i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "14px 24px", color: "var(--text-primary)", fontWeight: 500, fontSize: "0.85rem" }}>{inv.invoice_number || `#${inv.invoice_id}`}</td>
                  <td style={{ padding: "14px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>{mockCreationDate}</td>
                  <td style={{ padding: "14px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>{mockDueDate}</td>
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
    </div>
  );
}

export default NonPoTable;
