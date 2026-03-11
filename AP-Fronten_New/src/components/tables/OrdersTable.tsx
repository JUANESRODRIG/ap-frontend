import { FileText } from "lucide-react";

interface Invoice {
  invoice_id: number;
  invoice_number: string;
  vendor_id: string;
  status: string;
  invoice_total: number;
}

interface Props {
  invoices: Invoice[];
}

function getStatusClass(status: string) {
  const norm = status?.toLowerCase() || "";
  if (norm.includes("approved") || norm.includes("clean") || norm.includes("paid")) return "approved";
  if (norm.includes("exception") || norm.includes("rejected") || norm.includes("error")) return "exception";
  if (norm.includes("parked") || norm.includes("pending")) return "parked";
  return "";
}

function formatCurrency(val: any) {
  const num = Number(val);
  if (isNaN(num)) return "$0.00";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
}

function OrdersTable({ invoices }: Props) {
  return (
    <div className="table-container animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
      <div className="table-header">
        <h3 className="table-title">Recent Invoices</h3>
        <button className="table-header-action">
          <FileText size={16} />
          View All
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Invoice Number</th>
              <th>Vendor</th>
              <th>Status</th>
              <th>Total Amount</th>
            </tr>
          </thead>

          <tbody>
            {invoices.slice(0, 10).map((inv) => (
              <tr key={inv.invoice_id}>
                <td className="cell-bold">#{inv.invoice_id}</td>
                <td>{inv.invoice_number}</td>
                <td>{inv.vendor_id}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(inv.status)}`}>
                    {inv.status || "Unknown"}
                  </span>
                </td>
                <td className="cell-bold">{formatCurrency(inv.invoice_total)}</td>
              </tr>
            ))}

            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrdersTable;