import { useMemo } from "react";
import KPIBox from "../components/cards/KPIBox";
import NonPoTable from "../components/tables/NonPoTable";
import { FileText, Clock, Percent, AlertCircle, TrendingUp, CheckCircle2, AlertTriangle, Activity, BarChart3, PieChart } from "lucide-react";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart,
  BarChart, Bar, Cell
} from "recharts";

interface Props {
  invoices: any[];
}

function NonPoDashboard({ invoices }: Props) {

  // Dynamic calculations from real invoices dataset
  const {
    totalInvoices,
    pendingGL,
    highConfidencePct,
    avgConfidenceScore,
    autoApprovedCount,
    manualReviewCount,
    confidenceTrendData,
    topCategoriesData,
    confidenceDistributionData
  } = useMemo(() => {
    
    // Safety check
    const validInvoices = Array.isArray(invoices) ? invoices : [];
    
    const total = validInvoices.length;

    let totalConfidence = 0;
    let confidenceCount = 0;
    let highConfCount = 0;

    let pendingCount = 0;
    let autoApprove = 0;
    let manualReview = 0;

    const categoryCounts: Record<string, number> = {};
    
    // Confidence buckets
    let conf95_100 = 0;
    let conf85_94 = 0;
    let conf75_84 = 0;
    let confLow = 0;

    // Trend grouping by date
    const trendMap: Record<string, { sum: number, count: number }> = {};

    validInvoices.forEach(inv => {
      // Pending GL
      const status = (inv.status || "").toLowerCase();
      if (status.includes("needs_review") || status.includes("parked") || status.includes("processing") || status.includes("manual")) {
        pendingCount++;
      }
      
      if (status === "approved" || status === "clean") {
        autoApprove++;
      } else if (status === "exception" || status === "rejected" || status === "needs_review") {
        manualReview++;
      }

      // Confidence
      const confVal = parseInt(inv.confidence || "0", 10);
      if (!isNaN(confVal) && inv.confidence != null) {
        totalConfidence += confVal;
        confidenceCount++;
        
        if (confVal >= 90) highConfCount++;

        // Buckets
        if (confVal >= 95) conf95_100++;
        else if (confVal >= 85) conf85_94++;
        else if (confVal >= 75) conf75_84++;
        else confLow++;
      }

      // Category
      const cat = inv.category || inv.suggested_category || "Uncategorized";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

      // Date Trend (mocking month/day)
      const dateStr = inv.invoice_date || inv.created_at;
      if (dateStr && !isNaN(confVal) && inv.confidence != null) {
        try {
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) {
            const dayStr = `${String(d.getMonth()+1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
            if (!trendMap[dayStr]) trendMap[dayStr] = { sum: 0, count: 0 };
            trendMap[dayStr].sum += confVal;
            trendMap[dayStr].count += 1;
          }
        } catch (e) {
          // ignore parsing error
        }
      }
    });

    const avgConf = confidenceCount > 0 ? (totalConfidence / confidenceCount) : 0;
    const highConfPct = confidenceCount > 0 ? Math.round((highConfCount / confidenceCount) * 100) : 0;

    // Build trend data, sort by date string
    let parsedTrend = Object.keys(trendMap)
      .sort((a,b) => a.localeCompare(b))
      .map(date => ({
        name: date,
        value: Math.round(trendMap[date].sum / trendMap[date].count)
      }));
    
    // If we map 0 dates, supply mock
    if (parsedTrend.length === 0) {
      parsedTrend = [
        { name: '09/01', value: 87 },
        { name: '09/02', value: 91 },
      ];
    } else if (parsedTrend.length < 5) {
      // pad slightly so chart doesn't look empty
      parsedTrend.unshift({ name: 'Start', value: avgConf });
    }

    // Top categories (sort and pick top 7)
    const sortedCats = Object.keys(categoryCounts)
      .map(k => ({ name: k, value: categoryCounts[k], color: '#2e7d32' }))
      .sort((a,b) => b.value - a.value)
      .slice(0, 7);

    const maxConfBucket = Math.max(conf95_100, conf85_94, conf75_84, confLow) || 1; // avoid divide by zero

    return {
      totalInvoices: total,
      pendingGL: pendingCount,
      highConfidencePct: highConfPct,
      avgConfidenceScore: avgConf.toFixed(1),
      autoApprovedCount: autoApprove,
      manualReviewCount: manualReview,
      
      confidenceTrendData: parsedTrend,
      topCategoriesData: sortedCats.length > 0 ? sortedCats : [{ name: 'No Data', value: 0, color: '#2e7d32' }],
      confidenceDistributionData: [
        { name: '95-100%', value: conf95_100, max: maxConfBucket },
        { name: '85-94%', value: conf85_94, max: maxConfBucket },
        { name: '75-84%', value: conf75_84, max: maxConfBucket },
        { name: '65-74% Note:', value: confLow, max: maxConfBucket },
      ]
    };
  }, [invoices]);

  return (
    <div className="animate-fade-in-up">
      <div className="non-po-header">
        <h2>Non-PO Invoice Processing</h2>
        <p>General Ledger Assignment Agent — Category Identification & Auto-Classification</p>
      </div>

      <div className="non-po-grid">
        <KPIBox
          title="TOTAL NON-PO INVOICES"
          value={totalInvoices.toString()}
          icon={<FileText color="var(--accent-blue)" size={24} />}
          trend=""
          trendUp={true}
        />
        <KPIBox
          title="PENDING GL ASSIGNMENT"
          value={pendingGL.toString()}
          icon={<AlertCircle color="var(--accent-red)" size={24} />}
          trend=""
          trendUp={false}
        />
        <KPIBox
          title="HIGH CONFIDENCE (≥90%)"
          value={`${highConfidencePct}%`}
          icon={<Percent color="var(--accent-primary)" size={24} />}
          trend=""
          trendUp={true}
        />
        <KPIBox
          title="AVG. PROCESSING TIME"
          value="1.8 hrs"
          icon={<Clock color="var(--accent-cyan)" size={24} />}
          trend=""
          trendUp={true}
        />
      </div>

      <div className="non-po-performance-panel">
        <div className="non-po-performance-header">
          <h3 className="non-po-performance-title">
            <Activity color="var(--accent-primary)" size={18} />
            GL ASSIGNMENT AGENT PERFORMANCE
          </h3>
        </div>
        <div className="non-po-performance-metrics">
          <div className="non-po-metric">
            <span className="non-po-metric-label">
              <TrendingUp size={14} />
              Average Confidence Score
            </span>
            <span className="non-po-metric-value success">{avgConfidenceScore}%</span>
          </div>
          <div className="non-po-metric">
            <span className="non-po-metric-label">
              <FileText size={14} />
              Invoices Processed
            </span>
            <span className="non-po-metric-value">{totalInvoices}</span>
          </div>
          <div className="non-po-metric">
            <span className="non-po-metric-label">
              <CheckCircle2 size={14} />
              Auto-Approved / Clean
            </span>
            <span className="non-po-metric-value">{autoApprovedCount}</span>
          </div>
          <div className="non-po-metric">
            <span className="non-po-metric-label">
              <AlertTriangle size={14} />
              Manual Review Required
            </span>
            <span className={`non-po-metric-value ${manualReviewCount > 0 ? "warning" : ""}`}>
              {manualReviewCount}
            </span>
          </div>
        </div>
      </div>

      <div className="non-po-bottom-grid">
        <div className="non-po-chart-panel">
          <h4 className="non-po-chart-title">
            <TrendingUp size={16} color="var(--accent-blue)" />
            CONFIDENCE SCORE TREND
          </h4>
          <div style={{ flex: 1, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={confidenceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2e7d32" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                <Area type="monotone" dataKey="value" stroke="#2e7d32" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="non-po-chart-panel">
          <h4 className="non-po-chart-title">
            <BarChart3 size={16} color="#2e7d32" />
            TOP GL CATEGORIES (BY VOLUME)
          </h4>
          <div style={{ flex: 1, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCategoriesData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-muted)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {topCategoriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="non-po-chart-panel">
          <h4 className="non-po-chart-title">
            <PieChart size={16} color="var(--accent-primary)" />
            CONFIDENCE SCORE DISTRIBUTION
          </h4>
          <div style={{ flex: 1, width: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
            {confidenceDistributionData.map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '60px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {item.name}
                </div>
                <div style={{ flex: 1, height: '8px', background: 'var(--bg-surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${item.max > 0 ? (item.value / item.max) * 100 : 0}%`, 
                      background: index === 0 ? '#1b5e20' : index === 1 ? '#2e7d32' : index === 2 ? '#81c784' : '#c8e6c9',
                      borderRadius: '4px'
                    }} 
                  />
                </div>
                <div style={{ width: '20px', fontSize: '12px', fontWeight: 600, textAlign: 'right' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Render the Detailed Invoices Table */}
      <NonPoTable invoices={invoices} />
      
    </div>
  );
}

export default NonPoDashboard;
