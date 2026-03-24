import KPIBox from "../components/cards/KPIBox";
import NonPoTable from "../components/tables/NonPoTable";
import { FileText, Clock, Percent, AlertCircle } from "lucide-react";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart,
  BarChart, Bar, Cell
} from "recharts";

// Mock data for the charts
const confidenceTrendData = [
  { name: '09/01', value: 87 },
  { name: '09/02', value: 91 },
  { name: '09/03', value: 88 },
  { name: '09/04', value: 92 },
  { name: '09/05', value: 90 },
  { name: '09/06', value: 93 },
  { name: '09/07', value: 91 },
];

const topCategoriesData = [
  { name: 'Utilities', value: 80, color: '#2e7d32' },
  { name: 'Professional Services', value: 45, color: '#2e7d32' },
  { name: 'Tax / Government', value: 35, color: '#2e7d32' },
  { name: 'Subscriptions', value: 58, color: '#2e7d32' },
  { name: 'Meals & Entertainment', value: 30, color: '#2e7d32' },
  { name: 'Office Supplies', value: 25, color: '#2e7d32' },
  { name: 'Marketing', value: 18, color: '#2e7d32' },
];

const confidenceDistributionData = [
  { name: '95-100%', value: 89, max: 100 },
  { name: '85-94%', value: 67, max: 100 },
  { name: '75-84%', value: 45, max: 100 },
  { name: '65-74%', value: 12, max: 100 },
];

interface Props {
  invoices: any[];
}

function NonPoDashboard({ invoices }: Props) {
  return (
    <div className="animate-fade-in-up">
      <div className="non-po-header">
        <h2>Non-PO Invoice Processing</h2>
        <p>General Ledger Assignment Agent — Category Identification & Auto-Classification</p>
      </div>

      <div className="non-po-grid">
        <KPIBox
          title="TOTAL NON-PO INVOICES (MTD)"
          value="241"
          icon={<FileText color="var(--accent-blue)" size={24} />}
          trend=""
          trendUp={true}
        />
        <KPIBox
          title="PENDING GL ASSIGNMENT"
          value="19"
          icon={<AlertCircle color="var(--accent-red)" size={24} />}
          trend=""
          trendUp={false}
        />
        <KPIBox
          title="HIGH CONFIDENCE (≥90%)"
          value="78%"
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

      <div className="non-po-performance-panel" style={{ borderTop: "4px solid #22c55e" }}>
        <div className="non-po-performance-header">
          <h3 className="non-po-performance-title">GL ASSIGNMENT AGENT PERFORMANCE — LAST 7 DAYS</h3>
        </div>
        <div className="non-po-performance-metrics" style={{ justifyContent: "flex-start", gap: "60px" }}>
          <div className="non-po-metric">
            <span className="non-po-metric-label">Average Confidence Score</span>
            <span className="non-po-metric-value success">91.3%</span>
          </div>
          <div className="non-po-metric">
            <span className="non-po-metric-label">Invoices Processed</span>
            <span className="non-po-metric-value" style={{ fontWeight: 500 }}>241</span>
          </div>
          <div className="non-po-metric">
            <span className="non-po-metric-label">Auto-Approved</span>
            <span className="non-po-metric-value" style={{ fontWeight: 500 }}>189</span>
          </div>
          <div className="non-po-metric">
            <span className="non-po-metric-label">Manual Review Required</span>
            <span className="non-po-metric-value warning">52</span>
          </div>
        </div>
      </div>

      <div className="non-po-bottom-grid">
        <div className="non-po-chart-panel">
          <h4 className="non-po-chart-title">CONFIDENCE SCORE TREND</h4>
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
          <h4 className="non-po-chart-title">TOP GL CATEGORIES (BY VOLUME)</h4>
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
          <h4 className="non-po-chart-title">CONFIDENCE SCORE DISTRIBUTION</h4>
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
                      width: `${(item.value / item.max) * 100}%`, 
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
