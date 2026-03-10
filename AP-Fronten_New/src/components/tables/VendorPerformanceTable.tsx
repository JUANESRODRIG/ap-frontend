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

    function getRiskLevel(score: number) {
        if (score > 40) return "Critical";
        if (score > 20) return "Medium";
        return "Low";
    }

    return (
        <div className="table-container animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div style={{ overflowX: "auto" }}>
                <table className="data-table vendor-table">

                    <thead>
                        <tr>
                            <th>Vendor</th>
                            <th>Total Issues</th>
                            <th>Issue Value</th>
                            <th>Price Variance</th>
                            <th>Missing GR</th>
                            <th>PO Mismatch</th>
                            <th>Risk</th>
                        </tr>
                    </thead>

                    <tbody>

                        {vendors.map((v) => {

                            const score = v.issues * 10;
                            const risk = getRiskLevel(score);

                            // Dynamically style the risk badge based on severity level
                            let badgeClass = "status-badge clean";
                            if (risk === "Critical") badgeClass = "status-badge exception";
                            if (risk === "Medium") badgeClass = "status-badge parked";

                            return (
                                <tr key={v.vendor_id}>
                                    <td className="cell-bold">{v.vendor_name}</td>
                                    <td>{v.issues}</td>
                                    <td className="cell-bold">
                                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v.issue_value || 0)}
                                    </td>
                                    <td>{v.price_variance}</td>
                                    <td>{v.missing_gr}</td>
                                    <td>{v.po_mismatch}</td>
                                    <td>
                                        <span className={badgeClass}>{risk}</span>
                                    </td>
                                </tr>
                            );

                        })}

                        {vendors.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                                    No vendor data available.
                                </td>
                            </tr>
                        )}

                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default VendorPerformanceTable;
