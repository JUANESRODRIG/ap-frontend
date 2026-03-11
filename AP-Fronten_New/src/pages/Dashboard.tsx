import { useEffect, useState } from "react";
import KPIBox from "../components/cards/KPIBox";
import AgentPanel from "../components/cards/AgentPanel";
import RootCauseChart from "../components/charts/RootCauseChart";
import OrdersTable from "../components/tables/OrdersTable";
import VendorPerformanceTable from "../components/tables/VendorPerformanceTable";
import { supabase } from "../lib/supabase";
import { FileText, CheckCircle, DollarSign, AlertCircle } from "lucide-react";

function Dashboard() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [exceptions, setExceptions] = useState<any[]>([]);
    const [rootCauseData, setRootCauseData] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [straightThroughRate, setStraightThroughRate] = useState(0);
    const [parkedValue, setParkedValue] = useState(0);
    const [clearedValue, setClearedValue] = useState(0);

    function generateRootCauseData(exceptions: any[]) {
        const counts: any = {};

        exceptions.forEach((e) => {
            const cause = e.root_cause || "Unknown";
            counts[cause] = (counts[cause] || 0) + 1;
        });

        return Object.keys(counts).map((key) => ({
            name: key,
            value: counts[key],
        }));
    }

    useEffect(() => {
        fetchInvoices();
        fetchExceptions();
        fetchVendorPerformance();
    }, []);

    async function fetchExceptions() {
        const { data, error } = await supabase
            .from("exceptions")
            .select("*");

        if (error) {
            console.error(error);
            return;
        }

        const ex = data || [];

        setExceptions(ex);
        setRootCauseData(generateRootCauseData(ex));
    }

    async function fetchVendorPerformance() {
        const { data: vendorData } = await supabase
            .from("vendors")
            .select("*");

        const { data: exceptionData } = await supabase
            .from("exceptions")
            .select("*");

        const { data: invoiceData } = await supabase
            .from("invoices")
            .select("*");

        if (!vendorData) return;

        const results = vendorData.map((vendor: any) => {
            const vendorInvoices = invoiceData?.filter(
                (i) => i.vendor_id === vendor.vendor_id
            ) || [];

            const vendorExceptions = exceptionData?.filter((e) =>
                vendorInvoices.some((inv) => inv.invoice_id === e.invoice_id)
            ) || [];

            const issueValue = vendorExceptions.reduce((sum, e) => {
                const inv = vendorInvoices.find(
                    (i) => i.invoice_id === e.invoice_id
                );
                return sum + (inv?.invoice_total || 0);
            }, 0);

            return {
                vendor_id: vendor.vendor_id,
                vendor_name: vendor.vendor_name,
                issues: vendorExceptions.length,
                issue_value: issueValue,
                price_variance: vendorExceptions.filter(
                    (e) => e.exception_type === "Price Variance"
                ).length,
                missing_gr: vendorExceptions.filter(
                    (e) => e.exception_type === "Missing GR"
                ).length,
                po_mismatch: vendorExceptions.filter(
                    (e) => e.exception_type === "PO Mismatch"
                ).length
            };
        });

        setVendors(results);
    }

    async function fetchInvoices() {
        const { data, error } = await supabase
            .from("invoices")
            .select("*");

        if (error) {
            console.error(error);
            return;
        }

        const inv = data || [];

        setInvoices(inv);
        calculateKPIs(inv);
        setLoading(false);
    }

    function calculateKPIs(inv: any[]) {
        const total = inv.length;
        const clean = inv.filter(
            (i) => i.status === "Approved" || i.status === "Clean"
        ).length;

        const parked = inv.filter(
            (i) => i.status === "Parked" || i.status === "Exception"
        );

        const parkedVal = parked.reduce(
            (sum, i) => sum + Number(i.invoice_total || 0),
            0
        );

        const cleared = inv
            .filter((i) => i.status === "Approved")
            .reduce((sum, i) => sum + Number(i.invoice_total || 0), 0);

        setStraightThroughRate(
            total ? Math.round((clean / total) * 100) : 0
        );

        setParkedValue(parkedVal);
        setClearedValue(cleared);
    }

    const exceptionRate =
        invoices.length > 0
            ? Math.round((exceptions.length / invoices.length) * 100)
            : 0;

    const resolvedIssues = exceptions.filter(
        (e) => e.resolved === "true"
    ).length;

    return (
        <div className="animate-fade-in-up">

            <div className="welcome-card" style={{ marginBottom: "2rem" }}>
                <h2>Welcome back, Admin 👋</h2>
                <p>
                    Here's what's happening with your invoices today. You have{" "}
                    <strong>{invoices.length} invoices</strong> awaiting review.
                </p>
            </div>

            <div className="dashboard-header-container">
                <h1 className="dashboard-title">Dashboard Overview</h1>
            </div>

            <div className="kpi-grid">

                <KPIBox
                    title="Total Invoices"
                    value={invoices.length}
                    icon={<FileText color="var(--accent-blue)" size={24} />}
                    trend="12%"
                    trendUp={true}
                />

                <KPIBox
                    title="Straight Through Rate"
                    value={`${straightThroughRate}%`}
                    icon={<CheckCircle color="var(--accent-primary)" size={24} />}
                    trend="4.3%"
                    trendUp={true}
                />

                <KPIBox
                    title="Value Cleared"
                    value={`$${clearedValue.toLocaleString("en-US")}`}
                    icon={<DollarSign color="var(--accent-cyan)" size={24} />}
                    trend="2.1%"
                    trendUp={true}
                />

                <KPIBox
                    title="Total Parked Value"
                    value={`$${parkedValue.toLocaleString("en-US")}`}
                    icon={<AlertCircle color="var(--accent-red)" size={24} />}
                    trend="8.1%"
                    trendUp={false}
                />

            </div>

            <div className="agent-grid">
                <AgentPanel
                    title="3 Way Matching Agent"
                    value1={invoices.length - exceptions.length}
                    label1="Touchless Approvals"
                    value2={`${exceptionRate}%`}
                    label2="Exception Rate"
                />

                <div className="agent-panel">
                    <h3>Root Cause Agent</h3>
                    <RootCauseChart data={rootCauseData} />
                </div>

                <AgentPanel
                    title="Block Resolution"
                    value1={resolvedIssues}
                    label1="Issues Resolved"
                />
            </div>

            {loading ? (
                <div className="loading-container">
                    <p>Loading your invoices...</p>
                </div>
            ) : (
                <>
                    <OrdersTable invoices={invoices} />

                    <div className="vendor-section" style={{ marginTop: "30px" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>
                            Vendor Performance
                        </h2>
                        <VendorPerformanceTable vendors={vendors} />
                    </div>
                </>
            )}

        </div>
    );
}

export default Dashboard;