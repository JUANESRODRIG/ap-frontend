import { useEffect, useState } from "react";
import KPIBox from "../components/cards/KPIBox";
import ThreeWayMatchingPanel from "../components/cards/ThreeWayMatchingPanel";
import BlockResolutionPanel from "../components/cards/BlockResolutionPanel";
import RootCauseChart from "../components/charts/RootCauseChart";
import OrdersTable from "../components/tables/OrdersTable";
import VendorPerformanceTable from "../components/tables/VendorPerformanceTable";
import NonPoPipeline from "../components/cards/NonPoPipeline";
import NonPoDashboard from "./NonPoDashboard";
import { supabase } from "../lib/supabase";
import { FileText, CheckCircle, DollarSign, AlertCircle } from "lucide-react";

function Dashboard() {
    const [activeTab, setActiveTab] = useState("Main Dashboard");
    const [invoices, setInvoices] = useState<any[]>([]);
    const [exceptions, setExceptions] = useState<any[]>([]);
    const [rootCauseData, setRootCauseData] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [straightThroughRate, setStraightThroughRate] = useState(0);
    const [parkedValue, setParkedValue] = useState(0);
    const [clearedValue, setClearedValue] = useState(0);

    const [nonPoPendingCount, setNonPoPendingCount] = useState<number | undefined>(undefined);
    const [unclassifiedVendorsCount, setUnclassifiedVendorsCount] = useState<number | undefined>(undefined);
    const [nonPoTableData, setNonPoTableData] = useState<any[] | undefined>(undefined);

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

        // Subscribe to real-time updates from Supabase
        const subscription = supabase
            .channel('invoices-realtime')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'invoices' 
            }, (payload) => {
                console.log('Real-time update received:', payload);
                
                if (payload.eventType === 'INSERT') {
                    setInvoices(prev => {
                        const next = [...prev, payload.new];
                        calculateKPIs(next);
                        return next;
                    });
                } else if (payload.eventType === 'UPDATE') {
                    setInvoices(prev => {
                        const next = prev.map(inv => 
                            inv.invoice_id === payload.new.invoice_id ? payload.new : inv
                        );
                        calculateKPIs(next);
                        return next;
                    });
                } else if (payload.eventType === 'DELETE') {
                    setInvoices(prev => {
                        const next = prev.filter(inv => inv.invoice_id !== (payload.old as any).invoice_id);
                        calculateKPIs(next);
                        return next;
                    });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
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
            (i) => i.status === "Approved" || i.status === "Clean" || i.status === "ready_for_approval"
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

        const nonPoPending = inv.filter(i => 
            i.invoice_type === 'NON-PO' && 
            ['Processing', 'Parked', 'Exception', 'needs_review'].includes(i.status)
        );
        setNonPoPendingCount(nonPoPending.length);

        const unclassifiedVendors = inv.filter(i => 
            i.invoice_type === 'NON-PO' && !i.vendor_id
        );
        setUnclassifiedVendorsCount(unclassifiedVendors.length);
        
        // Use mock data for now
        setNonPoTableData(undefined);
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

            <div className="dashboard-tabs">
                <button 
                  className={`dashboard-tab ${activeTab === 'Main Dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Main Dashboard')}
                >
                  Main Dashboard
                </button>
                <button 
                  className={`dashboard-tab ${activeTab === 'Non-PO View' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Non-PO View')}
                >
                  Non-PO View
                </button>
            </div>

            {activeTab === 'Main Dashboard' ? (
                <>
                    <div className="dashboard-header-container">
                        <h1 className="dashboard-title">Dashboard Overview</h1>
                    </div>

            <NonPoPipeline 
                pendingApprovalCount={nonPoPendingCount}
                unclassifiedVendorsCount={unclassifiedVendorsCount}
                tableData={nonPoTableData}
            />

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
                <ThreeWayMatchingPanel
                    touchlessApprovals={invoices.length - exceptions.length}
                    exceptionRate={exceptionRate}
                    topException="Price Variance"
                    topExceptionCount={34}
                />

                <div className="agent-panel" style={{ padding: "24px 28px" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "20px" }}>Analysis Agent</h3>
                    <RootCauseChart data={rootCauseData} />
                </div>

                <BlockResolutionPanel 
                    resolvedCount={resolvedIssues} 
                    touchlessRate={straightThroughRate} 
                />
            </div>

            {loading ? (
                <div className="loading-container">
                    <p>Loading your invoices...</p>
                </div>
            ) : (
                <>
                    <div className="vendor-section" style={{ marginBottom: "30px" }}>
                        <VendorPerformanceTable vendors={vendors} />
                    </div>

                    <OrdersTable invoices={invoices} />
                </>
            )}
                </>
            ) : (
                <NonPoDashboard invoices={invoices.filter(i => i.invoice_type === 'NON-PO')} />
            )}

        </div>
    );
}

export default Dashboard;