export interface PendingCategoryData {
  category: string;
  invCount: number;
  avgAge: string;
  status: string;
  statusType: 'notify' | 'overdue' | 'review';
}

interface NonPoPipelineProps {
  pendingApprovalCount?: number;
  unclassifiedVendorsCount?: number;
  avgApprovalTime?: string;
  tableData?: PendingCategoryData[];
}

const defaultTableData: PendingCategoryData[] = [
  { category: 'Utilities', invCount: 9, avgAge: '2.1 days', status: 'Notified', statusType: 'notify' },
  { category: 'Tax / Government', invCount: 5, avgAge: '4.8 days', status: 'Notified', statusType: 'notify' },
  { category: 'Subscriptions', invCount: 7, avgAge: '1.9 days', status: 'Notified', statusType: 'notify' },
  { category: 'Professional Services', invCount: 4, avgAge: '6.2 days', status: 'Overdue', statusType: 'overdue' },
  { category: 'Unclassified', invCount: 3, avgAge: '8.4 days', status: 'In AP Review', statusType: 'review' },
];

function NonPoPipeline({
  pendingApprovalCount = 28,
  unclassifiedVendorsCount = 6,
  avgApprovalTime = "3.1",
  tableData = defaultTableData
}: NonPoPipelineProps) {
  return (
    <div style={{ marginBottom: "2rem", marginTop: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ 
            fontSize: "0.85rem", 
            fontWeight: 700, 
            color: "var(--text-muted)", 
            textTransform: "uppercase", 
            letterSpacing: "1px", 
            borderBottom: "2px solid var(--border-color)", 
            paddingBottom: "8px",
            display: "inline-block"
        }}>
          NON-PO PIPELINE
        </h2>
      </div>

      <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: "20px" 
      }}>
        {/* We will use grid standard approach where last item spans 2 if enough space */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr", gap: "20px", width: "100%" }}>
            
            {/* KPI Card 1 */}
            <div className="agent-panel" style={{ 
                padding: "24px", 
                borderTop: "4px solid #10b981", 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "flex-start",
                height: "100%"
            }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Non-PO Invoices Pending Approval
                </p>
                <h3 style={{ fontSize: "2.8rem", fontWeight: 500, margin: 0, color: "var(--text-primary)", lineHeight: 1 }}>{pendingApprovalCount}</h3>
            </div>

            {/* KPI Card 2 */}
            <div className="agent-panel" style={{ 
                padding: "24px", 
                borderTop: "4px solid #f59e0b", 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "flex-start",
                height: "100%"
            }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Unclassified Vendors (AP Review Queue)
                </p>
                <h3 style={{ fontSize: "2.8rem", fontWeight: 500, margin: 0, color: "#f59e0b", lineHeight: 1 }}>{unclassifiedVendorsCount}</h3>
            </div>

            {/* KPI Card 3 */}
            <div className="agent-panel" style={{ 
                padding: "24px", 
                borderTop: "4px solid #10b981", 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "flex-start",
                height: "100%"
            }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Avg. Approval Time
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                    <h3 style={{ fontSize: "2.8rem", fontWeight: 500, margin: 0, color: "var(--text-primary)", lineHeight: 1 }}>
                        {avgApprovalTime}
                    </h3>
                    <span style={{ fontSize: "1.5rem", fontWeight: 500, color: "var(--text-primary)", fontFamily: "monospace" }}>days</span>
                </div>
            </div>

            {/* Table Card */}
            <div style={{ display: "flex", flexDirection: "column" }}>
                <h3 style={{ 
                    fontSize: "0.65rem", 
                    fontWeight: 700, 
                    color: "var(--text-muted)", 
                    marginBottom: "8px", 
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                }}>
                    Pending Approvals
                </h3>
                <div className="agent-panel" style={{ 
                    padding: "0", 
                    overflow: "hidden", 
                    height: "100%", 
                    display: "flex", 
                    flexDirection: "column",
                    borderLeft: "3px solid #6366f1",
                    borderRadius: "16px"
                }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", textAlign: "left", flexGrow: 1 }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f9fafb" }}>
                                <th style={{ padding: "10px 14px", color: "var(--text-muted)", fontWeight: 600, borderBottom: "1px solid var(--border-color)" }}>CATEGORY</th>
                                <th style={{ padding: "10px 14px", color: "var(--text-muted)", fontWeight: 600, borderBottom: "1px solid var(--border-color)" }}># INV</th>
                                <th style={{ padding: "10px 14px", color: "var(--text-muted)", fontWeight: 600, borderBottom: "1px solid var(--border-color)" }}>AVG AGE</th>
                                <th style={{ padding: "10px 14px", color: "var(--text-muted)", fontWeight: 600, borderBottom: "1px solid var(--border-color)" }}>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row, idx) => (
                                <tr key={idx} style={{ 
                                    backgroundColor: "var(--bg-card)",
                                    borderBottom: idx < tableData.length - 1 ? "1px solid var(--border-color)" : "none"
                                }}>
                                    <td style={{ padding: "12px 16px", color: "var(--text-primary)" }}>{row.category}</td>
                                    <td style={{ padding: "12px 16px", color: "var(--text-primary)" }}>{row.invCount}</td>
                                    <td style={{ padding: "12px 16px", color: "var(--text-primary)" }}>{row.avgAge}</td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <span style={{
                                            display: "inline-block",
                                            padding: "3px 8px",
                                            borderRadius: "4px",
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                            border: `1px solid ${
                                                row.statusType === 'notify' ? '#10b981' : 
                                                row.statusType === 'overdue' ? '#f59e0b' : '#d1d5db'
                                            }`,
                                            color: `${
                                                row.statusType === 'notify' ? '#047857' : 
                                                row.statusType === 'overdue' ? '#d97706' : '#6b7280'
                                            }`,
                                            backgroundColor: `${
                                                row.statusType === 'notify' ? 'rgba(16, 185, 129, 0.1)' : 
                                                row.statusType === 'overdue' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(107, 114, 128, 0.1)'
                                            }`
                                        }}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

export default NonPoPipeline;
